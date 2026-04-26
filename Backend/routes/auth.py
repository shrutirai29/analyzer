from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
import random
import os
from flask_mail import Message
from mail_config import mail
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
)
from models import db, User

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/signup", methods=["POST"])
def signup():
    data = request.get_json() or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    target_role = (data.get("target_role") or "").strip()

    if not name or not email or not password:
        return jsonify({"error": "Name, email, and password are required."}), 400

    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters."}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "An account with this email already exists."}), 409

    user = User(name=name, email=email, target_role=target_role)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))

    return jsonify({
        "message": "Account created successfully.",
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": user.to_dict(),
    }), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"error": "Email and password are required."}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid email or password."}), 401

    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))

    return jsonify({
        "message": "Logged in successfully.",
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": user.to_dict(),
    })


@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    user_id = get_jwt_identity()
    access_token = create_access_token(identity=user_id)
    return jsonify({"access_token": access_token})


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    user_id = int(get_jwt_identity())
    user = User.query.get_or_404(user_id)
    return jsonify({"user": user.to_dict()})


@auth_bp.route("/forgot-password/request-otp", methods=["POST"])
def request_password_otp():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()

    if not email:
        return jsonify({"error": "Email is required."}), 400

    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({"message": "If this email exists, an OTP has been sent."})

    # ✅ OTP generate
    otp = f"{random.randint(0, 999999):06d}"

    user.otp_code = otp
    user.otp_expires_at = datetime.utcnow() + timedelta(minutes=10)
    db.session.commit()

    # ✅ EMAIL SEND
    try:
        msg = Message(
            subject="Password Reset OTP",
            sender=os.getenv("EMAIL_USER"),
            recipients=[email],
            body=f"Your OTP is {otp}. It is valid for 10 minutes."
        )
        mail.send(msg)
        print("✅ Email sent")

    except Exception as e:
        print("❌ Email error:", e)
        return jsonify({"error": "Failed to send OTP"}), 500

    return jsonify({
        "message": "OTP sent to your email"
    })


@auth_bp.route("/forgot-password/verify-otp", methods=["POST"])
def verify_password_otp():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    otp = (data.get("otp") or "").strip()

    user = User.query.filter_by(email=email).first()

    if not user or not user.otp_code:
        return jsonify({"error": "Invalid OTP request."}), 400

    if user.otp_code != otp:
        return jsonify({"error": "Invalid OTP code."}), 400

    if not user.otp_expires_at or user.otp_expires_at < datetime.utcnow():
        return jsonify({"error": "OTP expired. Request a new one."}), 400

    return jsonify({"message": "OTP verified."})


@auth_bp.route("/forgot-password/reset", methods=["POST"])
def reset_password_with_otp():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    otp = (data.get("otp") or "").strip()
    new_password = data.get("new_password") or ""

    if len(new_password) < 6:
        return jsonify({"error": "New password must be at least 6 characters."}), 400

    user = User.query.filter_by(email=email).first()

    if not user or not user.otp_code:
        return jsonify({"error": "Invalid reset request."}), 400

    if user.otp_code != otp:
        return jsonify({"error": "Invalid OTP code."}), 400

    if not user.otp_expires_at or user.otp_expires_at < datetime.utcnow():
        return jsonify({"error": "OTP expired. Request a new one."}), 400

    user.set_password(new_password)
    user.otp_code = ""
    user.otp_expires_at = None
    db.session.commit()

    return jsonify({"message": "Password reset successful. Please login."})