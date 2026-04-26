import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";

export default function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const profileSignals = [
    !!user?.headline,
    !!user?.bio,
    !!user?.target_role,
    !!user?.skills?.length,
    !!user?.linkedin_url,
    !!user?.github_url,
  ];
  const profileCompletion = Math.round((profileSignals.filter(Boolean).length / profileSignals.length) * 100);

  useEffect(() => {
    api
      .get("/user/dashboard-summary")
      .then((res) => setSummary(res.data))
      .catch(() => toast.error("Could not load dashboard analytics"));
  }, []);

  const kpis = summary?.kpis || {};

  return (
    <div className="space-y-6">
      <section className="card bg-gradient-to-br from-slate-900 to-slate-800 border-slate-800 text-white">
        <span className="inline-flex text-[11px] font-semibold tracking-widest uppercase text-brand-100 mb-3">
          Command Center
        </span>
        <h1 className="text-2xl md:text-3xl font-semibold">Welcome back, {user?.name || "there"}.</h1>
        <p className="text-sm text-slate-300 mt-2 max-w-2xl">
          Analyze your resume against a job description, discover gaps, and build a focused learning roadmap.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/analyze" className="btn-primary bg-white text-slate-900 hover:bg-slate-100">
            Start New Analysis
          </Link>
          <Link to="/history" className="btn-ghost bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700">
            View History
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Resume Reports</p>
          <p className="text-2xl font-semibold text-slate-900 mt-2">{kpis.total_analyses ?? 0}</p>
          <p className="muted mt-2">All saved resume-vs-job analysis reports.</p>
        </div>
        <div className="card">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Average Match Score</p>
          <p className="text-2xl font-semibold text-slate-900 mt-2">{kpis.average_match_score ?? 0}%</p>
          <p className="muted mt-2">Portfolio-level fit indicator across all analyses.</p>
        </div>
        <div className="card">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Decision Reports</p>
          <p className="text-2xl font-semibold text-slate-900 mt-2">{kpis.email_reports ?? 0}</p>
          <p className="muted mt-2">Detailed company response-email decision analysis history.</p>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="card">
          <h2 className="section-title">Profile Readiness</h2>
          <p className="muted mt-1">A richer profile improves recommendation quality.</p>
          <div className="w-full h-3 bg-slate-200 rounded-full mt-4">
            <div className="h-3 rounded-full bg-brand-500" style={{ width: `${profileCompletion}%` }} />
          </div>
          <p className="text-sm text-slate-700 mt-3 font-medium">{profileCompletion}% complete</p>
          <Link to="/profile" className="btn-ghost mt-4">
            Improve profile
          </Link>
        </div>
        <div className="card">
          <h2 className="section-title">Learning Progress</h2>
          <p className="muted mt-1">
            {kpis.completed_courses ?? 0}/{kpis.saved_courses ?? 0} saved courses marked completed.
          </p>
          <div className="w-full h-3 bg-slate-200 rounded-full mt-4">
            <div
              className="h-3 rounded-full bg-brand-500"
              style={{
                width: `${(kpis.saved_courses || 0) > 0 ? Math.round(((kpis.completed_courses || 0) / kpis.saved_courses) * 100) : 0}%`,
              }}
            />
          </div>
          <Link to="/courses" className="btn-ghost mt-4">
            View course roadmap
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="card">
          <h2 className="section-title">Top Missing Skills (All Reports)</h2>
          <div className="mt-3 space-y-2">
            {(summary?.top_missing_skills || []).slice(0, 6).map((item) => (
              <div key={item.skill} className="flex items-center justify-between text-sm">
                <span className="text-slate-700 capitalize">{item.skill}</span>
                <span className="tag-gray">{item.count}</span>
              </div>
            ))}
            {!(summary?.top_missing_skills || []).length && <p className="muted">No missing-skill data yet.</p>}
          </div>
        </div>
        <div className="card">
          <h2 className="section-title">New: Email Insights</h2>
          <p className="muted mt-1">
            Upload recruiter/company response emails to understand likely decisions and next actions.
          </p>
          <Link to="/email-insights" className="btn-primary mt-4">
            Analyze response email
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="card">
          <h2 className="section-title">Recent Resume Reports</h2>
          <div className="mt-3 space-y-3">
            {(summary?.recent_resume_reports || []).slice(0, 4).map((report) => (
              <article key={report.id} className="rounded-xl border border-slate-200 p-3">
                <p className="text-sm font-semibold text-slate-800">{report.job_title || "Role not specified"}</p>
                <p className="text-xs text-slate-500 mt-1">{new Date(report.created_at).toLocaleString()}</p>
                <p className="text-sm text-slate-600 mt-2">{report.match_score}% match</p>
              </article>
            ))}
            {!(summary?.recent_resume_reports || []).length && <p className="muted">No reports yet.</p>}
          </div>
        </div>
        <div className="card">
          <h2 className="section-title">Platform Features</h2>
          <ul className="mt-3 text-sm text-gray-600 space-y-2 list-disc list-inside leading-6">
            <li>OTP-enabled forgot password and secure account recovery.</li>
            <li>Detailed resume and email analysis reports with history.</li>
            <li>Course roadmap with completion tracking.</li>
            <li>Profile intelligence to improve recommendation quality.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
