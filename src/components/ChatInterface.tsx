import { useState, useRef, useEffect } from "react";
import { Bot, Send } from "lucide-react";

type Sender = "user" | "ai";

interface Message {
  id: string;
  text: string;
  sender: Sender;
  timestamp: Date;
}

// 🔹 Seed greeting from Rampage
const initialMessages: Message[] = [
  {
    id: "welcome-1",
    text: "GM Jeff — I'm _rampage. What are we working on today?",
    sender: "ai",
    timestamp: new Date(),
  },
];

const WEBHOOK_URL =
  import.meta.env.VITE_N8N_WEBHOOK_URL ||
  "https://rampagesystems.app.n8n.cloud/webhook/rampage-chat";

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const uid = "jeff_ready";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    
    if (hours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: trimmed,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid,
          message: trimmed,
          text: trimmed,
          user_input: trimmed,
        }),
      });

      const rawText = await response.text();
      console.log("Webhook status:", response.status);
      console.log("Webhook raw response:", rawText);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${rawText}`);
      }

      let data: any = {};
      try {
        data = rawText ? JSON.parse(rawText) : {};
      } catch (e) {
        console.warn("Failed to parse JSON from webhook:", e);
      }

      const replyText =
        (data.message ?? data.response ?? rawText) ||
        "I apologize, but I encountered an error processing your request.";

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: replyText,
        sender: "ai",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error communicating with AI:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text:
          "I'm having trouble connecting right now. Please check the N8N webhook configuration and try again.",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-discord-dark">
      {/* Messages Area - Discord style */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.map((msg, index) => {
          const showDate = index === 0 || 
            new Date(messages[index - 1].timestamp).toDateString() !== 
            new Date(msg.timestamp).toDateString();

          return (
            <div key={msg.id}>
              {/* Date separator */}
              {showDate && (
                <div className="flex items-center justify-center my-4">
                  <div className="flex-1 h-[1px] bg-discord-border"></div>
                  <span className="px-4 text-xs font-semibold text-discord-timestamp">
                    {new Date(msg.timestamp).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                  <div className="flex-1 h-[1px] bg-discord-border"></div>
                </div>
              )}

              {/* Message - Discord card style */}
              <div className="group px-4 py-2 mb-0.5 mx-2 rounded-lg border border-discord-border hover:bg-discord-hover hover:border-discord-gold/40 transition-all">
                <div className="flex gap-4">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {msg.sender === "ai" ? (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-discord-gold to-yellow-600 flex items-center justify-center">
                        <Bot className="w-6 h-6 text-white" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-discord-mention flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">JR</span>
                      </div>
                    )}
                  </div>

                  {/* Message content */}
                  <div className="flex-1 min-w-0">
                    {/* Username and timestamp */}
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-medium text-discord-primary text-[15px]">
                        {msg.sender === "ai" ? "_rampage" : "Jeff"}
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
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="px-4 py-2">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-discord-gold to-yellow-600 flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-medium text-discord-primary text-[15px]">
                    _rampage
                  </span>
                </div>
                <div className="text-discord-secondary text-sm italic">
                  is thinking...
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Discord style */}
      <div className="px-4 pb-6 pt-2">
        <div className="relative">
          <input
            className="w-full px-4 py-3 pr-12 rounded-lg bg-discord-input text-discord-primary placeholder:text-discord-muted text-[15px] focus:outline-none"
            placeholder="Message _rampage"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            onClick={handleSend}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-discord-gold hover:bg-yellow-600 flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={!input.trim() || isTyping}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
