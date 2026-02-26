import { Message } from '../types';
import { Bot } from 'lucide-react';
import Avatar from './Avatar';

interface MessageBubbleProps {
  message: Message;
  chatType: 'ai' | 'personal';
  onProfileClick?: () => void;
}

export default function MessageBubble({ message, chatType, onProfileClick }: MessageBubbleProps) {
  const isUser = message.sender === 'user';

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="group px-4 py-2 mb-0.5 mx-2 rounded-lg border border-discord-border hover:bg-discord-hover hover:border-discord-gold/40 transition-all">
      <div className="flex gap-4">
        {/* Avatar Section */}
        <div className="flex-shrink-0">
          {isUser ? (
            <Avatar
              src="https://avatars.githubusercontent.com/u/000000?v=4" // Replace with your real avatar URL
              alt="Jeffrey Ready"
              size={40}
              onClick={onProfileClick}
              clickable
            />
          ) : chatType === 'ai' ? (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-discord-gold to-yellow-600 flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
          ) : (
            <Avatar
              src="https://avatars.githubusercontent.com/u/000000?v=4"
              alt="Jeffrey Ready"
              size={40}
              onClick={onProfileClick}
              clickable
            />
          )}
        </div>

        {/* Message content */}
        <div className="flex-1 min-w-0">
          {/* Username and timestamp */}
          <div className="flex items-baseline gap-2 mb-1">
            <span className="font-medium text-discord-primary text-[15px]">
              {isUser ? 'Jeff' : chatType === 'ai' ? '_rampage' : 'Jeff'}
            </span>
            <span className="text-xs text-discord-timestamp">
              {formatTime(message.timestamp)}
            </span>
          </div>

          {/* Message text */}
          <div className="text-discord-primary text-[15px] leading-[1.375] break-words whitespace-pre-wrap">
            {message.text}
          </div>
        </div>
      </div>
    </div>
  );
}
