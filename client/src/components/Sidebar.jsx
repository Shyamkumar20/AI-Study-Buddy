import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  BookOpen,
  CalendarDays,
  CheckSquare,
  HelpCircle,
  MessageSquareText,
  TrendingUp,
  Bell,
  Settings,
  ShieldAlert,
  LogOut,
  Sparkles,
  Flame,
} from "lucide-react";

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Materials", path: "/materials", icon: BookOpen },
    { label: "Study Plan", path: "/study-plan", icon: CalendarDays },
    { label: "Tasks", path: "/tasks", icon: CheckSquare },
    { label: "Quizzes", path: "/quizzes", icon: HelpCircle },
    { label: "AI Assistant", path: "/chat", icon: MessageSquareText },
    { label: "Progress", path: "/progress", icon: TrendingUp },
    { label: "Notifications", path: "/notifications", icon: Bell },
    { label: "Settings", path: "/settings", icon: Settings },
  ];

  if (user?.role === "admin") {
    navItems.push({ label: "Admin Portal", path: "/admin", icon: ShieldAlert });
  }

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 flex flex-col transition-transform duration-300 ease-in-out
          bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-xl border-r border-slate-800/80
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Brand header */}
        <div className="flex items-center gap-3 px-6 h-20 border-b border-slate-800/80">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
              StudyBuddy AI
            </span>
            <span className="block text-[11px] font-medium text-indigo-400 uppercase tracking-wider">
              Intelligent Tutor
            </span>
          </div>
        </div>

        {/* Streak card banner */}
        <div className="px-5 py-4">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border border-amber-500/20">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400">
                <Flame className="w-5 h-5 fill-orange-400" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-200">
                  {user?.streak || 1}-Day Streak!
                </p>
                <p className="text-[11px] text-slate-400">Keep the fire burning</p>
              </div>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-orange-500/20 text-orange-300 border border-orange-500/30">
              🔥 {user?.streak || 1}d
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`
                }
              >
                <Icon className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User profile info & logout */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/50">
          <div className="flex items-center justify-between gap-3 p-2 rounded-xl">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center font-bold text-white text-sm shrink-0 uppercase shadow-md">
                {user?.name ? user.name[0] : "S"}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-200 truncate">
                  {user?.name || "Student"}
                </p>
                <p className="text-xs text-slate-400 truncate capitalize">
                  {user?.role || "student"}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Log out"
              className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
