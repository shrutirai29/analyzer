import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  FileSearch,
  FilePenLine,
  BookOpen,
  History,
  User,
  LogOut,
  MailCheck,
  Moon,
  Sun,
  ShieldCheck,
  BarChart3,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/analyze", label: "Analyze Resume", icon: FileSearch },
  { to: "/resume-builder", label: "Build Resume", icon: FilePenLine },
  { to: "/email-insights", label: "Email Insights", icon: MailCheck },
  { to: "/courses", label: "My Courses", icon: BookOpen },
  { to: "/history", label: "History", icon: History },
  { to: "/profile", label: "Profile", icon: User },
];

function initials(name = "") {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

export default function AppLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Top Nav */}
      <header className="bg-white/90 dark:bg-slate-950/90 border-b border-gray-100 dark:border-slate-800 min-h-14 flex items-center justify-between px-6 py-2 flex-shrink-0 z-50">
        <div>
          <span className="font-serif text-xl text-gray-900 dark:text-slate-100">
            <span className="inline-block w-2 h-2 rounded-full bg-brand-500 mr-2 mb-0.5" />
            SkillBridge
          </span>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Career intelligence and application optimization</p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800">
            <ShieldCheck size={12} />
            Auth + OTP
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800">
            <BarChart3 size={12} />
            Reports + Insights
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-brand-50 dark:bg-slate-800 text-brand-900 dark:text-brand-100 text-xs font-semibold flex items-center justify-center">
              {initials(user?.name)}
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-slate-300">{user?.name}</span>
          </div>
          <button onClick={toggleTheme} className="btn-ghost text-xs flex items-center gap-1.5 py-1.5 px-3">
            {theme === "dark" ? <Sun size={13} /> : <Moon size={13} />}
            {theme === "dark" ? "Light" : "Dark"}
          </button>
          <button onClick={handleLogout} className="btn-ghost text-xs flex items-center gap-1.5 py-1.5 px-3">
            <LogOut size={13} /> Sign out
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-52 bg-white/90 dark:bg-slate-950/90 border-r border-gray-100 dark:border-slate-800 py-5 px-3 flex-shrink-0 overflow-y-auto">
          <p className="text-[10px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-widest px-3 mb-2">Menu</p>
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium mb-0.5 transition-all ${
                  isActive
                    ? "bg-brand-50 dark:bg-slate-800 text-brand-900 dark:text-brand-100"
                    : "text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-800 dark:hover:text-slate-200"
                }`
              }
            >
              <Icon size={15} />
              {label}
            </NavLink>
          ))}
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-7 bg-gray-50/70 dark:bg-slate-950/40">
          <Outlet />
        </main>
      </div>
    </div>
  );
}