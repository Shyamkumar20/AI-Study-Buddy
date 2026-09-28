import React, { useState, useEffect } from "react";
import { userService } from "../services/userService";
import { EmptyState } from "../components/EmptyState";
import { SkeletonList } from "../components/SkeletonLoader";
import {
  Bell,
  CheckCircle2,
  Flame,
  CheckSquare,
  HelpCircle,
  Info,
  Check,
} from "lucide-react";

export const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        setLoading(true);
        const data = await userService.getNotifications();
        setNotifications(data || []);
      } catch (err) {
        console.error("Failed to load notifications:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifs();
  }, []);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const getIcon = (type) => {
    switch (type) {
      case "streak":
        return <Flame className="w-5 h-5 text-orange-400" />;
      case "task":
        return <CheckSquare className="w-5 h-5 text-indigo-400" />;
      case "quiz":
        return <HelpCircle className="w-5 h-5 text-emerald-400" />;
      default:
        return <Info className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Notifications</h1>
          <p className="text-sm text-slate-400 mt-1">
            Stay informed on your study reminders, streak milestones, and task deadlines
          </p>
        </div>

        {notifications.some((n) => !n.read) && (
          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {loading ? (
        <SkeletonList count={4} />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="All caught up!"
          description="You don't have any unread notifications right now."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-5 rounded-2xl border transition-all flex items-start gap-4 ${
                notif.read
                  ? "bg-slate-900/30 border-slate-800/60 text-slate-400"
                  : "bg-slate-900/70 border-indigo-500/20 text-slate-200 shadow-md"
              }`}
            >
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 shrink-0">
                {getIcon(notif.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-white">{notif.title}</h3>
                  <span className="text-[11px] text-slate-500 shrink-0">
                    {new Date(notif.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{notif.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
