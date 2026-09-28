import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { userService } from "../services/userService";
import {
  Menu,
  Sun,
  Moon,
  Bell,
  Sparkles,
  ExternalLink,
} from "lucide-react";

export const Navbar = ({ onToggleSidebar }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const data = await userService.getNotifications();
        setNotifications(data || []);
      } catch (err) {
        // Silently handle if unauthenticated
      }
    };
    fetchNotifs();
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 h-20 px-4 sm:px-8 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/80 dark:bg-slate-950/80 backdrop-blur-md">
      <div className="flex items-center gap-4">
        {/* Mobile toggle button */}
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden transition-colors"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Gemini Flash Active</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className="p-2.5 rounded-xl border border-slate-700/60 bg-slate-800/60 text-slate-300 hover:text-white hover:border-slate-600 transition-all duration-200"
        >
          {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="p-2.5 rounded-xl border border-slate-700/60 bg-slate-800/60 text-slate-300 hover:text-white hover:border-slate-600 transition-all duration-200 relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-indigo-500 text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                <span className="text-sm font-semibold text-white">Notifications</span>
                <Link
                  to="/notifications"
                  onClick={() => setShowNotifs(false)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  View all <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              <div className="space-y-2.5 max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">No notifications yet</p>
                ) : (
                  notifications.slice(0, 4).map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3 rounded-xl border transition-colors ${
                        notif.read
                          ? "bg-slate-800/40 border-slate-800/60 text-slate-400"
                          : "bg-indigo-500/10 border-indigo-500/20 text-slate-200"
                      }`}
                    >
                      <p className="text-xs font-semibold text-white">{notif.title}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{notif.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Pill */}
        <Link
          to="/settings"
          className="flex items-center gap-2.5 pl-2 pr-3.5 py-1.5 rounded-full border border-slate-700/60 bg-slate-800/40 hover:bg-slate-800/80 transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center text-xs font-bold text-white shadow-sm">
            {user?.name ? user.name[0] : "U"}
          </div>
          <span className="text-xs font-medium text-slate-200 hidden sm:inline-block max-w-[120px] truncate">
            {user?.name || "Student"}
          </span>
        </Link>
      </div>
    </header>
  );
};
