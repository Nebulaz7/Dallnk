import React from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Prism from "./animations/Prism";

export default function Home() {
  return (
    <div className="relative min-h-screen grid-background overflow-hidden">
      {/* Background Prism Animation */}
      <div className="absolute inset-0 w-full h-full">
        <Prism
          animationType="rotate"
          timeScale={0.5}
          height={3.5}
          baseWidth={5.5}
          scale={3}
          hueShift={0}
          colorFrequency={1}
          noise={0.3}
          glow={1}
        />
      </div>

      {/* Foreground Content */}
      <div className="relative z-10">
        <Navbar />
        <Hero />
      </div>
    </div>
  );
}
