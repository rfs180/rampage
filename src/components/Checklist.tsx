import { useState, useEffect, useRef } from "react";
import { CheckSquare, Clock, Trash2, ChevronDown, ChevronUp, Pencil, Check, X } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Bucket = "daily" | "fivemin" | "longer";

interface ChecklistTask {
  id: string;
  label: string;
  done: boolean;
  bucket: Bucket;
  time?: string;
  duration?: string;
  isDaily: boolean;
  emoji: string;
  description?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const bucketLabels: Record<Bucket, string> = {
  daily: "Daily",
  fivemin: "5 Minute Tasks",
  longer: "Longer Tasks",
};

const STORAGE_KEY = "rampage_checklist_v1";
const RESET_KEY = "rampage_checklist_last_reset";

// Seed tasks — all daily, live in the daily bucket permanently
const initialTasks: ChecklistTask[] = [
  { id: "1", label: "daily GM", done: false, bucket: "daily", time: "06:00", duration: "5m", isDaily: true, emoji: "😎" },
  { id: "2", label: "_rampage GM", done: false, bucket: "daily", time: "06:00", duration: "5m", isDaily: true, emoji: "👊" },
  { id: "3", label: "Morning PushUps - 30", done: false, bucket: "daily", time: "06:30", duration: "15m", isDaily: true, emoji: "🏋️‍♂️" },
  { id: "4", label: "Ai Updates/CheckUp", done: false, bucket: "daily", time: "07:00", duration: "15m", isDaily: true, emoji: "🤖" },
  { id: "5", label: "RFS Advertising/Marketing", done: false, bucket: "daily", time: "09:00", duration: "35m", isDaily: true, emoji: "📊" },
];

// ─── Pure helpers ─────────────────────────────────────────────────────────────

/** Migrate old bucket IDs so existing localStorage data isn't lost */
function migrateBucket(bucket: string): Bucket {
  if (bucket === "today") return "daily";
  if (bucket === "week") return "fivemin";
  if (bucket === "backlog") return "longer";
  return bucket as Bucket;
}

/** Local date string — used to track whether reset has run today */
function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

/** Milliseconds from right now until the next local midnight */
function getMsUntilMidnight(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime() - now.getTime();
}

/**
 * Midnight reset rules:
 *   isDaily          → uncheck (done = false), task stays forever
 *   !isDaily && done → removed
 *   !isDaily && !done → untouched, carries forward
 */
function applyMidnightReset(tasks: ChecklistTask[]): ChecklistTask[] {
  return tasks
    .filter((t) => !(t.done && !t.isDaily))
    .map((t) => (t.isDaily ? { ...t, done: false } : t));
}

function formatTime(time?: string): string {
  if (!time) return "";
  const [hStr, mStr] = time.split(":");
  const h = Number(hStr);
  const m = Number(mStr);
  const ampm = h >= 12 ? "PM" : "AM";
  const hr12 = h % 12 || 12;
  return `${hr12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function formatBoldText(text: string): React.ReactNode {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-semibold text-discord-primary">
        {part}
      </strong>
    ) : (
      part
    )
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Checklist() {
  const [tasks, setTasks] = useState<ChecklistTask[]>(initialTasks);

  // Add-form — isDaily defaults OFF, bucket defaults to fivemin
  const [newLabel, setNewLabel] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newBucket, setNewBucket] = useState<Bucket>("fivemin");
  const [newTime, setNewTime] = useState("");
  const [newDuration, setNewDuration] = useState("Duration");
  const [newIsDaily, setNewIsDaily] = useState(false);

  // UI state
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editEmoji, setEditEmoji] = useState("");
  const [editLabel, setEditLabel] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // Keeps the 24h interval reference alive for cleanup
  const midnightIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── 1. Load + migrate + catch-up reset ──────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (!saved) return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let parsed: any[] = JSON.parse(saved);
      if (!Array.isArray(parsed)) return;

      // Remap any old bucket IDs
      parsed = parsed.map((t) => ({ ...t, bucket: migrateBucket(t.bucket) }));

      // If midnight reset hasn't run today (app was closed), run it now
      const lastReset = window.localStorage.getItem(RESET_KEY);
      const today = getTodayString();
      if (lastReset !== today) {
        parsed = applyMidnightReset(parsed as ChecklistTask[]);
        window.localStorage.setItem(RESET_KEY, today);
      }

      setTasks(parsed as ChecklistTask[]);
    } catch (err) {
      console.error("Checklist: failed to load from localStorage", err);
    }
  }, []);

  // ── 2. Persist on every task change ─────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (err) {
      console.error("Checklist: failed to save to localStorage", err);
    }
  }, [tasks]);

  // ── 3. Live midnight timer ───────────────────────────────────────────────────
  useEffect(() => {
    const runReset = () => {
      setTasks((prev) => applyMidnightReset(prev));
      try {
        window.localStorage.setItem(RESET_KEY, getTodayString());
      } catch {}
    };

    // Fire once at midnight, then every 24 h after
    const timeoutId = setTimeout(() => {
      runReset();
      midnightIntervalRef.current = setInterval(runReset, 24 * 60 * 60 * 1000);
    }, getMsUntilMidnight());

    return () => {
      clearTimeout(timeoutId);
      if (midnightIntervalRef.current) clearInterval(midnightIntervalRef.current);
    };
  }, []);

  // ── Task handlers ────────────────────────────────────────────────────────────

  const toggleTask = (id: string) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const toggleExpand = (id: string) =>
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const startEdit = (task: ChecklistTask) => {
    setExpandedIds((prev) => new Set(prev).add(task.id));
    setEditingId(task.id);
    setEditEmoji(task.emoji);
    setEditLabel(task.label);
    setEditDescription(task.description ?? "");
  };

  const saveEdit = (id: string) => {
    const label = editLabel.trim();
    if (!label) return;
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              emoji: editEmoji.trim() || t.emoji,
              label,
              description: editDescription.trim() || undefined,
            }
          : t
      )
    );
    setEditingId(null);
  };

  const cancelEdit = () => setEditingId(null);

  const addTask = () => {
    const label = newLabel.trim();
    if (!label) return;

    // Daily tasks are always routed to the daily bucket — no other option
    const bucket: Bucket = newIsDaily ? "daily" : newBucket;

    const task: ChecklistTask = {
      id: Date.now().toString(),
      label,
      done: false,
      bucket,
      time: newTime || undefined,
      duration: newDuration === "Duration" ? undefined : newDuration,
      isDaily: newIsDaily,
      emoji: "📝",
      description: newDescription.trim() || undefined,
    };

    setTasks((prev) => [...prev, task]);
    setNewLabel("");
    setNewDescription("");
    setNewTime("");
    setNewDuration("Duration");
  };

  const buckets: Bucket[] = ["daily", "fivemin", "longer"];

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="h-full w-full bg-discord-dark text-discord-primary px-6 py-6 overflow-y-auto">

      {/* Title */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2 text-discord-primary">
          <CheckSquare className="w-5 h-5 text-discord-gold" />
          Checklist
        </h2>
        <p className="text-xs text-discord-muted mt-1">
          Quick control panel for your priorities. Stored locally on this device.
        </p>
      </div>

      {/* ── Add Task Form ─────────────────────────────────────────────────────── */}
      <div className="mb-6 rounded-lg bg-discord-darker border border-discord-border p-4">

        {/* Label + Add */}
        <div className="flex items-center gap-2 mb-2">
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
            placeholder="Add a task..."
            className="flex-1 rounded bg-discord-input border border-discord-border px-3 py-2 text-sm text-discord-primary placeholder:text-discord-muted focus:outline-none"
          />
          <button
            type="button"
            onClick={addTask}
            className="px-4 py-2 rounded bg-discord-gold hover:bg-yellow-600 text-white text-sm font-medium transition-colors"
          >
            Add
          </button>
        </div>

        {/* Description */}
        <div className="mb-3">
          <input
            type="text"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
            placeholder="Description (optional, supports **bold**)"
            className="w-full rounded bg-discord-input border border-discord-border px-3 py-2 text-sm text-discord-primary placeholder:text-discord-muted focus:outline-none"
          />
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-2 items-center">

          {/* Daily toggle — anchors the row */}
          <button
            type="button"
            onClick={() => setNewIsDaily((prev) => !prev)}
            className={`px-4 py-1.5 rounded text-xs font-medium transition-colors ${
              newIsDaily
                ? "bg-emerald-600 text-white"
                : "bg-discord-input border border-discord-border text-discord-secondary"
            }`}
          >
            {newIsDaily ? "✦ daily" : "one-time"}
          </button>

          {/* Bucket selector — hidden when isDaily is on */}
          {!newIsDaily && (
            <select
              value={newBucket}
              onChange={(e) => setNewBucket(e.target.value as Bucket)}
              className="rounded bg-discord-input border border-discord-border px-3 py-1.5 text-xs text-discord-primary focus:outline-none"
            >
              <option value="fivemin">5 Minute Tasks</option>
              <option value="longer">Longer Tasks</option>
            </select>
          )}

          {/* Time — always visible */}
          <div className="flex items-center rounded bg-discord-input border border-discord-border px-2 py-1.5 gap-2">
            <input
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="bg-transparent text-xs text-discord-primary focus:outline-none"
            />
            <Clock className="w-4 h-4 text-discord-muted" />
          </div>

          {/* Duration — always visible */}
          <select
            value={newDuration}
            onChange={(e) => setNewDuration(e.target.value)}
            className="rounded bg-discord-input border border-discord-border px-3 py-1.5 text-xs text-discord-primary focus:outline-none"
          >
            <option>Duration</option>
            <option>5m</option>
            <option>10m</option>
            <option>15m</option>
            <option>30m</option>
            <option>45m</option>
            <option>60m</option>
          </select>
        </div>
      </div>

      {/* ── Bucket Columns ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {buckets.map((bucket) => {
          const bucketTasks = tasks.filter((t) => t.bucket === bucket);
          const openCount = bucketTasks.filter((t) => !t.done).length;

          return (
            <section
              key={bucket}
              className="rounded-lg bg-discord-darker border border-discord-border p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-discord-primary uppercase tracking-wide">
                  {bucketLabels[bucket]}
                </h3>
                <span className="text-xs text-discord-muted">{openCount} open</span>
              </div>

              {bucketTasks.length === 0 ? (
                <p className="text-xs text-discord-muted mt-2">No tasks yet.</p>
              ) : (
                <ul className="space-y-2">
                  {bucketTasks.map((task) => {
                    const isExpanded = expandedIds.has(task.id);
                    const isEditing = editingId === task.id;

                    return (
                      <li key={task.id} className="flex items-start gap-2">

                        {/* Task card */}
                        <div className="flex-1 rounded bg-discord-input border border-discord-border overflow-hidden">

                          {/* Main row */}
                          <button
                            type="button"
                            onClick={() => toggleExpand(task.id)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-discord-hover transition-colors"
                          >
                            {/* Checkbox */}
                            <span
                              role="checkbox"
                              aria-checked={task.done}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleTask(task.id);
                              }}
                              className={`inline-flex items-center justify-center w-7 h-7 rounded border-2 text-sm flex-shrink-0 cursor-pointer ${
                                task.done
                                  ? "border-discord-gold bg-discord-gold text-white"
                                  : "border-discord-muted bg-transparent text-discord-muted"
                              }`}
                            >
                              {task.done ? "✓" : ""}
                            </span>

                            {/* Label + meta */}
                            <div className="flex flex-col flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-sm">{task.emoji}</span>
                                <span className="text-sm text-discord-muted">|</span>
                                <span
                                  className={`text-sm font-medium ${
                                    task.done
                                      ? "line-through text-discord-muted"
                                      : "text-discord-primary"
                                  }`}
                                >
                                  {formatBoldText(task.label)}
                                </span>
                                {task.duration && (
                                  <span className="text-xs text-discord-muted">
                                    ({task.duration})
                                  </span>
                                )}
                              </div>
                              {(task.time || task.isDaily) && (
                                <div className="mt-1 text-[11px] text-discord-muted">
                                  {task.time && (
                                    <span>Scheduled for {formatTime(task.time)} </span>
                                  )}
                                  {task.isDaily && (
                                    <span className="text-emerald-400 font-medium">Daily</span>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Chevron */}
                            <span className="text-discord-muted flex-shrink-0">
                              {isExpanded
                                ? <ChevronUp className="w-3.5 h-3.5" />
                                : <ChevronDown className="w-3.5 h-3.5" />}
                            </span>
                          </button>

                          {/* Expanded panel */}
                          {isExpanded && (
                            <div className="border-t border-discord-border px-3 pt-3 pb-3">
                              {isEditing ? (
                                /* Edit form */
                                <div className="flex flex-col gap-2">
                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      value={editEmoji}
                                      onChange={(e) => setEditEmoji(e.target.value)}
                                      maxLength={4}
                                      placeholder="😎"
                                      className="w-12 rounded bg-discord-input border border-discord-border px-2 py-2 text-sm text-center text-discord-primary placeholder:text-discord-muted focus:outline-none focus:border-discord-gold flex-shrink-0"
                                      aria-label="Emoji"
                                    />
                                    <input
                                      type="text"
                                      value={editLabel}
                                      onChange={(e) => setEditLabel(e.target.value)}
                                      onKeyDown={(e) => e.key === "Enter" && saveEdit(task.id)}
                                      placeholder="Task label..."
                                      className="flex-1 rounded bg-discord-input border border-discord-border px-3 py-2 text-sm text-discord-primary placeholder:text-discord-muted focus:outline-none focus:border-discord-gold min-w-0"
                                      aria-label="Label"
                                    />
                                  </div>
                                  <textarea
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    placeholder="Description (optional, supports **bold**)"
                                    rows={3}
                                    className="w-full rounded bg-discord-input border border-discord-border px-3 py-2 text-sm text-discord-primary placeholder:text-discord-muted focus:outline-none focus:border-discord-gold resize-none"
                                    aria-label="Description"
                                  />
                                  <div className="flex gap-2 pt-1">
                                    <button
                                      type="button"
                                      onClick={() => saveEdit(task.id)}
                                      className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors"
                                    >
                                      <Check className="w-3.5 h-3.5" /> Save
                                    </button>
                                    <button
                                      type="button"
                                      onClick={cancelEdit}
                                      className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-discord-input border border-discord-border text-discord-muted hover:text-discord-primary text-xs font-medium transition-colors"
                                    >
                                      <X className="w-3.5 h-3.5" /> Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                /* Read view */
                                <div>
                                  {task.description && (
                                    <p className="text-[11px] text-discord-muted mb-2">
                                      {formatBoldText(task.description)}
                                    </p>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => startEdit(task)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-discord-input border border-discord-border text-discord-muted hover:text-discord-primary hover:border-discord-gold text-xs font-medium transition-colors"
                                  >
                                    <Pencil className="w-3 h-3" /> Edit
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => deleteTask(task.id)}
                          className="w-8 h-8 flex items-center justify-center rounded bg-discord-input border border-discord-border text-discord-muted hover:text-red-400 hover:border-red-500 hover:bg-red-500/10 transition-colors flex-shrink-0"
                          aria-label="Delete task"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
