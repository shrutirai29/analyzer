# Curated course database keyed by skill name.
# Each entry has up to 3 course options (paid + free).
from functools import lru_cache
from urllib.parse import urlparse
from urllib.request import Request, urlopen


COURSES_DB = {
    "python": [
        {"title": "Python for Everybody Specialization", "platform": "Coursera", "provider": "University of Michigan", "duration": "7 weeks", "level": "Beginner", "url": "https://www.coursera.org/specializations/python", "is_free": False, "icon": "🐍"},
        {"title": "Complete Python Bootcamp: Zero to Hero", "platform": "Udemy", "provider": "Jose Portilla", "duration": "22 hours", "level": "Beginner", "url": "https://www.udemy.com/course/complete-python-bootcamp/", "is_free": False, "icon": "🐍"},
        {"title": "Python Full Course for Beginners", "platform": "YouTube", "provider": "freeCodeCamp", "duration": "4.5 hours", "level": "Beginner", "url": "https://www.youtube.com/watch?v=rfscVS0vtbw", "is_free": True, "icon": "🐍"},
    ],
    "javascript": [
        {"title": "The Complete JavaScript Course 2024", "platform": "Udemy", "provider": "Jonas Schmedtmann", "duration": "68 hours", "level": "All Levels", "url": "https://www.udemy.com/course/the-complete-javascript-course/", "is_free": False, "icon": "⚡"},
        {"title": "JavaScript Algorithms & Data Structures", "platform": "freeCodeCamp", "provider": "freeCodeCamp", "duration": "Self-paced", "level": "Intermediate", "url": "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/", "is_free": True, "icon": "⚡"},
    ],
    "react": [
        {"title": "React — The Complete Guide (incl. Redux)", "platform": "Udemy", "provider": "Maximilian Schwarzmüller", "duration": "48 hours", "level": "All Levels", "url": "https://www.udemy.com/course/react-the-complete-guide-incl-redux/", "is_free": False, "icon": "⚛"},
        {"title": "Full Stack Open — React & Node", "platform": "University of Helsinki", "provider": "U of Helsinki", "duration": "Self-paced", "level": "Intermediate", "url": "https://fullstackopen.com/", "is_free": True, "icon": "⚛"},
    ],
    "sql": [
        {"title": "SQL for Data Science", "platform": "Coursera", "provider": "UC Davis", "duration": "4 weeks", "level": "Beginner", "url": "https://www.coursera.org/learn/sql-for-data-science", "is_free": False, "icon": "🗄"},
        {"title": "SQL Tutorial — Full Database Course", "platform": "YouTube", "provider": "freeCodeCamp", "duration": "4 hours", "level": "Beginner", "url": "https://www.youtube.com/watch?v=HXV3zeQKqGY", "is_free": True, "icon": "🗄"},
    ],
    "machine learning": [
        {"title": "Machine Learning Specialization", "platform": "Coursera", "provider": "Andrew Ng / Stanford", "duration": "3 months", "level": "Beginner", "url": "https://www.coursera.org/specializations/machine-learning-introduction", "is_free": False, "icon": "🤖"},
        {"title": "Intro to Machine Learning", "platform": "Kaggle", "provider": "Kaggle", "duration": "Self-paced", "level": "Beginner", "url": "https://www.kaggle.com/learn/intro-to-machine-learning", "is_free": True, "icon": "🤖"},
    ],
    "deep learning": [
        {"title": "Deep Learning Specialization", "platform": "Coursera", "provider": "Andrew Ng / deeplearning.ai", "duration": "5 months", "level": "Intermediate", "url": "https://www.coursera.org/specializations/deep-learning", "is_free": False, "icon": "🧠"},
    ],
    "tensorflow": [
        {"title": "TensorFlow Developer Certificate", "platform": "Coursera", "provider": "deeplearning.ai", "duration": "4 months", "level": "Intermediate", "url": "https://www.coursera.org/professional-certificates/tensorflow-in-practice", "is_free": False, "icon": "🔶"},
    ],
    "data analysis": [
        {"title": "Google Data Analytics Professional Certificate", "platform": "Coursera", "provider": "Google", "duration": "6 months", "level": "Beginner", "url": "https://www.coursera.org/professional-certificates/google-data-analytics", "is_free": False, "icon": "📊"},
        {"title": "Data Analysis with Python", "platform": "freeCodeCamp", "provider": "freeCodeCamp", "duration": "Self-paced", "level": "Intermediate", "url": "https://www.freecodecamp.org/learn/data-analysis-with-python/", "is_free": True, "icon": "📊"},
    ],
    "aws": [
        {"title": "AWS Certified Cloud Practitioner", "platform": "Coursera", "provider": "AWS / Amazon", "duration": "4 weeks", "level": "Beginner", "url": "https://www.coursera.org/learn/aws-cloud-technical-essentials", "is_free": False, "icon": "☁"},
        {"title": "AWS Tutorial for Beginners", "platform": "YouTube", "provider": "Simplilearn", "duration": "11 hours", "level": "Beginner", "url": "https://www.youtube.com/watch?v=k1RI5locZE4", "is_free": True, "icon": "☁"},
    ],
    "docker": [
        {"title": "Docker & Kubernetes: The Practical Guide", "platform": "Udemy", "provider": "Maximilian Schwarzmüller", "duration": "23 hours", "level": "Intermediate", "url": "https://www.udemy.com/course/docker-kubernetes-the-practical-guide/", "is_free": False, "icon": "🐳"},
        {"title": "Docker Tutorial for Beginners", "platform": "YouTube", "provider": "TechWorld with Nana", "duration": "3 hours", "level": "Beginner", "url": "https://www.youtube.com/watch?v=3c-iBn73dDE", "is_free": True, "icon": "🐳"},
    ],
    "kubernetes": [
        {"title": "Kubernetes for Absolute Beginners", "platform": "Udemy", "provider": "Mumshad Mannambeth", "duration": "6 hours", "level": "Beginner", "url": "https://www.udemy.com/course/learn-kubernetes/", "is_free": False, "icon": "⚙"},
    ],
    "java": [
        {"title": "Java Programming and Software Engineering Fundamentals", "platform": "Coursera", "provider": "Duke University", "duration": "5 months", "level": "Beginner", "url": "https://www.coursera.org/specializations/java-programming", "is_free": False, "icon": "☕"},
    ],
    "typescript": [
        {"title": "Understanding TypeScript", "platform": "Udemy", "provider": "Maximilian Schwarzmüller", "duration": "15 hours", "level": "Intermediate", "url": "https://www.udemy.com/course/understanding-typescript/", "is_free": False, "icon": "🔷"},
    ],
    "nodejs": [
        {"title": "The Complete Node.js Developer Course", "platform": "Udemy", "provider": "Andrew Mead", "duration": "35 hours", "level": "All Levels", "url": "https://www.udemy.com/course/the-complete-nodejs-developer-course-2/", "is_free": False, "icon": "🟩"},
    ],
    "git": [
        {"title": "Git & GitHub Crash Course for Beginners", "platform": "YouTube", "provider": "Traversy Media", "duration": "1.5 hours", "level": "Beginner", "url": "https://www.youtube.com/watch?v=SWYqp7iY_Tc", "is_free": True, "icon": "🌿"},
        {"title": "Version Control with Git", "platform": "Coursera", "provider": "Atlassian", "duration": "4 weeks", "level": "Beginner", "url": "https://www.coursera.org/learn/version-control-with-git", "is_free": False, "icon": "🌿"},
    ],
    "excel": [
        {"title": "Excel Skills for Business Specialization", "platform": "Coursera", "provider": "Macquarie University", "duration": "4 months", "level": "Beginner", "url": "https://www.coursera.org/specializations/excel", "is_free": False, "icon": "📗"},
    ],
    "tableau": [
        {"title": "Data Visualization with Tableau Specialization", "platform": "Coursera", "provider": "UC Davis", "duration": "5 months", "level": "Beginner", "url": "https://www.coursera.org/specializations/data-visualization", "is_free": False, "icon": "📈"},
    ],
    "power bi": [
        {"title": "Microsoft Power BI Desktop for Business Intelligence", "platform": "Udemy", "provider": "Maven Analytics", "duration": "19 hours", "level": "All Levels", "url": "https://www.udemy.com/course/microsoft-power-bi-up-running-with-power-bi-desktop/", "is_free": False, "icon": "📉"},
    ],
    "communication": [
        {"title": "Improving Communication Skills", "platform": "Coursera", "provider": "University of Pennsylvania", "duration": "4 weeks", "level": "Beginner", "url": "https://www.coursera.org/learn/wharton-communication-skills", "is_free": False, "icon": "💬"},
    ],
    "agile": [
        {"title": "Agile with Atlassian Jira", "platform": "Coursera", "provider": "Atlassian", "duration": "4 weeks", "level": "Beginner", "url": "https://www.coursera.org/learn/agile-atlassian-jira", "is_free": False, "icon": "🔄"},
    ],
    "scrum": [
        {"title": "Scrum Master Certification Prep", "platform": "Coursera", "provider": "LearnQuest", "duration": "3 weeks", "level": "Beginner", "url": "https://www.coursera.org/learn/scrum-master-certification", "is_free": False, "icon": "🏃"},
    ],
    "linux": [
        {"title": "The Linux Command Line Bootcamp", "platform": "Udemy", "provider": "Colt Steele", "duration": "15 hours", "level": "Beginner", "url": "https://www.udemy.com/course/the-linux-command-line-bootcamp/", "is_free": False, "icon": "🐧"},
        {"title": "Linux Command Line Basics", "platform": "YouTube", "provider": "freeCodeCamp", "duration": "5 hours", "level": "Beginner", "url": "https://www.youtube.com/watch?v=sWbUDq4S6Y8", "is_free": True, "icon": "🐧"},
    ],
}


