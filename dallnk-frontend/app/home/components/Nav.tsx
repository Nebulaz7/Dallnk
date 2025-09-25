"use client";
import Link from "next/link";
import React, { useState } from "react";
import {
  Megaphone,
  UserRound,
  Plus,
  ChevronDown,
  Copy,
  LogOut,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const DoubleLineIcon = ({ size = 30, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 30 30"
    fill="none"
    className={className}
  >
    <rect x="4" y="9" width="24" height="2" rx="1" fill="currentColor" />
    <rect x="4" y="19" width="24" height="2" rx="1" fill="currentColor" />
  </svg>
);

const Nav = () => {
  const [isWalletDropdownOpen, setIsWalletDropdownOpen] = useState(false);

  const copyAddress = () => {
    navigator.clipboard.writeText("0x4...dummy34");
    // You can add a toast notification here
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-gray-800"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex gap-2">
            <div className="md:hidden cursor-pointer">
              <DoubleLineIcon />
            </div>
            <Link href="/" className="flex items-center">
              <h1
                style={{ fontFamily: "orbitron, sans-serif" }}
                className="text-2xl font-bold text-white hover:text-blue-400 transition-colors duration-200"
              >
                Dallnk
              </h1>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/marketplace"
              className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-200 group"
            >
              <Megaphone className="w-4 h-4 group-hover:text-blue-400 transition-colors duration-200" />
              <span className="text-sm font-medium">Marketplace</span>
            </Link>

            <Link
              href="/profile"
              className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-200 group"
            >
              <UserRound className="w-4 h-4 group-hover:text-blue-400 transition-colors duration-200" />
              <span className="text-sm font-medium">Profile</span>
            </Link>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* Create Quest Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-400/30 to-blue-500/90 hover:bg-blue-600 cursor-pointer text-white rounded-lg font-medium text-sm transition-all duration-200 shadow-lg shadow-blue-600/25"
            >
              <Plus className="w-4 h-4" />
              <span>Create Quest</span>
            </motion.button>

            {/* Mobile Create Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="sm:hidden p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200"
            >
              <Plus className="w-5 h-5" />
            </motion.button>

            {/* Wallet Dropdown */}
            <div className="relative">
              <motion.button
                onClick={() => setIsWalletDropdownOpen(!isWalletDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded-lg text-white text-sm font-medium transition-all duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="hidden sm:inline">0x4...dummy34</span>
                <span className="sm:hidden">0x4...34</span>
                <motion.div
                  animate={{ rotate: isWalletDropdownOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-4 h-4" />
                </motion.div>
              </motion.button>

              {/* Wallet Dropdown Menu */}
              <AnimatePresence>
                {isWalletDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50"
                  >
                    <div className="py-2">
                      <button
                        onClick={copyAddress}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors duration-200"
                      >
                        <Copy className="w-4 h-4" />
                        Copy Address
                      </button>
                      <button className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-gray-800 transition-colors duration-200">
                        <LogOut className="w-4 h-4" />
                        Disconnect
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden bg-gray-900/95 border-t border-gray-800">
        <div className="px-4 py-3 space-y-2">
          <Link
            href="/marketplace"
            className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-200"
          >
            <Megaphone className="w-5 h-5" />
            <span>Marketplace</span>
          </Link>
          <Link
            href="/profile"
            className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-200"
          >
            <UserRound className="w-5 h-5" />
            <span>Profile</span>
          </Link>
          <button className="flex items-center gap-3 w-full px-3 py-2 text-blue-400 hover:text-blue-300 hover:bg-gray-800/50 rounded-lg transition-all duration-200">
            <Plus className="w-5 h-5" />
            <span>Create Quest</span>
          </button>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {isWalletDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsWalletDropdownOpen(false)}
        />
      )}
    </motion.header>
  );
};

export default Nav;
