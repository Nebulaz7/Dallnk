"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Wallet, ArrowUpRight } from "lucide-react";
import "@fontsource/orbitron/700.css";
import { useConnect, useAccount, useDisconnect } from "wagmi";
import { metaMask } from "wagmi/connectors";

const SignIn = () => {
  const { connect, connectors, error, isPending } = useConnect();
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();

  // Debug: Log available connectors
  console.log('Available connectors:', connectors.map(c => ({ id: c.id, name: c.name })));

  const handleMetaMaskConnect = () => {
    // Find MetaMask connector by checking different possible IDs
    const metaMaskConnector = connectors.find(
      (c) => c.id === "metaMask" || c.id === "io.metamask" || c.name?.toLowerCase().includes('metamask')
    );
    
    if (metaMaskConnector) {
      console.log('Using connector:', metaMaskConnector.id, metaMaskConnector.name);
      connect({ connector: metaMaskConnector });
    } else {
      console.log('No MetaMask connector found, creating new one');
      // Fallback: create a new MetaMask connector
      const newMetaMaskConnector = metaMask();
      connect({ connector: newMetaMaskConnector });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-black/90">
      {/* Background glow effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] bg-sky-500/20 rounded-full blur-[120px] opacity-30"></div>
        <div className="absolute -bottom-[30%] -right-[20%] w-[60%] h-[60%] bg-purple-500/20 rounded-full blur-[120px] opacity-20"></div>
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
            <div className="text-3xl font-bold">
              Welcome To{" "}
              <span
                style={{ fontFamily: "orbitron, sans-serif" }}
                className="text-white"
              >
                Dallnk
              </span>
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
            you must sign in with a wallet
          </p>

          {/* Sign-in buttons */}
          <div className="space-y-4 flex pb-5 justify-center text-center mx-auto">
            {isConnected ? (
              <div className="text-center">
                <p className="text-green-400 mb-4">
                  Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
                </p>
                <motion.button
                  className="bg-red-500 text-[16px] text-white px-4 flex cursor-pointer py-2 rounded-full items-center border-2 border-red-500 gap-2 hover:bg-[#101010] hover:border-white transition duration-300"
                  onClick={() => disconnect()}
                  whileHover="hover"
                  variants={{ hover: { scale: 1.0 } }}
                >
                  Disconnect Wallet
                </motion.button>
              </div>
            ) : (
              <motion.button
                className="bg-blue-500 text-[16px] text-white px-4 flex cursor-pointer py-2 rounded-full items-center border-2 border-blue-500 gap-2 hover:bg-[#101010] hover:border-white transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover="hover"
                onClick={handleMetaMaskConnect}
                disabled={isPending}
                variants={{ hover: { scale: 1.0 } }}
                layout
              >
                <Wallet className="inline mb-0" size={20} />
                {isPending ? "Connecting..." : "Connect Wallet"}
                <motion.span
                  className="text-lg font-extralight"
                  variants={{
                    hover: {
                      x: 4,
                      transition: { type: "spring", stiffness: 400, damping: 10 },
                    },
                  }}
                >
                  <ArrowUpRight className="inline-block mb-1" />
                </motion.span>
              </motion.button>
            )}

            {error && (
              <div className="text-center mt-4">
                <p className="text-red-400 text-sm">
                  Error: {error.message}
                </p>
                <p className="text-gray-400 text-xs mt-2">
                  Make sure MetaMask is installed and enabled
                </p>
              </div>
            )}
          </div>

          {/* Terms */}
          <p className="mt-8 text-xs text-center text-white/50 pb-3">
            By signing in, you accept the{" "}
            <Link href="#" className="text-blue-400 hover:text-sky-300">
              Terms of Service
            </Link>{" "}
            and acknowledge our{" "}
            <Link href="#" className="text-blue-400 hover:text-sky-300">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SignIn;
