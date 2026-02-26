import { X, ChevronLeft, Zap, Bell, Settings, HelpCircle } from 'lucide-react';

interface RightSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function RightSidebar({ isOpen, onToggle }: RightSidebarProps) {
  return (
    <>
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed right-0 top-1/2 -translate-y-1/2 bg-gradient-to-br from-[#f59e0b] to-[#eab308] text-white p-3 rounded-l-xl shadow-lg hover:brightness-110 transition-all duration-200 z-40"
          aria-label="Open controls"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}

      <aside
        className={`fixed right-0 top-0 h-screen w-[320px] bg-[#1a2936] border-l border-[#f59e0b]/20 transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-[#f59e0b]/20 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Controls</h2>
            <button
              onClick={onToggle}
              className="text-[#9ca3af] hover:text-[#f59e0b] transition-colors duration-200"
              aria-label="Close controls"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-4">
              <div className="bg-[#1e2936] border border-[#f59e0b]/20 rounded-xl p-4 hover:border-[#f59e0b]/40 transition-all duration-200 cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#f59e0b]/10 flex items-center justify-center group-hover:bg-[#f59e0b]/20 transition-colors duration-200">
                    <Zap className="w-5 h-5 text-[#f59e0b]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Quick Actions</h3>
                    <p className="text-xs text-[#9ca3af]">Shortcuts & macros</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#1e2936] border border-[#f59e0b]/20 rounded-xl p-4 hover:border-[#f59e0b]/40 transition-all duration-200 cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#f59e0b]/10 flex items-center justify-center group-hover:bg-[#f59e0b]/20 transition-colors duration-200">
                    <Bell className="w-5 h-5 text-[#f59e0b]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Notifications</h3>
                    <p className="text-xs text-[#9ca3af]">Activity & alerts</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#1e2936] border border-[#f59e0b]/20 rounded-xl p-4 hover:border-[#f59e0b]/40 transition-all duration-200 cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#f59e0b]/10 flex items-center justify-center group-hover:bg-[#f59e0b]/20 transition-colors duration-200">
                    <Settings className="w-5 h-5 text-[#f59e0b]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Settings</h3>
                    <p className="text-xs text-[#9ca3af]">Preferences & config</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#1e2936] border border-[#f59e0b]/20 rounded-xl p-4 hover:border-[#f59e0b]/40 transition-all duration-200 cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#f59e0b]/10 flex items-center justify-center group-hover:bg-[#f59e0b]/20 transition-colors duration-200">
                    <HelpCircle className="w-5 h-5 text-[#f59e0b]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Help & Support</h3>
                    <p className="text-xs text-[#9ca3af]">Documentation & FAQ</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {isOpen && (
        <div
          onClick={onToggle}
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          aria-hidden="true"
        />
      )}
    </>
  );
}
