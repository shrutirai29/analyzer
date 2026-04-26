import os
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename

from models import db, Analysis, EmailAnalysis
from utils.file_parser import extract_text
from utils.analyzer import (
    analyze_resume,
    analyze_resume_fallback,
    analyze_rejection_email_fallback,
)
from utils.courses_db import get_courses_for_skills

analysis_bp = Blueprint("analysis", __name__)

ALLOWED_EXTENSIONS = {"pdf", "docx", "txt"}


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def _extract_uploaded_text(field_name):
    if field_name not in request.files:
        return ""
    file = request.files[field_name]
    if not (file and file.filename and allowed_file(file.filename)):
        return ""

    filename = secure_filename(file.filename)
    filepath = os.path.join(current_app.config["UPLOAD_FOLDER"], filename)
    file.save(filepath)
    try:
        return extract_text(filepath)
    finally:
        if os.path.exists(filepath):
            os.remove(filepath)


@analysis_bp.route("/analyze", methods=["POST"])
@jwt_required()
def analyze():
    user_id = int(get_jwt_identity())

    job_description = (request.form.get("job_description") or "").strip()
    resume_text_input = (request.form.get("resume_text") or "").strip()
    target_role = (request.form.get("target_role") or "").strip()
    job_title = (request.form.get("job_title") or "").strip()

    if not job_description:
        return jsonify({"error": "Job description is required."}), 400

    # Handle file upload
    resume_text = _extract_uploaded_text("resume") or resume_text_input

    if not resume_text:
        return jsonify({"error": "Please upload a resume file or paste your resume text."}), 400

    # Run AI analysis
    try:
        result = analyze_resume(resume_text, job_description, target_role)
    except Exception as e:
        current_app.logger.warning(f"AI analysis failed, using fallback: {e}")
        result = analyze_resume_fallback(resume_text, job_description)

    # Get course recommendations for missing skills
    courses = get_courses_for_skills(result.get("topMissingForCourses") or result.get("missingSkills", []))

    # Save analysis to DB
    dim = result.get("dimensionScores", {})
    analysis = Analysis(
        user_id=user_id,
        job_title=job_title or target_role,
        job_description=job_description,
        resume_text=resume_text[:5000],  # Store first 5000 chars
        match_score=result.get("matchScore", 0),
        technical_score=dim.get("technical", 0),
        experience_score=dim.get("experience", 0),
        education_score=dim.get("education", 0),
        soft_skills_score=dim.get("soft_skills", 0),
        found_skills=result.get("foundSkills", []),
        missing_skills=result.get("missingSkills", []),
        ai_tips=result.get("tips", []),
        verdict=result.get("verdict", ""),
        raw_result=result,
    )
    db.session.add(analysis)
    db.session.commit()

    return jsonify({
        "analysis": analysis.to_dict(),
        "recommended_courses": courses,
    })


@analysis_bp.route("/email-feedback", methods=["POST"])
@jwt_required()
def email_feedback():
    user_id = int(get_jwt_identity())
    target_role = (request.form.get("target_role") or "").strip()
    email_text = (request.form.get("email_text") or "").strip()
    email_text = _extract_uploaded_text("email_file") or email_text

    if not email_text:
        return jsonify({"error": "Please upload the email content file or paste the email text."}), 400

    result = analyze_rejection_email_fallback(email_text=email_text, target_role=target_role)
    report = EmailAnalysis(
        user_id=user_id,
        target_role=target_role,
        decision=result.get("decision", ""),
        confidence=int(result.get("confidence", 0)),
        summary=result.get("summary", ""),
        possible_reasons=result.get("possible_reasons", []),
        next_steps=result.get("next_steps", []),
        raw_email_excerpt=email_text[:3000],
        raw_result=result,
    )
    db.session.add(report)
    db.session.commit()
    return jsonify({"email_analysis": report.to_dict()})


@analysis_bp.route("/email-history", methods=["GET"])
@jwt_required()
def email_history():
    user_id = int(get_jwt_identity())
    reports = (
        EmailAnalysis.query.filter_by(user_id=user_id)
        .order_by(EmailAnalysis.created_at.desc())
        .limit(20)
        .all()
    )
    return jsonify({"reports": [report.to_dict() for report in reports]})


