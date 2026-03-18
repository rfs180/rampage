import { useState } from "react";
import Sidebar from "./Sidebar";
import RightSidebar from "./RightSidebar";
import ChatInterface from "./ChatInterface";
import ComingSoon from "./ComingSoon";
import Checklist from "./Checklist";
import ArchitectSpeech from "./ArchitectSpeech";
import GMChat from "./GMChat";
import CalendarJobs from "./CalendarJobs";
import UserProfile from "./UserProfile";
import ControlPanel from "./ControlPanel";
import { Menu } from "lucide-react";

export default function Layout() {
  const [activeItem, setActiveItem] = useState("dashboard");
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleItemClick = (itemId: string) => {
    setActiveItem(itemId);
    setIsMobileSidebarOpen(false);
  };

  const handleRightSidebarToggle = () => {
    setIsRightSidebarOpen((prev) => !prev);
  };

  // Get the label/title for the active section
  const getActiveTitle = () => {
    const titles: { [key: string]: string } = {
      dashboard: "📊 | dashboard",
      checklist: "✅ | checklist",
      architectspeech: "📘 | architectSpeech",
      gm: "🔥 | GM",
      calendar: "📅 | calendar & jobs",
      messages: "📧 | messages",
      integrations: "🔧 | Integrations",
      "screen-recorder": "📹 | Screen Recorder",
      "image-tools": "🎨 | Image Tools",
      "document-generator": "📝 | Document Generator",
      automation: "🤖 | Automation Scenarios",
      "control-panel": "🎛️ | Control Panel",
    };
    return titles[activeItem] || "Dashboard";
  };

  // Decide which main content to render
  let content = null;
  if (activeItem === "dashboard") {
    content = <ChatInterface />;
  } else if (activeItem === "checklist") {
    content = <Checklist />;
  } else if (activeItem === "gm") {
    content = <GMChat />;
  } else if (activeItem === "architectspeech") {
  content = <ArchitectSpeech />;
  } else if (activeItem === "calendar") {
    content = <CalendarJobs />;
  } else if (activeItem === "profile") {
  content = <UserProfile />;
  } else if (activeItem === "control-panel") {
    content = <ControlPanel />;
  } else {
    content = <ComingSoon />;
  }

return (
  <div className="flex h-screen bg-discord-dark overflow-hidden pt-safe">
    {/* Sidebar: full-screen drawer on mobile, static on desktop */}
    <Sidebar
      activeItem={activeItem}
      onItemClick={handleItemClick}
      mobileOpen={isMobileSidebarOpen}
      onMobileClose={() => setIsMobileSidebarOpen(false)}
    />

    {/* Main content area */}
    <main className="flex-1 flex flex-col min-w-0">
      {/* Top bar - Discord style channel header */}
      <div className="h-14 min-h-[56px] bg-discord-dark border-b border-discord-border flex items-center px-4 flex-shrink-0">
        {/* Mobile menu button */}
        <button
          className="lg:hidden mr-3 text-discord-secondary hover:text-discord-primary transition-colors p-2"
          onClick={() => setIsMobileSidebarOpen(true)}
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Channel/Section name */}
        <div className="flex items-center gap-2">
          <span className="text-discord-muted text-xl font-light">#</span>
          <h1 className="text-discord-primary font-semibold text-base">
            {getActiveTitle()}
          </h1>
        </div>

        {/* Right sidebar toggle button */}
        <button
          onClick={handleRightSidebarToggle}
          className="ml-auto text-discord-secondary hover:text-discord-primary transition-colors p-2"
        >
          <span className="text-xl">⚙️</span>
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto bg-discord-dark">
        {content}
      </div>
    </main>

    {/* Right sidebar */}
    <RightSidebar
      isOpen={isRightSidebarOpen}
      onToggle={handleRightSidebarToggle}
    />
  </div>
);
}