def get_courses_for_skills(skill_names: list) -> list:
    """
    Given a list of missing skill names, return the best matching courses.
    Returns at most 2 courses per skill, max 8 courses total.
    """
    results = []
    seen_titles = set()

    for skill in skill_names[:6]:
        skill_lower = skill.lower()
        # Try exact match first, then partial
        key = skill_lower if skill_lower in COURSES_DB else next(
            (k for k in COURSES_DB if k in skill_lower or skill_lower in k), None
        )
        if not key:
            continue
        for course in COURSES_DB[key][:2]:
            if course["title"] not in seen_titles:
                seen_titles.add(course["title"])
                results.append({**course, "skill": skill})
        if len(results) >= 8:
            break

    verified = [course for course in results if is_course_url_available(course.get("url", ""))]
    # If network checks fail, avoid returning empty recommendations.
    return verified or results


@lru_cache(maxsize=256)
def is_course_url_available(url: str) -> bool:
    parsed = urlparse(url or "")
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        return False

    try:
        request = Request(url, method="HEAD", headers={"User-Agent": "SkillBridge/1.0"})
        with urlopen(request, timeout=3) as response:
            return 200 <= response.status < 400
    except Exception:
        try:
            request = Request(url, method="GET", headers={"User-Agent": "SkillBridge/1.0"})
            with urlopen(request, timeout=3) as response:
                return 200 <= response.status < 400
        except Exception:
            return False