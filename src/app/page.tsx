import { Hologram } from "@/components/3d/Hologram";
import { ChatInterface } from "@/components/layout/ChatInterface";
import { SettingsPanel } from "@/components/layout/SettingsPanel";
import { HudPanel } from "@/components/layout/HudPanel";

export default function Home() {
  return (
    <main className="relative w-screen h-screen overflow-hidden bg-black text-white">
      {/* Background Grid Layer */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Decorative Borders */}
      <div className="absolute top-4 left-4 w-16 h-16 border-t-2 border-l-2 border-cyan-500/50 pointer-events-none"></div>
      <div className="absolute top-4 right-4 w-16 h-16 border-t-2 border-r-2 border-cyan-500/50 pointer-events-none"></div>
      <div className="absolute bottom-4 left-4 w-16 h-16 border-b-2 border-l-2 border-cyan-500/50 pointer-events-none"></div>
      <div className="absolute bottom-4 right-4 w-16 h-16 border-b-2 border-r-2 border-cyan-500/50 pointer-events-none"></div>

      {/* 3D Hologram Centerpiece */}
      <Hologram />

      {/* UI Overlays */}
      <HudPanel />
      <ChatInterface />
      <SettingsPanel />
    </main>
  );
}
