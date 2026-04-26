import { useState } from "react";
import toast from "react-hot-toast";
import api from "../utils/api";

export default function ResumeBuilderPage() {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    location: "",
    target_role: "Software Engineer",
    summary: "",
    skills: "",
    projects: "",
    education: "",
    experience: "",
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    if (!form.full_name || !form.target_role) {
      toast.error("Please add your name and target role.");
      return;
    }
    setLoading(true);
    try {
      const response = await api.post("/analysis/build-resume", {
        ...form,
        skills: form.skills.split(",").map((x) => x.trim()).filter(Boolean),
        projects: form.projects.split("\n").map((x) => x.trim()).filter(Boolean),
        education: form.education.split("\n").map((x) => x.trim()).filter(Boolean),
        experience: form.experience.split("\n").map((x) => x.trim()).filter(Boolean),
      });
      setResult(response.data.resume);
      toast.success("Resume draft generated");
    } catch (error) {
      toast.error(error.response?.data?.error || "Could not generate resume");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="card">
        <h1 className="section-title dark:text-slate-100">Resume Builder Assistant</h1>
        <p className="muted mt-1">No resume? Answer these prompts and get a strong resume draft instantly.</p>
        <form className="mt-5 space-y-4" onSubmit={submit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="input" placeholder="Full name" value={form.full_name} onChange={(e) => update("full_name", e.target.value)} />
            <input className="input" placeholder="Target role" value={form.target_role} onChange={(e) => update("target_role", e.target.value)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input className="input" placeholder="Email" value={form.email} onChange={(e) => update("email", e.target.value)} />
            <input className="input" placeholder="Phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
            <input className="input" placeholder="Location" value={form.location} onChange={(e) => update("location", e.target.value)} />
          </div>
          <textarea className="input min-h-24" placeholder="Professional summary" value={form.summary} onChange={(e) => update("summary", e.target.value)} />
          <input className="input" placeholder="Skills (comma-separated)" value={form.skills} onChange={(e) => update("skills", e.target.value)} />
          <textarea className="input min-h-24" placeholder="Projects (one per line)" value={form.projects} onChange={(e) => update("projects", e.target.value)} />
          <textarea className="input min-h-20" placeholder="Experience (one per line)" value={form.experience} onChange={(e) => update("experience", e.target.value)} />
          <textarea className="input min-h-20" placeholder="Education (one per line)" value={form.education} onChange={(e) => update("education", e.target.value)} />
          <button className="btn-primary" disabled={loading} type="submit">{loading ? "Generating..." : "Generate Resume Draft"}</button>
        </form>
      </section>

      {result && (
        <section className="card space-y-4">
          <h2 className="section-title dark:text-slate-100">Generated Resume</h2>
          <pre className="bg-slate-900 text-slate-100 text-sm p-4 rounded-xl overflow-auto whitespace-pre-wrap">{result.text}</pre>
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Improvement Tips</p>
            <ul className="mt-2 list-disc list-inside text-sm text-slate-600 dark:text-slate-300 space-y-1">
              {(result.improvement_tips || []).map((tip) => <li key={tip}>{tip}</li>)}
            </ul>
          </div>
          <p className="text-sm text-brand-600 dark:text-brand-300 font-medium">{result.motivation}</p>
        </section>
      )}
    </div>
  );
}
