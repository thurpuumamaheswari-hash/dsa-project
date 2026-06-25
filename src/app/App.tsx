import { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "motion/react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from "recharts";
import {
  LayoutDashboard, GitBranch, Droplets, Network, Route,
  BarChart2, Cpu, Bell, Search, Sun, Moon, User, Plus,
  Trash2, AlertTriangle, CheckCircle, TrendingUp, TrendingDown,
  Play, Pause, SkipForward, Activity, Database, Gauge,
  Menu, X, ChevronRight, Info, Clock, Zap, RefreshCw,
  SkipBack, Filter, Calendar, DollarSign, Target, Check,
  Waves, ChevronDown, Shield,
} from "lucide-react";
import {
  BST, AVLTree, GRAPH_NODES, GRAPH_EDGES,
  bfsSteps, dfsSteps, dijkstraSteps, getPath, primMSTSteps,
  mergeSortSteps, quickSortSteps, heapSortSteps, countingSortSteps,
  activitySelection, knapsack, lis,
  type TraversalStep, type DijkstraStep, type MSTStep, type SortStep,
} from "./algorithms";
import {
  dashboardStats, waterConsumptionData, regionDistributionData,
  pipelineStatusData, recentActivities, pipelineRows, waterUsageRows,
  maintenanceActivities, upgradeItems, demandSequence, demandTrendData,
} from "./mockData";

// ─── Types ────────────────────────────────────────────────────────────────────
type Page = "dashboard" | "pipeline" | "waterusage" | "network" | "route" | "reports" | "resources";

// ─── Palette helpers ─────────────────────────────────────────────────────────
const PIE_COLORS = ["#00ccff", "#0055ff", "#00e87a", "#ffb300", "#ff3366"];
const STATUS_COLORS: Record<string, string> = {
  Excellent: "#00e87a", Good: "#00ccff", Fair: "#ffb300",
  "Needs Repair": "#ff8800", Critical: "#ff3366",
};

// ─── Utility components ───────────────────────────────────────────────────────
function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-card/80 backdrop-blur-sm border border-border rounded-xl ${className}`}>
      {children}
    </div>
  );
}

function Badge({ label, color }: { label: string; color?: string }) {
  const base = "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold";
  const map: Record<string, string> = {
    Active: "bg-emerald-500/20 text-emerald-400",
    Maintenance: "bg-amber-500/20 text-amber-400",
    Inactive: "bg-red-500/20 text-red-400",
    Critical: "bg-red-500/20 text-red-400",
    High: "bg-orange-500/20 text-orange-400",
    Medium: "bg-yellow-500/20 text-yellow-400",
    Low: "bg-blue-500/20 text-blue-400",
    success: "bg-emerald-500/20 text-emerald-400",
    warning: "bg-amber-500/20 text-amber-400",
    info: "bg-cyan-500/20 text-cyan-400",
  };
  return <span className={`${base} ${color || map[label] || "bg-muted text-muted-foreground"}`}>{label}</span>;
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-semibold text-foreground" style={{ fontFamily: "Rajdhani, sans-serif" }}>{title}</h2>
      {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
    </div>
  );
}

function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = value;
    const duration = 1200;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start = Math.min(start + step, end);
      setDisplay(start);
      if (start >= end) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{typeof value === "number" && !Number.isInteger(value) ? display.toFixed(1) : Math.floor(display).toLocaleString()}{suffix}</span>;
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "dashboard" as Page, label: "Dashboard", icon: LayoutDashboard },
  { id: "pipeline" as Page, label: "Pipeline / BST", icon: GitBranch },
  { id: "waterusage" as Page, label: "Water Usage / AVL", icon: Droplets },
  { id: "network" as Page, label: "Network Analysis", icon: Network },
  { id: "route" as Page, label: "Route Optimization", icon: Route },
  { id: "reports" as Page, label: "Reports & Analytics", icon: BarChart2 },
  { id: "resources" as Page, label: "Resource Optimizer", icon: Cpu },
];

function Sidebar({ page, setPage, isDark, setIsDark, collapsed, setCollapsed }:
  { page: Page; setPage: (p: Page) => void; isDark: boolean; setIsDark: (v: boolean) => void; collapsed: boolean; setCollapsed: (v: boolean) => void; }
) {
  return (
    <aside className={`fixed top-0 left-0 h-full bg-sidebar border-r border-sidebar-border flex flex-col z-40 transition-all duration-300 ${collapsed ? "w-16" : "w-60"}`}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <Waves className="w-4 h-4 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div>
            <div className="font-bold text-base text-sidebar-foreground" style={{ fontFamily: "Rajdhani, sans-serif", letterSpacing: "0.08em" }}>WATERGRID</div>
            <div className="text-xs text-muted-foreground">Smart Water System</div>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className="ml-auto text-muted-foreground hover:text-foreground transition-colors">
          <Menu className="w-4 h-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const active = page === id;
          return (
            <button
              key={id}
              onClick={() => setPage(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${active
                ? "bg-primary/15 text-primary font-medium"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${active ? "text-primary" : ""}`} />
              {!collapsed && <span>{label}</span>}
              {!collapsed && active && <ChevronRight className="ml-auto w-3 h-3 text-primary/60" />}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-sidebar-border p-3 space-y-2">
        <button onClick={() => setIsDark(!isDark)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors`}>
          {isDark ? <Sun className="w-4 h-4 shrink-0" /> : <Moon className="w-4 h-4 shrink-0" />}
          {!collapsed && <span>{isDark ? "Light Mode" : "Dark Mode"}</span>}
        </button>
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <User className="w-3.5 h-3.5 text-primary" />
            </div>
            <div>
              <div className="text-xs font-medium text-sidebar-foreground">Admin Officer</div>
              <div className="text-xs text-muted-foreground">Municipal Corp.</div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

// ─── TopNav ───────────────────────────────────────────────────────────────────
function TopNav({ page, alerts }: { page: Page; alerts: number }) {
  const titles: Record<Page, string> = {
    dashboard: "Dashboard", pipeline: "Pipeline Management",
    waterusage: "Water Usage Monitoring", network: "Network Analysis",
    route: "Route Optimization", reports: "Reports & Analytics",
    resources: "Resource Optimization",
  };
  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur border-b border-border px-6 py-3 flex items-center gap-4">
      <div>
        <h1 className="text-lg font-semibold text-foreground" style={{ fontFamily: "Rajdhani, sans-serif" }}>{titles[page]}</h1>
        <div className="text-xs text-muted-foreground">WaterGrid Smart Management Platform</div>
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-2 bg-muted/50 border border-border rounded-lg px-3 py-1.5 text-sm text-muted-foreground w-48 hidden md:flex">
        <Search className="w-3.5 h-3.5 shrink-0" />
        <span>Search…</span>
      </div>
      <button className="relative p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
        <Bell className="w-4 h-4" />
        {alerts > 0 && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />}
      </button>
      <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
        <User className="w-3.5 h-3.5 text-primary" />
      </div>
    </header>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard() {
  const stats = [
    { label: "Total Reservoirs", value: dashboardStats.totalReservoirs, suffix: "", icon: Database, color: "text-cyan-400", bg: "bg-cyan-500/10", trend: "+2 this year" },
    { label: "Total Pipelines", value: dashboardStats.totalPipelines, suffix: "", icon: GitBranch, color: "text-blue-400", bg: "bg-blue-500/10", trend: "+14 this month" },
    { label: "Daily Consumption", value: dashboardStats.dailyConsumption, suffix: " ML", icon: Waves, color: "text-indigo-400", bg: "bg-indigo-500/10", trend: "+3.2% vs last week" },
    { label: "Active Alerts", value: dashboardStats.activeAlerts, suffix: "", icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10", trend: "2 critical" },
    { label: "Dist. Efficiency", value: dashboardStats.distributionEfficiency, suffix: "%", icon: Gauge, color: "text-emerald-400", bg: "bg-emerald-500/10", trend: "+1.4% this month" },
    { label: "Quality Score", value: dashboardStats.waterQualityScore, suffix: "/100", icon: Shield, color: "text-violet-400", bg: "bg-violet-500/10", trend: "Excellent" },
  ];

  return (
    <div className="p-6 space-y-6">
      <SectionHeader title="System Overview" subtitle="Real-time water distribution metrics" />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <GlassCard className="p-4 hover:border-primary/30 transition-colors">
              <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <div className={`text-2xl font-bold ${s.color}`} style={{ fontFamily: "JetBrains Mono, monospace" }}>
                <AnimatedNumber value={s.value} suffix={s.suffix} />
              </div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              <div className="text-xs text-muted-foreground/70 mt-0.5">{s.trend}</div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Consumption Area Chart */}
        <GlassCard className="xl:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Annual Water Consumption</h3>
            <Badge label="2026" color="bg-primary/10 text-primary" />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={waterConsumptionData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="gR" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#00ccff" stopOpacity={0.3} /><stop offset="95%" stopColor="#00ccff" stopOpacity={0} /></linearGradient>
                <linearGradient id="gC" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0055ff" stopOpacity={0.3} /><stop offset="95%" stopColor="#0055ff" stopOpacity={0} /></linearGradient>
                <linearGradient id="gI" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#00e87a" stopOpacity={0.3} /><stop offset="95%" stopColor="#00e87a" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: "#6ba8c8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6ba8c8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#0a1a35", border: "1px solid rgba(0,180,255,0.2)", borderRadius: "8px", color: "#d4eaf7", fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12, color: "#6ba8c8" }} />
              <Area type="monotone" dataKey="residential" stroke="#00ccff" fill="url(#gR)" strokeWidth={1.5} name="Residential" />
              <Area type="monotone" dataKey="commercial" stroke="#0055ff" fill="url(#gC)" strokeWidth={1.5} name="Commercial" />
              <Area type="monotone" dataKey="industrial" stroke="#00e87a" fill="url(#gI)" strokeWidth={1.5} name="Industrial" />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Region Pie */}
        <GlassCard className="p-5">
          <h3 className="font-semibold text-foreground mb-4">Distribution by Region</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={regionDistributionData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {regionDistributionData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#0a1a35", border: "1px solid rgba(0,180,255,0.2)", borderRadius: "8px", color: "#d4eaf7", fontSize: 12 }} formatter={(v: number) => [`${v}%`, ""]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {regionDistributionData.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: PIE_COLORS[i] }} />
                  <span className="text-muted-foreground">{d.name}</span>
                </div>
                <span className="font-medium text-foreground" style={{ fontFamily: "JetBrains Mono, monospace" }}>{d.value}%</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Pipeline Health + Activities */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <GlassCard className="p-5">
          <h3 className="font-semibold text-foreground mb-4">Pipeline Health Status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={pipelineStatusData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="status" tick={{ fill: "#6ba8c8", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6ba8c8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#0a1a35", border: "1px solid rgba(0,180,255,0.2)", borderRadius: "8px", color: "#d4eaf7", fontSize: 12 }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {pipelineStatusData.map((d) => <Cell key={d.status} fill={STATUS_COLORS[d.status] || "#00ccff"} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard className="p-5">
          <h3 className="font-semibold text-foreground mb-4">Recent System Activity</h3>
          <div className="space-y-3">
            {recentActivities.map((a) => (
              <div key={a.id} className="flex items-start gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${a.severity === "success" ? "bg-emerald-500/20" : a.severity === "warning" ? "bg-amber-500/20" : "bg-cyan-500/20"}`}>
                  {a.severity === "success" ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : a.severity === "warning" ? <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> : <Info className="w-3.5 h-3.5 text-cyan-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground leading-snug">{a.message}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

// ─── PIPELINE MANAGEMENT (BST) ────────────────────────────────────────────────
function PipelineManagement() {
  const [bst] = useState(() => {
    const t = new BST();
    [312, 205, 523, 101, 418, 631].forEach(v => t.insert(v, `Pipeline-${v}`));
    return t;
  });
  const [tick, setTick] = useState(0);
  const [inputVal, setInputVal] = useState("");
  const [inputLabel, setInputLabel] = useState("");
  const [message, setMessage] = useState("");
  const [searchHighlight, setSearchHighlight] = useState<number | null>(null);
  const [traversalResult, setTraversalResult] = useState<{ value: number; label: string }[]>([]);
  const [traversalType, setTraversalType] = useState("");
  const svgRef = useRef<SVGSVGElement>(null);
  const layout = useMemo(() => bst.getLayout(700), [tick]);

  const refresh = () => setTick(n => n + 1);

  const handleInsert = () => {
    const v = parseInt(inputVal);
    if (isNaN(v)) { setMessage("Enter a valid pipeline ID (number)"); return; }
    bst.insert(v, inputLabel || `Pipeline-${v}`);
    setMessage(`✓ Pipeline ${v} inserted`); setInputVal(""); setInputLabel(""); refresh();
  };
  const handleDelete = () => {
    const v = parseInt(inputVal);
    if (isNaN(v)) { setMessage("Enter a valid pipeline ID"); return; }
    bst.delete(v); setMessage(`Pipeline ${v} deleted`); setInputVal(""); refresh();
  };
  const handleSearch = () => {
    const v = parseInt(inputVal);
    if (isNaN(v)) { setMessage("Enter a pipeline ID to search"); return; }
    const found = bst.search(v);
    setSearchHighlight(v);
    setMessage(found ? `✓ Pipeline ${v} found in tree` : `✗ Pipeline ${v} not found`);
  };

  return (
    <div className="p-6 space-y-6">
      <SectionHeader title="Pipeline Management — BST" subtitle="Binary Search Tree visualization for pipeline registry" />
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Controls */}
        <div className="space-y-4">
          <GlassCard className="p-4">
            <h3 className="font-semibold text-sm text-foreground mb-3">Add / Search / Delete</h3>
            <div className="space-y-2">
              <input
                type="number" placeholder="Pipeline ID (e.g. 250)"
                value={inputVal} onChange={e => setInputVal(e.target.value)}
                className="w-full bg-input-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
              />
              <input
                type="text" placeholder="Label (optional)"
                value={inputLabel} onChange={e => setInputLabel(e.target.value)}
                className="w-full bg-input-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
              />
              <div className="grid grid-cols-3 gap-2">
                <button onClick={handleInsert} className="flex items-center justify-center gap-1 bg-primary/15 hover:bg-primary/25 text-primary border border-primary/30 rounded-lg py-2 text-xs font-medium transition-colors"><Plus className="w-3 h-3" />Insert</button>
                <button onClick={handleDelete} className="flex items-center justify-center gap-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg py-2 text-xs font-medium transition-colors"><Trash2 className="w-3 h-3" />Delete</button>
                <button onClick={handleSearch} className="flex items-center justify-center gap-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg py-2 text-xs font-medium transition-colors"><Search className="w-3 h-3" />Search</button>
              </div>
              {message && <div className={`text-xs px-2 py-1.5 rounded-lg ${message.startsWith("✓") ? "bg-emerald-500/10 text-emerald-400" : message.startsWith("✗") ? "bg-red-500/10 text-red-400" : "bg-amber-500/10 text-amber-400"}`}>{message}</div>}
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <h3 className="font-semibold text-sm text-foreground mb-3">Traversal Orders</h3>
            <div className="space-y-2">
              {([["Inorder", () => bst.inorder()], ["Preorder", () => bst.preorder()], ["Postorder", () => bst.postorder()]] as [string, () => { value: number; label: string }[]][]).map(([name, fn]) => (
                <button key={name} onClick={() => { setTraversalResult(fn()); setTraversalType(name); }}
                  className="w-full text-left px-3 py-2 rounded-lg bg-muted/50 hover:bg-muted text-sm text-foreground transition-colors flex items-center justify-between">
                  {name} Traversal <ChevronRight className="w-3 h-3 text-muted-foreground" />
                </button>
              ))}
            </div>
            {traversalResult.length > 0 && (
              <div className="mt-3 p-3 bg-muted/30 rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">{traversalType} order:</div>
                <div className="flex flex-wrap gap-1">
                  {traversalResult.map((n, i) => (
                    <span key={i} className="text-xs px-1.5 py-0.5 bg-primary/10 text-primary rounded font-mono">{n.value}</span>
                  ))}
                </div>
              </div>
            )}
          </GlassCard>
        </div>

        {/* BST SVG */}
        <div className="xl:col-span-2">
          <GlassCard className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm text-foreground">BST Visualization</h3>
              <span className="text-xs text-muted-foreground font-mono">{bst.size()} nodes</span>
            </div>
            {bst.size() === 0 ? (
              <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">Tree is empty. Insert pipeline IDs.</div>
            ) : (
              <div className="overflow-auto">
                <svg ref={svgRef} width={layout.svgWidth} height={Math.max(layout.svgHeight, 160)} className="w-full">
                  {layout.edges.map((e, i) => (
                    <line key={i} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} stroke="rgba(0,180,255,0.3)" strokeWidth={1.5} />
                  ))}
                  {layout.nodes.map((n) => {
                    const isHL = searchHighlight === n.value;
                    return (
                      <g key={n.value} transform={`translate(${n.x},${n.y})`}>
                        <circle r={22} fill={isHL ? "rgba(255,179,0,0.25)" : "rgba(0,100,200,0.25)"} stroke={isHL ? "#ffb300" : "#00ccff"} strokeWidth={isHL ? 2 : 1.5} />
                        <text textAnchor="middle" dy="4" fill={isHL ? "#ffb300" : "#d4eaf7"} fontSize={11} fontFamily="JetBrains Mono, monospace" fontWeight={600}>{n.value}</text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            )}
          </GlassCard>
        </div>
      </div>

      {/* Pipeline Table */}
      <GlassCard className="p-5">
        <h3 className="font-semibold text-foreground mb-4">Pipeline Registry</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["ID", "Name", "Diameter (mm)", "Material", "Pressure (bar)", "Status", "Installed", "Route"].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pipelineRows.map(r => (
                <tr key={r.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="py-2 px-3 font-mono text-primary text-xs">{r.id}</td>
                  <td className="py-2 px-3 text-foreground">{r.name}</td>
                  <td className="py-2 px-3 text-muted-foreground font-mono text-xs">{r.diameter}</td>
                  <td className="py-2 px-3 text-muted-foreground text-xs">{r.material}</td>
                  <td className="py-2 px-3 text-muted-foreground font-mono text-xs">{r.pressure}</td>
                  <td className="py-2 px-3"><Badge label={r.status} /></td>
                  <td className="py-2 px-3 text-muted-foreground text-xs">{r.installed}</td>
                  <td className="py-2 px-3 text-muted-foreground text-xs">{r.from} → {r.to}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}

// ─── WATER USAGE MONITORING (AVL) ─────────────────────────────────────────────
function WaterUsageMonitoring() {
  const [avl] = useState(() => {
    const t = new AVLTree();
    [285, 223, 197, 182, 445, 168].forEach((v, i) => t.insert(v, `Region-${i + 1}`));
    return t;
  });
  const [tick, setTick] = useState(0);
  const [inputVal, setInputVal] = useState("");
  const [inputLabel, setInputLabel] = useState("");
  const [message, setMessage] = useState("");
  const layout = useMemo(() => avl.getLayout(680), [tick]);

  const bfColor = (bf: number) => bf === 0 ? "#00e87a" : Math.abs(bf) === 1 ? "#ffb300" : "#ff3366";

  const handleInsert = () => {
    const v = parseInt(inputVal);
    if (isNaN(v)) { setMessage("Enter a valid consumption value"); return; }
    avl.insert(v, inputLabel || `Region-${v}`);
    setMessage(`✓ Usage record ${v} inserted (auto-balanced)`); setInputVal(""); setInputLabel(""); setTick(n => n + 1);
  };
  const handleDelete = () => {
    const v = parseInt(inputVal);
    if (isNaN(v)) return;
    avl.delete(v); setMessage(`Usage record ${v} deleted`); setInputVal(""); setTick(n => n + 1);
  };

  return (
    <div className="p-6 space-y-6">
      <SectionHeader title="Water Usage Monitoring — AVL Tree" subtitle="Self-balancing AVL tree for consumption data management" />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Controls */}
        <GlassCard className="p-4 space-y-3">
          <h3 className="font-semibold text-sm text-foreground">Manage Records</h3>
          <input type="number" placeholder="Consumption value (ML)" value={inputVal} onChange={e => setInputVal(e.target.value)}
            className="w-full bg-input-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50" />
          <input type="text" placeholder="Region name (optional)" value={inputLabel} onChange={e => setInputLabel(e.target.value)}
            className="w-full bg-input-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50" />
          <div className="grid grid-cols-2 gap-2">
            <button onClick={handleInsert} className="flex items-center justify-center gap-1 bg-primary/15 hover:bg-primary/25 text-primary border border-primary/30 rounded-lg py-2 text-xs font-medium transition-colors"><Plus className="w-3 h-3" />Insert</button>
            <button onClick={handleDelete} className="flex items-center justify-center gap-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg py-2 text-xs font-medium transition-colors"><Trash2 className="w-3 h-3" />Delete</button>
          </div>
          {message && <div className={`text-xs px-2 py-1.5 rounded-lg ${message.startsWith("✓") ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>{message}</div>}
          <div className="pt-2 border-t border-border">
            <div className="text-xs text-muted-foreground mb-2">Balance Factor Legend</div>
            {[["= 0", "Balanced", "#00e87a"], ["= ±1", "Slightly off", "#ffb300"], ["= ±2", "Rotation needed", "#ff3366"]].map(([bf, desc, color]) => (
              <div key={bf} className="flex items-center gap-2 text-xs mb-1">
                <div className="w-3 h-3 rounded-full" style={{ background: color as string }} />
                <span className="text-muted-foreground">BF {bf}: <span className="text-foreground">{desc}</span></span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* AVL Tree SVG */}
        <GlassCard className="xl:col-span-2 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-foreground">AVL Tree Visualization</h3>
            <span className="text-xs text-muted-foreground font-mono">{avl.size()} nodes</span>
          </div>
          <div className="overflow-auto">
            <svg width={layout.svgWidth} height={Math.max(layout.svgHeight, 200)} className="w-full">
              {layout.edges.map((e, i) => (
                <line key={i} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} stroke="rgba(0,180,255,0.3)" strokeWidth={1.5} />
              ))}
              {layout.nodes.map((n) => (
                <g key={n.value} transform={`translate(${n.x},${n.y})`}>
                  <circle r={24} fill="rgba(0,80,180,0.25)" stroke={bfColor(n.balanceFactor)} strokeWidth={2} />
                  <text textAnchor="middle" dy="4" fill="#d4eaf7" fontSize={11} fontFamily="JetBrains Mono, monospace" fontWeight={600}>{n.value}</text>
                  <circle cx={20} cy={-20} r={8} fill={bfColor(n.balanceFactor)} />
                  <text x={20} y={-20} textAnchor="middle" dy="4" fill="#000" fontSize={9} fontWeight={700}>{n.balanceFactor > 0 ? `+${n.balanceFactor}` : n.balanceFactor}</text>
                  <text textAnchor="middle" dy={38} fill="#6ba8c8" fontSize={9}>h={n.height}</text>
                </g>
              ))}
            </svg>
          </div>
        </GlassCard>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <GlassCard className="p-4 xl:col-span-2">
          <h3 className="font-semibold text-sm text-foreground mb-3">Regional Consumption (ML/day)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={waterUsageRows} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="region" tick={{ fill: "#6ba8c8", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6ba8c8", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#0a1a35", border: "1px solid rgba(0,180,255,0.2)", borderRadius: "8px", color: "#d4eaf7", fontSize: 12 }} />
              <Bar dataKey="consumption" name="Consumption" fill="#00ccff" radius={[4, 4, 0, 0]} />
              <Bar dataKey="target" name="Target" fill="rgba(0,204,255,0.2)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard className="p-4">
          <h3 className="font-semibold text-sm text-foreground mb-3">Consumption Share</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={regionDistributionData} cx="50%" cy="50%" outerRadius={70} dataKey="value" paddingAngle={2}>
                {regionDistributionData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#0a1a35", border: "1px solid rgba(0,180,255,0.2)", borderRadius: "8px", color: "#d4eaf7", fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>
    </div>
  );
}

// ─── NETWORK ANALYSIS (Graph BFS / DFS) ──────────────────────────────────────
const NODE_TYPE_COLORS: Record<string, string> = {
  reservoir: "#00ccff", pump: "#0055ff", treatment: "#00e87a", distribution: "#a855f7",
};

function NetworkAnalysis() {
  const [algo, setAlgo] = useState<"bfs" | "dfs">("bfs");
  const [startNode, setStartNode] = useState("R1");
  const [steps, setSteps] = useState<TraversalStep[]>([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const run = () => {
    const s = algo === "bfs" ? bfsSteps(startNode) : dfsSteps(startNode);
    setSteps(s); setStepIdx(0); setIsPlaying(false);
  };

  useEffect(() => {
    if (isPlaying && steps.length > 0) {
      intervalRef.current = setInterval(() => {
        setStepIdx(prev => {
          if (prev >= steps.length - 1) { setIsPlaying(false); clearInterval(intervalRef.current); return prev; }
          return prev + 1;
        });
      }, 600);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, steps.length]);

  const currentStep = steps[stepIdx] || null;

  const nodeColor = (id: string) => {
    if (!currentStep) return NODE_TYPE_COLORS[GRAPH_NODES.find(n => n.id === id)?.type || "distribution"];
    if (currentStep.current === id) return "#ffb300";
    if (currentStep.visited.includes(id)) return "#00e87a";
    return NODE_TYPE_COLORS[GRAPH_NODES.find(n => n.id === id)?.type || "distribution"];
  };

  return (
    <div className="p-6 space-y-6">
      <SectionHeader title="Network Analysis — Graph BFS / DFS" subtitle="Animated graph traversal on water distribution network" />
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Controls */}
        <GlassCard className="p-4 space-y-4">
          <h3 className="font-semibold text-sm text-foreground">Traversal Controls</h3>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Algorithm</label>
            <div className="flex gap-2">
              {(["bfs", "dfs"] as const).map(a => (
                <button key={a} onClick={() => setAlgo(a)} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors border ${algo === a ? "bg-primary/15 text-primary border-primary/30" : "bg-muted/40 text-muted-foreground border-border hover:border-primary/20"}`}>
                  {a.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Start Node</label>
            <select value={startNode} onChange={e => setStartNode(e.target.value)}
              className="w-full bg-input-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50">
              {GRAPH_NODES.map(n => <option key={n.id} value={n.id}>{n.id} — {n.label}</option>)}
            </select>
          </div>
          <button onClick={run} className="w-full bg-primary/15 hover:bg-primary/25 text-primary border border-primary/30 rounded-lg py-2 text-sm font-medium transition-colors">
            Initialize Traversal
          </button>
          {steps.length > 0 && (
            <>
              <div className="flex gap-2">
                <button onClick={() => { setStepIdx(0); setIsPlaying(false); }} className="p-2 rounded-lg bg-muted/40 hover:bg-muted text-muted-foreground transition-colors"><SkipBack className="w-4 h-4" /></button>
                <button onClick={() => setStepIdx(i => Math.max(0, i - 1))} className="p-2 rounded-lg bg-muted/40 hover:bg-muted text-muted-foreground transition-colors"><ChevronRight className="w-4 h-4 rotate-180" /></button>
                <button onClick={() => setIsPlaying(p => !p)} className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-primary/15 hover:bg-primary/25 text-primary border border-primary/30 py-2 text-sm font-medium transition-colors">
                  {isPlaying ? <><Pause className="w-4 h-4" />Pause</> : <><Play className="w-4 h-4" />Play</>}
                </button>
                <button onClick={() => setStepIdx(i => Math.min(steps.length - 1, i + 1))} className="p-2 rounded-lg bg-muted/40 hover:bg-muted text-muted-foreground transition-colors"><ChevronRight className="w-4 h-4" /></button>
                <button onClick={() => { setStepIdx(steps.length - 1); setIsPlaying(false); }} className="p-2 rounded-lg bg-muted/40 hover:bg-muted text-muted-foreground transition-colors"><SkipForward className="w-4 h-4" /></button>
              </div>
              <div className="text-xs text-center text-muted-foreground">Step {stepIdx + 1} / {steps.length}</div>
              {currentStep && <div className="p-2 bg-muted/30 rounded-lg text-xs text-foreground">{currentStep.description}</div>}
            </>
          )}

          {/* Legend */}
          <div className="pt-2 border-t border-border">
            <div className="text-xs text-muted-foreground mb-2">Node Legend</div>
            {[["reservoir", "Main Reservoir"], ["pump", "Pump Station"], ["treatment", "Treatment"], ["distribution", "Distribution"]].map(([t, label]) => (
              <div key={t} className="flex items-center gap-2 text-xs mb-1">
                <div className="w-3 h-3 rounded-full" style={{ background: NODE_TYPE_COLORS[t] }} />
                <span className="text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Graph */}
        <GlassCard className="xl:col-span-2 p-4">
          <h3 className="font-semibold text-sm text-foreground mb-3">Water Distribution Network</h3>
          <div className="overflow-auto">
            <svg viewBox="0 0 760 560" width="100%" style={{ minHeight: 360 }}>
              {/* Edges */}
              {GRAPH_EDGES.map(e => {
                const fn = GRAPH_NODES.find(n => n.id === e.from)!;
                const tn = GRAPH_NODES.find(n => n.id === e.to)!;
                const mx = (fn.x + tn.x) / 2, my = (fn.y + tn.y) / 2;
                const active = currentStep && (currentStep.visited.includes(e.from) && currentStep.visited.includes(e.to));
                return (
                  <g key={e.id}>
                    <line x1={fn.x} y1={fn.y} x2={tn.x} y2={tn.y} stroke={active ? "rgba(0,232,122,0.5)" : "rgba(0,150,200,0.25)"} strokeWidth={active ? 2.5 : 1.5} />
                    <text x={mx} y={my - 5} textAnchor="middle" fill="#6ba8c8" fontSize={9} fontFamily="JetBrains Mono, monospace">{e.weight}km</text>
                  </g>
                );
              })}
              {/* Nodes */}
              {GRAPH_NODES.map(n => {
                const color = nodeColor(n.id);
                const isCurrent = currentStep?.current === n.id;
                return (
                  <g key={n.id} transform={`translate(${n.x},${n.y})`}>
                    {isCurrent && <circle r={34} fill="none" stroke="#ffb300" strokeWidth={2} opacity={0.5} />}
                    <circle r={26} fill={`${color}22`} stroke={color} strokeWidth={isCurrent ? 2.5 : 1.5} />
                    <text textAnchor="middle" dy="-3" fill={color} fontSize={11} fontWeight={700} fontFamily="JetBrains Mono, monospace">{n.id}</text>
                    <text textAnchor="middle" dy={10} fill="#8bb8d0" fontSize={8}>{n.label.split(" ")[0]}</text>
                    <text textAnchor="middle" dy={20} fill="#8bb8d0" fontSize={8}>{n.label.split(" ").slice(1).join(" ")}</text>
                  </g>
                );
              })}
            </svg>
          </div>
        </GlassCard>
      </div>

      {/* Visited nodes table */}
      {currentStep && currentStep.visited.length > 0 && (
        <GlassCard className="p-4">
          <h3 className="font-semibold text-sm text-foreground mb-3">Traversal Progress</h3>
          <div className="flex flex-wrap gap-2">
            {currentStep.visited.map((id, i) => {
              const node = GRAPH_NODES.find(n => n.id === id);
              const isCurr = id === currentStep.current;
              return (
                <div key={id} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs ${isCurr ? "bg-amber-500/15 border-amber-500/30 text-amber-400" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"}`}>
                  <span className="font-mono font-bold">{i + 1}.</span>
                  <span>{node?.label}</span>
                </div>
              );
            })}
          </div>
        </GlassCard>
      )}
    </div>
  );
}

// ─── ROUTE OPTIMIZATION (Dijkstra / MST) ──────────────────────────────────────
function RouteOptimization() {
  const [mode, setMode] = useState<"dijkstra" | "mst">("dijkstra");
  const [startNode, setStartNode] = useState("R1");
  const [endNode, setEndNode] = useState("R9");
  const [dijkSteps, setDijkSteps] = useState<DijkstraStep[]>([]);
  const [mstSteps, setMstSteps] = useState<MSTStep[]>([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const steps = mode === "dijkstra" ? dijkSteps : mstSteps;

  const run = () => {
    if (mode === "dijkstra") {
      setDijkSteps(dijkstraSteps(startNode));
    } else {
      setMstSteps(primMSTSteps());
    }
    setStepIdx(0); setIsPlaying(false);
  };

  useEffect(() => {
    if (isPlaying && steps.length > 0) {
      intervalRef.current = setInterval(() => {
        setStepIdx(prev => {
          if (prev >= steps.length - 1) { setIsPlaying(false); clearInterval(intervalRef.current); return prev; }
          return prev + 1;
        });
      }, 700);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, steps.length]);

  const currentDijk = dijkSteps[stepIdx] as DijkstraStep | undefined;
  const currentMST = mstSteps[stepIdx] as MSTStep | undefined;

  const shortestPath = currentDijk ? getPath(currentDijk.previous, endNode) : [];

  const edgeInPath = (from: string, to: string) => {
    if (mode === "dijkstra" && shortestPath.length > 1) {
      for (let i = 0; i < shortestPath.length - 1; i++) {
        if ((shortestPath[i] === from && shortestPath[i + 1] === to) || (shortestPath[i] === to && shortestPath[i + 1] === from)) return true;
      }
    }
    if (mode === "mst" && currentMST) {
      return currentMST.edges.some(e => (e.from === from && e.to === to) || (e.from === to && e.to === from));
    }
    return false;
  };

  return (
    <div className="p-6 space-y-6">
      <SectionHeader title="Route Optimization — Dijkstra / MST" subtitle="Find shortest paths and minimum spanning trees in the water network" />
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Controls */}
        <GlassCard className="p-4 space-y-4">
          <div className="flex gap-2">
            {(["dijkstra", "mst"] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setStepIdx(0); setIsPlaying(false); }}
                className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${mode === m ? "bg-primary/15 text-primary border-primary/30" : "bg-muted/40 text-muted-foreground border-border hover:border-primary/20"}`}>
                {m === "dijkstra" ? "Dijkstra" : "Prim MST"}
              </button>
            ))}
          </div>
          {mode === "dijkstra" && (
            <>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Source Node</label>
                <select value={startNode} onChange={e => setStartNode(e.target.value)} className="w-full bg-input-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50">
                  {GRAPH_NODES.map(n => <option key={n.id} value={n.id}>{n.id} — {n.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Destination</label>
                <select value={endNode} onChange={e => setEndNode(e.target.value)} className="w-full bg-input-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50">
                  {GRAPH_NODES.map(n => <option key={n.id} value={n.id}>{n.id} — {n.label}</option>)}
                </select>
              </div>
            </>
          )}
          <button onClick={run} className="w-full bg-primary/15 hover:bg-primary/25 text-primary border border-primary/30 rounded-lg py-2 text-sm font-medium transition-colors">
            Run {mode === "dijkstra" ? "Dijkstra" : "Prim's MST"}
          </button>
          {steps.length > 0 && (
            <>
              <div className="flex gap-2">
                <button onClick={() => { setStepIdx(0); setIsPlaying(false); }} className="p-2 rounded-lg bg-muted/40 hover:bg-muted text-muted-foreground"><SkipBack className="w-4 h-4" /></button>
                <button onClick={() => setIsPlaying(p => !p)} className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-primary/15 text-primary border border-primary/30 py-2 text-sm font-medium">
                  {isPlaying ? <><Pause className="w-4 h-4" />Pause</> : <><Play className="w-4 h-4" />Play</>}
                </button>
                <button onClick={() => setStepIdx(i => Math.min(steps.length - 1, i + 1))} className="p-2 rounded-lg bg-muted/40 hover:bg-muted text-muted-foreground"><SkipForward className="w-4 h-4" /></button>
              </div>
              <div className="text-xs text-center text-muted-foreground">Step {stepIdx + 1} / {steps.length}</div>
              <div className="p-2 bg-muted/30 rounded-lg text-xs text-foreground">{(currentDijk || currentMST)?.description}</div>
            </>
          )}

          {/* Results */}
          {mode === "dijkstra" && currentDijk && shortestPath.length > 1 && (
            <div className="pt-2 border-t border-border space-y-2">
              <div className="text-xs text-muted-foreground">Shortest Path</div>
              <div className="flex flex-wrap gap-1 items-center">
                {shortestPath.map((id, i) => (
                  <span key={id} className="flex items-center gap-1">
                    <span className="text-xs px-1.5 py-0.5 bg-primary/10 text-primary rounded font-mono">{id}</span>
                    {i < shortestPath.length - 1 && <ChevronRight className="w-3 h-3 text-muted-foreground" />}
                  </span>
                ))}
              </div>
              <div className="text-xs text-muted-foreground">Total distance: <span className="text-primary font-mono font-bold">{currentDijk.distances[endNode] === Infinity ? "∞" : `${currentDijk.distances[endNode]} km`}</span></div>
            </div>
          )}
          {mode === "mst" && currentMST && (
            <div className="pt-2 border-t border-border">
              <div className="text-xs text-muted-foreground mb-1">MST Total Cost</div>
              <div className="text-xl font-bold text-primary font-mono">{currentMST.totalCost} km</div>
              <div className="text-xs text-muted-foreground mt-1">{currentMST.edges.length} edges selected</div>
            </div>
          )}
        </GlassCard>

        {/* Graph */}
        <GlassCard className="xl:col-span-2 p-4">
          <h3 className="font-semibold text-sm text-foreground mb-3">Network Graph</h3>
          <svg viewBox="0 0 760 560" width="100%" style={{ minHeight: 360 }}>
            {GRAPH_EDGES.map(e => {
              const fn = GRAPH_NODES.find(n => n.id === e.from)!;
              const tn = GRAPH_NODES.find(n => n.id === e.to)!;
              const mx = (fn.x + tn.x) / 2, my = (fn.y + tn.y) / 2;
              const inP = edgeInPath(e.from, e.to);
              return (
                <g key={e.id}>
                  <line x1={fn.x} y1={fn.y} x2={tn.x} y2={tn.y}
                    stroke={inP ? (mode === "dijkstra" ? "#ffb300" : "#00e87a") : "rgba(0,150,200,0.2)"}
                    strokeWidth={inP ? 3 : 1.5} />
                  <text x={mx} y={my - 5} textAnchor="middle" fill="#6ba8c8" fontSize={9} fontFamily="JetBrains Mono, monospace">{e.weight}</text>
                </g>
              );
            })}
            {GRAPH_NODES.map(n => {
              const visited = mode === "dijkstra" ? (currentDijk?.visited.includes(n.id) || false) : (currentMST?.inMST.includes(n.id) || false);
              const color = visited ? (mode === "dijkstra" ? "#00ccff" : "#00e87a") : NODE_TYPE_COLORS[n.type];
              const dist = mode === "dijkstra" && currentDijk ? currentDijk.distances[n.id] : null;
              return (
                <g key={n.id} transform={`translate(${n.x},${n.y})`}>
                  <circle r={26} fill={`${color}22`} stroke={color} strokeWidth={visited ? 2 : 1.5} />
                  <text textAnchor="middle" dy="-3" fill={color} fontSize={11} fontWeight={700} fontFamily="JetBrains Mono, monospace">{n.id}</text>
                  {dist !== null && dist !== Infinity && (
                    <text textAnchor="middle" dy={10} fill="#ffb300" fontSize={9} fontFamily="JetBrains Mono, monospace">{dist}</text>
                  )}
                  <text textAnchor="middle" dy={40} fill="#6ba8c8" fontSize={8}>{n.label}</text>
                </g>
              );
            })}
          </svg>
        </GlassCard>
      </div>
    </div>
  );
}

// ─── REPORTS & ANALYTICS (Sorting) ───────────────────────────────────────────
type SortAlgo = "merge" | "quick" | "heap" | "counting";

function ReportsAnalytics() {
  const [algo, setAlgo] = useState<SortAlgo>("merge");
  const [array, setArray] = useState<number[]>([64, 34, 25, 12, 22, 11, 90, 47, 38, 71, 55, 83]);
  const [steps, setSteps] = useState<SortStep[]>([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const genArray = () => {
    const arr = Array.from({ length: 12 }, () => Math.floor(Math.random() * 90) + 10);
    setArray(arr); setSteps([]); setStepIdx(0); setIsPlaying(false);
  };

  const initSort = () => {
    const fns = { merge: mergeSortSteps, quick: quickSortSteps, heap: heapSortSteps, counting: countingSortSteps };
    setSteps(fns[algo](array)); setStepIdx(0); setIsPlaying(false);
  };

  useEffect(() => {
    if (isPlaying && steps.length > 0) {
      intervalRef.current = setInterval(() => {
        setStepIdx(prev => {
          if (prev >= steps.length - 1) { setIsPlaying(false); clearInterval(intervalRef.current); return prev; }
          return prev + 1;
        });
      }, 180);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, steps.length]);

  const currentStep = steps[stepIdx];
  const displayArray = currentStep ? currentStep.array : array;
  const maxVal = Math.max(...displayArray, 1);

  const barColor = (i: number) => {
    if (!currentStep) return "#0055ff";
    if (currentStep.sorted.includes(i)) return "#00e87a";
    if (currentStep.swapping.includes(i)) return "#ff3366";
    if (currentStep.comparing.includes(i)) return "#ffb300";
    return "#0055ff";
  };

  return (
    <div className="p-6 space-y-6">
      <SectionHeader title="Reports & Analytics — Sorting Algorithms" subtitle="Step-by-step visualization of sorting algorithms on consumption data" />
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
        {/* Controls */}
        <GlassCard className="p-4 space-y-4">
          <h3 className="font-semibold text-sm text-foreground">Algorithm</h3>
          <div className="grid grid-cols-2 gap-2">
            {(["merge", "quick", "heap", "counting"] as SortAlgo[]).map(a => (
              <button key={a} onClick={() => { setAlgo(a); setSteps([]); setStepIdx(0); setIsPlaying(false); }}
                className={`py-2 rounded-lg text-xs font-medium border transition-colors capitalize ${algo === a ? "bg-primary/15 text-primary border-primary/30" : "bg-muted/40 text-muted-foreground border-border hover:border-primary/20"}`}>
                {a}
              </button>
            ))}
          </div>
          <button onClick={genArray} className="w-full flex items-center justify-center gap-2 bg-muted/40 hover:bg-muted text-foreground border border-border rounded-lg py-2 text-sm font-medium transition-colors">
            <RefreshCw className="w-3.5 h-3.5" />New Array
          </button>
          <button onClick={initSort} className="w-full bg-primary/15 hover:bg-primary/25 text-primary border border-primary/30 rounded-lg py-2 text-sm font-medium transition-colors">
            Initialize Sort
          </button>
          {steps.length > 0 && (
            <>
              <div className="flex gap-2">
                <button onClick={() => { setStepIdx(0); setIsPlaying(false); }} className="p-2 rounded-lg bg-muted/40 hover:bg-muted text-muted-foreground"><SkipBack className="w-4 h-4" /></button>
                <button onClick={() => setIsPlaying(p => !p)} className="flex-1 flex items-center justify-center gap-2 bg-primary/15 text-primary border border-primary/30 rounded-lg py-2 text-sm font-medium">
                  {isPlaying ? <><Pause className="w-3.5 h-3.5" />Pause</> : <><Play className="w-3.5 h-3.5" />Play</>}
                </button>
                <button onClick={() => { setStepIdx(steps.length - 1); setIsPlaying(false); }} className="p-2 rounded-lg bg-muted/40 hover:bg-muted text-muted-foreground"><SkipForward className="w-4 h-4" /></button>
              </div>
              <input type="range" min={0} max={steps.length - 1} value={stepIdx} onChange={e => { setStepIdx(Number(e.target.value)); setIsPlaying(false); }} className="w-full accent-primary" />
              <div className="text-xs text-center text-muted-foreground">Step {stepIdx + 1} / {steps.length}</div>
            </>
          )}

          {/* Color Legend */}
          <div className="pt-2 border-t border-border">
            {[["Comparing", "#ffb300"], ["Swapping", "#ff3366"], ["Sorted", "#00e87a"], ["Default", "#0055ff"]].map(([label, color]) => (
              <div key={label} className="flex items-center gap-2 text-xs mb-1">
                <div className="w-3 h-3 rounded-sm" style={{ background: color }} />
                <span className="text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Bar Visualization */}
        <GlassCard className="xl:col-span-3 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-foreground capitalize">{algo} Sort Visualization</h3>
            {currentStep && <div className="text-xs text-muted-foreground">{currentStep.description}</div>}
          </div>
          <div className="flex items-end justify-center gap-1.5 h-52 px-4">
            {displayArray.map((v, i) => {
              const h = (v / maxVal) * 100;
              const color = barColor(i);
              return (
                <div key={i} className="flex flex-col items-center gap-1 flex-1" style={{ maxWidth: 48 }}>
                  <span className="text-xs font-mono" style={{ color, fontSize: 9 }}>{v}</span>
                  <div className="w-full rounded-t-sm transition-all duration-100" style={{ height: `${h}%`, background: color, opacity: 0.85 }} />
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>

      {/* Rankings Table */}
      <GlassCard className="p-5">
        <h3 className="font-semibold text-foreground mb-4">Water Consumption Rankings</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Rank", "Region", "Consumption (ML)", "Target (ML)", "Efficiency", "Population", "Status"].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...waterUsageRows].sort((a, b) => b.consumption - a.consumption).map((r, i) => (
                <tr key={r.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="py-2 px-3">
                    <span className={`text-xs font-bold font-mono ${i === 0 ? "text-amber-400" : i === 1 ? "text-slate-400" : i === 2 ? "text-amber-700" : "text-muted-foreground"}`}>#{i + 1}</span>
                  </td>
                  <td className="py-2 px-3 font-medium text-foreground">{r.region}</td>
                  <td className="py-2 px-3 text-primary font-mono text-xs">{r.consumption.toFixed(1)}</td>
                  <td className="py-2 px-3 text-muted-foreground font-mono text-xs">{r.target}</td>
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${Math.min(r.efficiency, 100)}%`, background: r.efficiency > 100 ? "#ff3366" : r.efficiency > 95 ? "#00e87a" : "#ffb300" }} />
                      </div>
                      <span className="text-xs font-mono text-muted-foreground">{r.efficiency}%</span>
                    </div>
                  </td>
                  <td className="py-2 px-3 text-muted-foreground text-xs">{r.population ? r.population.toLocaleString() : "—"}</td>
                  <td className="py-2 px-3"><Badge label={r.efficiency <= 100 ? "Active" : "Maintenance"} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}

// ─── RESOURCE OPTIMIZATION ────────────────────────────────────────────────────
function ResourceOptimization() {
  const [budget, setBudget] = useState(200);
  const knapsackResult = useMemo(() => knapsack(upgradeItems, budget), [budget]);
  const activityResult = useMemo(() => activitySelection(maintenanceActivities), []);
  const lisResult = useMemo(() => lis(demandSequence), []);

  const priorityColor: Record<string, string> = { Critical: "#ff3366", High: "#ff8800", Medium: "#ffb300", Low: "#00ccff" };

  return (
    <div className="p-6 space-y-6">
      <SectionHeader title="Resource Optimization — DP Algorithms" subtitle="Activity selection, budget optimization, and demand forecasting" />

      {/* Activity Selection */}
      <GlassCard className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-foreground">Activity Selection — Greedy Scheduling</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Maximum non-overlapping maintenance tasks (sorted by finish time)</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge label={`${activityResult.length} selected`} color="bg-emerald-500/15 text-emerald-400" />
            <Badge label={`${maintenanceActivities.length} total`} color="bg-muted text-muted-foreground" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Timeline header */}
            <div className="flex mb-2">
              <div className="w-48 shrink-0" />
              <div className="flex-1 flex">
                {Array.from({ length: 13 }, (_, i) => i + 6).map(h => (
                  <div key={h} className="flex-1 text-xs text-muted-foreground text-center">{h}:00</div>
                ))}
              </div>
            </div>
            {maintenanceActivities.map(act => {
              const selected = activityResult.some(a => a.id === act.id);
              const dayStart = 6, dayEnd = 19, span = dayEnd - dayStart;
              const left = ((act.start - dayStart) / span) * 100;
              const width = ((act.end - act.start) / span) * 100;
              return (
                <div key={act.id} className="flex items-center mb-2">
                  <div className="w-48 shrink-0 pr-3">
                    <div className="text-xs text-foreground truncate">{act.name}</div>
                    <div className="text-xs text-muted-foreground">{act.resource}</div>
                  </div>
                  <div className="flex-1 relative h-8 bg-muted/20 rounded-lg overflow-hidden">
                    <div className="absolute h-full rounded-lg transition-all"
                      style={{
                        left: `${left}%`, width: `${width}%`,
                        background: selected ? `${priorityColor[act.priority]}33` : "rgba(100,100,120,0.2)",
                        border: `1px solid ${selected ? priorityColor[act.priority] : "rgba(100,100,120,0.3)"}`,
                        opacity: selected ? 1 : 0.45,
                      }}>
                      <div className="flex items-center h-full px-2 gap-1">
                        {selected && <Check className="w-3 h-3 shrink-0" style={{ color: priorityColor[act.priority] }} />}
                        <span className="text-xs truncate" style={{ color: selected ? priorityColor[act.priority] : "#6ba8c8" }}>{act.start}–{act.end}h</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </GlassCard>

      {/* Knapsack + LIS */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Knapsack */}
        <GlassCard className="p-5">
          <h3 className="font-semibold text-foreground mb-1">Budget Optimization — 0/1 Knapsack</h3>
          <p className="text-xs text-muted-foreground mb-4">Select upgrades to maximize efficiency within budget</p>
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">Budget Limit</span>
              <span className="font-mono text-primary">₹{budget} Cr</span>
            </div>
            <input type="range" min={50} max={400} step={10} value={budget} onChange={e => setBudget(Number(e.target.value))}
              className="w-full accent-primary" />
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { label: "Total Benefit", value: `${knapsackResult.totalBenefit}%`, color: "text-emerald-400" },
              { label: "Total Cost", value: `₹${knapsackResult.totalCost} Cr`, color: "text-primary" },
            ].map(s => (
              <div key={s.label} className="bg-muted/30 rounded-lg p-3 text-center">
                <div className={`text-xl font-bold font-mono ${s.color}`}>{s.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            {upgradeItems.map(item => {
              const sel = knapsackResult.selected.some(s => s.id === item.id);
              return (
                <div key={item.id} className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs transition-colors ${sel ? "bg-primary/10 border-primary/30" : "bg-muted/20 border-border/50 opacity-50"}`}>
                  <div className="flex items-center gap-2">
                    {sel ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <X className="w-3.5 h-3.5 text-muted-foreground" />}
                    <span className={sel ? "text-foreground" : "text-muted-foreground"}>{item.name}</span>
                  </div>
                  <div className="flex gap-3 font-mono">
                    <span className="text-primary">₹{item.cost}Cr</span>
                    <span className="text-emerald-400">+{item.benefit}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* LIS */}
        <GlassCard className="p-5">
          <h3 className="font-semibold text-foreground mb-1">Demand Trend — Longest Increasing Subsequence</h3>
          <p className="text-xs text-muted-foreground mb-4">Identifies longest monotonically rising demand pattern for forecasting</p>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: "LIS Length", value: lisResult.length, color: "text-primary" },
              { label: "Total Points", value: demandSequence.length, color: "text-muted-foreground" },
              { label: "Final Value", value: lisResult.subsequence[lisResult.subsequence.length - 1], color: "text-emerald-400" },
            ].map(s => (
              <div key={s.label} className="bg-muted/30 rounded-lg p-3 text-center">
                <div className={`text-lg font-bold font-mono ${s.color}`}>{s.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={demandTrendData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: "#6ba8c8", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6ba8c8", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#0a1a35", border: "1px solid rgba(0,180,255,0.2)", borderRadius: "8px", color: "#d4eaf7", fontSize: 12 }} />
              <Line type="monotone" dataKey="demand" stroke="#00ccff" strokeWidth={2} dot={(props: { cx: number; cy: number; index: number }) => {
                const inLIS = lisResult.indices.includes(props.index);
                return <circle key={props.index} cx={props.cx} cy={props.cy} r={inLIS ? 5 : 3} fill={inLIS ? "#00e87a" : "#00ccff"} stroke={inLIS ? "#00e87a" : "#00ccff"} />;
              }} />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2 text-xs">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-emerald-400" /><span className="text-muted-foreground">LIS nodes</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-cyan-400" /><span className="text-muted-foreground">All demand points</span></div>
          </div>
          <div className="mt-3 p-2 bg-muted/30 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">LIS Subsequence ({lisResult.length} values)</div>
            <div className="flex flex-wrap gap-1">
              {lisResult.subsequence.map((v, i) => (
                <span key={i} className="text-xs px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded font-mono">{v}</span>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState<Page>("dashboard");
  const [isDark, setIsDark] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  const pages: Record<Page, React.ReactNode> = {
    dashboard: <Dashboard />,
    pipeline: <PipelineManagement />,
    waterusage: <WaterUsageMonitoring />,
    network: <NetworkAnalysis />,
    route: <RouteOptimization />,
    reports: <ReportsAnalytics />,
    resources: <ResourceOptimization />,
  };

  const sideWidth = collapsed ? 64 : 240;

  return (
    <div className={isDark ? "dark" : ""}>
      <div className="min-h-screen bg-background text-foreground" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        {/* Ambient background */}
        <div className="fixed inset-0 pointer-events-none" style={{
          background: isDark
            ? "radial-gradient(ellipse at 15% 40%, rgba(0,80,180,0.12) 0%, transparent 55%), radial-gradient(ellipse at 85% 15%, rgba(0,180,255,0.08) 0%, transparent 50%), radial-gradient(ellipse at 55% 85%, rgba(0,60,140,0.1) 0%, transparent 45%)"
            : "radial-gradient(ellipse at 15% 40%, rgba(0,85,204,0.06) 0%, transparent 55%), radial-gradient(ellipse at 85% 15%, rgba(0,136,255,0.05) 0%, transparent 50%)",
        }} />

        <Sidebar page={page} setPage={setPage} isDark={isDark} setIsDark={setIsDark} collapsed={collapsed} setCollapsed={setCollapsed} />

        <div className="relative" style={{ marginLeft: sideWidth, transition: "margin-left 0.3s" }}>
          <TopNav page={page} alerts={dashboardStats.activeAlerts} />
          <main className="overflow-y-auto" style={{ minHeight: "calc(100vh - 56px)" }}>
            <motion.div key={page} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
              {pages[page]}
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
}
