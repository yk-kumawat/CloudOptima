import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import Navbar from "../Components/Navbar";
import { API_URL } from "../config";

// Helper to colorize specific data points within the plain string returned by the ML model
const ColorizeText: React.FC<{ text: string }> = ({ text }) => {
  if (!text) return null;

  // Regex matches: 
  // 1. Instance types (must contain hyphen or dot, e.g., t2.micro, n1-standard-1)
  // 2. Percentages (digits followed by %)
  // 3. Currency (₹ symbol followed by space and numbers/commas/dots)
  // 4. Cloud providers (AWS, Azure, GCP)
  const regex = /([a-z0-9]+\.[a-z0-9]+|[a-z0-9]+-[a-z0-9]+-[a-z0-9]+|\d+(?:\.\d+)?%|₹\s[\d,]+(?:\.\d+)?|AWS|Azure|GCP)/g;
  
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, index) => {
        if (part.match(regex)) {
          return (
            <span key={index} className="text-primary font-bold">
              {part}
            </span>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
};

const Dashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"form" | "json">("json");
  const [predictionResult, setPredictionResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Default JSON for initial model testing
  const [jsonConfig, setJsonConfig] = useState(JSON.stringify(
    {
      cpu_usage: 0,
      memory_usage: 0,
      net_io: 0,
      disk_io: 0,
      cloud_provider: "",
      region: "",
      vm_type: "",
      vCPU: 0,
      RAM_GB: 0,
      price_per_hour: 0,
      latency_ms: 0,
      throughput: 0
    },
    null,
    2
  ));

  const VM_OPTIONS = {
    AWS: [
      { value: "t3.small", label: "t3.small (2 vCPU, 2GB RAM)" },
      { value: "t3.medium", label: "t3.medium (2 vCPU, 4GB RAM)" },
      { value: "t3.large", label: "t3.large (2 vCPU, 8GB RAM)" }
    ],
    Azure: [
      { value: "B1s", label: "B1s (1 vCPU, 1GB RAM)" },
      { value: "B2s", label: "B2s (2 vCPU, 4GB RAM)" },
      { value: "B4ms", label: "B4ms (4 vCPU, 16GB RAM)" }
    ],
    GCP: [
      { value: "n1-standard-1", label: "n1-standard-1 (1 vCPU, 3.75GB RAM)" },
      { value: "n1-standard-2", label: "n1-standard-2 (2 vCPU, 7.5GB RAM)" },
      { value: "n1-standard-4", label: "n1-standard-4 (4 vCPU, 15GB RAM)" }
    ]
  };

  const handleFormChange = (key: string, value: any) => {
    try {
      const current = JSON.parse(jsonConfig);
      current[key] = value;
      setJsonConfig(JSON.stringify(current, null, 2));
    } catch (e) {
      // ignore if json is currently malformed
    }
  };

  const getFormValue = (key: string) => {
    try {
      return JSON.parse(jsonConfig)[key];
    } catch (e) {
      return "";
    }
  };

  useEffect(() => {
    // If we navigated to Dashboard via "View" on the Saved page
    if (location.state?.savedRecord) {
      const record = location.state.savedRecord;
      setPredictionResult(record.predictionResult);
      if (record.inputConfig) {
        setJsonConfig(JSON.stringify(record.inputConfig, null, 2));
      }
    }
  }, [location.state]);

  const handleOptimize = async () => {
    try {
      setIsLoading(true);
      const parsedData = JSON.parse(jsonConfig);
      console.log("Sending data to BFF:", parsedData);
      
      const response = await axios.post(`${API_URL}/predict`, parsedData);
      console.log("Success! Received results from BFF:", response.data);
      
      setPredictionResult(response.data);
      
      // Update UI usage bars if the model returns new utilization metrics
      if (response.data.predicted_utilization) {
        handleFormChange("cpu_usage", Math.round(response.data.predicted_utilization));
      }

      toast.success("Optimization Complete!");
    } catch (error: any) {
      console.error("Optimization failed:", error.response?.data || error.message);
      toast.error(error.response?.data?.error || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!predictionResult) {
      toast.error("Please run an optimization first before saving.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication required to save optimizations.");
        navigate("/login");
        return;
      }
      
      const payload = {
        name: `Optimization - ${new Date().toLocaleDateString()}`,
        provider: predictionResult.current_config.provider,
        providerName: predictionResult.current_config.provider === "AWS" ? "AWS Global" : predictionResult.current_config.provider === "Azure" ? "Azure Enterprise" : "Google Cloud",
        instanceType: predictionResult.current_config.vm_type,
        status: predictionResult.optimization_status,
        inputConfig: JSON.parse(jsonConfig),
        predictionResult: predictionResult
      };

      await axios.post(`${API_URL}/optimizations`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success("Optimization saved successfully!");
    } catch (error: any) {
      console.error("Save failed:", error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const displayUtilization = predictionResult?.predicted_utilization 
    ? Math.round(predictionResult.predicted_utilization) 
    : 0;

  return (
    <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display transition-colors duration-300">
      {/* HEADER */}
      <Navbar />

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 lg:p-8 max-w-400 mx-auto w-full grid grid-cols-1 lg:grid-cols-10 gap-6">
        {/* LEFT PANEL: INPUT PARAMETERS */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <section className="bg-white dark:bg-card-dark/70 border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-xl shadow-slate-300 dark:shadow-none backdrop-blur-md h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                <span className="material-symbols-outlined text-primary">
                  tune
                </span>
                Input Parameters
              </h3>
              <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-border-dark">
                <button
                  onClick={() => setViewMode("form")}
                  className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                    viewMode === "form"
                      ? "bg-primary text-white shadow-sm"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  Form
                </button>
                <button
                  onClick={() => setViewMode("json")}
                  className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                    viewMode === "json"
                      ? "bg-primary text-white shadow-sm"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  JSON
                </button>
              </div>
            </div>

            {viewMode === "form" ? (
              <div className="flex-1 overflow-y-auto pr-2 space-y-5 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Cloud Provider
                    </label>
                    <select 
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-border-dark text-slate-900 dark:text-slate-200 rounded-lg p-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                      value={getFormValue("cloud_provider")}
                      onChange={(e) => {
                        try {
                          const current = JSON.parse(jsonConfig);
                          current["cloud_provider"] = e.target.value;
                          current["vm_type"] = ""; // Reset VM type
                          setJsonConfig(JSON.stringify(current, null, 2));
                        } catch (err) {}
                      }}
                    >
                      <option value="" disabled hidden>Select Provider</option>
                      <option value="AWS">AWS</option>
                      <option value="Azure">Azure</option>
                      <option value="GCP">GCP</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Region
                    </label>
                    <select 
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-border-dark text-slate-900 dark:text-slate-200 rounded-lg p-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                      value={getFormValue("region")}
                      onChange={(e) => handleFormChange("region", e.target.value)}
                    >
                      <option value="" disabled hidden>Select Region</option>
                      <option value="US">US</option>
                      <option value="Asia">Asia</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    VM Type
                  </label>
                  <select 
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-border-dark text-slate-900 dark:text-slate-200 rounded-lg p-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none disabled:opacity-50"
                    value={getFormValue("vm_type")}
                    onChange={(e) => handleFormChange("vm_type", e.target.value)}
                    disabled={!getFormValue("cloud_provider")}
                  >
                    <option value="" disabled hidden>
                      {!getFormValue("cloud_provider") ? "Select Provider first" : "Select VM Instance Type"}
                    </option>
                    {getFormValue("cloud_provider") && (VM_OPTIONS as any)[getFormValue("cloud_provider")]?.map((vm: any) => (
                      <option key={vm.value} value={vm.value}>{vm.label}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "vCPU", key: "vCPU" },
                    { label: "RAM (GB)", key: "RAM_GB" },
                    { label: "Network IO", key: "net_io" },
                    { label: "Disk IO", key: "disk_io" },
                  ].map((field) => (
                    <div key={field.label} className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">
                        {field.label}
                      </label>
                      <input
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-border-dark text-slate-900 dark:text-slate-200 rounded-lg p-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                        type="number"
                        value={getFormValue(field.key)}
                        onChange={(e) => handleFormChange(field.key, Number(e.target.value))}
                      />
                    </div>
                  ))}
                </div>
                {/* Row 3: Latency, Throughput, Target Price */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Latency (ms)
                    </label>
                    <input
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-border-dark text-slate-900 dark:text-slate-200 rounded-lg p-2 text-sm focus:ring-1 focus:ring-primary outline-none transition-all"
                      type="number"
                      value={getFormValue("latency_ms")}
                      onChange={(e) => handleFormChange("latency_ms", Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Throughput
                    </label>
                    <input
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-border-dark text-slate-900 dark:text-slate-200 rounded-lg p-2 text-sm focus:ring-1 focus:ring-primary outline-none transition-all"
                      type="number"
                      value={getFormValue("throughput")}
                      onChange={(e) => handleFormChange("throughput", Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Price Hourly ($)
                    </label>
                    <input
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-border-dark text-slate-900 dark:text-slate-200 rounded-lg p-2 text-sm focus:ring-1 focus:ring-primary outline-none transition-all"
                      type="number"
                      step="0.001"
                      value={getFormValue("price_per_hour")}
                      onChange={(e) => handleFormChange("price_per_hour", Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-slate-500 uppercase">
                        CPU Usage Utilization
                      </label>
                      <span className="text-xs font-bold text-primary">
                        {getFormValue("cpu_usage") || 0}%
                      </span>
                    </div>
                    <input
                      type="range"
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
                      value={getFormValue("cpu_usage") || 0}
                      onChange={(e) => {
                        handleFormChange("cpu_usage", parseInt(e.target.value));
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-slate-500 uppercase">
                        Memory Consumption
                      </label>
                      <span className="text-xs font-bold text-primary">
                        {getFormValue("memory_usage") || 0}%
                      </span>
                    </div>
                    <input
                      type="range"
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
                      value={getFormValue("memory_usage") || 0}
                      onChange={(e) => {
                        handleFormChange("memory_usage", parseInt(e.target.value));
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Configuration JSON
                </label>
                <textarea
                  spellCheck="false"
                  rows={18}
                  className="flex-1 w-full p-4 rounded-xl font-mono text-sm bg-slate-50 border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none dark:bg-slate-900/50 dark:border-border-dark dark:text-slate-300"
                  value={jsonConfig}
                  onChange={(e) => setJsonConfig(e.target.value)}
                />
              </div>
            )}

            <button 
              onClick={handleOptimize}
              disabled={isLoading}
              className={`mt-8 w-full h-12 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 ${
                isLoading ? 'bg-slate-400 cursor-not-allowed' : 'bg-primary hover:bg-blue-600 shadow-primary/20'
              }`}
            >
              <span className={`material-symbols-outlined text-xl ${isLoading ? 'animate-spin' : ''}`}>
                {isLoading ? 'autorenew' : 'rocket_launch'}
              </span>
              {isLoading ? 'Processing AI...' : 'Run AI Optimization'}
            </button>
          </section>
        </div>

        {/* RIGHT PANEL: RESULTS */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <div className="flex flex-col md:flex-row items-start justify-between gap-4">
            <div className="bg-white dark:bg-card-dark/70 border border-slate-200 dark:border-white/5 p-6 rounded-xl flex flex-col gap-1 w-full md:w-72 shadow-xl shadow-slate-300 dark:shadow-none">
              <span className="text-xs font-bold text-slate-500 uppercase">
                Predicted Monthly Cost
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-slate-900 dark:text-white">
                  {predictionResult?.predicted_monthly_cost || "₹ 0.00"}
                </span>
              </div>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              <button className="flex-1 md:flex-none px-4 py-2 border border-slate-300 dark:border-border-dark bg-white dark:bg-transparent text-sm font-bold rounded-lg flex items-center justify-center gap-2 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                <span className="material-symbols-outlined text-xl">
                  picture_as_pdf
                </span>{" "}
                Export PDF
              </button>
              <button 
                onClick={handleSave}
                disabled={!predictionResult}
                className={`flex-1 md:flex-none px-4 py-2 text-white text-sm font-bold rounded-lg flex items-center justify-center gap-2 shadow-lg transition-all
                  ${!predictionResult ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed shadow-none' : 'bg-primary shadow-primary/20 hover:bg-blue-600'}
                `}
              >
                <span className="material-symbols-outlined text-xl">
                  database
                </span>{" "}
                Save
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/3 bg-white dark:bg-card-dark/70 border border-slate-200 dark:border-white/5 rounded-xl p-4 flex flex-col items-center justify-center gap-2 shadow-xl shadow-slate-300 dark:shadow-none">
              <span className="text-xs font-bold text-slate-500 uppercase">
                Utilization
              </span>
              
              {/* Circular Progress Bar */}
              <div className="w-24 h-24 relative flex items-center justify-center">
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                  {/* Background Track */}
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-slate-100 dark:text-slate-800"
                  />
                  {/* Progress Indicator */}
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeDasharray={264}
                    strokeDashoffset={264 - (displayUtilization / 100) * 264}
                    strokeLinecap="round"
                    fill="transparent"
                    className={`transition-all duration-700 ease-out ${
                      displayUtilization < 50 ? 'text-orange-500' : displayUtilization <= 80 ? 'text-green-500' : 'text-red-500'
                    }`}
                  />
                </svg>
                <span className="absolute text-xl font-black text-slate-900 dark:text-white">
                  {displayUtilization}%
                </span>
              </div>
            </div>

            <div className="flex-1 bg-white dark:bg-card-dark/70 border border-slate-200 dark:border-white/5 rounded-xl p-5 flex flex-col justify-between shadow-xl shadow-slate-300 dark:shadow-none">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-black text-primary uppercase">
                    Recommendation
                  </span>
                  <h3 className="text-lg font-bold">
                    {predictionResult?.optimization_status || "Analysis Ready"}
                  </h3>
                </div>
                <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">
                  lightbulb
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                {predictionResult?.recommendation || "Run optimization to see AI-driven hardware recommendations."}
              </p>
            </div>
          </div>

          {/* ARBITRAGE PANEL */}
          <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-accent-green/30 rounded-2xl p-6 shadow-xl shadow-slate-300 dark:shadow-none">
            <h3 className="text-lg font-bold mb-4">
              {predictionResult?.optimization_status === "Optimal" 
                ? "Current Setup Insight" 
                : "Optimization Recommendation"}
            </h3>
            <p className="mb-10 text-sm text-slate-500">
              {predictionResult?.arbitrage_insight ? (
                <ColorizeText text={predictionResult.arbitrage_insight} />
              ) : (
                "Run optimization to see AI-driven hardware recommendations."
              )}
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-border-dark">
                    <th className="pb-3 pl-2 text-left text-xs uppercase text-slate-500 font-bold w-[20%]">Provider</th>
                    <th className="pb-3 text-left text-xs uppercase text-slate-500 font-bold w-[15%]">Region</th>
                    <th className="pb-3 text-left text-xs uppercase text-slate-500 font-bold w-[25%]">Instance Type</th>
                    <th className="pb-3 text-left text-xs uppercase text-slate-500 font-bold w-[20%]">Utilization</th>
                    <th className="pb-3 text-left text-xs uppercase text-slate-500 font-bold w-[20%]">Monthly Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-border-dark">
                  <tr>
                    <td className="py-4 pl-2 text-slate-600 dark:text-slate-400">
                      {predictionResult?.current_config?.provider || "---"}
                    </td>
                    <td className="font-medium">{predictionResult?.current_config?.region || "---"}</td>
                    <td className="font-medium text-slate-600 dark:text-slate-300">{predictionResult?.current_config?.vm_type || "---"}</td>
                    <td className="font-medium">
                      {typeof predictionResult?.predicted_utilization === 'number' 
                        ? `${predictionResult.predicted_utilization}%` 
                        : "---"}
                    </td>
                    <td className="font-bold">{predictionResult?.predicted_monthly_cost || "---"}</td>
                  </tr>
                  {predictionResult?.optimization_status !== "Optimal" && (
                    <tr className="bg-accent-green/20 dark:bg-accent-green/10">
                      <td className="py-4 pl-2 text-accent-green font-bold">
                        {predictionResult?.arbitrage_details?.provider || predictionResult?.current_config?.provider}
                      </td>
                      <td className="font-bold">{predictionResult?.arbitrage_details?.region || predictionResult?.current_config?.region}</td>
                      <td className="font-bold text-slate-800 dark:text-white">
                        {predictionResult?.recommended_instance}
                      </td>
                      <td className="font-bold text-accent-green">
                        {typeof predictionResult?.optimized_util === 'number' 
                          ? `${predictionResult.optimized_util}%` 
                          : "---"}
                      </td>
                      <td className="text-accent-green font-black">
                        {predictionResult?.optimized_monthly_cost || "---"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
