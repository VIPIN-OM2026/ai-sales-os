import { useState, useEffect, useRef } from "react";

const LEADS = [
  { id: "L001", name: "Arjun Sharma", company: "PropEdge Realty", source: "WhatsApp", score: 92, stage: "Qualified", value: 85000, lastContact: "2h ago", avatar: "AS", industry: "Real Estate" },
  { id: "L002", name: "Meera Nair", company: "NovaCare Clinic", source: "Website", score: 78, stage: "Contacted", value: 42000, lastContact: "5h ago", avatar: "MN", industry: "Healthcare" },
  { id: "L003", name: "Ravi Kapoor", company: "FinWise Advisory", source: "Email", score: 65, stage: "New", value: 120000, lastContact: "1d ago", avatar: "RK", industry: "Finance" },
  { id: "L004", name: "Priya Menon", company: "EduBridge Academy", source: "Referral", score: 88, stage: "Proposal", value: 35000, lastContact: "3h ago", avatar: "PM", industry: "Education" },
  { id: "L005", name: "Kiran Patel", company: "CreativeAxis Agency", source: "LinkedIn", score: 71, stage: "Negotiation", value: 67000, lastContact: "6h ago", avatar: "KP", industry: "Agency" },
  { id: "L006", name: "Divya Reddy", company: "MedLife Clinic", source: "WhatsApp", score: 55, stage: "New", value: 28000, lastContact: "2d ago", avatar: "DR", industry: "Healthcare" },
];

const PIPELINE = {
  New: LEADS.filter(l => l.stage === "New"),
  Contacted: LEADS.filter(l => l.stage === "Contacted"),
  Qualified: LEADS.filter(l => l.stage === "Qualified"),
  Proposal: LEADS.filter(l => l.stage === "Proposal"),
  Negotiation: LEADS.filter(l => l.stage === "Negotiation"),
  Won: [],
};

const ACTIVITIES = [
  { id: 1, type: "whatsapp", lead: "Arjun Sharma", msg: "Follow-up sent via WhatsApp", time: "2m ago", status: "sent" },
  { id: 2, type: "ai", lead: "Meera Nair", msg: "AI scored lead: 78/100 — medium intent", time: "15m ago", status: "info" },
  { id: 3, type: "email", lead: "Ravi Kapoor", msg: "Proposal email delivered", time: "1h ago", status: "sent" },
  { id: 4, type: "call", lead: "Priya Menon", msg: "Call scheduled for tomorrow 10 AM", time: "2h ago", status: "scheduled" },
  { id: 5, type: "invoice", lead: "Kiran Patel", msg: "Invoice ₹67,000 reminder sent", time: "3h ago", status: "sent" },
  { id: 6, type: "ai", lead: "System", msg: "Workflow: 12 reminders auto-sent today", time: "4h ago", status: "info" },
];

const ANALYTICS = {
  revenue: [28, 42, 38, 55, 61, 48, 72, 68, 83, 91, 87, 104],
  leads: [12, 18, 15, 22, 28, 24, 31, 27, 35, 42, 38, 47],
  conversion: [18, 22, 19, 28, 31, 26, 34, 30, 38, 42, 39, 45],
};

const WHATSAPP_TEMPLATES = [
  { id: 1, name: "Initial Follow-Up", trigger: "New Lead", sent: 142, opened: 128, replied: 67 },
  { id: 2, name: "Appointment Reminder", trigger: "24h before", sent: 89, opened: 84, replied: 71 },
  { id: 3, name: "Invoice Reminder", trigger: "Due in 3 days", sent: 56, opened: 51, replied: 38 },
  { id: 4, name: "Re-engagement", trigger: "7 days silent", sent: 34, opened: 22, replied: 9 },
];

const WORKFLOWS = [
  { id: 1, name: "New Lead Nurture", status: "active", triggers: 247, lastRun: "2m ago", steps: 5 },
  { id: 2, name: "Invoice Auto-Reminder", status: "active", triggers: 89, lastRun: "1h ago", steps: 3 },
  { id: 3, name: "Re-engagement Sequence", status: "paused", triggers: 12, lastRun: "2d ago", steps: 7 },
  { id: 4, name: "Appointment Confirmation", status: "active", triggers: 156, lastRun: "30m ago", steps: 4 },
];

const STAGE_COLORS = { New: "#64748b", Contacted: "#3b82f6", Qualified: "#8b5cf6", Proposal: "#f59e0b", Negotiation: "#ef4444", Won: "#10b981" };
const SCORE_COLOR = (s) => s >= 80 ? "#10b981" : s >= 60 ? "#f59e0b" : "#ef4444";

