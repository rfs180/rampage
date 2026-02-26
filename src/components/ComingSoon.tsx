import { Clock } from 'lucide-react';

export default function ComingSoon() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#1e2936] border-2 border-[#f59e0b]/30 mb-6">
          <Clock className="w-10 h-10 text-[#f59e0b]" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Coming Soon</h2>
        <p className="text-[#9ca3af]">This feature is under development</p>
      </div>
    </div>
  );
}
