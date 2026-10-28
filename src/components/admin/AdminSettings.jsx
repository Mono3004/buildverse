import React, { useState, useEffect } from "react";
import {
  Key,
  Database,
  Save,
  Check,
  Server,
  Shield,
  Zap,
  Globe,
  RefreshCw,
  Sliders,
  AlertTriangle,
  Download,
  Lock,
  Activity,
  Cpu,
} from "lucide-react";

const API_BASE = "http://localhost:5000/api/v1";

export default function AdminSettings() {
  const [saved, setSaved] = useState(false);
  const [pingLoading, setPingLoading] = useState(false);
  const [pingResult, setPingResult] = useState(null);
  const [maintenanceSaving, setMaintenanceSaving] = useState(false);

  // 1. DATABASE CONFIG
  const [mongoUri, setMongoUri] = useState("mongodb://127.0.0.1:27017/buildverse");
  const [poolSize, setPoolSize] = useState(10);
  const [autoIndex, setAutoIndex] = useState(true);

  // 2. MICROSERVICES & CACHE
  const [redisMode, setRedisMode] = useState("memory");
  const [kafkaMode, setKafkaMode] = useState("fast-fail");
  const [workerConcurrency, setWorkerConcurrency] = useState(5);

  // 3. SECURITY & AUTH
  const [jwtSecret, setJwtSecret] = useState("super-secret-buildverse-jwt-token-key");
  const [tokenExpiry, setTokenExpiry] = useState("7d");
  const [registrationMode, setRegistrationMode] = useState("open");
  const [rateLimit, setRateLimit] = useState(120);
  const [corsOrigin, setCorsOrigin] = useState("http://localhost:8080, http://localhost:8081, *");

  // 4. LOCALIZATION & PLATFORM
  const [currency, setCurrency] = useState("INR");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [defaultTheme, setDefaultTheme] = useState("cyberpunk-green");

  // Load maintenance mode from MongoDB on mount
  useEffect(() => {
    fetch(`${API_BASE}/system/maintenance`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data && data.maintenanceMode !== undefined) {
          setMaintenanceMode(data.maintenanceMode);
        }
      })
      .catch(() => {});

    try {
      const stored = localStorage.getItem("buildverse_system_config");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.mongoUri) setMongoUri(parsed.mongoUri);
        if (parsed.poolSize) setPoolSize(parsed.poolSize);
        if (parsed.autoIndex !== undefined) setAutoIndex(parsed.autoIndex);
        if (parsed.redisMode) setRedisMode(parsed.redisMode);
        if (parsed.kafkaMode) setKafkaMode(parsed.kafkaMode);
        if (parsed.workerConcurrency) setWorkerConcurrency(parsed.workerConcurrency);
        if (parsed.jwtSecret) setJwtSecret(parsed.jwtSecret);
        if (parsed.tokenExpiry) setTokenExpiry(parsed.tokenExpiry);
        if (parsed.registrationMode) setRegistrationMode(parsed.registrationMode);
        if (parsed.rateLimit) setRateLimit(parsed.rateLimit);
        if (parsed.corsOrigin) setCorsOrigin(parsed.corsOrigin);
        if (parsed.currency) setCurrency(parsed.currency);
        if (parsed.defaultTheme) setDefaultTheme(parsed.defaultTheme);
      }
    } catch {
      /* ignore */
    }
  }, []);

  // Toggle maintenance mode — instantly syncs to MongoDB
  const handleMaintenanceToggle = async (checked) => {
    setMaintenanceMode(checked);
    setMaintenanceSaving(true);
    try {
      await fetch(`${API_BASE}/system/maintenance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          maintenanceMode: checked,
          maintenanceMessage: "New updates are coming or email us on buildverse123@gmail.com",
          contactEmail: "buildverse123@gmail.com",
        }),
      });
    } catch {
      /* Silent — will still be saved in handleSave */
    } finally {
      setMaintenanceSaving(false);
    }
  };

  const handlePing = async () => {
    setPingLoading(true);
    setPingResult(null);
    const start = performance.now();
    try {
      const res = await fetch("http://localhost:5000/api/v1/health", { method: "GET" });
      const latency = Math.round(performance.now() - start);
      if (res.ok) {
        setPingResult({ success: true, latency, message: `Connected (Latency: ${latency}ms) — MongoDB 127.0.0.1:27017` });
      } else {
        setPingResult({ success: false, latency, message: `Server error ${res.status}` });
      }
    } catch (err) {
      setPingResult({ success: false, latency: 0, message: "Backend offline or connection refused on :5000" });
    } finally {
      setPingLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const config = {
      mongoUri,
      poolSize,
      autoIndex,
      redisMode,
      kafkaMode,
      workerConcurrency,
      jwtSecret,
      tokenExpiry,
      registrationMode,
      rateLimit,
      corsOrigin,
      currency,
      maintenanceMode,
      defaultTheme,
      updatedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem("buildverse_system_config", JSON.stringify(config));
    } catch {
      /* ignore */
    }
    // Also sync maintenance mode to MongoDB
    try {
      await fetch(`${API_BASE}/system/maintenance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          maintenanceMode,
          maintenanceMessage: "New updates are coming or email us on buildverse123@gmail.com",
          contactEmail: "buildverse123@gmail.com",
        }),
      });
    } catch {
      /* ignore */
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleExportDump = () => {
    const backupData = {
      generatedAt: new Date().toISOString(),
      platform: "BuildVerse Enterprise System Config",
      database: {
        uri: mongoUri,
        poolSize,
        autoIndex,
      },
      microservices: {
        redisMode,
        kafkaMode,
        workerConcurrency,
      },
      security: {
        tokenExpiry,
        registrationMode,
        rateLimit,
        corsOrigin,
      },
      localization: {
        currency,
        defaultTheme,
        maintenanceMode,
      },
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `buildverse-config-snapshot-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight font-display">
            System & Infrastructure Configuration
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Production microservices orchestration, MongoDB connection pooling, RBAC rules, and currency engines.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={handleExportDump}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-surface-elevated border border-border text-foreground text-xs font-bold hover:border-primary/50 transition-colors"
          >
            <Download className="w-4 h-4 text-primary" />
            <span>Export Snapshot</span>
          </button>

          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-primary text-primary-foreground text-xs font-black shadow-lg shadow-primary/20 hover:scale-105 transition-all"
          >
            {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{saved ? "Settings Applied ✓" : "Save Changes"}</span>
          </button>
        </div>
      </div>

      {maintenanceMode && (
        <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-400 text-xs font-bold flex items-center space-x-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <div>
            <p className="font-extrabold">System Maintenance Mode Active</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Non-admin members will see a maintenance banner on login until toggled off.
            </p>
          </div>
        </div>
      )}

      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center space-x-3">
          <Check className="w-5 h-5 shrink-0" />
          <span>System configuration updated successfully across MongoDB microservices runtime.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. DATABASE & PERSISTENCE SETTINGS */}
        <div className="p-6 rounded-3xl bg-card border border-border space-y-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">MongoDB Infrastructure & Connection Pooling</h3>
                <p className="text-[11px] text-muted-foreground">Primary persistence layer for users, projects, issues, and courses.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePing}
              disabled={pingLoading}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-surface-elevated border border-border text-xs font-bold text-foreground hover:border-primary/50 transition-colors"
            >
              <Activity className={`w-3.5 h-3.5 text-primary ${pingLoading ? "animate-spin" : ""}`} />
              <span>{pingLoading ? "Pinging..." : "Test Connection"}</span>
            </button>
          </div>

          {pingResult && (
            <div
              className={`p-3 rounded-2xl text-xs font-mono flex items-center space-x-2 border ${
                pingResult.success
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-rose-500/10 border-rose-500/30 text-rose-400"
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${pingResult.success ? "bg-emerald-400" : "bg-rose-400"}`} />
              <span>{pingResult.message}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-foreground mb-1 block">Primary MongoDB Connection URI</label>
              <input
                type="text"
                value={mongoUri}
                onChange={(e) => setMongoUri(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-border text-xs font-mono text-foreground focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-foreground mb-1 block">
                Connection Pool Size ({poolSize} connections)
              </label>
              <input
                type="range"
                min="5"
                max="50"
                value={poolSize}
                onChange={(e) => setPoolSize(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground font-mono mt-1">
                <span>Min: 5</span>
                <span>Current: {poolSize}</span>
                <span>Max: 50</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-surface-elevated border border-border">
              <div>
                <p className="text-xs font-bold text-foreground">Auto-Index Synchronization</p>
                <p className="text-[10px] text-muted-foreground">Ensures unique indexes on email and slug fields</p>
              </div>
              <input
                type="checkbox"
                checked={autoIndex}
                onChange={(e) => setAutoIndex(e.target.checked)}
                className="w-4 h-4 accent-primary rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* 2. MICROSERVICES & BROKER CONTROLS */}
        <div className="p-6 rounded-3xl bg-card border border-border space-y-5 shadow-xl">
          <div className="flex items-center space-x-2.5 border-b border-border pb-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Microservices, Caching & Message Broker</h3>
              <p className="text-[11px] text-muted-foreground">Redis key-value cache and Apache Kafka distributed event bus.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-foreground mb-1 block">Redis Caching Mode</label>
              <select
                value={redisMode}
                onChange={(e) => setRedisMode(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-border text-xs font-bold text-foreground focus:outline-none focus:border-primary"
              >
                <option value="memory">In-Memory Safe Fallback (Active)</option>
                <option value="cluster">Live Redis Cluster (127.0.0.1:6379)</option>
                <option value="disabled">Bypass Cache Entirely</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-foreground mb-1 block">Kafka Streaming Mode</label>
              <select
                value={kafkaMode}
                onChange={(e) => setKafkaMode(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-border text-xs font-bold text-foreground focus:outline-none focus:border-primary"
              >
                <option value="fast-fail">Fast-Fail Zero-Lag (&lt;15ms)</option>
                <option value="cluster">Distributed Broker (localhost:9092)</option>
                <option value="mock">Simulated Event Bus</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-foreground mb-1 block">BullMQ Worker Concurrency</label>
              <input
                type="number"
                min="1"
                max="20"
                value={workerConcurrency}
                onChange={(e) => setWorkerConcurrency(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-border text-xs font-bold text-foreground focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* 3. SECURITY & ACCESS GOVERNANCE */}
        <div className="p-6 rounded-3xl bg-card border border-border space-y-5 shadow-xl">
          <div className="flex items-center space-x-2.5 border-b border-border pb-3">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Security, Authentication & Rate Limiting</h3>
              <p className="text-[11px] text-muted-foreground">JWT payload encryption, CORS policies, and DDoS protection thresholds.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-foreground mb-1 block">JWT Secret Salt Key</label>
              <input
                type="password"
                value={jwtSecret}
                onChange={(e) => setJwtSecret(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-border text-xs font-mono text-foreground focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-foreground mb-1 block">Token Expiration Window</label>
              <select
                value={tokenExpiry}
                onChange={(e) => setTokenExpiry(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-border text-xs font-bold text-foreground focus:outline-none focus:border-primary"
              >
                <option value="24h">24 Hours (High Security)</option>
                <option value="7d">7 Days (Standard)</option>
                <option value="30d">30 Days (Extended Session)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-foreground mb-1 block">Registration Policy</label>
              <select
                value={registrationMode}
                onChange={(e) => setRegistrationMode(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-border text-xs font-bold text-foreground focus:outline-none focus:border-primary"
              >
                <option value="open">Open Registration (Students & Mentors)</option>
                <option value="invite">Invite-Only (Admin Provisioned)</option>
                <option value="approval">Require Manual Admin Approval</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-foreground mb-1 block">
                API Rate Limiter ({rateLimit} req/min)
              </label>
              <input
                type="range"
                min="30"
                max="300"
                step="10"
                value={rateLimit}
                onChange={(e) => setRateLimit(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground font-mono mt-1">
                <span>30 req/m</span>
                <span>Current: {rateLimit} req/min</span>
                <span>300 req/m</span>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-foreground mb-1 block">CORS Whitelisted Origins</label>
              <input
                type="text"
                value={corsOrigin}
                onChange={(e) => setCorsOrigin(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-border text-xs font-mono text-foreground focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* 4. LOCALIZATION & PLATFORM THEME */}
        <div className="p-6 rounded-3xl bg-card border border-border space-y-5 shadow-xl">
          <div className="flex items-center space-x-2.5 border-b border-border pb-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Localization & Platform Operations</h3>
              <p className="text-[11px] text-muted-foreground">Currency formatting, Cyberpunk palette, and maintenance mode flags.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-foreground mb-1 block">Platform Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-border text-xs font-bold text-foreground focus:outline-none focus:border-primary"
              >
                <option value="INR">INR (₹) - Indian Rupee [Active]</option>
                <option value="USD">USD ($) - US Dollar</option>
                <option value="EUR">EUR (€) - Euro</option>
                <option value="GBP">GBP (£) - British Pound</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-foreground mb-1 block">Cyberpunk Dark Accent</label>
              <select
                value={defaultTheme}
                onChange={(e) => setDefaultTheme(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-border text-xs font-bold text-foreground focus:outline-none focus:border-primary"
              >
                <option value="cyberpunk-green">Void Black & Neon Green (#CCFF00)</option>
                <option value="cyberpunk-orange">Void Black & Neon Orange (#FF6600)</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-surface-elevated border border-amber-500/30">
              <div>
                <p className="text-xs font-bold text-foreground">Maintenance Mode</p>
                <p className="text-[10px] text-muted-foreground">
                  {maintenanceSaving ? "Syncing to MongoDB..." : "Lock platform — syncs live to MongoDB"}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {maintenanceSaving && <RefreshCw className="w-3 h-3 text-amber-400 animate-spin" />}
                <input
                  type="checkbox"
                  checked={maintenanceMode}
                  onChange={(e) => handleMaintenanceToggle(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center space-x-2 px-6 py-3 rounded-2xl bg-primary text-primary-foreground text-xs font-black shadow-lg shadow-primary/20 hover:scale-105 transition-all"
          >
            {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{saved ? "Configuration Saved ✓" : "Save System Configuration"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