function Avatar({ initials, size = 36, color = "#6366f1" }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
      {initials}
    </div>
  );
}

function Badge({ label, color = "#6366f1" }) {
  return (
    <span style={{ padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: color + "22", color, letterSpacing: "0.04em", textTransform: "uppercase" }}>
      {label}
    </span>
  );
}

function ScoreRing({ score }) {
  const r = 18, c = 2 * Math.PI * r, fill = (score / 100) * c;
  return (
    <svg width={44} height={44} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={22} cy={22} r={r} fill="none" stroke="#1e293b" strokeWidth={3} />
      <circle cx={22} cy={22} r={r} fill="none" stroke={SCORE_COLOR(score)} strokeWidth={3} strokeDasharray={`${fill} ${c - fill}`} strokeLinecap="round" />
      <text x={22} y={22} textAnchor="middle" dominantBaseline="central" style={{ transform: "rotate(90deg) translate(0,-44px)", fill: SCORE_COLOR(score), fontSize: 11, fontWeight: 700 }}>{score}</text>
    </svg>
  );
}

function MiniChart({ data, color = "#6366f1", height = 40 }) {
  const max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 100},${height - ((v - min) / (max - min || 1)) * (height - 4) - 2}`).join(" ");
  const id = `g${color.replace("#", "")}`;
  return (
    <svg viewBox={`0 0 100 ${height}`} style={{ width: "100%", height }} preserveAspectRatio="none">
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} /><stop offset="100%" stopColor={color} stopOpacity={0} /></linearGradient></defs>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
      <polygon points={`0,${height} ${pts} 100,${height}`} fill={`url(#${id})`} opacity={0.25} />
    </svg>
  );
}

function StatCard({ label, value, sub, color, data, icon }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: "#0f172a", border: `1px solid ${hov ? color : "#1e293b"}`, borderRadius: 16, padding: "20px 24px", display: "flex", flexDirection: "column", gap: 8, transition: "border-color 0.2s", cursor: "default" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#f1f5f9", marginTop: 4, lineHeight: 1 }}>{value}</div>
          <div style={{ fontSize: 12, color, marginTop: 6, fontWeight: 600 }}>{sub}</div>
        </div>
        <div style={{ fontSize: 24, opacity: 0.6 }}>{icon}</div>
      </div>
      {data && <div style={{ marginTop: 8 }}><MiniChart data={data} color={color} /></div>}
    </div>
  );
}

