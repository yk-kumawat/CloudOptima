import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display antialiased overflow-x-hidden relative">
      {/* ================= NAVBAR ================= */}
      <Navbar />

      {/* ================= HERO ================= */}
      <section className="relative px-6 lg:px-20 pt-20 pb-32 overflow-hidden">
        {/* Glow Background */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-accent-green/10 blur-[100px] rounded-full"></div>

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 relative z-10">
          {/* Left */}
          <div className="flex flex-col gap-7 lg:w-1/2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              ML-Driven Multi-Cloud Cost & Performance Optimization Platform
            </div>

            <h1 className="text-4xl lg:text-6xl font-black leading-tight dark:text-white">
              <span className="text-transparent bg-clip-text bg-linear-to-r from-primary via-blue-400 to-accent-green">
                Cloud Cost
              </span>{" "}
              Optimization System
            </h1>

            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl">
              Predict cloud expenditure, analyze workload utilization, and
              detect cross-cloud arbitrage opportunities across AWS, Azure, and
              GCP using machine learning.
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="h-14 px-8 bg-primary text-white rounded-xl font-bold shadow-xl hover:scale-105 transition-transform"
              >
                Start Free
              </button>
              <button
                onClick={() => navigate("/register")}
                className="h-14 px-8 rounded-xl font-bold border dark:border-white/10 hover:bg-white/10 transition-all"
              >
                Register
              </button>
            </div>

            {/* Trusted Row */}
            <div className="flex items-center gap-6 pt-6 grayscale opacity-60">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Trusted by leading teams
              </span>
              <div className="flex gap-4">
                <span className="material-symbols-outlined text-3xl">
                  terminal
                </span>
                <span className="material-symbols-outlined text-3xl">dns</span>
                <span className="material-symbols-outlined text-3xl">hub</span>
              </div>
            </div>
          </div>

          {/* Right Dashboard Card */}
          <div className="lg:w-1/2 w-full">
            <div className="relative group">
              <div className="absolute -inset-1 bg-linear-to-r from-primary to-accent-green rounded-2xl blur opacity-25 group-hover:opacity-40 transition"></div>

              <div className="relative bg-card-dark rounded-2xl border border-slate-800 overflow-hidden">
                {/* Window Header */}
                <div className="bg-slate-800/50 px-4 py-2 flex items-center gap-2 border-b border-slate-700">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                  </div>
                  <div className="mx-auto text-[10px] text-slate-500 font-mono uppercase">
                    Global Metrics Dashboard
                  </div>
                </div>

                {/* Metrics */}
                <div className="p-6 grid grid-cols-2 gap-4">
                  <div className="col-span-2 bg-primary/5 border border-primary/20 rounded-lg p-4">
                    <div className="text-xs text-slate-400 uppercase">
                      Total Monthly Savings
                    </div>
                    <div className="text-4xl font-black text-accent-green">
                      +$42,890.00
                    </div>
                  </div>

                  <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
                    <div className="text-xs text-slate-400 uppercase">
                      Compute Load
                    </div>
                    <div className="text-2xl font-bold text-white">82%</div>
                  </div>

                  <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
                    <div className="text-xs text-slate-400 uppercase">
                      Idle Waste
                    </div>
                    <div className="text-2xl font-bold text-red-400">0.4%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="px-6 lg:px-20 py-24 bg-slate-50 dark:bg-[#0d111a]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-4 mb-16 max-w-2xl">
            <h2 className="text-accent-green font-bold tracking-widest uppercase text-sm">
              Engineered for Performance
            </h2>
            <h3 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white leading-tight">
              Powerful Features for Modern Infrastructure
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
              Our neon-powered engine monitors every byte and dollar across your
              entire multi-cloud estate, providing actionable intelligence in
              seconds.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            <div className="group flex flex-col gap-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-card-dark p-6 transition-all hover:border-primary/50 hover:-translate-y-1 shadow-sm hover:shadow-xl hover:shadow-primary/5">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                <span className="material-symbols-outlined text-2xl">
                  attach_money
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                  Cost Prediction
                </h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  Predict accurate hourly and monthly cloud cost using trained
                  regression models.
                </p>
              </div>
            </div>
            <div className="group flex flex-col gap-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-card-dark p-6 transition-all hover:border-primary/50 hover:-translate-y-1 shadow-sm hover:shadow-xl hover:shadow-primary/5">
              <div className="w-12 h-12 rounded-xl bg-accent-green/10 flex items-center justify-center text-accent-green group-hover:bg-accent-green group-hover:text-white transition-all">
                <span className="material-symbols-outlined">data_usage</span>
              </div>
              <div className="flex flex-col gap-2">
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                  Utilization Monitor
                </h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  Identify underutilized and overutilized resources before
                  performance or cost issues occur.
                </p>
              </div>
            </div>
            <div className="group flex flex-col gap-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-card-dark p-6 transition-all hover:border-primary/50 hover:-translate-y-1 shadow-sm hover:shadow-xl hover:shadow-primary/5">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                <span className="material-symbols-outlined">balance</span>
              </div>
              <div className="flex flex-col gap-2">
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                  Arbitrage Engine
                </h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  Compare multi-cloud pricing models and suggest cost-efficient
                  alternatives.
                </p>
              </div>
            </div>
            <div className="group flex flex-col gap-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-card-dark p-6 transition-all hover:border-primary/50 hover:-translate-y-1 shadow-sm hover:shadow-xl hover:shadow-primary/5">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white transition-all">
                <span className="material-symbols-outlined">
                  energy_savings_leaf
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                  Efficiency Score
                </h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  Evaluate deployments using multi-objective optimization
                  metrics.
                </p>
              </div>
            </div>
            <div className="group flex flex-col gap-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-card-dark p-6 transition-all hover:border-primary/50 hover:-translate-y-1 shadow-sm hover:shadow-xl hover:shadow-primary/5">
              <div className="w-12 h-12 rounded-xl bg-accent-green/10 flex items-center justify-center text-accent-green group-hover:bg-accent-green group-hover:text-white transition-all">
                <span className="material-symbols-outlined">
                  history_toggle_off
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                  Historical Analytics
                </h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  Track previous predictions and monitor cost trends over time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="px-6 lg:px-20 py-24 bg-background-light dark:bg-background-dark">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 items-center">
          <div className="lg:w-1/2 flex flex-col gap-8">
            <h2 className="text-4xl font-black text-slate-900 dark:text-white leading-tight">
              Intelligent Cloud Optimization Engine
            </h2>
            <div className="flex flex-col gap-6">
              <div className="flex gap-4">
                <div className="shrink-0 w-12 h-12 rounded-full glass-effect border border-primary/30 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">analytics</span>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    Deep Evaluation Process
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    Our proprietary metadata analysis engine performs a
                    comprehensive audit of your architecture to find hidden
                    inefficiencies that basic tools miss.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="shrink-0 w-12 h-12 rounded-full glass-effect border border-accent-green/30 flex items-center justify-center text-accent-green">
                  <span className="material-symbols-outlined">psychology</span>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    Proprietary ML Engine
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    Advanced self-learning algorithms that evolve with your
                    specific workload patterns, providing customized
                    recommendations for maximum ROI.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:w-1/2 w-full grid grid-cols-2 gap-4">
            <div className="aspect-square rounded-2xl bg-primary/5 border border-primary/10 p-6 flex flex-col justify-center items-center text-center gap-3">
              <span className="text-4xl font-black text-primary">99.9%</span>
              <span className="text-sm font-bold text-slate-500 uppercase">
                Accuracy Rate
              </span>
            </div>
            <div className="aspect-square rounded-2xl bg-accent-green/5 border border-accent-green/10 p-6 flex flex-col justify-center items-center text-center gap-3 mt-8">
              <span className="text-4xl font-black text-accent-green">45%</span>
              <span className="text-sm font-bold text-slate-500 uppercase">
                Avg. Savings
              </span>
            </div>
            <div className="aspect-square rounded-2xl bg-slate-800/20 border border-slate-700/30 p-6 flex flex-col justify-center items-center text-center gap-3">
              <span className="text-4xl font-black text-white">2.4s</span>
              <span className="text-sm font-bold text-slate-500 uppercase">
                Analysis Speed
              </span>
            </div>
            <div className="aspect-square rounded-2xl bg-primary/5 border border-primary/10 p-6 flex flex-col justify-center items-center text-center gap-3 mt-8">
              <span className="text-4xl font-black text-primary">500+</span>
              <span className="text-sm font-bold text-slate-500 uppercase">
                Data Points
              </span>
            </div>
          </div>
        </div>
      </section>
      <section className="px-6 lg:px-20 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden bg-linear-to-br from-primary via-blue-700 to-indigo-900 px-8 py-16 lg:py-24 text-center">
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)",
                backgroundSize: "32px 32px",
              }}
            ></div>
            <div className="relative z-10 flex flex-col items-center gap-8">
              <h2 className="text-4xl lg:text-6xl font-black text-white leading-tight">
                Start Optimizing Your <br className="hidden lg:block" /> Cloud
                Today
              </h2>
              <p className="text-blue-100 text-lg lg:text-xl max-w-2xl font-medium">
                Join thousands of engineers who have taken control of their
                infrastructure costs. Setup takes less than 10 minutes.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button className="h-14 px-10 bg-white text-primary rounded-xl font-black text-lg shadow-2xl shadow-black/20 hover:scale-105 transition-transform">
                  Get Started Free
                </button>
                <button className="h-14 px-10 glass-effect border-white/20 text-white rounded-xl font-bold text-lg hover:bg-white/10 transition-all">
                  Talk to Sales
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="px-6 lg:px-20 py-12 border-t dark:border-slate-800 bg-white dark:bg-background-dark">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-white">
              <span className="material-symbols-outlined text-xl">
                cloud_done
              </span>
            </div>
            <h2 className="text-lg font-extrabold dark:text-white">
              CloudOptima
            </h2>
          </div>

          <div className="flex gap-6 text-sm text-slate-500 dark:text-slate-400">
            <a>Privacy Policy</a>
            <a>Terms of Service</a>
            <a>Security</a>
            <a>Contact</a>
          </div>

          <div className="text-sm text-slate-400">
            © 2026 CloudOptima AI Inc.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
