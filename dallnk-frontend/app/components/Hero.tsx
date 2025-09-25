"use client";
import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";

const Hero = () => {
  return (
    <section className="flex items-center pt-14 justify-center min-h-[95vh] lg:px-20 lg:py-1 md:pt-20 lg:pt-24 relative z-20">
      <div className="max-w-7xl mx-auto w-full hero-font">
        <div className="flex items-center justify-center">
          <motion.img
            src="/verified-badge.svg"
            alt="verify"
            className="absolute rotate-12 top-30 left-10 w-12 lg:w-28 z-0"
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 6, repeat: Infinity }}
          />

          <motion.img
            src="/filecoin.svg"
            alt="filecoin"
            className="absolute rotate-3 bottom-20 right-10 w-10 lg:w-20 z-0"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          />

          {/* Centered Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="text-center space-y-6 px-6 relative z-10"
          >
            {/* ...existing code... */}
            <h1 className="text-left lg:text-center text-4xl lg:text-6xl font-light hero-font leading-tight mb-6">
              Get verified & secure{" "}
              <span className="relative">
                <span className="underline-text font-bold">data</span>
              </span>{" "}
              from a decentralized community of{" "}
              <span className="relative">
                <span className="highlight-text">data miners</span>
              </span>
            </h1>
            <p className="md:text-lg text-gray-200 max-w-3xl mx-auto">
              <span
                style={{ fontFamily: "orbitron, sans-serif" }}
                className="text-white"
              >
                Dallnk
              </span>{" "}
              is a decentralized data crowdsourcing community, where you get
              incentives by sharing data that can be used to train and improve
              AI models.
            </p>
            {/* Cta Buttons */}
            <div className="flex items-center justify-center">
              <motion.button
                className="bg-blue-500 text-[14px] text-white md:text-[24px] px-5 py-3 md:px-6 cursor-pointer md:py-3 rounded-full flex items-center gap-1 hover:bg-[#101010] shadow-sm shadow-blue-400/50  hover:shadow-md hover:shadow-blue-400/50 transition duration-100"
                whileHover="hover"
                variants={{
                  hover: { scale: 1.0, y: -2 },
                }}
                layout
              >
                Explore Now
                <motion.span
                  className="text-lg font-extralight"
                  variants={{
                    hover: {
                      x: 4,
                      transition: { stiffness: 400, damping: 10 },
                    },
                  }}
                >
                  <ArrowUpRight className="w-3 h-3 md:w-6 md:h-6 " />
                </motion.span>
              </motion.button>
            </div>
            <a
              href="https://filecoin.io"
              target="_blank"
              rel="noopener noreferrer"
              className="fixed bottom-10 right-10 flex items-center gap-3 px-5 py-3 bg-black/90 border border-gray-700 rounded-full text-decoration-none transition-all duration-300 overflow-hidden hover:shadow-lg hover:shadow-blue-500/20 group"
            >
              <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-r from-transparent via-blue-500/10 to-transparent transform rotate-45 translate-x-[-100%] transition-transform duration-600 pointer-events-none group-hover:translate-x-[100%]"></div>
              <span className="text-gray-400 text-xs tracking-wider uppercase transition-colors duration-300 group-hover:text-gray-300">
                POWERED BY
              </span>
              <Image
                src="/filecoin.svg"
                alt="Filecoin"
                width={24}
                height={24}
                className="brightness-80 transition-all duration-300 group-hover:brightness-100"
              />{" "}
              Filecoin
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
