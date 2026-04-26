import { Link } from "react-router-dom";
import { Sparkles, Rocket, GraduationCap, TrendingUp } from "lucide-react";

const guestCards = [
  { title: "Resume Match", value: "78%", icon: TrendingUp, note: "Sample role alignment score" },
  { title: "Missing Skills", value: "5", icon: Sparkles, note: "Detected from a sample JD" },
  { title: "Courses Suggested", value: "8", icon: GraduationCap, note: "Mapped to your skill gaps" },
];

export default function GuestDashboardPage() {
  return (
    <div className="min-h-screen px-4 py-8 md:py-12">
      <div className="max-w-6xl mx-auto space-y-6">
        <section className="card bg-gradient-to-br from-slate-900 to-slate-800 text-white border-slate-800">
          <p className="text-xs tracking-[0.2em] uppercase text-brand-100">Guest Preview</p>
          <h1 className="text-3xl md:text-4xl font-semibold mt-3">See how SkillBridge helps candidates stand out.</h1>
          <p className="text-slate-300 mt-3 max-w-2xl">
            This is a sample dashboard with demo metrics. Create an account to unlock personalized analysis, history, and career roadmap.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/login" className="btn-primary bg-white text-slate-900 hover:bg-slate-100">
              Create Free Account
            </Link>
            <Link to="/login" className="btn-ghost bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700">
              Sign In
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {guestCards.map(({ title, value, note, icon: Icon }) => (
            <article key={title} className="card">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-600">{title}</p>
                <Icon size={16} className="text-brand-500" />
              </div>
              <p className="text-3xl font-semibold text-slate-900 mt-2">{value}</p>
              <p className="muted mt-2">{note}</p>
            </article>
          ))}
        </section>

        <section className="card">
          <div className="flex items-center gap-2 text-slate-700">
            <Rocket size={16} />
            <p className="font-semibold">Startup-level roadmap feature highlights</p>
          </div>
          <ul className="mt-3 text-sm text-slate-600 list-disc list-inside space-y-2">
            <li>Analyze rejection/selection emails to learn what to improve.</li>
            <li>Track profile completeness and prioritize high-impact updates.</li>
            <li>Save and complete skill-gap courses from trusted sources.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
