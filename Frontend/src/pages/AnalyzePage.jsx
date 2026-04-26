import { useState } from "react";
import toast from "react-hot-toast";
import api from "../utils/api";
import ScoreRing from "../components/ScoreRing";
import CourseCard from "../components/CourseCard";
import { Link } from "react-router-dom";

const ROLE_OPTIONS = [
  "Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Analyst",
  "Data Scientist",
  "Machine Learning Engineer",
  "Product Manager",
  "QA Engineer",
  "DevOps Engineer",

   // Non-technical / Business roles
  "Product Manager",
  "Project Manager",
  "Business Analyst",
  "HR Manager",
  "Recruiter",
  "Marketing Manager",
  "Digital Marketing Specialist",
  "Content Writer",
  "Copywriter",
  "Sales Executive",
  "Account Manager",
  "Operations Manager",
  "Customer Support Executive",
  "UI/UX Designer",
  "Graphic Designer",
  "Finance Analyst",
  "Business Development Executive",

   // Non-technical / Business roles
  "Product Manager",
  "Project Manager",
  "Business Analyst",
  "HR Manager",
  "Recruiter",
  "Marketing Manager",
  "Digital Marketing Specialist",
  "Content Writer",
  "Copywriter",
  "Sales Executive",
  "Account Manager",
  "Operations Manager",
  "Customer Support Executive",
  "UI/UX Designer",
  "Graphic Designer",
  "Finance Analyst",
  "Business Development Executive",
];


const SENIORITY_OPTIONS = ["Fresher", "1-2 years", "3-5 years", "5+ years"];

export default function AnalyzePage() {
  const [jobTitle, setJobTitle] = useState(ROLE_OPTIONS[0]);
  const [targetRole, setTargetRole] = useState(ROLE_OPTIONS[0]);
  const [seniority, setSeniority] = useState(SENIORITY_OPTIONS[0]);
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleAnalyze = async (event) => {
    event.preventDefault();
    if (!jobDescription.trim()) return toast.error("Job description is required");
    if (!resumeText.trim() && !resumeFile) return toast.error("Add resume text or upload a file");

    const formData = new FormData();
    formData.append("job_title", jobTitle);
    formData.append("target_role", targetRole);
    formData.append("job_description", jobDescription);
    formData.append("resume_text", resumeText);
    if (resumeFile) formData.append("resume", resumeFile);

    setLoading(true);
    try {
      const response = await api.post("/analysis/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(response.data);
      toast.success("Analysis completed");
    } catch (error) {
      toast.error(error.response?.data?.error || "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const score = result?.analysis?.match_score || 0;
  const dimScores = result?.analysis?.dimension_scores || {};
  const weakestArea = Object.entries(dimScores).sort((a, b) => a[1] - b[1])[0]?.[0];

  const motivationMessage =
    score >= 75
      ? "Amazing progress! You are close to interview-ready. A few focused tweaks can make this profile stand out."
      : score >= 55
      ? "Good momentum. Your profile has potential; improving the weakest areas can quickly boost shortlist chances."
      : "Strong start. Most candidates begin here - consistent iteration on resume + skills will create big improvements.";

  const improvementPlan = [
    weakestArea ? `Primary focus area: ${weakestArea.replace("_", " ")}.` : null,
    "Update 3 resume bullets with measurable outcomes (numbers, %, impact).",
    "Mirror 8-12 keywords from the job description naturally in your experience section.",
    "Complete 1-2 recommended courses for top missing skills this week.",
  ].filter(Boolean);

  return (
    <div className="space-y-6">
      <section className="card">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-slate-100">Resume Analyzer</h1>
        <p className="text-sm text-gray-500 dark:text-slate-300 mt-1">Guided flow: choose role -&gt; add JD -&gt; upload resume -&gt; get action plan.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/dashboard" className="btn-ghost text-xs">Back to dashboard</Link>
          <Link to="/email-insights" className="btn-ghost text-xs">Analyze company email</Link>
          <Link to="/courses" className="btn-ghost text-xs">See learning roadmap</Link>
        </div>
        <form className="mt-5 space-y-4" onSubmit={handleAnalyze}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select className="input" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)}>
              {ROLE_OPTIONS.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
            <select className="input" value={targetRole} onChange={(e) => setTargetRole(e.target.value)}>
              {ROLE_OPTIONS.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select className="input" value={seniority} onChange={(e) => setSeniority(e.target.value)}>
              {SENIORITY_OPTIONS.map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
            <input className="input" value={resumeFile?.name || ""} placeholder="Selected file name appears here" readOnly />
          </div>
          <textarea
            className="input min-h-36"
            placeholder="Paste job description"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
          <textarea
            className="input min-h-32"
            placeholder="Paste resume text (optional if uploading file)"
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
          />
          <input type="file" accept=".pdf,.docx,.txt" onChange={(e) => setResumeFile(e.target.files?.[0] || null)} />
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Analyzing..." : "Analyze Resume"}
          </button>
        </form>
      </section>

      {result?.analysis && (
        <section className="space-y-5">
          <div className="card">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-slate-100">Analysis Result</h2>
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <ScoreRing score={result.analysis.match_score || 0} />
              <div className="space-y-2 text-sm text-gray-700 dark:text-slate-200">
                <p><span className="font-semibold">Verdict:</span> {result.analysis.verdict}</p>
                <p><span className="font-semibold">Found skills:</span> {(result.analysis.found_skills || []).join(", ") || "N/A"}</p>
                <p><span className="font-semibold">Missing skills:</span> {(result.analysis.missing_skills || []).join(", ") || "N/A"}</p>
                <p><span className="font-semibold">Seniority context:</span> {seniority}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold text-gray-900 dark:text-slate-100">Improvement Plan (Personalized)</h3>
            <ul className="list-disc list-inside text-sm text-gray-600 dark:text-slate-300 mt-3 space-y-1">
              {improvementPlan.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ul>
          </div>

          <div className="card bg-gradient-to-r from-brand-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
            <h3 className="font-semibold text-gray-900 dark:text-slate-100">Motivation Coach</h3>
            <p className="text-sm text-gray-700 dark:text-slate-300 mt-2">{motivationMessage}</p>
          </div>

          <div className="card">
            <h3 className="font-semibold text-gray-900 dark:text-slate-100">AI Suggestions</h3>
            <ul className="list-disc list-inside text-sm text-gray-600 dark:text-slate-300 mt-3 space-y-1">
              {(result.analysis.ai_tips || []).map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-200 mb-3">Recommended Courses</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {(result.recommended_courses || []).map((course) => (
                <CourseCard key={`${course.title}-${course.skill}`} course={course} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
