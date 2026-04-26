import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../utils/api";
import ScoreRing from "../components/ScoreRing";

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState([]);
  const [emailReports, setEmailReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = async () => {
    try {
      const [resumeRes, emailRes] = await Promise.all([
        api.get("/analysis/history"),
        api.get("/analysis/email-history"),
      ]);
      setAnalyses(resumeRes.data.analyses || []);
      setEmailReports(emailRes.data.reports || []);
    } catch {
      toast.error("Failed to load analysis history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const removeAnalysis = async (analysisId) => {
    try {
      await api.delete(`/analysis/${analysisId}`);
      setAnalyses((prev) => prev.filter((item) => item.id !== analysisId));
      toast.success("Analysis deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  if (loading) return <div className="text-sm text-gray-500 dark:text-slate-300">Loading history...</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-slate-100">Detailed Report History</h1>
      {!analyses.length ? (
        <div className="card text-sm text-gray-500 dark:text-slate-300">No analyses yet. Run your first analysis to see results here.</div>
      ) : (
        analyses.map((analysis) => (
          <div key={analysis.id} className="card flex flex-col md:flex-row gap-5">
            <ScoreRing score={analysis.match_score} size={95} strokeWidth={10} />
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">{analysis.job_title || "Role not specified"}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{analysis.created_at ? new Date(analysis.created_at).toLocaleString() : ""}</p>
              <p className="text-sm text-gray-600 dark:text-slate-300 mt-2">{analysis.verdict}</p>
              <div className="mt-3 text-sm text-slate-600 dark:text-slate-300 space-y-1">
                <p><span className="font-semibold">Found skills:</span> {(analysis.found_skills || []).join(", ") || "N/A"}</p>
                <p><span className="font-semibold">Missing skills:</span> {(analysis.missing_skills || []).join(", ") || "N/A"}</p>
                <p><span className="font-semibold">Improvement tips:</span> {(analysis.ai_tips || []).slice(0, 2).join(" | ") || "N/A"}</p>
              </div>
            </div>
            <button className="btn-danger h-fit" onClick={() => removeAnalysis(analysis.id)}>
              Delete
            </button>
          </div>
        ))
      )}

      <section className="pt-3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-3">Email Decision Reports</h2>
        {!emailReports.length ? (
          <div className="card text-sm text-gray-500 dark:text-slate-300">No email decision reports yet.</div>
        ) : (
          emailReports.map((report) => (
            <article key={report.id} className="card mb-3">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{report.decision} ({report.confidence}%)</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{new Date(report.created_at).toLocaleString()}</p>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">{report.summary}</p>
              <div className="mt-3">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">Action Plan</p>
                <ul className="text-sm text-slate-600 dark:text-slate-300 mt-1 list-disc list-inside space-y-1">
                  {(report.next_steps || []).map((step) => <li key={step}>{step}</li>)}
                </ul>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
