import os
import json
import anthropic

AI_MODEL = os.getenv("ANTHROPIC_MODEL", "claude-3-5-sonnet-latest")


def analyze_resume(resume_text: str, job_description: str, target_role: str = "") -> dict:
    """
    Send resume + job description to Claude and get structured analysis back.
    Returns a dict with matchScore, dimensionScores, foundSkills, missingSkills, tips, verdict.
    """
    prompt = f"""You are an expert career coach and ATS (Applicant Tracking System) specialist.
Analyze this resume against the job description and give a detailed, honest assessment.

RESUME:
{resume_text}

JOB DESCRIPTION:
{job_description}

TARGET ROLE: {target_role or "not specified"}

Return ONLY valid JSON — no markdown fences, no preamble, no extra text:
{{
  "matchScore": <integer 0-100, honest ATS-style match>,
  "dimensionScores": {{
    "technical": <0-100>,
    "experience": <0-100>,
    "education": <0-100>,
    "soft_skills": <0-100>
  }},
  "foundSkills": [<skills clearly present in the resume that the job wants>],
  "missingSkills": [<important skills in the job description NOT found in resume>],
  "verdict": "<2-3 sentence honest summary of fit and what to do next>",
  "tips": [
    "<specific actionable tip 1 referencing actual resume content>",
    "<specific actionable tip 2>",
    "<specific actionable tip 3>"
  ],
  "topMissingForCourses": [<up to 6 skill names from missingSkills — use common names like: python, javascript, react, sql, machine learning, data analysis, aws, docker, java, typescript, git, excel, communication, agile, nodejs, kubernetes, tensorflow, tableau, power bi>]
}}"""

    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise RuntimeError("ANTHROPIC_API_KEY is not configured.")

    # Lazy client init avoids import-time crashes when SDK/httpx versions mismatch.
    client = anthropic.Anthropic(api_key=api_key)

    message = client.messages.create(
        model=AI_MODEL,
        max_tokens=1200,
        messages=[{"role": "user", "content": prompt}],
    )

    raw = message.content[0].text.strip()
    # Strip any accidental markdown fences
    raw = raw.replace("```json", "").replace("```", "").strip()
    return json.loads(raw)


def analyze_resume_fallback(resume_text: str, job_description: str) -> dict:
    """
    Simple keyword-based fallback if the Anthropic API is unavailable.
    """
    KNOWN_SKILLS = [
        "python", "javascript", "java", "typescript", "golang", "rust", "c++",
        "react", "vue", "angular", "nodejs", "django", "flask", "fastapi", "spring",
        "sql", "postgresql", "mysql", "mongodb", "redis",
        "machine learning", "deep learning", "tensorflow", "pytorch", "scikit-learn",
        "data analysis", "pandas", "numpy", "tableau", "power bi",
        "aws", "azure", "gcp", "docker", "kubernetes", "terraform", "ci/cd",
        "git", "linux", "rest api", "graphql",
        "excel", "communication", "agile", "scrum", "leadership",
    ]

    job_lower = job_description.lower()
    resume_lower = resume_text.lower()

    found = [s for s in KNOWN_SKILLS if s in resume_lower]
    missing = [s for s in KNOWN_SKILLS if s in job_lower and s not in found]

    overlap = len(found)
    total_required = len([s for s in KNOWN_SKILLS if s in job_lower]) or 1
    score = min(90, int((overlap / total_required) * 100))

    return {
        "matchScore": score,
        "dimensionScores": {
            "technical": min(100, score + 5),
            "experience": max(0, score - 8),
            "education": score,
            "soft_skills": min(100, score + 10),
        },
        "foundSkills": found or ["communication", "problem-solving"],
        "missingSkills": missing[:8],
        "verdict": (
            "Strong candidate with good overlap."
            if score >= 65
            else "Good foundation — focus on bridging the technical skill gaps."
        ),
        "tips": [
            "Tailor your resume keywords to mirror the exact language in the job posting.",
            "Quantify your achievements: add numbers, percentages, and impact metrics.",
            "Add a dedicated skills section with all relevant technologies.",
        ],
        "topMissingForCourses": missing[:6],
    }


def analyze_rejection_email_fallback(email_text: str, target_role: str = "") -> dict:
    text = (email_text or "").lower()
    shortlisted_signals = [
        "congratulations",
        "next round",
        "selected",
        "offer",
        "pleased to inform",
    ]
    rejection_signals = [
        "not selected",
        "regret",
        "unfortunately",
        "other candidates",
        "not moving forward",
    ]

    selected_hits = sum(1 for signal in shortlisted_signals if signal in text)
    rejected_hits = sum(1 for signal in rejection_signals if signal in text)

    if selected_hits > rejected_hits:
        decision = "Selected / Moving Forward"
        confidence = min(95, 55 + selected_hits * 12)
        why = [
            "Your profile appears to align with current hiring criteria.",
            "The message indicates progression to the next stage.",
        ]
        next_steps = [
            "Reply quickly and confirm interview availability.",
            "Prepare STAR stories aligned to role requirements.",
            "Research company product, metrics, and recent updates.",
        ]
    elif rejected_hits > 0:
        decision = "Rejected / Not Moving Forward"
        confidence = min(95, 60 + rejected_hits * 10)
        why = [
            "The email language indicates they moved ahead with other candidates.",
            "This commonly reflects role fit, competition, or evidence gaps in impact.",
        ]
        next_steps = [
            "Request concise feedback on skill, experience, and interview gaps.",
            "Tailor your resume with role-specific keywords and measurable outcomes.",
            "Strengthen two priority skills and reapply in 8-12 weeks.",
        ]
    else:
        decision = "Unclear / Needs Manual Review"
        confidence = 45
        why = [
            "The email does not include explicit acceptance or rejection language.",
            "It may be an update, hold status, or process message.",
        ]
        next_steps = [
            "Check for action items, deadlines, or interview scheduling links.",
            "Send a professional follow-up asking for current application status.",
            "Continue parallel applications and interview preparation.",
        ]

    role_text = f" for {target_role}" if target_role else ""
    return {
        "decision": decision,
        "confidence": confidence,
        "summary": f"Automated classification{role_text}: {decision}.",
        "possible_reasons": why,
        "next_steps": next_steps,
    }