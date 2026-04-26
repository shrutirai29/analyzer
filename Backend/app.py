import os
from mail_config import mail
from flask import Flask
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from flask_cors import CORS
from dotenv import load_dotenv
from sqlalchemy import text

from models import db
from routes.auth import auth_bp
from routes.analysis import analysis_bp
from routes.courses import courses_bp
from routes.user import user_bp

load_dotenv()


def create_app():
    app = Flask(__name__)

    env = os.getenv("FLASK_ENV", "development")
    debug = env == "development"

    # ── Config ────────────────────────────────────────────
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
        "DATABASE_URL", "sqlite:///skillbridge.db"  # SQLite fallback for dev
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "dev-secret-change-me")
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-flask-secret")
    app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024  # 10 MB max upload
    app.config["JSON_SORT_KEYS"] = False

    app.config["MAIL_SERVER"] = "smtp.gmail.com"
    app.config["MAIL_PORT"] = 587
    app.config["MAIL_USE_TLS"] = True
    app.config["MAIL_USERNAME"] = os.getenv("EMAIL_USER")
    app.config["MAIL_PASSWORD"] = os.getenv("EMAIL_PASS")

    # Upload folder
    upload_dir = os.path.join(os.path.dirname(__file__), "uploads")
    os.makedirs(upload_dir, exist_ok=True)
    app.config["UPLOAD_FOLDER"] = upload_dir

    # ── Extensions ────────────────────────────────────────
    db.init_app(app)
    mail.init_app(app) 
    JWTManager(app)
    Migrate(app, db)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # ── Blueprints ────────────────────────────────────────
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(analysis_bp, url_prefix="/api/analysis")
    app.register_blueprint(courses_bp, url_prefix="/api/courses")
    app.register_blueprint(user_bp, url_prefix="/api/user")

    # ── Health check ──────────────────────────────────────
    @app.route("/api/health")
    def health():
        return {"status": "ok", "service": "SkillBridge API", "environment": env}

    return app


app = create_app()


def ensure_sqlite_columns():
    db_uri = app.config.get("SQLALCHEMY_DATABASE_URI", "")
    if not db_uri.startswith("sqlite"):
        return

    required_columns = {
        "headline": "ALTER TABLE users ADD COLUMN headline VARCHAR(180) DEFAULT ''",
        "bio": "ALTER TABLE users ADD COLUMN bio TEXT DEFAULT ''",
        "years_experience": "ALTER TABLE users ADD COLUMN years_experience INTEGER DEFAULT 0",
        "location": "ALTER TABLE users ADD COLUMN location VARCHAR(120) DEFAULT ''",
        "preferred_work_type": "ALTER TABLE users ADD COLUMN preferred_work_type VARCHAR(50) DEFAULT ''",
        "skills": "ALTER TABLE users ADD COLUMN skills JSON",
        "linkedin_url": "ALTER TABLE users ADD COLUMN linkedin_url VARCHAR(255) DEFAULT ''",
        "github_url": "ALTER TABLE users ADD COLUMN github_url VARCHAR(255) DEFAULT ''",
        "otp_code": "ALTER TABLE users ADD COLUMN otp_code VARCHAR(10) DEFAULT ''",
        "otp_expires_at": "ALTER TABLE users ADD COLUMN otp_expires_at DATETIME",
    }

    existing = db.session.execute(text("PRAGMA table_info(users)")).fetchall()
    existing_columns = {row[1] for row in existing}
    for column_name, ddl in required_columns.items():
        if column_name not in existing_columns:
            db.session.execute(text(ddl))

    analysis_cols = db.session.execute(text("PRAGMA table_info(analyses)")).fetchall()
    analysis_column_names = {row[1] for row in analysis_cols}
    if "raw_result" not in analysis_column_names:
        db.session.execute(text("ALTER TABLE analyses ADD COLUMN raw_result JSON"))
    db.session.commit()

if __name__ == "__main__":
    debug = os.getenv("FLASK_ENV", "development") == "development"
    with app.app_context():
        db.create_all()
        ensure_sqlite_columns()
    app.run(
        host=os.getenv("FLASK_HOST", "127.0.0.1"),
        port=int(os.getenv("FLASK_PORT", "5000")),
        debug=debug,
    )