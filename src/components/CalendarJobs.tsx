import { Calendar as CalendarIcon } from "lucide-react";

export default function CalendarJobs() {
  // ⬇️ Put your real Calendly link here
  const calendlyUrl = "https://calendly.com/your-link";

  return (
    <div className="min-h-screen w-full bg-[#0f1419] text-white px-4 pt-12 pb-28">
      {/* Title + subtitle */}
      <h2 className="text-2xl font-semibold flex items-center gap-2">
        <CalendarIcon className="w-5 h-5 text-[#f59e0b]" />
        Calendar &amp; Jobs
      </h2>
      <p className="text-xs text-[#9ca3af] mt-1 mb-4">
        Appointments and job bookings. Your checklist stays separate.
      </p>

      {/* Calendly embed */}
      <div className="mt-4 h-[calc(100vh-200px)] rounded-3xl border border-[#1f2937] bg-[#020617] overflow-hidden">
        <iframe
          src={calendlyUrl}
          className="w-full h-full"
          title="Calendar & Jobs"
        />
      </div>
    </div>
  );
}
