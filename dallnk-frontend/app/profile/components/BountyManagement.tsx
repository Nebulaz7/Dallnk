"use client";
import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  Download,
  ExternalLink,
  Clock,
  FileText,
  Coins,
  User,
  Eye,
  AlertTriangle,
  Loader2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  BountySubmission,
  acceptSubmission,
  declineSubmission,
  downloadFromIPFS,
} from "../../utils/bountyManagement";

interface BountyManagementProps {
  bounties: BountySubmission[];
  onBountyUpdate: () => void;
}

const BountyManagement: React.FC<BountyManagementProps> = ({
  bounties,
  onBountyUpdate,
}) => {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const clearMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };

  const formatAddress = (address: string, isMobile = false) => {
    if (isMobile) {
      return `${address.slice(0, 4)}...${address.slice(-2)}`;
    }
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(label);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleAccept = useCallback(
    async (bountyId: string) => {
      const confirmed = window.confirm(
        "Are you sure you want to accept this submission? This will verify the data and release payment to the submitter."
      );

      if (!confirmed) return;

      clearMessages();
      setProcessingId(bountyId);
      try {
        const result = await acceptSubmission(bountyId);

        if (result.success) {
          setSuccessMessage(
            "✅ Submission accepted and payment released successfully!"
          );
          onBountyUpdate();
        } else {
          setError(`Failed to accept submission: ${result.error}`);
        }
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Unknown error occurred";
        if (
          message.includes("user rejected") ||
          message.includes("User denied") ||
          message.includes("ACTION_REJECTED")
        ) {
          setError("Transaction cancelled. You can try again when ready.");
        } else {
          setError(`Error: ${message}`);
        }
      } finally {
        setProcessingId(null);
      }
    },
    [onBountyUpdate]
  );

  const handleDecline = useCallback(
    async (bountyId: string) => {
      const confirmed = window.confirm(
        "Are you sure you want to decline this submission? This will reset the request and allow new submissions."
      );

      if (!confirmed) return;

      clearMessages();
      setProcessingId(bountyId);
      try {
        const result = await declineSubmission(bountyId);

        if (result.success) {
          setSuccessMessage("Submission declined. Request is now open again.");
          onBountyUpdate();
        } else {
          setError(`Failed to decline: ${result.error}`);
        }
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Unknown error occurred";
        setError(`Error: ${message}`);
      } finally {
        setProcessingId(null);
      }
    },
    [onBountyUpdate]
  );

  const handleDownload = useCallback(
    async (ipfsHash: string, bountyId: string) => {
      if (!ipfsHash) return;

      clearMessages();
      setDownloadingId(bountyId);
      try {
        await downloadFromIPFS(ipfsHash, `data-request-${bountyId}`);
        setSuccessMessage("File downloaded successfully!");
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Download failed";
        setError(`Download failed: ${message}`);
      } finally {
        setDownloadingId(null);
      }
    },
    []
  );

  const toggleExpanded = useCallback(
    (bountyId: string) => {
      setExpandedId(expandedId === bountyId ? null : bountyId);
    },
    [expandedId]
  );

  const getStatusInfo = (bounty: BountySubmission) => {
    if (bounty.isPaid) {
      return {
        status: "Completed",
        color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
        icon: <CheckCircle className="w-4 h-4" />,
      };
    }
    if (bounty.isVerified) {
      return {
        status: "Verified",
        color: "bg-green-500/20 text-green-400 border-green-500/30",
        icon: <CheckCircle className="w-4 h-4" />,
      };
    }
    if (
      bounty.submitter &&
      bounty.submitter !== "0x0000000000000000000000000000000000000000"
    ) {
      return {
        status: "Pending Review",
        color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
        icon: <Clock className="w-4 h-4" />,
      };
    }
    return {
      status: "Open",
      color: "bg-gray-500/20 text-gray-400 border-gray-500/30",
      icon: <AlertTriangle className="w-4 h-4" />,
    };
  };

  const bountiesWithSubmissions = bounties.filter(
    (bounty) =>
      bounty.submitter &&
      bounty.submitter !== "0x0000000000000000000000000000000000000000"
  );

  if (bountiesWithSubmissions.length === 0) {
    return (
      <div className="text-center py-12 bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-xl border border-white/10">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
          <FileText className="w-8 h-8 text-gray-500" />
        </div>
        <p className="text-gray-400 text-base sm:text-lg mb-2">
          No submissions to review
        </p>
        <p className="text-gray-500 text-sm">
          Data submissions will appear here for your review
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-500/10 border border-red-500/30 text-red-400 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg flex items-start gap-2 text-sm"
          >
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" />
            <span className="flex-1">{error}</span>
            <button
              onClick={clearMessages}
              className="text-red-400/60 hover:text-red-400 transition-colors"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg flex items-start gap-2 text-sm"
          >
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" />
            <span className="flex-1">{successMessage}</span>
            <button
              onClick={clearMessages}
              className="text-emerald-400/60 hover:text-emerald-400 transition-colors"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h3 className="text-lg sm:text-xl font-bold text-white">
          Review Submissions
        </h3>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-full text-xs sm:text-sm w-fit">
          <Clock className="w-4 h-4" />
          {bountiesWithSubmissions.length} pending
        </div>
      </div>

      {/* Submissions List */}
      <div className="space-y-3 sm:space-y-4">
        {bountiesWithSubmissions.map((bounty) => {
          const statusInfo = getStatusInfo(bounty);
          const isExpanded = expandedId === bounty.bountyId;
          const isProcessing = processingId === bounty.bountyId;
          const isDownloading = downloadingId === bounty.bountyId;
          const hasSubmission =
            bounty.submitter !== "0x0000000000000000000000000000000000000000";

          return (
            <motion.div
              key={bounty.bountyId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-all shadow-lg"
            >
              <div className="p-4 sm:p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h4 className="text-base sm:text-lg font-semibold text-white">
                        Request #{bounty.bountyId}
                      </h4>
                      <div
                        className={`px-2 sm:px-3 py-1 rounded-full text-xs border flex items-center gap-1 ${statusInfo.color}`}
                      >
                        {statusInfo.icon}
                        <span className="hidden xs:inline">
                          {statusInfo.status}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm line-clamp-2">
                      {bounty.description}
                    </p>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <div className="flex items-center gap-1.5 text-green-400 font-semibold text-base sm:text-lg">
                      <Coins className="w-4 h-4 sm:w-5 sm:h-5" />
                      {bounty.bounty} tFIL
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {formatDate(bounty.timestamp)}
                    </div>
                  </div>
                </div>

                {/* Submission Info */}
                {hasSubmission && (
                  <div className="bg-gray-800/50 rounded-lg p-3 sm:p-4 mb-4 border border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                        <div className="flex items-center gap-2 text-white font-medium text-sm">
                          <User className="w-4 h-4" />
                          <span className="hidden sm:inline">Submission</span>
                        </div>
                        <div className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-full text-xs">
                          <CheckCircle className="w-3 h-3" />
                          <span>AI Verified</span>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleExpanded(bounty.bountyId)}
                        className="text-gray-400 hover:text-white transition-colors p-1"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    <div className="space-y-2 sm:space-y-3 text-sm">
                      {/* Submitter */}
                      <div>
                        <span className="text-gray-400 text-xs">
                          Submitter:
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-white font-mono text-xs sm:text-sm">
                            <span className="hidden sm:inline">
                              {formatAddress(bounty.submitter)}
                            </span>
                            <span className="sm:hidden">
                              {formatAddress(bounty.submitter, true)}
                            </span>
                          </span>
                          <button
                            onClick={() =>
                              copyToClipboard(bounty.submitter, "submitter")
                            }
                            className="text-gray-400 hover:text-white transition-colors"
                          >
                            {copiedText === "submitter" ? (
                              <Check className="w-3 h-3 text-green-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                          <a
                            href={`https://calibration.filscan.io/address/${bounty.submitter}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>

                      {/* IPFS Hash */}
                      {bounty.ipfsHash && (
                        <div>
                          <span className="text-gray-400 text-xs">
                            IPFS CID:
                          </span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-white font-mono text-xs break-all">
                              {bounty.ipfsHash.slice(0, 20)}...
                            </span>
                            <button
                              onClick={() =>
                                copyToClipboard(bounty.ipfsHash, "ipfs")
                              }
                              className="text-gray-400 hover:text-white transition-colors shrink-0"
                            >
                              {copiedText === "ipfs" ? (
                                <Check className="w-3 h-3 text-green-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                            <a
                              href={`https://gateway.pinata.cloud/ipfs/${bounty.ipfsHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 transition-colors shrink-0"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Expanded Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-gray-800/30 rounded-lg p-3 sm:p-4 mb-4 border border-gray-600">
                        <h5 className="text-white font-medium mb-2 text-sm">
                          Requirements:
                        </h5>
                        <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                          {bounty.requirements}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action Buttons */}
                {hasSubmission && (
                  <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3">
                    {/* View/Download Button */}
                    {bounty.ipfsHash && (
                      <a
                        href={`https://gateway.pinata.cloud/ipfs/${bounty.ipfsHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-blue-600/20 border border-blue-500/30 text-blue-300 rounded-lg hover:bg-blue-600/30 transition-colors text-sm font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Data</span>
                      </a>
                    )}

                    {/* Accept/Decline for pending */}
                    {!bounty.isPaid && !bounty.isVerified && (
                      <>
                        <button
                          onClick={() => handleAccept(bounty.bountyId)}
                          disabled={isProcessing}
                          className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-green-600/20 border border-green-500/30 text-green-300 rounded-lg hover:bg-green-600/30 transition-colors disabled:opacity-50 text-sm font-medium"
                        >
                          {isProcessing ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                          <span>Accept & Pay</span>
                        </button>

                        <button
                          onClick={() => handleDecline(bounty.bountyId)}
                          disabled={isProcessing}
                          className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-red-600/20 border border-red-500/30 text-red-300 rounded-lg hover:bg-red-600/30 transition-colors disabled:opacity-50 text-sm font-medium"
                        >
                          {isProcessing ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <XCircle className="w-4 h-4" />
                          )}
                          <span>Decline</span>
                        </button>
                      </>
                    )}

                    {/* Completed Status */}
                    {bounty.isPaid && (
                      <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600/20 border border-blue-500/30 text-blue-300 rounded-lg text-sm font-medium">
                        <CheckCircle className="w-4 h-4" />
                        <span>Completed</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default BountyManagement;
