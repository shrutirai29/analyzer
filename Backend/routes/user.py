from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Analysis, SavedCourse, EmailAnalysis

user_bp = Blueprint("user", __name__)


@user_bp.route("/profile", methods=["GET"])
@jwt_required()
def get_profile():
    user_id = int(get_jwt_identity())
    user = User.query.get_or_404(user_id)
    return jsonify({"user": user.to_dict()})


@user_bp.route("/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    user_id = int(get_jwt_identity())
    user = User.query.get_or_404(user_id)
    data = request.get_json() or {}

    if "name" in data and str(data["name"]).strip():
        user.name = data["name"].strip()
    if "target_role" in data:
        user.target_role = str(data["target_role"]).strip()
    if "headline" in data:
        user.headline = str(data["headline"]).strip()
    if "bio" in data:
        user.bio = str(data["bio"]).strip()
    if "location" in data:
        user.location = str(data["location"]).strip()
    if "preferred_work_type" in data:
        user.preferred_work_type = str(data["preferred_work_type"]).strip()
    if "linkedin_url" in data:
        user.linkedin_url = str(data["linkedin_url"]).strip()
    if "github_url" in data:
        user.github_url = str(data["github_url"]).strip()
    if "years_experience" in data:
        try:
            user.years_experience = max(0, int(data["years_experience"] or 0))
        except (TypeError, ValueError):
            return jsonify({"error": "Years of experience must be a number."}), 400
    if "skills" in data:
        skills = data["skills"] if isinstance(data["skills"], list) else []
        user.skills = [str(item).strip() for item in skills if str(item).strip()][:30]

    db.session.commit()
    return jsonify({"user": user.to_dict()})


@user_bp.route("/change-password", methods=["PUT"])
@jwt_required()
def change_password():
    user_id = int(get_jwt_identity())
    user = User.query.get_or_404(user_id)
    data = request.get_json() or {}

    current = data.get("current_password", "")
    new_pass = data.get("new_password", "")

    if not user.check_password(current):
        return jsonify({"error": "Current password is incorrect."}), 400
    if len(new_pass) < 6:
        return jsonify({"error": "New password must be at least 6 characters."}), 400

    user.set_password(new_pass)
    db.session.commit()
    return jsonify({"message": "Password updated successfully."})


@user_bp.route("/dashboard-summary", methods=["GET"])
@jwt_required()
def dashboard_summary():
    user_id = int(get_jwt_identity())
    analyses = Analysis.query.filter_by(user_id=user_id).all()
    courses = SavedCourse.query.filter_by(user_id=user_id).all()
    email_reports = (
        EmailAnalysis.query.filter_by(user_id=user_id)
        .order_by(EmailAnalysis.created_at.desc())
        .limit(5)
        .all()
    )

    total_analyses = len(analyses)
    avg_match = round(sum(a.match_score for a in analyses) / total_analyses, 1) if total_analyses else 0
    completed_courses = len([course for course in courses if course.is_completed])
    latest = sorted(analyses, key=lambda item: item.created_at, reverse=True)[:5]

    top_missing = {}
    for analysis in analyses:
        for skill in (analysis.missing_skills or []):
            key = str(skill).strip().lower()
            if key:
                top_missing[key] = top_missing.get(key, 0) + 1

    top_missing_list = [
        {"skill": skill, "count": count}
        for skill, count in sorted(top_missing.items(), key=lambda item: item[1], reverse=True)[:8]
    ]

    return jsonify({
        "kpis": {
            "total_analyses": total_analyses,
            "average_match_score": avg_match,
            "saved_courses": len(courses),
            "completed_courses": completed_courses,
            "email_reports": EmailAnalysis.query.filter_by(user_id=user_id).count(),
        },
        "recent_resume_reports": [analysis.to_dict() for analysis in latest],
        "recent_email_reports": [report.to_dict() for report in email_reports],
        "top_missing_skills": top_missing_list,
    })