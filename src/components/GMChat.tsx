import { useState, useEffect, useRef } from "react";
import { Flame, Send } from "lucide-react";

interface Message {
  id: string;
  text: string;
  timestamp: number;
  isUser: boolean;
}

// Helper: Get date string in format "Wednesday, December 31, 2025"
function getDateString(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Helper: Format time like Discord
function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// Helper: Group messages by date
function groupMessagesByDate(messages: Message[]) {
  const groups: { date: string; messages: Message[] }[] = [];
  
  messages.forEach((msg) => {
    const dateStr = getDateString(msg.timestamp);
    const lastGroup = groups[groups.length - 1];
    
    if (lastGroup && lastGroup.date === dateStr) {
      lastGroup.messages.push(msg);
    } else {
      groups.push({ date: dateStr, messages: [msg] });
    }
  });
  
  return groups;
}

export default function GMChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const saved = window.localStorage.getItem("rampage_gm_chat_v1");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setMessages(parsed);
        }
      }
    } catch (err) {
      console.warn("GM chat: corrupted localStorage, starting fresh");
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save messages + auto-scroll
  useEffect(() => {
    if (!isLoaded || typeof window === "undefined") return;

    try {
      window.localStorage.setItem("rampage_gm_chat_v1", JSON.stringify(messages));
    } catch (err) {
      console.warn("GM chat: failed to save to localStorage");
    }

    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoaded]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMsg: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      timestamp: Date.now(),
      isUser: true,
    };
    setMessages((prev) => [...prev, newMsg]);
    setInput("");
  };

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="flex flex-col h-full bg-discord-dark">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Flame className="w-16 h-16 mb-4 text-discord-gold opacity-50" />
            <p className="text-discord-secondary text-base mb-2">Start the streak.</p>
            <p className="text-discord-muted text-sm">No logs. No AI. Just fire.</p>
          </div>
        ) : (
          messageGroups.map((group, groupIdx) => (
            <div key={groupIdx}>
              {/* Date Separator - Discord style */}
              <div className="flex items-center justify-center my-4">
                <div className="flex-1 h-[1px] bg-discord-border"></div>
                <span className="px-4 text-xs font-semibold text-discord-timestamp">
                  {group.date}
                </span>
                <div className="flex-1 h-[1px] bg-discord-border"></div>
              </div>

              {/* Messages for this date - Discord card style */}
              {group.messages.map((msg) => (
                <div key={msg.id} className="group px-4 py-2 mb-0.5 mx-2 rounded-lg border border-discord-border hover:bg-discord-hover hover:border-discord-gold/40 transition-all">
                  <div className="flex gap-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-discord-gold flex items-center justify-center">
                        <Flame className="w-6 h-6 text-white" />
                      </div>
                    </div>

                    {/* Message content */}
                    <div className="flex-1 min-w-0">
                      {/* Username and timestamp */}
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="font-medium text-discord-primary text-[15px]">
                          GM
                        </span>
                        <span className="text-xs text-discord-timestamp">
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>

                      {/* Message text */}
                      <div className="text-discord-primary text-[15px] leading-[1.375] break-words">
                        {msg.text}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar - Discord style */}
      <div className="px-4 pb-6 pt-2">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
            placeholder="Message GM"
            className="w-full px-4 py-3 pr-12 rounded-lg bg-discord-input text-discord-primary placeholder:text-discord-muted text-[15px] focus:outline-none"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-discord-gold hover:bg-yellow-600 flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