@analysis_bp.route("/build-resume", methods=["POST"])
@jwt_required()
def build_resume():
    data = request.get_json() or {}
    full_name = (data.get("full_name") or "").strip()
    email = (data.get("email") or "").strip()
    phone = (data.get("phone") or "").strip()
    location = (data.get("location") or "").strip()
    target_role = (data.get("target_role") or "").strip()
    summary = (data.get("summary") or "").strip()
    skills = data.get("skills") or []
    projects = data.get("projects") or []
    education = data.get("education") or []
    experience = data.get("experience") or []

    if not full_name or not target_role:
        return jsonify({"error": "Full name and target role are required."}), 400

    normalized_skills = [str(skill).strip() for skill in skills if str(skill).strip()]
    normalized_projects = [str(project).strip() for project in projects if str(project).strip()]
    normalized_education = [str(item).strip() for item in education if str(item).strip()]
    normalized_experience = [str(item).strip() for item in experience if str(item).strip()]

    resume_lines = [
        full_name.upper(),
        f"Target Role: {target_role}",
        " | ".join([part for part in [email, phone, location] if part]),
        "",
        "PROFESSIONAL SUMMARY",
        summary or f"Motivated candidate targeting {target_role} roles with strong learning agility and execution focus.",
        "",
        "CORE SKILLS",
        ", ".join(normalized_skills[:20]) or "Communication, Problem Solving, Collaboration, Adaptability",
        "",
        "PROJECTS",
    ]
    if normalized_projects:
        for project in normalized_projects[:6]:
            resume_lines.append(f"- {project}")
    else:
        resume_lines.extend([
            "- Add 2-3 role-relevant projects with tech stack and measurable outcomes.",
            "- Mention impact (users served, speed improvement, automation achieved).",
        ])

    resume_lines.extend(["", "EXPERIENCE"])
    if normalized_experience:
        for item in normalized_experience[:6]:
            resume_lines.append(f"- {item}")
    else:
        resume_lines.append("- Add internships, freelance work, volunteering, or leadership contributions.")

    resume_lines.extend(["", "EDUCATION"])
    if normalized_education:
        for item in normalized_education[:4]:
            resume_lines.append(f"- {item}")
    else:
        resume_lines.append("- Add degree, college, graduation year, and key coursework.")

    improvement_tips = [
        "Use action verbs and include quantified impact in each bullet.",
        "Tailor keywords to each job description before applying.",
        "Keep resume length to one page for fresher/junior profiles.",
        "Prioritize recent and relevant projects over generic coursework.",
    ]

    return jsonify({
        "resume": {
            "full_name": full_name,
            "target_role": target_role,
            "summary": summary,
            "skills": normalized_skills,
            "projects": normalized_projects,
            "experience": normalized_experience,
            "education": normalized_education,
            "text": "\n".join([line for line in resume_lines if line is not None]),
            "improvement_tips": improvement_tips,
            "motivation": "You are building a strong foundation. Keep iterating weekly and your profile quality will compound fast.",
        }
    })


@analysis_bp.route("/history", methods=["GET"])
@jwt_required()
def history():
    user_id = int(get_jwt_identity())
    analyses = (
        Analysis.query.filter_by(user_id=user_id)
        .order_by(Analysis.created_at.desc())
        .limit(20)
        .all()
    )
    return jsonify({"analyses": [a.to_dict() for a in analyses]})


@analysis_bp.route("/<int:analysis_id>", methods=["GET"])
@jwt_required()
def get_analysis(analysis_id):
    user_id = int(get_jwt_identity())
    analysis = Analysis.query.filter_by(id=analysis_id, user_id=user_id).first_or_404()
    courses = get_courses_for_skills(analysis.missing_skills)
    return jsonify({"analysis": analysis.to_dict(), "recommended_courses": courses})


@analysis_bp.route("/<int:analysis_id>", methods=["DELETE"])
@jwt_required()
def delete_analysis(analysis_id):
    user_id = int(get_jwt_identity())
    analysis = Analysis.query.filter_by(id=analysis_id, user_id=user_id).first_or_404()
    db.session.delete(analysis)
    db.session.commit()
    return jsonify({"message": "Analysis deleted."})