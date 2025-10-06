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
  Menu,
  X,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { checkConnection, disconnectWallet } from "../../utils/contract";

const Nav = () => {
  const [isWalletDropdownOpen, setIsWalletDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

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
    setIsMobileMenuOpen(false);
    window.location.href = "/signin";
  };

  const formatAddress = (
    address: string,
    length: "short" | "medium" | "long" = "medium"
  ) => {
    if (length === "short") {
      return `${address.slice(0, 4)}...${address.slice(-2)}`;
    } else if (length === "medium") {
      return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }
    return address;
  };

  const handleOpenBountyModal = () => {
    setIsBountyModalOpen(true);
    setIsMobileMenuOpen(false);
  };

  const handleCloseBountyModal = () => {
    setIsBountyModalOpen(false);
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

    // Validate bounty amount
    const bountyAmount = parseFloat(bountyForm.bounty);
    if (bountyAmount < 0.001) {
      alert("Minimum bounty is 0.001 tFIL");
      return;
    }

    setIsSubmittingBounty(true);

    try {
      const { announceDataRequest } = await import("../../utils/contract");

      const { tx, receipt } = await announceDataRequest(
        bountyForm.description,
        bountyForm.requirements,
        bountyForm.bounty
      );

      console.log("Bounty created:", { tx, receipt });
      handleCloseBountyModal();

      alert(
        `✅ Bounty created successfully!\n\nTransaction: ${receipt.hash}\n\nYour data request is now live!`
      );

      // Refresh the page to show the new bounty
      window.location.href = "/home";
    } catch (error: any) {
      console.error("Error creating bounty:", error);
      const errorMessage =
        error?.message || "Failed to create bounty. Please try again.";
      alert(`❌ ${errorMessage}`);
    } finally {
      setIsSubmittingBounty(false);
    }
  };

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-gray-800"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Mobile Menu Toggle */}
            <div className="flex items-center gap-3">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                <AnimatePresence mode="wait">
                  {isMobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="w-6 h-6" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="w-6 h-6" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>

              {/* Logo */}
              <Link href="/" className="flex items-center">
                <h1
                  style={{ fontFamily: "orbitron, sans-serif" }}
                  className="text-xl sm:text-2xl font-bold text-white hover:text-blue-400 transition-colors duration-200"
                >
                  Dallnk
                </h1>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-2 lg:space-x-4">
              <Link
                href="/home"
                className="flex items-center gap-2 px-3 lg:px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-200 group"
              >
                <Megaphone className="w-4 h-4 group-hover:text-blue-400 transition-colors duration-200" />
                <span className="text-sm font-medium">Marketplace</span>
              </Link>

              <Link
                href="/profile"
                className="flex items-center gap-2 px-3 lg:px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-200 group"
              >
                <UserRound className="w-4 h-4 group-hover:text-blue-400 transition-colors duration-200" />
                <span className="text-sm font-medium">Profile</span>
              </Link>
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Create Bounty Button - Desktop */}
              <motion.button
                onClick={handleOpenBountyModal}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="hidden lg:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-400/30 to-blue-500/90 hover:bg-blue-600 text-white rounded-lg font-medium text-sm transition-all duration-200 shadow-lg shadow-blue-600/25"
              >
                <Plus className="w-4 h-4" />
                <span>Create Request</span>
              </motion.button>

              {/* Create Bounty Button - Tablet */}
              <motion.button
                onClick={handleOpenBountyModal}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="hidden md:flex lg:hidden items-center gap-1 px-3 py-2 bg-gradient-to-r from-blue-400/30 to-blue-500/90 hover:bg-blue-600 text-white rounded-lg font-medium text-sm transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                <span>Create</span>
              </motion.button>

              {/* Create Bounty Button - Mobile */}
              <motion.button
                onClick={handleOpenBountyModal}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="md:hidden p-2 bg-gradient-to-r from-blue-400/30 to-blue-500/90 hover:bg-blue-600 text-white rounded-lg transition-all duration-200"
              >
                <Plus className="w-5 h-5" />
              </motion.button>

              {/* Wallet Section */}
              {walletAddress ? (
                <div className="relative">
                  <motion.button
                    onClick={() =>
                      setIsWalletDropdownOpen(!isWalletDropdownOpen)
                    }
                    className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 lg:px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded-lg text-white text-xs sm:text-sm font-medium transition-all duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="hidden sm:inline font-mono">
                      {formatAddress(walletAddress, "medium")}
                    </span>
                    <span className="sm:hidden font-mono">
                      {formatAddress(walletAddress, "short")}
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
                        className="absolute right-0 mt-2 w-64 sm:w-72 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50"
                      >
                        <div className="py-2">
                          {/* Full Address Display */}
                          <div className="px-4 py-3 border-b border-gray-700">
                            <p className="text-xs text-gray-400 mb-1">
                              Wallet Address
                            </p>
                            <p className="text-xs sm:text-sm text-white font-mono break-all">
                              {walletAddress}
                            </p>
                          </div>

                          <button
                            onClick={copyAddress}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors duration-200"
                          >
                            <Copy className="w-4 h-4" />
                            {copySuccess ? "Copied!" : "Copy Address"}
                          </button>

                          <button
                            onClick={handleDisconnect}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-gray-800 transition-colors duration-200"
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
                  className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs sm:text-sm font-medium transition-all duration-200"
                >
                  <Wallet className="w-4 h-4" />
                  <span className="hidden xs:inline">Connect</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-16 left-0 bottom-0 w-64 bg-gray-900 border-r border-gray-800 z-50 md:hidden overflow-y-auto"
            >
              <div className="p-4 space-y-2">
                <Link
                  href="/home"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200"
                >
                  <Megaphone className="w-5 h-5" />
                  <span className="font-medium">Marketplace</span>
                </Link>

                <Link
                  href="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200"
                >
                  <UserRound className="w-5 h-5" />
                  <span className="font-medium">Profile</span>
                </Link>

                <button
                  onClick={handleOpenBountyModal}
                  className="flex items-center gap-3 w-full px-4 py-3 text-blue-400 hover:text-blue-300 hover:bg-gray-800 rounded-lg transition-all duration-200"
                >
                  <Plus className="w-5 h-5" />
                  <span className="font-medium">Create Request</span>
                </button>

                {/* Mobile Wallet Info */}
                {walletAddress && (
                  <div className="mt-4 pt-4 border-t border-gray-800">
                    <div className="px-4 py-3 bg-gray-800/50 rounded-lg border border-gray-700">
                      <p className="text-xs text-gray-400 mb-2">
                        Connected Wallet
                      </p>
                      <p className="text-sm text-white font-mono break-all">
                        {walletAddress}
                      </p>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={copyAddress}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                        >
                          <Copy className="w-3 h-3" />
                          {copySuccess ? "Copied!" : "Copy"}
                        </button>
                        <button
                          onClick={handleDisconnect}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded transition-colors"
                        >
                          <LogOut className="w-3 h-3" />
                          Disconnect
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Click outside to close wallet dropdown */}
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
            <div className="fixed pt-[24vh] inset-0 z-[110] flex items-center justify-center p-4 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.3 }}
                className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-lg my-8"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-700">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-white">
                      Create Data Request
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-400 mt-1">
                      Post a bounty for the data you need
                    </p>
                  </div>
                  <button
                    onClick={handleCloseBountyModal}
                    className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-800 rounded"
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>

                {/* Modal Body */}
                <form
                  onSubmit={handleSubmitBounty}
                  className="p-4 sm:p-6 space-y-4 sm:space-y-5"
                >
                  {!walletAddress && (
                    <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-300 text-sm">
                      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                      <p>Please connect your wallet to create a request.</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Data Description *
                    </label>
                    <textarea
                      value={bountyForm.description}
                      onChange={(e) =>
                        handleBountyFormChange("description", e.target.value)
                      }
                      className="w-full p-3 sm:p-4 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all text-sm"
                      placeholder="e.g., Customer demographics dataset for ML training"
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
                      className="w-full p-3 sm:p-4 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all text-sm"
                      placeholder="e.g., CSV format, 10,000+ records, verified sources"
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
                        step="0.001"
                        min="0.001"
                        value={bountyForm.bounty}
                        onChange={(e) =>
                          handleBountyFormChange("bounty", e.target.value)
                        }
                        className="w-full p-3 sm:p-4 pr-16 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                        placeholder="5.0"
                        required
                      />
                      <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">
                        tFIL
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2 bg-gray-800/50 p-2 rounded">
                      Minimum: 0.001 tFIL. Funds will be locked until delivery.
                    </p>
                  </div>

                  {/* Wallet Info */}
                  {walletAddress && (
                    <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-600/30 rounded-lg p-3 sm:p-4">
                      <p className="text-xs sm:text-sm text-blue-300 mb-1 font-semibold">
                        Payment From
                      </p>
                      <p className="text-xs sm:text-sm text-white font-mono bg-gray-800/50 p-2 rounded break-all">
                        {walletAddress}
                      </p>
                    </div>
                  )}

                  {/* Submit Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-700">
                    <button
                      type="button"
                      onClick={handleCloseBountyModal}
                      className="w-full sm:flex-1 px-4 py-2.5 sm:py-3 text-gray-300 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors font-medium border border-gray-700 text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={
                        isSubmittingBounty ||
                        !walletAddress ||
                        !bountyForm.description ||
                        !bountyForm.requirements ||
                        parseFloat(bountyForm.bounty) < 0.001
                      }
                      className="w-full sm:flex-1 px-4 py-2.5 sm:py-3 bg-gradient-to-r from-blue-400/30 to-blue-500/90 hover:bg-blue-600 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-all font-semibold shadow-lg text-sm"
                    >
                      {isSubmittingBounty ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Creating...
                        </div>
                      ) : (
                        "Create Request"
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Nav;
