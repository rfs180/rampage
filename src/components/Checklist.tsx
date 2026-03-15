import { useState, useEffect } from "react";
import { CheckSquare, Square, Plus, Clock, Trash2, ChevronDown, ChevronUp } from "lucide-react";

type Bucket = "today" | "week" | "backlog";

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

const bucketLabels: Record<Bucket, string> = {
  today: "Today",
  week: "This Week",
  backlog: "Backlog",
};

const initialTasks: ChecklistTask[] = [
  {
    id: "1",
    label: "daily GM",
    done: false,
    bucket: "today",
    time: "06:00",
    duration: "5m",
    isDaily: true,
    emoji: "😎",
  },
  {
    id: "2",
    label: "_rampage GM",
    done: false,
    bucket: "today",
    time: "06:00",
    duration: "5m",
    isDaily: true,
    emoji: "👊",
  },
  {
    id: "3",
    label: "Morning PushUps - 30",
    done: false,
    bucket: "today",
    time: "06:30",
    duration: "15m",
    isDaily: true,
    emoji: "🏋️‍♂️",
  },
  {
    id: "4",
    label: "Ai Updates/CheckUp",
    done: false,
    bucket: "today",
    time: "07:00",
    duration: "15m",
    isDaily: true,
    emoji: "🤖",
  },
  {
    id: "5",
    label: "RFS Advertising/Marketing",
    done: false,
    bucket: "week",
    time: "09:00",
    duration: "35m",
    isDaily: true,
    emoji: "📊",
  },
];

function formatTime(time?: string) {
  if (!time) return "";
  const [hStr, mStr] = time.split(":");
  const h = Number(hStr);
  const m = Number(mStr);
  const ampm = h >= 12 ? "PM" : "AM";
  const hr12 = h % 12 || 12;
  return `${hr12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

/**
 * Converts **text** markdown bold syntax into <strong> elements.
 * Splits on double-asterisk pairs and alternates between plain and bold segments.
 */
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

export default function Checklist() {
  const [tasks, setTasks] = useState<ChecklistTask[]>(initialTasks);

  const [newLabel, setNewLabel] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newBucket, setNewBucket] = useState<Bucket>("today");
  const [newTime, setNewTime] = useState("");
  const [newDuration, setNewDuration] = useState("Duration");
  const [newIsDaily, setNewIsDaily] = useState(true);

  // Tracks which task cards have their description expanded
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      const saved = window.localStorage.getItem("rampage_checklist_v1");
      if (!saved) return;

      const parsed = JSON.parse(saved) as ChecklistTask[];
      if (Array.isArray(parsed)) {
        setTasks(parsed);
      }
    } catch (err) {
      console.error("Failed to load checklist from localStorage", err);
    }
  }, []);

  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      window.localStorage.setItem(
        "rampage_checklist_v1",
        JSON.stringify(tasks)
      );
    } catch (err) {
      console.error("Failed to save checklist to localStorage", err);
    }
  }, [tasks]);

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task
      )
    );
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const addTask = () => {
    const label = newLabel.trim();
    if (!label) return;

    const task: ChecklistTask = {
      id: Date.now().toString(),
      label,
      done: false,
      bucket: newBucket,
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

  const buckets: Bucket[] = ["today", "week", "backlog"];

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

      {/* Add Task Form */}
      <div className="mb-6 rounded-lg bg-discord-darker border border-discord-border p-4">
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

        {/* Description input */}
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

        <div className="flex flex-wrap gap-2">
          {/* Bucket select */}
          <select
            value={newBucket}
            onChange={(e) => setNewBucket(e.target.value as Bucket)}
            className="rounded bg-discord-input border border-discord-border px-3 py-1.5 text-xs text-discord-primary focus:outline-none"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="backlog">Backlog</option>
          </select>

          {/* Time input */}
          <div className="flex items-center rounded bg-discord-input border border-discord-border px-2 py-1.5 gap-2">
            <input
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="bg-transparent text-xs text-discord-primary focus:outline-none"
            />
            <Clock className="w-4 h-4 text-discord-muted" />
          </div>

          {/* Duration select */}
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

          {/* Daily toggle */}
          <button
            type="button"
            onClick={() => setNewIsDaily((prev) => !prev)}
            className={`px-4 py-1.5 rounded text-xs font-medium transition-colors ${
              newIsDaily
                ? "bg-emerald-600 text-white"
                : "bg-discord-input border border-discord-border text-discord-secondary"
            }`}
          >
            {newIsDaily ? "daily" : "one-time"}
          </button>
        </div>
      </div>

      {/* Sections Grid */}
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
                <span className="text-xs text-discord-muted">
                  {openCount} open
                </span>
              </div>

              {bucketTasks.length === 0 ? (
                <p className="text-xs text-discord-muted mt-2">No tasks yet.</p>
              ) : (
                <ul className="space-y-2">
                  {bucketTasks.map((task) => {
                    const isExpanded = expandedIds.has(task.id);
                    const hasDescription = !!task.description;

                    return (
                      <li
                        key={task.id}
                        className="flex items-start gap-2"
                      >
                        {/* Task card */}
                        <div className="flex-1 rounded bg-discord-input border border-discord-border overflow-hidden">
                          {/* Main row — clicking expands; checkbox stops propagation to toggle done */}
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

                            {/* Content */}
                            <div className="flex flex-col flex-1 min-w-0">
                              {/* Label row */}
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

                              {/* Meta info */}
                              {(task.time || task.isDaily) && (
                                <div className="mt-1 text-[11px] text-discord-muted">
                                  {task.time && (
                                    <span>Scheduled for {formatTime(task.time)} </span>
                                  )}
                                  {task.isDaily && (
                                    <span className="text-emerald-400 font-medium">
                                      Daily
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Expand chevron — only shown if description exists */}
                            {hasDescription && (
                              <span className="text-discord-muted flex-shrink-0">
                                {isExpanded ? (
                                  <ChevronUp className="w-3.5 h-3.5" />
                                ) : (
                                  <ChevronDown className="w-3.5 h-3.5" />
                                )}
                              </span>
                            )}
                          </button>

                          {/* Expandable description panel */}
                          {hasDescription && isExpanded && (
                            <div className="text-[11px] text-discord-muted mt-2 border-t border-discord-border pt-2 px-3 pb-2.5">
                              {formatBoldText(task.description!)}
                            </div>
                          )}
                        </div>

                        {/* Delete button */}
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
