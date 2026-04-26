import toast from "react-hot-toast";
import api from "../utils/api";

const PLATFORM_COLORS = {
  Coursera: "text-blue-700",
  Udemy: "text-purple-700",
  YouTube: "text-red-600",
  freeCodeCamp: "text-green-700",
  Kaggle: "text-teal-700",
  default: "text-gray-600",
};

const SKILL_ICONS = {
  python: "🐍", javascript: "⚡", react: "⚛", sql: "🗄", java: "☕",
  "machine learning": "🤖", "deep learning": "🧠", tensorflow: "🔶",
  "data analysis": "📊", aws: "☁", docker: "🐳", kubernetes: "⚙",
  typescript: "🔷", nodejs: "🟩", git: "🌿", excel: "📗",
  tableau: "📈", "power bi": "📉", communication: "💬", agile: "🔄",
  default: "📖",
};

function getIcon(skill = "") {
  const key = Object.keys(SKILL_ICONS).find((k) => skill.toLowerCase().includes(k));
  return SKILL_ICONS[key] || SKILL_ICONS.default;
}

export default function CourseCard({ course, onSaved, showSave = true, showRemove = false, onRemove }) {
  const platformColor = PLATFORM_COLORS[course.platform] || PLATFORM_COLORS.default;

  const handleSave = async () => {
    try {
      await api.post("/courses/", course);
      toast.success("Course saved to your roadmap");
      onSaved?.();
    } catch (err) {
      if (err.response?.status === 409) toast.error("Already in your list");
      else toast.error("Failed to save course");
    }
  };

  return (
    <div className="card flex gap-3 items-start hover:shadow-md transition-shadow">
      <div className="w-11 h-11 rounded-xl bg-gray-50 flex items-center justify-center text-xl flex-shrink-0">
        {getIcon(course.skill || course.title)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 leading-snug mb-0.5">{course.title}</p>
        <p className="text-xs text-gray-400 mb-2">{course.provider} · {course.duration} · {course.level}</p>
        {course.skill && (
          <span className="tag-red mb-2 inline-block">Gap: {course.skill}</span>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold ${platformColor}`}>{course.platform}</span>
            {course.is_free && (
              <span className="tag-green">Free</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <a
              href={course.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-brand-500 hover:text-brand-600"
            >
              View →
            </a>
            {showSave && (
              <button
                onClick={handleSave}
                className="text-xs font-semibold text-gray-500 hover:text-gray-800"
              >
                + Save
              </button>
            )}
            {showRemove && (
              <button
                onClick={onRemove}
                className="text-xs font-semibold text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}