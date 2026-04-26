from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
import bcrypt

db = SQLAlchemy()


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    target_role = db.Column(db.String(120), default="")
    headline = db.Column(db.String(180), default="")
    bio = db.Column(db.Text, default="")
    years_experience = db.Column(db.Integer, default=0)
    location = db.Column(db.String(120), default="")
    preferred_work_type = db.Column(db.String(50), default="")
    skills = db.Column(db.JSON, default=list)
    linkedin_url = db.Column(db.String(255), default="")
    github_url = db.Column(db.String(255), default="")
    otp_code = db.Column(db.String(10), default="")
    otp_expires_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    analyses = db.relationship("Analysis", backref="user", lazy=True, cascade="all, delete-orphan")
    saved_courses = db.relationship("SavedCourse", backref="user", lazy=True, cascade="all, delete-orphan")

    def set_password(self, password):
        self.password_hash = bcrypt.hashpw(
            password.encode("utf-8"), bcrypt.gensalt()
        ).decode("utf-8")

    def check_password(self, password):
        return bcrypt.checkpw(
            password.encode("utf-8"), self.password_hash.encode("utf-8")
        )

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "target_role": self.target_role,
            "headline": self.headline,
            "bio": self.bio,
            "years_experience": self.years_experience,
            "location": self.location,
            "preferred_work_type": self.preferred_work_type,
            "skills": self.skills or [],
            "linkedin_url": self.linkedin_url,
            "github_url": self.github_url,
            "created_at": self.created_at.isoformat(),
            "total_analyses": len(self.analyses),
        }


class Analysis(db.Model):
    __tablename__ = "analyses"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    job_title = db.Column(db.String(200), default="")
    job_description = db.Column(db.Text, nullable=False)
    resume_text = db.Column(db.Text, nullable=False)
    match_score = db.Column(db.Float, nullable=False)
    technical_score = db.Column(db.Float, default=0)
    experience_score = db.Column(db.Float, default=0)
    education_score = db.Column(db.Float, default=0)
    soft_skills_score = db.Column(db.Float, default=0)
    found_skills = db.Column(db.JSON, default=list)
    missing_skills = db.Column(db.JSON, default=list)
    ai_tips = db.Column(db.JSON, default=list)
    verdict = db.Column(db.Text, default="")
    raw_result = db.Column(db.JSON, default=dict)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "job_title": self.job_title,
            "job_description": self.job_description[:200] + "..." if len(self.job_description) > 200 else self.job_description,
            "match_score": self.match_score,
            "dimension_scores": {
                "technical": self.technical_score,
                "experience": self.experience_score,
                "education": self.education_score,
                "soft_skills": self.soft_skills_score,
            },
            "found_skills": self.found_skills,
            "missing_skills": self.missing_skills,
            "ai_tips": self.ai_tips,
            "verdict": self.verdict,
            "raw_result": self.raw_result or {},
            "created_at": self.created_at.isoformat(),
        }


class SavedCourse(db.Model):
    __tablename__ = "saved_courses"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    skill = db.Column(db.String(100), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    platform = db.Column(db.String(100), default="")
    provider = db.Column(db.String(150), default="")
    duration = db.Column(db.String(80), default="")
    level = db.Column(db.String(80), default="")
    url = db.Column(db.Text, default="")
    is_free = db.Column(db.Boolean, default=False)
    is_completed = db.Column(db.Boolean, default=False)
    saved_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "skill": self.skill,
            "title": self.title,
            "platform": self.platform,
            "provider": self.provider,
            "duration": self.duration,
            "level": self.level,
            "url": self.url,
            "is_free": self.is_free,
            "is_completed": self.is_completed,
            "saved_at": self.saved_at.isoformat(),
        }


class EmailAnalysis(db.Model):
    __tablename__ = "email_analyses"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    target_role = db.Column(db.String(120), default="")
    decision = db.Column(db.String(100), default="")
    confidence = db.Column(db.Integer, default=0)
    summary = db.Column(db.Text, default="")
    possible_reasons = db.Column(db.JSON, default=list)
    next_steps = db.Column(db.JSON, default=list)
    raw_email_excerpt = db.Column(db.Text, default="")
    raw_result = db.Column(db.JSON, default=dict)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "target_role": self.target_role,
            "decision": self.decision,
            "confidence": self.confidence,
            "summary": self.summary,
            "possible_reasons": self.possible_reasons or [],
            "next_steps": self.next_steps or [],
            "raw_email_excerpt": self.raw_email_excerpt,
            "raw_result": self.raw_result or {},
            "created_at": self.created_at.isoformat(),
        }