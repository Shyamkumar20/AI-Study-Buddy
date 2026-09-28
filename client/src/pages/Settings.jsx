import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { authService } from "../services/authService";
import {
  Settings as SettingsIcon,
  User,
  Mail,
  Clock,
  Sun,
  Moon,
  Save,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Shield,
} from "lucide-react";

export const Settings = () => {
  const { user, updateUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [name, setName] = useState(user?.name || "");
  const [studyGoalHours, setStudyGoalHours] = useState(user?.studyGoalHours || 2);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await authService.updateProfile({
        name,
        studyGoalHours: Number(studyGoalHours),
      });
      updateUser(res.user);
      setSuccess("Profile settings saved successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Account & Preferences</h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage your personal study targets and interface preferences
        </p>
      </div>

      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-5">
          <div className="flex items-center gap-4 pb-4 border-b border-slate-800">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center font-bold text-white text-xl uppercase shadow-lg shadow-indigo-500/25">
              {user?.name ? user.name[0] : "S"}
            </div>
            <div>
              <h2 className="text-base font-bold text-white">{user?.name || "Student"}</h2>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                <span className="capitalize font-medium">{user?.role || "student"}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  disabled
                  value={user?.email || ""}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/40 border border-slate-800 text-sm text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Study Preferences */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-5">
          <h2 className="text-base font-bold text-white">Study Preferences</h2>

          <div>
            <div className="flex items-center justify-between text-xs font-medium text-slate-300 mb-2">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-400" />
                <span>Daily Study Goal</span>
              </span>
              <span className="text-indigo-400 font-bold">{studyGoalHours} Hours / Day</span>
            </div>
            <input
              type="range"
              min="1"
              max="8"
              value={studyGoalHours}
              onChange={(e) => setStudyGoalHours(e.target.value)}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <div>
              <p className="text-sm font-semibold text-white">Appearance Theme</p>
              <p className="text-xs text-slate-400 mt-0.5">Toggle between dark and light mode</p>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-2 text-xs font-semibold"
            >
              {theme === "dark" ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-400" />
                  <span>Dark Mode</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Preferences</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={logout}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>
      </form>
    </div>
  );
};
