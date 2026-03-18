import { useState, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type LogEntry = {
  type: "ok" | "err" | "info";
  time: string;
  msg: string;
  sub: string;
};

type Automation = {
  id: number;
  name: string;
  short: string;
  client: string;
  platform: string;
  status: "active" | "broken" | "idle" | "paused";
  lastRun: string;
  runCount: string;
  desc: string;
  logs: LogEntry[];
};

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockAutomations: Automation[] = [
  {
    id: 1,
    name: "FB Auto-Poster",
    short: "FB Poster",
    client: "Ready Forest Solutions",
    platform: "n8n + OpenAI",
    status: "active",
    lastRun: "2 min ago",
    runCount: "142 runs",
    desc: "AI-generated captions posted to Facebook. Two-route pipeline: image-based job site photos and spreadsheet-driven value content posts.",
    logs: [
      { type: "ok", time: "2m ago", msg: "Posted: '3 reasons to hire a certified arborist'", sub: "Image post — Route B" },
      { type: "ok", time: "6h ago", msg: "Posted: 'Grinding stumps in St. Albert today'", sub: "Photo post — Route A" },
      { type: "info", time: "2d ago", msg: "Spreadsheet updated — 4 new post drafts loaded", sub: "" },
    ],
  },
  {
    id: 2,
    name: "Lead Enrichment",
    short: "Lead Enrich",
    client: "Ready Forest Solutions",
    platform: "n8n + Apify",
    status: "active",
    lastRun: "1 hr ago",
    runCount: "89 runs",
    desc: "Scrapes property mgmt contacts via Apify, deduplicates, enriches fields, and pushes verified leads to CRM Google Sheet.",
    logs: [
      { type: "ok", time: "1h ago", msg: "Processed 47 new leads — Edmonton batch 4", sub: "12 dupes removed" },
      { type: "err", time: "3d ago", msg: "Apify rate limit hit — batch paused mid-run", sub: "Resumed automatically after 2h" },
    ],
  },
  {
    id: 3,
    name: "Contact Form Handler",
    short: "Form Handler",
    client: "Ready Forest Solutions",
    platform: "n8n + Formspree",
    status: "active",
    lastRun: "3 hr ago",
    runCount: "38 runs",
    desc: "Catches Formspree submissions, sends Zoho Mail notification, and creates a CRM entry in Google Sheets.",
    logs: [
      { type: "ok", time: "3h ago", msg: "New lead: John M. — tree removal quote request", sub: "CRM row added" },
      { type: "ok", time: "1d ago", msg: "New lead: Sarah K. — emergency storm call", sub: "CRM row added" },
    ],
  },
  {
    id: 4,
    name: "Invoice Reminders",
    short: "Invoice Seq",
    client: "Acme Property Mgmt",
    platform: "n8n + Gmail",
    status: "broken",
    lastRun: "2 days ago",
    runCount: "24 runs",
    desc: "Sends payment reminders at 7, 14, and 30 day intervals after invoice creation. Pulls invoice data from Airtable.",
    logs: [
      { type: "err", time: "2d ago", msg: "Gmail OAuth token expired — workflow halted", sub: "Needs re-authentication in n8n credentials" },
      { type: "ok", time: "9d ago", msg: "Reminder sent: Invoice #1042 — 14 day notice", sub: "" },
    ],
  },
  {
    id: 5,
    name: "Tenant Onboarding",
    short: "Tenant Flow",
    client: "Acme Property Mgmt",
    platform: "n8n + Gmail",
    status: "idle",
    lastRun: "5 days ago",
    runCount: "11 runs",
    desc: "Triggers on new tenant creation — sends welcome email, document package, and portal access instructions.",
    logs: [
      { type: "ok", time: "5d ago", msg: "Onboarded: Unit 4B — Taylor R.", sub: "Welcome email + docs sent" },
      { type: "info", time: "12d ago", msg: "Flow updated — new lease template v3 added", sub: "" },
    ],
  },
  {
    id: 6,
    name: "Ticket Router",
    short: "Ticket Router",
    client: "Acme Property Mgmt",
    platform: "n8n",
    status: "active",
    lastRun: "45 min ago",
    runCount: "67 runs",
    desc: "Categorizes incoming maintenance requests by type and urgency, assigns contractors, and sends confirmation to tenant.",
    logs: [
      { type: "ok", time: "45m ago", msg: "Routed 3 tickets: 2 plumbing, 1 electrical", sub: "All assigned successfully" },
      { type: "ok", time: "4h ago", msg: "Routed 1 urgent ticket: Unit 7C water leak", sub: "Plumber notified" },
    ],
  },
  {
    id: 7,
    name: "Quote Follow-Up",
    short: "Quote Seq",
    client: "Greenscape Landscaping",
    platform: "n8n",
    status: "paused",
    lastRun: "8 days ago",
    runCount: "19 runs",
    desc: "3-touch email follow-up sequence after quote is sent. Tracks open events via pixel. Paused pending client messaging changes.",
    logs: [
      { type: "info", time: "8d ago", msg: "Sequence paused — client requested copy changes", sub: "" },
      { type: "ok", time: "10d ago", msg: "Follow-up #2 sent to 4 open quotes", sub: "1 open tracked" },
    ],
  },
  {
    id: 8,
    name: "Review Request Bot",
    short: "Review Bot",
    client: "Greenscape Landscaping",
    platform: "n8n + Twilio",
    status: "active",
    lastRun: "6 hr ago",
    runCount: "53 runs",
    desc: "48hr post-job trigger sends review request via SMS + email. Tracks completion and flags non-responders.",
    logs: [
      { type: "ok", time: "6h ago", msg: "4 review requests sent — 1 Google review received", sub: "" },
      { type: "ok", time: "2d ago", msg: "3 requests sent — 2 Google reviews received", sub: "4.9 stars avg this week" },
    ],
  },
  {
    id: 9,
    name: "Health Monitor",
    short: "Health Monitor",
    client: "Internal",
    platform: "n8n",
    status: "active",
    lastRun: "15 min ago",
    runCount: "210 runs",
    desc: "Checks all workflow last-run timestamps every 30min. Sends Slack alert if any workflow hasn't run within its expected window.",
    logs: [
      { type: "err", time: "15m ago", msg: "Alert sent: Invoice Reminder broken for 48h", sub: "Slack #automation-alerts" },
      { type: "ok", time: "45m ago", msg: "All systems check passed", sub: "9 workflows checked" },
    ],
  },
];

// ─── Status Config ─────────────────────────────────────────────────────────────

const statusConfig = {
  active: {
    cell: "bg-green-50 border-green-200",
    dot: "bg-green-600",
    text: "text-green-800",
    badge: "bg-green-100 text-green-800 border border-green-200",
    label: "Active",
  },
  broken: {
    cell: "bg-red-50 border-red-200",
    dot: "bg-red-600",
    text: "text-red-800",
    badge: "bg-red-100 text-red-800 border border-red-200",
    label: "Broken",
  },
  idle: {
    cell: "bg-amber-50 border-amber-200",
    dot: "bg-amber-500",
    text: "text-amber-800",
    badge: "bg-amber-100 text-amber-800 border border-amber-200",
    label: "Idle",
  },
  paused: {
    cell: "bg-discord-darker border-discord-border",
    dot: "bg-gray-400",
    text: "text-discord-muted",
    badge: "bg-discord-input text-discord-muted border border-discord-border",
    label: "Paused",
  },
};

const logDotColor = {
  ok: "bg-green-500",
  err: "bg-red-500",
  info: "bg-blue-400",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function ControlPanel() {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    // TODO: Replace mock with live webhook once n8n is wired up:
    // fetch("https://[PLACEHOLDER_N8N_WEBHOOK_URL]/webhook/control-panel")
    //   .then((res) => res.json())
    //   .then((data) => setAutomations(data))
    //   .catch((err) => console.error("Control panel fetch failed:", err));

    setAutomations(mockAutomations);
  }, []);

  const selected = automations.find((a) => a.id === selectedId) ?? null;

  const handleCellClick = (id: number) => {
    setSelectedId((prev) => (prev === id ? null : id));
  };

  // ── Status summary counts ──
  const counts = {
    active: automations.filter((a) => a.status === "active").length,
    broken: automations.filter((a) => a.status === "broken").length,
    idle: automations.filter((a) => a.status === "idle").length,
    paused: automations.filter((a) => a.status === "paused").length,
  };

  return (
    <div className="flex flex-col gap-6 p-6 h-full overflow-y-auto">

      {/* ── Section 1: Status Grid ── */}
      <div className="rounded-lg bg-discord-darker border border-discord-border p-5">

        {/* Header row */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-discord-primary uppercase tracking-wide">
            System Status
          </h2>
          <div className="flex items-center gap-4 text-xs text-discord-muted">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-600 inline-block" />
              Active ({counts.active})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-600 inline-block" />
              Broken ({counts.broken})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
              Idle ({counts.idle})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-gray-400 inline-block" />
              Paused ({counts.paused})
            </span>
          </div>
        </div>

        {/* Grid */}
        <div
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(88px, 1fr))", gap: "6px" }}
          className="grid"
        >
          {automations.map((auto) => {
            const cfg = statusConfig[auto.status];
            const isSelected = selectedId === auto.id;

            return (
              <button
                key={auto.id}
                onClick={() => handleCellClick(auto.id)}
                className={`
                  flex flex-col items-center justify-center gap-1.5 rounded-md border px-2 py-3
                  text-center transition-all cursor-pointer
                  ${cfg.cell}
                  ${isSelected ? "border-blue-500 ring-1 ring-blue-500" : ""}
                  hover:brightness-95
                `}
              >
                <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
                <span className={`text-[11px] font-medium leading-tight ${cfg.text}`}>
                  {auto.short}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Section 2: Detail Panel ── */}
      <div className="rounded-lg bg-discord-darker border border-discord-border p-5 flex-1">

        {!selected ? (
          // Empty state
          <div className="flex items-center justify-center h-32">
            <p className="text-discord-muted text-sm">
              Select any automation above to see details
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">

            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-discord-primary font-semibold text-base">
                  {selected.name}
                </h3>
                <p className="text-discord-secondary text-sm mt-1 leading-relaxed">
                  {selected.desc}
                </p>
              </div>
              <span
                className={`
                  flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full
                  ${statusConfig[selected.status].badge}
                `}
              >
                {statusConfig[selected.status].label}
              </span>
            </div>

            {/* Meta row */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "Client", value: selected.client },
                { label: "Platform", value: selected.platform },
                { label: "Last Run", value: selected.lastRun },
                { label: "Total Runs", value: selected.runCount },
              ].map((meta) => (
                <div
                  key={meta.label}
                  className="rounded-md bg-discord-input border border-discord-border px-3 py-2.5"
                >
                  <p className="text-[10px] font-semibold text-discord-muted uppercase tracking-wide mb-1">
                    {meta.label}
                  </p>
                  <p className="text-discord-primary text-sm font-medium truncate">
                    {meta.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Activity Feed */}
            <div>
              <h4 className="text-[11px] font-semibold text-discord-muted uppercase tracking-wide mb-3">
                Recent Activity
              </h4>
              <ul className="flex flex-col gap-2">
                {selected.logs.map((log, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 rounded-md bg-discord-input border border-discord-border px-3 py-2.5"
                  >
                    <span
                      className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${logDotColor[log.type]}`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-discord-primary text-sm leading-snug">
                          {log.msg}
                        </span>
                        <span className="text-discord-muted text-xs flex-shrink-0">
                          {log.time}
                        </span>
                      </div>
                      {log.sub && (
                        <p className="text-discord-muted text-xs mt-0.5">
                          {log.sub}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        )}
      </div>

    </div>
  );
}
