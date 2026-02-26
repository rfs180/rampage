export default function TypingIndicator() {
  return (
    <div className="flex justify-start animate-fade-in">
      <div className="max-w-[80%] md:max-w-[60%]">
        <div className="bg-[#1e2936] border border-[#f59e0b]/20 rounded-xl px-4 py-3 shadow-lg">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-[#f59e0b] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2 h-2 bg-[#f59e0b] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2 h-2 bg-[#f59e0b] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
            <span className="text-[#9ca3af] text-xs ml-1">_rampage is thinking...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
