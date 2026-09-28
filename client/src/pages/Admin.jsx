import React, { useState, useEffect } from "react";
import { adminService } from "../services/adminService";
import { SkeletonList, SkeletonCard } from "../components/SkeletonLoader";
import {
  ShieldAlert,
  Users,
  BookOpen,
  Trash2,
  Calendar,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export const Admin = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsData, usersData] = await Promise.all([
        adminService.getStats(),
        adminService.getUsers(),
      ]);
      setStats(statsData);
      setUsers(usersData || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load admin data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Delete user "${userName}"? This will permanently delete their account and all uploaded materials.`)) {
      return;
    }

    try {
      await adminService.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      setSuccess(`User "${userName}" was successfully deleted.`);
      const newStats = await adminService.getStats();
      setStats(newStats);
    } catch (err) {
      alert("Failed to delete user: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider mb-1">
          <ShieldAlert className="w-4 h-4" />
          <span>Restricted Admin Portal</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">System Administration</h1>
        <p className="text-sm text-slate-400 mt-1">
          Platform-wide user management and infrastructure analytics
        </p>
      </div>

      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-medium">Total Active Students</span>
              <p className="text-3xl font-extrabold text-white mt-1">{stats?.totalUsers || 0}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-medium">Total Uploaded Materials</span>
              <p className="text-3xl font-extrabold text-white mt-1">{stats?.totalMaterials || 0}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <BookOpen className="w-6 h-6" />
            </div>
          </div>
        </div>
      )}

      {/* User Management Table */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-4">
        <h2 className="text-base font-bold text-white">Registered Accounts ({users.length})</h2>

        {loading ? (
          <SkeletonList count={3} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 border-b border-slate-800 uppercase font-semibold">
                <tr>
                  <th className="pb-3 px-3">Name</th>
                  <th className="pb-3 px-3">Email</th>
                  <th className="pb-3 px-3">Role</th>
                  <th className="pb-3 px-3">Registered</th>
                  <th className="pb-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-3 font-semibold text-white">{u.name}</td>
                    <td className="py-3.5 px-3 text-slate-300 font-mono text-[11px]">{u.email}</td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.role === "admin"
                            ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                            : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() => handleDeleteUser(u._id, u.name)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
