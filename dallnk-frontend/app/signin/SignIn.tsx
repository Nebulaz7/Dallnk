"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Wallet, ArrowUpRight, CheckCircle } from "lucide-react";
import {
  connectWalletWithStorage,
  checkConnection,
  disconnectWallet,
} from "../utils/contract";
import "@fontsource/orbitron/700.css";
import "../globals.css";

const SignIn = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for existing connection on component mount
  useEffect(() => {
    const savedAddress = checkConnection();
    if (savedAddress) {
      setWalletAddress(savedAddress);
    }
  }, []);

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const address = await connectWalletWithStorage();
      setWalletAddress(address);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to connect wallet";
      setError(errorMessage);
      console.error("Wallet connection error:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectWallet = () => {
    disconnectWallet();
    setWalletAddress(null);
    setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 grid-background">
      {/* Background glow effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] bg-sky-500/20 rounded-full blur-[120px] opacity-30"></div>
        <div className="absolute -bottom-[30%] -right-[20%] w-[60%] h-[60%] bg-blue-500/20 rounded-full blur-[120px] opacity-20"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-gradient-to-r from-white/5 via-white/10 to-white/5 backdrop-blur-xl shadow-2xl shadow-black/20 rounded-3xl border border-white/10 p-8 relative overflow-hidden">
          {/* Logo */}
          <div className="flex justify-center mb-6 pb-3">
            <div className="flex text-3xl font-bold">
              <span className=" mt-3">Welcome To </span>
              <div className="flex gap-0">
                <Image
                  src="/logo.svg"
                  alt="Dallnk logo"
                  content="fit-width"
                  className="rounded-full p-0"
                  height={60}
                  width={60}
                />
                <span
                  style={{ fontFamily: "orbitron, sans-serif" }}
                  className="text-white inline-block mt-3"
                >
                  Dallnk
                </span>
              </div>
            </div>
          </div>

          {/* Info text */}
          <p className="text-white/80 text-center mb-8 pb-4">
            To use{" "}
            <span
              style={{ fontFamily: "orbitron, sans-serif" }}
              className="text-white"
            >
              Dallnk
            </span>{" "}
            you must connect your wallet
          </p>

          {/* Wallet Connection Status */}
          {walletAddress ? (
            <div className="mb-6">
              <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 text-center">
                <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-green-400 font-medium mb-1">
                  Wallet Connected
                </p>
                <p className="text-white/70 text-sm font-mono">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </p>
                <button
                  onClick={handleDisconnectWallet}
                  className="mt-3 text-red-400 hover:text-red-300 text-sm underline"
                >
                  Disconnect
                </button>
              </div>

              {/* Continue to App Button */}
              <div className="mt-6 text-center">
                <Link
                  href="/home" // or wherever your main app is
                  className="bg-green-500 text-white px-6 py-3 rounded-full font-medium hover:bg-green-600 transition duration-300 inline-flex items-center gap-2"
                >
                  Continue to App
                  <ArrowUpRight size={20} />
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Error Message */}
              {error && (
                <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-center">
                  <p className="text-red-400 text-sm">{error}</p>
                  <p className="text-white/50 text-xs mt-2">
                    Make sure you&apos;re on Filecoin Calibration testnet
                  </p>
                </div>
              )}

              {/* Connect Wallet Button */}
              <div className="space-y-4 flex pb-5 justify-center text-center mx-auto">
                <motion.button
                  onClick={handleConnectWallet}
                  disabled={isConnecting}
                  className="bg-blue-500 text-[16px] text-white px-4 flex cursor-pointer py-2 rounded-full items-center border-2 border-blue-500 gap-2 hover:bg-[#101010] hover:border-white transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover="hover"
                  variants={{
                    hover: { scale: 1.0 },
                  }}
                  layout
                >
                  <Wallet className="inline mb-0" size={20} />
                  {isConnecting ? "Connecting..." : "Connect Wallet"}
                  {!isConnecting && (
                    <motion.span
                      className="text-lg font-extralight"
                      variants={{
                        hover: {
                          x: 4,
                          transition: {
                            type: "spring",
                            stiffness: 400,
                            damping: 10,
                          },
                        },
                      }}
                    >
                      <ArrowUpRight className="inline-block mb-1" />
                    </motion.span>
                  )}
                </motion.button>
              </div>
            </>
          )}

          {/* Network Info - Enhanced */}
          <div className="mt-6 mb-4">
            <div className="bg-gradient-to-r from-blue-500/10 via-blue-500/10 to-blue-500/10 border border-blue-500/20 rounded-2xl p-4 backdrop-blur-sm">
              <div className="flex items-center justify-center gap-3">
                {/* Network Icon */}
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500/30 rounded-full blur-md"></div>
                  <svg
                    className="w-5 h-5 text-blue-400 relative z-10"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>

                {/* Network Details */}
                <div className="flex flex-col items-start">
                  <p className="text-white/50 text-[10px] uppercase tracking-wider font-medium">
                    Connected Network
                  </p>
                  <div className="flex items-center gap-2">
                    {/* Status Indicator */}
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <p className="text-white font-medium text-sm">
                      Filecoin Calibration Testnet
                    </p>
                  </div>
                </div>

                {/* Chain ID Badge */}
                <div className="ml-auto">
                  <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full border border-purple-500/30">
                    Chain: 314159
                  </span>
                </div>
              </div>

              {/* Additional Network Info */}
              <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1 text-white/40">
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Testnet Only</span>
                </div>
                <a
                  href="https://faucet.calibnet.chainsafe-fil.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 flex items-center gap-1 transition duration-200"
                >
                  Get tFIL
                  <ArrowUpRight size={12} />
                </a>
              </div>
            </div>
          </div>

          {/* Terms */}
          <p className="mt-8 text-xs text-center text-white/50 pb-3">
            By connecting, you accept the{" "}
            <Link href="#" className="text-blue-400 hover:text-sky-300">
              Terms of Service
            </Link>{" "}
            and acknowledge our{" "}
            <Link href="#" className="text-blue-400 hover:text-sky-300">
              Privacy Policy
            </Link>
            .
          </p>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-white/70 hover:text-white text-sm flex items-center justify-center gap-1 transition duration-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SignIn;
