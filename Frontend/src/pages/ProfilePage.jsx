import { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [targetRole, setTargetRole] = useState(user?.target_role || "");
  const [headline, setHeadline] = useState(user?.headline || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [location, setLocation] = useState(user?.location || "");
  const [preferredWorkType, setPreferredWorkType] = useState(user?.preferred_work_type || "");
  const [linkedinUrl, setLinkedinUrl] = useState(user?.linkedin_url || "");
  const [githubUrl, setGithubUrl] = useState(user?.github_url || "");
  const [yearsExperience, setYearsExperience] = useState(user?.years_experience || 0);
  const [skillsInput, setSkillsInput] = useState((user?.skills || []).join(", "));
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const saveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const skills = skillsInput
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      const response = await api.put("/user/profile", {
        name,
        target_role: targetRole,
        headline,
        bio,
        location,
        preferred_work_type: preferredWorkType,
        linkedin_url: linkedinUrl,
        github_url: githubUrl,
        years_experience: yearsExperience,
        skills,
      });
      updateUser(response.data.user);
      toast.success("Profile updated");
    } catch (error) {
      toast.error(error.response?.data?.error || "Profile update failed");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (event) => {
    event.preventDefault();
    if (!currentPassword || !newPassword) return toast.error("Please fill password fields");
    try {
      await api.put("/user/change-password", {
        current_password: currentPassword,
        new_password: newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      toast.success("Password changed");
    } catch (error) {
      toast.error(error.response?.data?.error || "Password change failed");
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <section className="card">
        <h1 className="text-xl font-semibold text-gray-900">Profile</h1>
        <p className="muted mt-1">Add more signals so analysis and recommendations are more personalized.</p>
        <form className="space-y-4 mt-4" onSubmit={saveProfile}>
          <input className="input" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="input" placeholder="Professional headline" value={headline} onChange={(e) => setHeadline(e.target.value)} />
          <input className="input" placeholder="Target role" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} />
          <textarea className="input min-h-24" placeholder="Short bio" value={bio} onChange={(e) => setBio(e.target.value)} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="input" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
            <input
              className="input"
              placeholder="Years of experience"
              type="number"
              min="0"
              value={yearsExperience}
              onChange={(e) => setYearsExperience(e.target.value)}
            />
          </div>
          <select className="input" value={preferredWorkType} onChange={(e) => setPreferredWorkType(e.target.value)}>
            <option value="">Preferred work type</option>
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
            <option value="onsite">On-site</option>
            <option value="open">Open to all</option>
          </select>
          <input className="input" placeholder="Top skills (comma separated)" value={skillsInput} onChange={(e) => setSkillsInput(e.target.value)} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="input" placeholder="LinkedIn URL" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} />
            <input className="input" placeholder="GitHub URL" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} />
          </div>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </section>

      <section className="card">
        <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
        <form className="space-y-4 mt-4" onSubmit={changePassword}>
          <input
            type="password"
            className="input"
            placeholder="Current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <input
            type="password"
            className="input"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <button type="submit" className="btn-ghost">
            Update Password
          </button>
        </form>
      </section>
    </div>
  );
}
