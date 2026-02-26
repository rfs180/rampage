import { useState, KeyboardEvent } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');

  const handleSubmit = () => {
    if (input.trim() && !disabled) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="px-4 pb-6 pt-2 bg-discord-dark">
      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          disabled={disabled}
          className="w-full px-4 py-3 pr-12 rounded-lg bg-discord-input text-discord-primary placeholder:text-discord-muted text-[15px] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        />
        <button
          onClick={handleSubmit}
          disabled={!input.trim() || disabled}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-discord-gold hover:bg-yellow-600 flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