function Dashboard() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
        <StatCard label="Monthly Revenue" value="₹9.4L" sub="↑ 14% vs last month" color="#10b981" data={ANALYTICS.revenue} icon="💰" />
        <StatCard label="Active Leads" value="247" sub="↑ 23 this week" color="#6366f1" data={ANALYTICS.leads} icon="🎯" />
        <StatCard label="Conversion Rate" value="34.2%" sub="↑ 3.1% improvement" color="#f59e0b" data={ANALYTICS.conversion} icon="📈" />
        <StatCard label="AI Actions Today" value="1,247" sub="Fully automated" color="#ec4899" data={[40,55,62,48,71,68,83,91,87,104,98,112]} icon="⚡" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 16 }}>
        <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, padding: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 20 }}>Pipeline Overview</div>
          {Object.entries(PIPELINE).map(([stage, leads]) => (
            <div key={stage} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <div style={{ width: 90, fontSize: 12, color: "#64748b", fontWeight: 600 }}>{stage}</div>
              <div style={{ flex: 1, background: "#1e293b", borderRadius: 4, height: 8, overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 4, width: `${Math.min((leads.length / 6) * 100, 100)}%`, background: STAGE_COLORS[stage], transition: "width 1s ease" }} />
              </div>
              <div style={{ width: 24, textAlign: "right", fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}>{leads.length}</div>
            </div>
          ))}
          <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid #1e293b" }}>
            <div style={{ fontSize: 11, color: "#64748b", marginBottom: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>Revenue Trend</div>
            <MiniChart data={ANALYTICS.revenue} color="#6366f1" height={60} />
          </div>
        </div>
        <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, padding: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 20 }}>Live Activity</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {ACTIVITIES.map(a => {
              const icons = { whatsapp: "💬", ai: "🤖", email: "📧", call: "📞", invoice: "🧾" };
              const colors = { sent: "#10b981", info: "#6366f1", scheduled: "#f59e0b" };
              return (
                <div key={a.id} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "#1e293b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>{icons[a.type]}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: "#e2e8f0", lineHeight: 1.4 }}>{a.msg}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
                      <span style={{ fontSize: 11, color: "#475569" }}>{a.lead}</span>
                      <span style={{ fontSize: 11, color: "#475569" }}>· {a.time}</span>
                      <div style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: colors[a.status] }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase" }}>Hot Leads — AI Ranked</div>
          <Badge label="AI Scored" color="#6366f1" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
          {LEADS.filter(l => l.score >= 70).slice(0, 3).map(lead => (
            <div key={lead.id} style={{ background: "#070d1a", border: "1px solid #1e293b", borderRadius: 12, padding: 16, cursor: "pointer", transition: "border-color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "#6366f1"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "#1e293b"}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <Avatar initials={lead.avatar} size={36} color={SCORE_COLOR(lead.score)} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}>{lead.name}</div>
                    <div style={{ fontSize: 11, color: "#475569" }}>{lead.company}</div>
                  </div>
                </div>
                <ScoreRing score={lead.score} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Badge label={lead.stage} color={STAGE_COLORS[lead.stage]} />
                <span style={{ fontSize: 13, fontWeight: 700, color: "#10b981" }}>₹{(lead.value / 1000).toFixed(0)}K</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Leads() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const filtered = LEADS.filter(l => (filter === "All" || l.stage === filter) && (l.name.toLowerCase().includes(search.toLowerCase()) || l.company.toLowerCase().includes(search.toLowerCase())));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search leads..."
          style={{ flex: 1, minWidth: 200, background: "#0f172a", border: "1px solid #1e293b", borderRadius: 10, padding: "10px 16px", color: "#f1f5f9", fontSize: 13, outline: "none" }} />
        {["All", "New", "Contacted", "Qualified", "Proposal", "Negotiation"].map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{ padding: "8px 14px", borderRadius: 8, border: `1px solid ${filter === s ? "#6366f1" : "#1e293b"}`, background: filter === s ? "#6366f133" : "transparent", color: filter === s ? "#818cf8" : "#64748b", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}>{s}</button>
        ))}
      </div>
      <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 80px 1fr 100px 80px", padding: "12px 20px", borderBottom: "1px solid #1e293b", fontSize: 11, color: "#475569", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          <span>Lead</span><span>Company</span><span>Source</span><span>Score</span><span>Stage</span><span>Value</span><span>Last</span>
        </div>
        {filtered.map((lead, i) => (
          <div key={lead.id} style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 80px 1fr 100px 80px", padding: "14px 20px", borderBottom: i < filtered.length - 1 ? "1px solid #0d1829" : "none", alignItems: "center", cursor: "pointer", transition: "background 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.background = "#0d1829"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <Avatar initials={lead.avatar} size={32} color={SCORE_COLOR(lead.score)} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{lead.name}</div>
                <div style={{ fontSize: 11, color: "#64748b" }}>{lead.industry}</div>
              </div>
            </div>
            <div style={{ fontSize: 13, color: "#94a3b8" }}>{lead.company}</div>
            <div><Badge label={lead.source} color="#6366f1" /></div>
            <div style={{ fontSize: 13, fontWeight: 700, color: SCORE_COLOR(lead.score) }}>{lead.score}</div>
            <div><Badge label={lead.stage} color={STAGE_COLORS[lead.stage]} /></div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#10b981" }}>₹{(lead.value / 1000).toFixed(0)}K</div>
            <div style={{ fontSize: 11, color: "#475569" }}>{lead.lastContact}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Pipeline() {
  return (
    <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 8 }}>
      {Object.entries(PIPELINE).map(([stage, leads]) => (
        <div key={stage} style={{ minWidth: 240, background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: STAGE_COLORS[stage] }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>{stage}</span>
            </div>
            <span style={{ fontSize: 12, color: "#475569" }}>{leads.length}</span>
          </div>
          {leads.length === 0 && <div style={{ height: 60, border: "2px dashed #1e293b", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 11, color: "#334155" }}>empty</span></div>}
          {leads.map(lead => (
            <div key={lead.id} style={{ background: "#070d1a", border: "1px solid #1e293b", borderRadius: 10, padding: 12, cursor: "grab", transition: "all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = STAGE_COLORS[stage]; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e293b"; e.currentTarget.style.transform = "translateY(0)"; }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                <Avatar initials={lead.avatar} size={28} color={SCORE_COLOR(lead.score)} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0" }}>{lead.name}</div>
                  <div style={{ fontSize: 10, color: "#64748b" }}>{lead.company}</div>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#10b981" }}>₹{(lead.value / 1000).toFixed(0)}K</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: SCORE_COLOR(lead.score) }}>AI:{lead.score}</span>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function WhatsApp() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ background: "linear-gradient(135deg,#064e3b,#065f46)", border: "1px solid #059669", borderRadius: 16, padding: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#ecfdf5" }}>WhatsApp Automation</div>
          <div style={{ fontSize: 13, color: "#6ee7b7", marginTop: 4 }}>321 messages sent today · 89% open rate</div>
        </div>
        <div style={{ fontSize: 48 }}>💬</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
        {WHATSAPP_TEMPLATES.map(t => (
          <div key={t.id} style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 14, padding: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", marginBottom: 4 }}>{t.name}</div>
            <div style={{ fontSize: 11, color: "#059669", marginBottom: 12 }}>{t.trigger}</div>
            {[["Sent", t.sent, "#6366f1"], ["Opened", t.opened, "#10b981"], ["Replied", t.replied, "#f59e0b"]].map(([l, v, c]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: "#64748b" }}>{l}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: c }}>{v}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function Workflows() {
  const [wf, setWf] = useState(WORKFLOWS);
  const toggle = (id) => setWf(prev => prev.map(w => w.id === id ? { ...w, status: w.status === "active" ? "paused" : "active" } : w));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {wf.map(w => (
          <div key={w.id} style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 14, padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9", marginBottom: 4 }}>{w.name}</div>
                <div style={{ fontSize: 11, color: "#475569" }}>{w.steps} steps · Last run {w.lastRun}</div>
              </div>
              <button onClick={() => toggle(w.id)} style={{ padding: "4px 12px", borderRadius: 20, border: "none", cursor: "pointer", background: w.status === "active" ? "#10b98122" : "#f59e0b22", color: w.status === "active" ? "#10b981" : "#f59e0b", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor" }} />
                {w.status}
              </button>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {Array.from({ length: w.steps }).map((_, i) => (
                <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i < w.steps - 1 ? "#6366f1" : "#1e293b" }} />
              ))}
            </div>
            <div style={{ marginTop: 10, fontSize: 11, color: "#64748b" }}>Triggered {w.triggers}× total</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AIAssistant() {
  const [messages, setMessages] = useState([
    { role: "ai", text: "I'm your AI Sales Assistant. Ask me to score leads, draft follow-ups, analyze pipeline trends, or suggest workflow strategies." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(m => [...m, { role: "user", text: userMsg }]);
    setLoading(true);
    try {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are an AI Sales & Operations Assistant for OpsMonsters — a SaaS platform for SMEs.
Current data: 247 active leads, 34.2% conversion, ₹9.4L monthly revenue.
Top lead: Arjun Sharma (score 92, ₹85K, Real Estate). 1,247 AI actions today.
Be concise, actionable, business-focused.`,
          messages: messages.filter((_, i) => i > 0).map(m => ({ role: m.role === "ai" ? "assistant" : "user", content: m.text })).concat([{ role: "user", content: userMsg }])
        })
      });
      const data = await resp.json();
      setMessages(m => [...m, { role: "ai", text: data.content?.[0]?.text || "Error getting response." }]);
    } catch {
      setMessages(m => [...m, { role: "ai", text: "Connection error. Please try again." }]);
    }
    setLoading(false);
  };

  const QUICK = ["Score top leads", "Draft WhatsApp for Arjun Sharma", "Pipeline analysis", "Best follow-up strategy for clinics"];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, height: "calc(100vh - 160px)", maxHeight: 680 }}>
      <div style={{ flex: 1, background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, padding: 20, overflowY: "auto", display: "flex", flexDirection: "column", gap: 14 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            {m.role === "ai" && <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>⚡</div>}
            <div style={{ maxWidth: "75%", padding: "12px 16px", borderRadius: 12, background: m.role === "user" ? "#6366f122" : "#070d1a", border: `1px solid ${m.role === "user" ? "#6366f133" : "#1e293b"}`, fontSize: 13, color: "#e2e8f0", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{m.text}</div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center" }}>⚡</div>
            <div style={{ display: "flex", gap: 4 }}>{[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#6366f1", animation: `bounce 1s infinite ${i*0.15}s` }} />)}</div>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {QUICK.map(q => (
          <button key={q} onClick={() => setInput(q)} style={{ padding: "6px 12px", background: "#0f172a", border: "1px solid #1e293b", borderRadius: 20, color: "#64748b", fontSize: 11, cursor: "pointer", fontWeight: 600, transition: "all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.color = "#818cf8"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e293b"; e.currentTarget.style.color = "#64748b"; }}>
            {q}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Ask AI: score leads, draft messages, analyze pipeline..."
          style={{ flex: 1, background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: "12px 16px", color: "#f1f5f9", fontSize: 13, outline: "none" }}
          onFocus={e => e.target.style.borderColor = "#6366f1"} onBlur={e => e.target.style.borderColor = "#1e293b"} />
        <button onClick={send} style={{ padding: "12px 20px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", border: "none", borderRadius: 12, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: loading ? 0.6 : 1 }}>Send</button>
      </div>
    </div>
  );
}

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "◈" },
  { id: "leads", label: "Leads", icon: "⬡" },
  { id: "pipeline", label: "Pipeline", icon: "⬥" },
  { id: "whatsapp", label: "WhatsApp", icon: "◉" },
  { id: "workflows", label: "Workflows", icon: "⬟" },
  { id: "ai", label: "AI Assistant", icon: "⚡" },
];

export default function App() {
  const [active, setActive] = useState("dashboard");
  const PAGES = { dashboard: Dashboard, leads: Leads, pipeline: Pipeline, whatsapp: WhatsApp, workflows: Workflows, ai: AIAssistant };
  const Page = PAGES[active];
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:#070d1a;font-family:'DM Mono',monospace;}
        ::-webkit-scrollbar{width:4px;height:4px;}
        ::-webkit-scrollbar-track{background:#0f172a;}
        ::-webkit-scrollbar-thumb{background:#1e293b;border-radius:4px;}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
      `}</style>
      <div style={{ display: "flex", minHeight: "100vh", background: "#070d1a" }}>
        <div style={{ width: 220, background: "#0a1120", borderRight: "1px solid #1e293b", display: "flex", flexDirection: "column", padding: "24px 16px", flexShrink: 0, position: "sticky", top: 0, height: "100vh" }}>
          <div style={{ marginBottom: 32, paddingLeft: 8 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#f1f5f9", fontFamily: "'Syne',sans-serif", lineHeight: 1.1 }}>OpsMonsters</div>
            <div style={{ fontSize: 10, color: "#6366f1", marginTop: 2, letterSpacing: "0.1em" }}>AI SALES OS · v1.0</div>
          </div>
          <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
            {NAV.map(n => (
              <button key={n.id} onClick={() => setActive(n.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, border: "none", cursor: "pointer", textAlign: "left", background: active === n.id ? "#6366f122" : "transparent", color: active === n.id ? "#818cf8" : "#475569", fontWeight: active === n.id ? 700 : 500, fontSize: 13, fontFamily: "'DM Mono',monospace", transition: "all 0.15s", borderLeft: `2px solid ${active === n.id ? "#6366f1" : "transparent"}` }}
                onMouseEnter={e => { if (active !== n.id) { e.currentTarget.style.color = "#94a3b8"; e.currentTarget.style.background = "#6366f111"; } }}
                onMouseLeave={e => { if (active !== n.id) { e.currentTarget.style.color = "#475569"; e.currentTarget.style.background = "transparent"; } }}>
                <span style={{ fontSize: 16 }}>{n.icon}</span>{n.label}
              </button>
            ))}
          </nav>
          <div style={{ paddingTop: 20, borderTop: "1px solid #1e293b" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <Avatar initials="VP" size={32} color="#6366f1" />
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0" }}>Vipin P.</div>
                <div style={{ fontSize: 10, color: "#475569" }}>ORG_ADMIN</div>
              </div>
            </div>
          </div>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <div style={{ height: 60, borderBottom: "1px solid #1e293b", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", background: "#0a1120", position: "sticky", top: 0, zIndex: 10 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#f1f5f9", fontFamily: "'Syne',sans-serif" }}>{NAV.find(n => n.id === active)?.label}</div>
              <div style={{ fontSize: 11, color: "#475569" }}>June 2026 · AI-powered operations</div>
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", background: "#10b98111", border: "1px solid #10b98133", borderRadius: 20 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", animation: "pulse 2s infinite" }} />
                <span style={{ fontSize: 11, color: "#10b981", fontWeight: 700 }}>12 workflows live</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", background: "#6366f111", border: "1px solid #6366f133", borderRadius: 20 }}>
                <span style={{ fontSize: 11, color: "#818cf8", fontWeight: 700 }}>⚡ AI Active</span>
              </div>
            </div>
          </div>
          <div style={{ flex: 1, padding: 28, overflowY: "auto", animation: "fadeIn 0.3s ease" }}>
            <Page key={active} />
          </div>
        </div>
      </div>
    </>
  );
}
