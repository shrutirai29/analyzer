import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function AuthPage() {
  const [tab, setTab] = useState("login");
  const [loading, setLoading] = useState(false);

  const { login, signup } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({
    name: "",
    email: "",
    password: "",
    target_role: "",
  });

  // LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password)
      return toast.error("Fill in all fields");

    setLoading(true);
    try {
      await login(loginForm.email, loginForm.password);
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // SIGNUP
  const handleSignup = async (e) => {
    e.preventDefault();
    if (!signupForm.name || !signupForm.email || !signupForm.password)
      return toast.error("Fill in all required fields");

    if (signupForm.password.length < 6)
      return toast.error("Password must be at least 6 characters");

    setLoading(true);
    try {
      await signup(
        signupForm.name,
        signupForm.email,
        signupForm.password,
        signupForm.target_role
      );
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.error || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="btn-ghost absolute top-4 right-4 text-xs flex items-center gap-1.5"
        type="button"
      >
        {theme === "dark" ? <Sun size={13} /> : <Moon size={13} />}
        {theme === "dark" ? "Light" : "Dark"}
      </button>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* LEFT INFO PANEL */}
        <div className="card hidden lg:flex flex-col justify-between bg-slate-900 text-white border-slate-800">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-100/90">
              SkillBridge AI
            </p>
            <h1 className="text-4xl font-serif mt-5 leading-tight">
              Build a resume that gets shortlisted.
            </h1>
            <p className="text-sm text-slate-300 mt-4 leading-6">
              ATS score breakdown, company insights, roadmap courses & profile optimization.
            </p>
          </div>
        </div>

        {/* RIGHT FORM PANEL */}
        <div className="card p-8 md:p-10">

          <h1 className="font-serif text-4xl text-center mb-1">
            SkillBridge
          </h1>
          <p className="text-center muted mb-8">
            Your AI-powered career intelligence platform
          </p>

          {/* Tabs */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-7">
            {["login", "signup"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                  tab === t
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500"
                }`}
              >
                {t === "login" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>

          {/* LOGIN */}
          {tab === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">

              <input
                type="email"
                className="input"
                placeholder="Email address"
                value={loginForm.email}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, email: e.target.value })
                }
              />

              <input
                type="password"
                className="input"
                placeholder="Password"
                value={loginForm.password}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, password: e.target.value })
                }
              />

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full mt-2"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>

              {/* FORGOT PASSWORD LINK */}
              <p
                onClick={() => navigate("/forgot-password")}
                className="text-xs text-blue-500 text-center mt-3 cursor-pointer hover:underline"
              >
                Forgot password?
              </p>
            </form>
          )}

          {/* SIGNUP */}
          {tab === "signup" && (
            <form onSubmit={handleSignup} className="space-y-4">

              <input
                type="text"
                className="input"
                placeholder="Full name"
                value={signupForm.name}
                onChange={(e) =>
                  setSignupForm({ ...signupForm, name: e.target.value })
                }
              />

              <input
                type="email"
                className="input"
                placeholder="Email address"
                value={signupForm.email}
                onChange={(e) =>
                  setSignupForm({ ...signupForm, email: e.target.value })
                }
              />

              <input
                type="text"
                className="input"
                placeholder="Target role"
                value={signupForm.target_role}
                onChange={(e) =>
                  setSignupForm({
                    ...signupForm,
                    target_role: e.target.value,
                  })
                }
              />

              <input
                type="password"
                className="input"
                placeholder="Password"
                value={signupForm.password}
                onChange={(e) =>
                  setSignupForm({ ...signupForm, password: e.target.value })
                }
              />

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full mt-2"
              >
                {loading ? "Creating account..." : "Create account"}
              </button>
            </form>
          )}

          {/* GUEST */}
          <div className="mt-5 text-center">
            <Link
              to="/guest"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              Continue as guest
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}