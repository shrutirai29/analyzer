import { useState } from "react";
import toast from "react-hot-toast";
import api from "../utils/api";

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
];

export default function EmailInsightsPage() {
  const [targetRole, setTargetRole] = useState(ROLE_OPTIONS[0]);
  const [emailText, setEmailText] = useState("");
  const [emailFile, setEmailFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!emailText.trim() && !emailFile) {
      toast.error("Paste email content or upload a file.");
      return;
    }

    const formData = new FormData();
    formData.append("target_role", targetRole);
    formData.append("email_text", emailText);
    if (emailFile) formData.append("email_file", emailFile);

    setLoading(true);
    try {
      const response = await api.post("/analysis/email-feedback", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(response.data.email_analysis);
      toast.success("Email analysis ready");
    } catch (error) {
      toast.error(error.response?.data?.error || "Could not analyze this email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="card">
        <h1 className="section-title">Company Response Email Analyzer</h1>
        <p className="muted mt-1">
          Upload or paste recruiter/company response emails to understand likely outcomes and next actions.
        </p>

        <form className="space-y-4 mt-5" onSubmit={handleSubmit}>
          <select className="input" value={targetRole} onChange={(e) => setTargetRole(e.target.value)}>
            {ROLE_OPTIONS.map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
          <textarea
            className="input min-h-44"
            placeholder="Paste recruiter/company response email here"
            value={emailText}
            onChange={(e) => setEmailText(e.target.value)}
          />
          <input type="file" accept=".pdf,.docx,.txt" onChange={(e) => setEmailFile(e.target.files?.[0] || null)} />
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? "Analyzing..." : "Analyze Email"}
          </button>
        </form>
      </section>

      {result && (
        <section className="card space-y-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400">Likely Outcome</p>
            <p className="text-2xl font-semibold text-slate-900 mt-1">{result.decision}</p>
            <p className="muted mt-1">Confidence: {result.confidence}%</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">Summary</p>
            <p className="text-sm text-slate-600 mt-1">{result.summary}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">Possible Reasons</p>
            <ul className="mt-2 text-sm text-slate-600 list-disc list-inside space-y-1">
              {(result.possible_reasons || []).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">What to Do Next</p>
            <ul className="mt-2 text-sm text-slate-600 list-disc list-inside space-y-1">
              {(result.next_steps || []).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}
