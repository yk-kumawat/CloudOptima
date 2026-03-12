import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Navbar from '../Components/Navbar';
import { API_URL } from '../config';

interface OptimizationRecord {
  _id: string;
  provider: 'AWS' | 'Azure' | 'GCP';
  providerName: string;
  instanceType: string;
  status: 'Optimal' | 'Underutilized' | 'Overutilized';
  createdAt: string;
  inputConfig: any;
  predictionResult: any;
}

const Saved: React.FC = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState<OptimizationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/optimizations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecords(res.data);
    } catch (err) {
      console.error("Failed to fetch records:", err);
      toast.error("Failed to fetch saved optimizations.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this optimization record?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/optimizations/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecords(records.filter(r => r._id !== id));
      toast.success("Optimization deleted successfully!");
    } catch (err: any) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete record: " + (err.response?.data?.message || err.message));
    }
  };

  const handleView = (record: OptimizationRecord) => {
    navigate("/dashboard", { state: { savedRecord: record } });
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'AWS': return { icon: 'storage', color: 'text-orange-500', bg: 'bg-orange-500/10' };
      case 'Azure': return { icon: 'cloud', color: 'text-blue-500', bg: 'bg-blue-500/10' };
      default: return { icon: 'dns', color: 'text-red-500', bg: 'bg-red-500/10' };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Optimal': return 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800';
      case 'Underutilized': return 'bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800';
      case 'Overutilized': return 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800';
      default: return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display antialiased transition-colors duration-300">
      {/* HEADER */}
      <Navbar />

      {/* MAIN CONTENT */}
      <main className="flex-1 px-6 lg:px-20 py-12">
        <div className="max-w-7xl mx-auto">
          {/* HERO / SEARCH */}
          <div className="flex flex-col items-center gap-8 mb-16">
            <h1 className="text-4xl lg:text-5xl font-black text-center dark:text-white tracking-tight">
              My Saved <span className="text-primary">Optimizations</span>
            </h1>
            <div className="relative w-full max-w-2xl group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500">
                <span className="material-symbols-outlined">search</span>
              </div>
              <input
                type="text"
                className="w-full h-14 pl-12 pr-4 bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 shadow-sm focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all"
                placeholder="Search optimizations by name, provider or type..."
              />
            </div>
          </div>

          {/* TABLE CONTAINER */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-card-dark/50 overflow-hidden shadow-2xl shadow-slate-400 dark:shadow-black/20">
            {/* Desktop View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                    <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-slate-500">Cloud Provider</th>
                    <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-slate-500">Instance Type</th>
                    <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-slate-500">Status</th>
                    <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-slate-500">Created Date</th>
                    <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-slate-500 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/50 dark:divide-slate-800/50">
                  {loading ? (
                    <tr><td colSpan={5} className="p-8 text-center text-slate-500">Loading your saved optimizations...</td></tr>
                  ) : records.length === 0 ? (
                    <tr><td colSpan={5} className="p-8 text-center text-slate-500">No saved optimizations found. Head to the dashboard to run some!</td></tr>
                  ) : records.map((record) => {
                    const style = getProviderIcon(record.provider);
                    return (
                      <tr key={record._id} className="hover:bg-primary/5 transition-colors group">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded ${style.bg} flex items-center justify-center ${style.color}`}>
                              <span className="material-symbols-outlined text-xl">{style.icon}</span>
                            </div>
                            <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">{record.providerName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-sm text-slate-500 dark:text-slate-400 font-mono">{record.instanceType}</td>
                        <td className="px-6 py-5">
                          <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getStatusBadge(record.status)}`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-sm text-slate-500 dark:text-slate-400">{new Date(record.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-5">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => handleView(record)} className="p-2 h-10 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all cursor-pointer" title="View">
                              <span className="material-symbols-outlined">visibility</span>
                            </button>
                            <button onClick={() => handleDelete(record._id)} className="p-2 h-10 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer" title="Delete">
                              <span className="material-symbols-outlined">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="md:hidden flex flex-col divide-y divide-slate-200 dark:divide-slate-800">
              {loading ? (
                <div className="p-8 text-center text-slate-500">Loading your saved optimizations...</div>
              ) : records.length === 0 ? (
                <div className="p-8 text-center text-slate-500">No saved optimizations found.</div>
              ) : records.map((record) => {
                const style = getProviderIcon(record.provider);
                return (
                  <div key={record._id} className="p-6 flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded ${style.bg} flex items-center justify-center ${style.color}`}>
                          <span className="material-symbols-outlined text-xl">{style.icon}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-700 dark:text-slate-200">{record.providerName}</span>
                          <span className="text-xs text-slate-500 uppercase tracking-wider">{new Date(record.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => handleView(record)} className="p-2 text-slate-400 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg">
                          <span className="material-symbols-outlined text-lg">visibility</span>
                        </button>
                        <button onClick={() => handleDelete(record._id)} className="p-2 text-red-500 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg">
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Instance Type</p>
                        <p className="text-sm font-mono text-slate-600 dark:text-slate-300">{record.instanceType}</p>
                      </div>
                      <div>
                        <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getStatusBadge(record.status)}`}>
                          {record.status}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Saved;