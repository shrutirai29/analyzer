from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, SavedCourse

courses_bp = Blueprint("courses", __name__)


@courses_bp.route("/", methods=["GET"])
@jwt_required()
def get_courses():
    user_id = int(get_jwt_identity())
    courses = SavedCourse.query.filter_by(user_id=user_id).order_by(SavedCourse.saved_at.desc()).all()
    return jsonify({"courses": [c.to_dict() for c in courses]})


@courses_bp.route("/", methods=["POST"])
@jwt_required()
def save_course():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    # Prevent duplicates
    existing = SavedCourse.query.filter_by(user_id=user_id, url=data.get("url", "")).first()
    if existing:
        return jsonify({"error": "Course already saved."}), 409

    course = SavedCourse(
        user_id=user_id,
        skill=data.get("skill", ""),
        title=data.get("title", ""),
        platform=data.get("platform", ""),
        provider=data.get("provider", ""),
        duration=data.get("duration", ""),
        level=data.get("level", ""),
        url=data.get("url", ""),
        is_free=data.get("is_free", False),
    )
    db.session.add(course)
    db.session.commit()
    return jsonify({"course": course.to_dict()}), 201


@courses_bp.route("/<int:course_id>/complete", methods=["PATCH"])
@jwt_required()
def toggle_complete(course_id):
    user_id = int(get_jwt_identity())
    course = SavedCourse.query.filter_by(id=course_id, user_id=user_id).first_or_404()
    course.is_completed = not course.is_completed
    db.session.commit()
    return jsonify({"course": course.to_dict()})


@courses_bp.route("/<int:course_id>", methods=["DELETE"])
@jwt_required()
def delete_course(course_id):
    user_id = int(get_jwt_identity())
    course = SavedCourse.query.filter_by(id=course_id, user_id=user_id).first_or_404()
    db.session.delete(course)
    db.session.commit()
    return jsonify({"message": "Course removed."})