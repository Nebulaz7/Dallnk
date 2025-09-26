"use client";
import React, { useEffect, useRef, useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Prism from "./animations/Prism";
import About from "./components/About";
import Tag from "./components/Tag";
import Footer from "./components/Footer";

export default function Home() {
  const [isPrismVisible, setIsPrismVisible] = useState(false);
  const prismContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Show Prism when it's in view or close to being in view
          setIsPrismVisible(entry.isIntersecting);
        });
      },
      {
        root: null,
        rootMargin: "100px", // Load 100px before it comes into view
        threshold: 0, // Trigger as soon as any part is visible
      }
    );

    if (prismContainerRef.current) {
      observer.observe(prismContainerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className="cursor-crosshair">
      <div
        className="relative min-h-screen grid-background overflow-hidden "
        ref={prismContainerRef}
      >
        {/* Background Prism Animation */}
        <Navbar />
        <Tag />

        {/* Conditional Prism rendering with intersection observer */}
        <div className="absolute inset-0 w-full h-full">
          {isPrismVisible && typeof window !== "undefined" && (
            <Prism
              animationType="rotate"
              timeScale={0.3}
              height={3.5}
              baseWidth={5.5}
              scale={3}
              hueShift={0}
              colorFrequency={1}
              noise={0.3}
              glow={0.6}
            />
          )}
        </div>

        {/* Foreground Content */}
        <div className="relative z-10">
          <Hero />
        </div>
      </div>
      <About />
      <Footer />
    </div>
  );
}
