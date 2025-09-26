"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import {
  Megaphone,
  UserRound,
  Plus,
  ChevronDown,
  Copy,
  LogOut,
  Wallet,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { checkConnection, disconnectWallet } from "../../utils/contract";

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
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isBountyModalOpen, setIsBountyModalOpen] = useState(false);
  const [bountyForm, setBountyForm] = useState({
    description: "",
    requirements: "",
    bounty: "5",
  });
  const [isSubmittingBounty, setIsSubmittingBounty] = useState(false);

  // Check wallet connection on component mount
  useEffect(() => {
    const savedAddress = checkConnection();
    setWalletAddress(savedAddress);
  }, []);

  const copyAddress = async () => {
    if (walletAddress) {
      try {
        await navigator.clipboard.writeText(walletAddress);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (err) {
        console.error("Failed to copy address:", err);
      }
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setWalletAddress(null);
    setIsWalletDropdownOpen(false);
    // Redirect to sign-in page
    window.location.href = "/signin";
  };

  const formatAddress = (address: string, isMobile = false) => {
    if (isMobile) {
      return `${address.slice(0, 4)}...${address.slice(-2)}`;
    }
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleOpenBountyModal = () => {
    setIsBountyModalOpen(true);
  };

  const handleCloseBountyModal = () => {
    setIsBountyModalOpen(false);
    // Reset form when closing
    setBountyForm({
      description: "",
      requirements: "",
      bounty: "5",
    });
  };

  const handleBountyFormChange = (field: string, value: string) => {
    setBountyForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmitBounty = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!walletAddress) {
      alert("Please connect your wallet first");
      return;
    }

    setIsSubmittingBounty(true);

    try {
      // Import the announceDataRequest function
      const { announceDataRequest } = await import("../../utils/contract");

      const tx = await announceDataRequest(
        bountyForm.description,
        bountyForm.requirements,
        bountyForm.bounty
      );

      console.log("Bounty created:", tx);
      handleCloseBountyModal();

      // You might want to show a success message or redirect
      alert("Bounty created successfully!");
    } catch (error) {
      console.error("Error creating bounty:", error);
      alert("Failed to create bounty. Please try again.");
    } finally {
      setIsSubmittingBounty(false);
    }
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
              href="/home"
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
            {/* Create Bounty Button */}
            <motion.button
              onClick={handleOpenBountyModal}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-400/30 to-blue-500/90 hover:bg-blue-600 cursor-pointer text-white rounded-lg font-medium text-sm transition-all duration-200 shadow-lg shadow-blue-600/25"
            >
              <Plus className="w-4 h-4" />
              <span>Create bounty</span>
            </motion.button>

            {/* Mobile Create Button */}
            <motion.button
              onClick={handleOpenBountyModal}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="sm:hidden p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200"
            >
              <Plus className="w-5 h-5" />
            </motion.button>

            {/* Wallet Section */}
            {walletAddress ? (
              <div className="relative">
                <motion.button
                  onClick={() => setIsWalletDropdownOpen(!isWalletDropdownOpen)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded-lg text-white text-sm font-medium transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="hidden sm:inline font-mono">
                    {formatAddress(walletAddress)}
                  </span>
                  <span className="sm:hidden font-mono">
                    {formatAddress(walletAddress, true)}
                  </span>
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
                      className="absolute right-0 mt-2 w-56 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50"
                    >
                      <div className="py-2">
                        {/* Full Address Display */}
                        <div className="px-4 py-2 border-b border-gray-700">
                          <p className="text-xs text-gray-400 mb-1">
                            Wallet Address
                          </p>
                          <p className="text-sm text-white font-mono break-all">
                            {walletAddress}
                          </p>
                        </div>

                        <button
                          onClick={copyAddress}
                          className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors duration-200"
                        >
                          <Copy className="w-4 h-4" />
                          {copySuccess ? "Copied!" : "Copy Address"}
                        </button>

                        <button
                          onClick={handleDisconnect}
                          className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-gray-800 transition-colors duration-200"
                        >
                          <LogOut className="w-4 h-4" />
                          Disconnect
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                href="/signin"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all duration-200"
              >
                <Wallet className="w-4 h-4" />
                <span className="hidden sm:inline">Connect Wallet</span>
                <span className="sm:hidden">Connect</span>
              </Link>
            )}
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
          <button
            onClick={handleOpenBountyModal}
            className="flex items-center gap-3 w-full px-3 py-2 text-blue-400 hover:text-blue-300 hover:bg-gray-800/50 rounded-lg transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            <span>Create Bounty</span>
          </button>

          {/* Mobile Wallet Info */}
          {walletAddress && (
            <div className="mt-3 px-3 py-2 bg-gray-800/50 rounded-lg border border-gray-700">
              <p className="text-xs text-gray-400 mb-1">Connected Wallet</p>
              <p className="text-sm text-white font-mono">
                {formatAddress(walletAddress)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {isWalletDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsWalletDropdownOpen(false)}
        />
      )}

      {/* Create Bounty Modal */}
      <AnimatePresence>
        {isBountyModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]"
              onClick={handleCloseBountyModal}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 mt-[50vh] z-[110] flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gray-900 border-2 border-gray-600 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto relative">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-gray-900">
                  <h2 className="text-xl font-bold text-white">
                    Create Data Bounty
                  </h2>
                  <button
                    onClick={handleCloseBountyModal}
                    className="text-gray-400 hover:text-white transition-colors duration-200 p-1 hover:bg-gray-700 rounded"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Modal Body - Enhanced Visibility */}
                <div className="bg-gray-900">
                  <form onSubmit={handleSubmitBounty} className="p-6 space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">
                        Data Description *
                      </label>
                      <textarea
                        value={bountyForm.description}
                        onChange={(e) =>
                          handleBountyFormChange("description", e.target.value)
                        }
                        className="w-full p-4 bg-gray-800 border-2 border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all duration-200"
                        placeholder="Describe the data you need (e.g., Customer demographics for ML training)"
                        rows={3}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">
                        Requirements *
                      </label>
                      <textarea
                        value={bountyForm.requirements}
                        onChange={(e) =>
                          handleBountyFormChange("requirements", e.target.value)
                        }
                        className="w-full p-4 bg-gray-800 border-2 border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all duration-200"
                        placeholder="Format, size, quality requirements (e.g., CSV format, 10,000+ records)"
                        rows={3}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">
                        Bounty Amount (tFIL) *
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          min="5"
                          value={bountyForm.bounty}
                          onChange={(e) =>
                            handleBountyFormChange("bounty", e.target.value)
                          }
                          className="w-full p-4 bg-gray-800 border-2 border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          placeholder="5.0"
                          required
                        />
                        <div className="absolute right-4 top-4 text-gray-400 text-sm pointer-events-none font-semibold">
                          tFIL
                        </div>
                      </div>
                      <p className="text-xs text-gray-300 mt-2 bg-gray-800/50 p-2 rounded">
                        Minimum: 5 tFIL. This amount will be locked until data
                        is delivered.
                      </p>
                    </div>

                    {/* Wallet Info */}
                    {walletAddress && (
                      <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-600/30 rounded-lg p-4">
                        <p className="text-sm text-blue-300 mb-1 font-semibold">
                          Payment From
                        </p>
                        <p className="text-sm text-white font-mono bg-gray-800/50 p-2 rounded">
                          {formatAddress(walletAddress)}
                        </p>
                      </div>
                    )}

                    {/* Submit Button */}
                    <div className="flex gap-3 pt-6 border-t border-gray-700">
                      <button
                        type="button"
                        onClick={handleCloseBountyModal}
                        className="flex-1 px-4 py-3 text-gray-300 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors duration-200 font-medium border border-gray-600"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={
                          isSubmittingBounty ||
                          !bountyForm.description ||
                          !bountyForm.requirements ||
                          parseFloat(bountyForm.bounty) < 5
                        }
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 font-semibold shadow-lg"
                      >
                        {isSubmittingBounty ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Creating...
                          </div>
                        ) : (
                          "Create Bounty"
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Nav;
