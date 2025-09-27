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
} from "lucide-react";
import {
  BountySubmission,
  acceptSubmission,
  declineSubmission,
  releasePayment,
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

  const clearMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleAccept = useCallback(
    async (bountyId: string) => {
      clearMessages();
      setProcessingId(bountyId);
      try {
        const result = await acceptSubmission(bountyId);

        if (result.success) {
          setSuccessMessage(
            "Submission accepted successfully! You can now release payment."
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
          setError(
            "Transaction cancelled by user. You can try again when ready."
          );
        } else {
          setError(`Error accepting submission: ${message}`);
        }
      } finally {
        setProcessingId(null);
      }
    },
    [onBountyUpdate]
  );

  const handleReleasePayment = useCallback(
    async (bountyId: string) => {
      clearMessages();
      setProcessingId(bountyId);
      try {
        const result = await releasePayment(bountyId);
        if (result.success) {
          setSuccessMessage("Payment released successfully!");
          onBountyUpdate();
        } else {
          setError(`Failed to release payment: ${result.error}`);
        }
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Unknown error occurred";
        if (
          message.includes("user rejected") ||
          message.includes("User denied")
        ) {
          setError("Payment cancelled by user. You can try again when ready.");
        } else {
          setError(`Error releasing payment: ${message}`);
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
        "Are you sure you want to decline this submission? This will reset the bounty and allow new submissions."
      );

      if (!confirmed) return;

      clearMessages();
      setProcessingId(bountyId);
      try {
        const result = await declineSubmission(bountyId);

        if (result.success) {
          setSuccessMessage("Submission declined successfully!");
          onBountyUpdate();
        } else {
          setError(`Failed to decline submission: ${result.error}`);
        }
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Unknown error occurred";
        setError(`Error declining submission: ${message}`);
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
        await downloadFromIPFS(ipfsHash, `bounty-${bountyId}-data`);
        setSuccessMessage("File downloaded successfully!");
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Download failed";
        setError(
          `Download failed: ${message}. The file may not be available on IPFS.`
        );
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
        color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
        icon: <CheckCircle className="w-4 h-4" />,
      };
    }
    if (bounty.isVerified) {
      return {
        status: "Verified",
        color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
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
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-gray-500 mx-auto mb-4" />
        <p className="text-gray-400 text-lg mb-2">No submissions to review</p>
        <p className="text-gray-500 text-sm">
          Submissions to your bounties will appear here for review
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
          <button
            onClick={clearMessages}
            className="ml-auto text-red-400/60 hover:text-red-400"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>{successMessage}</span>
          <button
            onClick={clearMessages}
            className="ml-auto text-emerald-400/60 hover:text-emerald-400"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">Review Submissions</h3>
        <div className="text-sm text-gray-400">
          {bountiesWithSubmissions.length} submission
          {bountiesWithSubmissions.length !== 1 ? "s" : ""} pending
        </div>
      </div>

      <div className="space-y-4">
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
              className="bg-gray-900/50 border border-gray-700 rounded-xl overflow-hidden hover:border-gray-600 transition-colors"
            >
              {/* Header */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-semibold text-white">
                        Bounty #{bounty.bountyId}
                      </h4>
                      <div
                        className={`px-3 py-1 rounded-full text-xs border flex items-center gap-1 ${statusInfo.color}`}
                      >
                        {statusInfo.icon}
                        {statusInfo.status}
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                      {bounty.description}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-1 text-green-400 font-semibold text-lg">
                      <Coins className="w-5 h-5" />
                      {bounty.bounty} tFIL
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Created {formatDate(bounty.timestamp)}
                    </div>
                  </div>
                </div>

                {/* Submission Info */}
                {hasSubmission && (
                  <div className="bg-gray-800/50 rounded-lg p-4 mb-4 border border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-white font-medium">
                          <User className="w-4 h-4" />
                          Submission Details
                        </div>
                        {/* AI Verification Tag */}
                        <div className="flex items-center gap-1 px-2 py-1 bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-full text-xs">
                          <CheckCircle className="w-3 h-3" />
                          AI Verified
                        </div>
                      </div>
                      <button
                        onClick={() => toggleExpanded(bounty.bountyId)}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Submitter:</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-white font-mono">
                            {formatAddress(bounty.submitter)}
                          </span>
                          <button
                            onClick={() => copyToClipboard(bounty.submitter)}
                            className="text-gray-400 hover:text-white transition-colors"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {bounty.ipfsHash && (
                        <div>
                          <span className="text-gray-400">IPFS Hash:</span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-white font-mono text-xs">
                              {bounty.ipfsHash.slice(0, 12)}...
                            </span>
                            <button
                              onClick={() => copyToClipboard(bounty.ipfsHash)}
                              className="text-gray-400 hover:text-white transition-colors"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                            <a
                              href={`https://w3s.link/ipfs/${bounty.ipfsHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 transition-colors"
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
                      <div className="bg-gray-800/30 rounded-lg p-4 mb-4 border border-gray-600">
                        <h5 className="text-white font-medium mb-2">
                          Requirements:
                        </h5>
                        <p className="text-gray-300 text-sm leading-relaxed">
                          {bounty.requirements}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action Buttons */}
                {hasSubmission && (
                  <div className="flex flex-wrap gap-3">
                    {/* Download Button - Available for submissions with IPFS hash */}
                    {bounty.ipfsHash && (
                      <button
                        onClick={() =>
                          handleDownload(bounty.ipfsHash, bounty.bountyId)
                        }
                        disabled={isDownloading}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 border border-blue-500/30 text-blue-300 rounded-lg hover:bg-blue-600/30 transition-colors disabled:opacity-50"
                      >
                        {isDownloading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                        {bounty.isPaid ? "Download Data" : "Preview Data"}
                      </button>
                    )}

                    {/* Accept/Decline Buttons - Only show for unpaid submissions */}
                    {!bounty.isPaid && !bounty.isVerified && (
                      <>
                        <button
                          onClick={() => handleAccept(bounty.bountyId)}
                          disabled={isProcessing}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 border border-blue-500/30 text-blue-300 rounded-lg hover:bg-blue-600/30 transition-colors disabled:opacity-50"
                        >
                          {isProcessing ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                          Accept Submission
                        </button>

                        <button
                          onClick={() => handleDecline(bounty.bountyId)}
                          disabled={isProcessing}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600/20 border border-red-500/30 text-red-300 rounded-lg hover:bg-red-600/30 transition-colors disabled:opacity-50"
                        >
                          {isProcessing ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <XCircle className="w-4 h-4" />
                          )}
                          Decline
                        </button>
                      </>
                    )}

                    {/* Release Payment Button - shown after acceptance */}
                    {bounty.isVerified && !bounty.isPaid && (
                      <button
                        onClick={() => handleReleasePayment(bounty.bountyId)}
                        disabled={isProcessing}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 rounded-lg hover:bg-emerald-600/30 transition-colors disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Coins className="w-4 h-4" />
                        )}
                        Release Payment
                      </button>
                    )}

                    {/* Already Completed */}
                    {bounty.isPaid && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 rounded-lg">
                        <CheckCircle className="w-4 h-4" />
                        Payment Released
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
