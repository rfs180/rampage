import { Bot, ChevronDown } from "lucide-react";
import { MenuCategory } from "../types";
import { useState } from "react";

interface SidebarProps {
  activeItem: string;
  onItemClick: (itemId: string) => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const menuCategories: MenuCategory[] = [
  {
    title: "BUSINESS HUB",
    items: [
      { id: "dashboard", label: "📊 | dashboard" },
      { id: "gm", label: "🔥 | GM" },
      { id: "checklist", label: "✅ | checkList" },
      { id: "calendar", label: "📅 | calendar & jobs", isComingSoon: true },
      { id: "architectspeech", label: "📘 | architectSpeech" },
      { id: "messages", label: "📧 | messages", isComingSoon: true },
      { id: "integrations", label: "🔧 | Integrations", isComingSoon: true },
    ],
  },
  {
    title: "TOOLS",
    items: [
      { id: "profile", label: "👤 | My Profile" },
      { id: "screen-recorder", label: "📹 | Screen Recorder", isComingSoon: true },
      { id: "image-tools", label: "🎨 | Image Tools", isComingSoon: true },
      { id: "document-generator", label: "📝 | Document Generator", isComingSoon: true },
      { id: "control-panel", label: "🎛️ | Control Panel" },
    ],
  },
];

export default function Sidebar({
  activeItem,
  onItemClick,
  mobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  const toggleCategory = (title: string) => {
    const newCollapsed = new Set(collapsedCategories);
    if (newCollapsed.has(title)) {
      newCollapsed.delete(title);
    } else {
      newCollapsed.add(title);
    }
    setCollapsedCategories(newCollapsed);
  };

  return (
    <aside
      className={`
        z-40 w-full lg:w-[240px] bg-discord-darker border-r border-discord-border flex flex-col h-screen
        fixed top-0 left-0 transform transition-transform duration-200
        pt-safe lg:pt-0
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:static
      `}
    >
      {/* Header */}
      <div className="p-3 bg-discord-darkest border-b border-discord-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-discord-gold to-yellow-600 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-discord-primary">_rampage</h1>
            <p className="text-[10px] text-discord-muted">AI Platform</p>
          </div>
        </div>

        {/* Mobile close button */}
        {onMobileClose && (
          <button
            className="lg:hidden text-discord-muted hover:text-discord-primary"
            onClick={onMobileClose}
          >
            ✕
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {menuCategories.map((category) => {
          const isCollapsed = collapsedCategories.has(category.title);

          return (
            <div key={category.title} className="mb-2">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category.title)}
                className="w-full flex items-center justify-between px-2 py-1 mb-1 hover:text-discord-primary transition-colors"
              >
                <h3 className="text-[11px] font-semibold text-discord-muted uppercase tracking-wide">
                  {category.title}
                </h3>
                <ChevronDown
                  className={`w-3 h-3 text-discord-muted transition-transform ${
                    isCollapsed ? "-rotate-90" : ""
                  }`}
                />
              </button>

              {/* Category Items */}
              {!isCollapsed && (
                <ul className="space-y-[2px]">
                  {category.items.map((item) => {
                    const isActive = activeItem === item.id;

                    return (
                      <li key={item.id}>
                        <button
                          onClick={() => onItemClick(item.id)}
                          className={`w-full flex items-center gap-2 px-2 py-1.5 rounded transition-all ${
                            isActive
                              ? "bg-discord-hover text-discord-primary"
                              : "text-discord-secondary hover:bg-discord-hover hover:text-discord-primary"
                          }`}
                        >
                          <span className="text-[15px] font-medium">{item.label}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
