import { useState, useEffect, useRef } from "react";
import { Book, Send } from "lucide-react";

interface JournalEntry {
  id: string;
  text: string;
  timestamp: number;
}

function getDateString(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function groupEntriesByDate(entries: JournalEntry[]) {
  const groups: { date: string; entries: JournalEntry[] }[] = [];
  
  entries.forEach((entry) => {
    const dateStr = getDateString(entry.timestamp);
    const lastGroup = groups[groups.length - 1];
    
    if (lastGroup && lastGroup.date === dateStr) {
      lastGroup.entries.push(entry);
    } else {
      groups.push({ date: dateStr, entries: [entry] });
    }
  });
  
  return groups;
}

export default function ArchitectSpeech() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [input, setInput] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const entriesEndRef = useRef<HTMLDivElement>(null);

  // Load entries from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const saved = window.localStorage.getItem("rampage_architectspeech_v1");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setEntries(parsed);
        }
      }
    } catch (err) {
      console.warn("architectSpeech: corrupted localStorage, starting fresh");
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save entries + auto-scroll
  useEffect(() => {
    if (!isLoaded || typeof window === "undefined") return;

    try {
      window.localStorage.setItem("rampage_architectspeech_v1", JSON.stringify(entries));
    } catch (err) {
      console.warn("architectSpeech: failed to save to localStorage");
    }

    entriesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [entries, isLoaded]);

  const addEntry = () => {
    if (!input.trim()) return;
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      text: input.trim(),
      timestamp: Date.now(),
    };
    setEntries((prev) => [...prev, newEntry]);
    setInput("");
  };

  const entryGroups = groupEntriesByDate(entries);

  return (
    <div className="flex flex-col h-full bg-discord-dark">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Book className="w-16 h-16 mb-4 text-discord-gold opacity-50" />
            <p className="text-discord-secondary text-base mb-2">Your personal journal</p>
            <p className="text-discord-muted text-sm">Private thoughts. Local only. No AI.</p>
          </div>
        ) : (
          entryGroups.map((group, groupIdx) => (
            <div key={groupIdx}>
              {/* Date Separator */}
              <div className="flex items-center justify-center my-4">
                <div className="flex-1 h-[1px] bg-discord-border"></div>
                <span className="px-4 text-xs font-semibold text-discord-timestamp">
                  {group.date}
                </span>
                <div className="flex-1 h-[1px] bg-discord-border"></div>
              </div>

              {/* Entries for this date */}
              {group.entries.map((entry) => (
                <div 
                  key={entry.id} 
                  className="group px-4 py-2 mb-0.5 mx-2 rounded-lg border border-discord-border hover:bg-discord-hover hover:border-discord-gold/40 transition-all"
                >
                  <div className="flex gap-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-discord-gold flex items-center justify-center">
                        <Book className="w-6 h-6 text-white" />
                      </div>
                    </div>

                    {/* Entry content */}
                    <div className="flex-1 min-w-0">
                      {/* Username and timestamp */}
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="font-medium text-discord-primary text-[15px]">
                          architectSpeech
                        </span>
                        <span className="text-xs text-discord-timestamp">
                          {formatTime(entry.timestamp)}
                        </span>
                      </div>

                      {/* Entry text */}
                      <div className="text-discord-primary text-[15px] leading-[1.375] break-words whitespace-pre-wrap">
                        {entry.text}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
        <div ref={entriesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="px-4 pb-6 pt-2">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                addEntry();
              }
            }}
            placeholder="Write your thoughts..."
            rows={3}
            className="w-full px-4 py-3 pr-12 rounded-lg bg-discord-input text-discord-primary placeholder:text-discord-muted text-[15px] focus:outline-none resize-none"
          />
          <button
            onClick={addEntry}
            disabled={!input.trim()}
            className="absolute right-2 bottom-2 w-8 h-8 rounded-full bg-discord-gold hover:bg-yellow-600 flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
