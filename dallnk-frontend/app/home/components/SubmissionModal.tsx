"use client";
import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  X,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  Zap,
  Shield,
  Upload as UploadIcon,
  Brain,
  Link as LinkIcon,
  Trash2,
  RotateCcw,
  Eye,
} from "lucide-react";
import { uploadToStoracha, UploadResult } from "../../utils/storacha";
import {
  verifyDataWithAI,
  VerificationResult,
} from "../../utils/aiVerification";
import {
  submitDataToContract,
  SubmissionResult,
  checkSubmissionEligibility,
} from "../../utils/contractSubmission";
import {
  validateFileSubmission,
  canSubmitToRequest,
  trackSubmissionAttempt,
} from "../../utils/rateLimiting";
import { checkConnection } from "../../utils/contract";

type SubmissionStep =
  | "upload"
  | "uploading"
  | "verifying"
  | "submitting"
  | "success"
  | "error";

interface DataRequest {
  id: string;
  description: string;
  requirements: string;
  bounty: string;
  requester: string;
}

interface SubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  bounty: DataRequest | null;
  onSuccess?: (submissionId: string) => void;
}

interface SubmissionState {
  step: SubmissionStep;
  file: File | null;
  uploadResult: UploadResult | null;
  verificationResult: VerificationResult | null;
  submissionResult: SubmissionResult | null;
  error: string | null;
  description: string;
}

type EligibilityCheck = {
  canSubmit?: boolean;
  eligible?: boolean;
  reason?: string;
  cooldownSeconds?: number;
};

const SubmissionModal: React.FC<SubmissionModalProps> = ({
  isOpen,
  onClose,
  bounty,
  onSuccess,
}) => {
  const [state, setState] = useState<SubmissionState>({
    step: "upload",
    file: null,
    uploadResult: null,
    verificationResult: null,
    submissionResult: null,
    error: null,
    description: "",
  });
  const [isDragging, setIsDragging] = useState(false);

  const walletAddress = checkConnection();

  React.useEffect(() => {
    if (isOpen) {
      setState({
        step: "upload",
        file: null,
        uploadResult: null,
        verificationResult: null,
        submissionResult: null,
        error: null,
        description: "",
      });
      setIsDragging(false);
    }
  }, [isOpen, bounty?.id]);

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setState((prev) => ({
        ...prev,
        file,
        uploadResult: null,
        verificationResult: null,
        submissionResult: null,
        error: null,
        step: "upload",
      }));
    },
    []
  );

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (!file) return;

    setIsDragging(false);
    setState((prev) => ({
      ...prev,
      file,
      uploadResult: null,
      verificationResult: null,
      submissionResult: null,
      error: null,
      step: "upload",
    }));
  }, []);

  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
    },
    []
  );

  const handleDragEnter = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(true);
    },
    []
  );

  const handleDragLeave = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (event.currentTarget.contains(event.relatedTarget as Node)) return;
      setIsDragging(false);
    },
    []
  );

  const handleRemoveFile = useCallback(() => {
    setState((prev) => ({
      ...prev,
      file: null,
      uploadResult: null,
      verificationResult: null,
      submissionResult: null,
      error: null,
      step: "upload",
    }));
  }, []);

  const handleDescriptionChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const { value } = event.target;
      setState((prev) => ({ ...prev, description: value }));
    },
    []
  );

  const handleRetry = useCallback(() => {
    setState((prev) => ({
      ...prev,
      step: "upload",
      error: null,
      submissionResult: null,
      verificationResult: null,
    }));
  }, []);

  const startSubmissionProcess = useCallback(async () => {
    if (!state.file || !bounty || !walletAddress) return;

    try {
      // Validate file submission
      const validation = validateFileSubmission(
        state.file,
        walletAddress,
        bounty.id
      );

      if (!validation.isValid) {
        setState((prev) => ({
          ...prev,
          step: "error",
          error: validation.errors.join(". "),
        }));
        return;
      }

      // Check eligibility
      const eligibility = (await checkSubmissionEligibility(
        walletAddress,
        bounty.id
      )) as EligibilityCheck;

      const canProceed =
        eligibility?.canSubmit ?? eligibility?.eligible ?? true;

      if (!canProceed) {
        const reason =
          eligibility?.reason ||
          "Submission cooldown active, please try again later.";
        setState((prev) => ({
          ...prev,
          step: "error",
          error: reason,
        }));
        return;
      }

      // Check rate limiting
      const directEligibility = canSubmitToRequest(walletAddress, bounty.id);
      if (!directEligibility.canSubmit) {
        setState((prev) => ({
          ...prev,
          step: "error",
          error:
            directEligibility.reason ||
            "Cannot submit to this request right now.",
        }));
        return;
      }

      // Step 1: Upload to Pinata via our API
      setState((prev) => ({ ...prev, step: "uploading", error: null }));
      console.log("📤 Starting upload to Pinata...");

      const uploadResult = await uploadToStoracha(state.file);
      console.log("✅ Upload successful:", uploadResult);

      setState((prev) => ({ ...prev, uploadResult }));

      // Step 2: AI Verification
      setState((prev) => ({ ...prev, step: "verifying" }));
      console.log("🤖 Starting AI verification...");

      const verificationResult = await verifyDataWithAI(
        uploadResult.cid,
        bounty.description,
        bounty.requirements,
        uploadResult.type,
        uploadResult.size
      );

      console.log("✅ Verification complete:", verificationResult);
      setState((prev) => ({ ...prev, verificationResult }));

      if (!verificationResult.isApproved) {
        setState((prev) => ({
          ...prev,
          step: "error",
          error: `AI Verification Failed: ${verificationResult.reason}`,
        }));
        return;
      }

      // Step 3: Submit to blockchain
      setState((prev) => ({ ...prev, step: "submitting" }));
      console.log("⛓️ Submitting to blockchain...");

      trackSubmissionAttempt(walletAddress, bounty.id);

      const submissionResult = await submitDataToContract(
        bounty.id,
        uploadResult.cid,
        state.description || `Data submission for request #${bounty.id}`
      );

      console.log("✅ Blockchain submission complete:", submissionResult);
      setState((prev) => ({ ...prev, submissionResult }));

      if (submissionResult.success) {
        setState((prev) => ({ ...prev, step: "success" }));
        onSuccess?.(bounty.id);
      } else {
        setState((prev) => ({
          ...prev,
          step: "error",
          error: submissionResult.error || "Blockchain submission failed.",
        }));
      }
    } catch (error: unknown) {
      console.error("❌ Submission process failed:", error);
      const message =
        error instanceof Error ? error.message : "Submission process failed.";
      setState((prev) => ({
        ...prev,
        step: "error",
        error: message,
      }));
    }
  }, [state.file, state.description, bounty, walletAddress, onSuccess]);

  const resetAndClose = useCallback(() => {
    setState({
      step: "upload",
      file: null,
      uploadResult: null,
      verificationResult: null,
      submissionResult: null,
      error: null,
      description: "",
    });
    setIsDragging(false);
    onClose();
  }, [onClose]);

  if (!bounty || !isOpen) return null;

  const isProcessing = ["uploading", "verifying", "submitting"].includes(
    state.step
  );

  const steps: { id: SubmissionStep; label: string; icon: React.ReactNode }[] =
    [
      {
        id: "upload",
        label: "Upload Data",
        icon: <UploadIcon className="w-4 h-4" />,
      },
      {
        id: "uploading",
        label: "Upload to IPFS",
        icon: <Shield className="w-4 h-4" />,
      },
      {
        id: "verifying",
        label: "AI Verification",
        icon: <Brain className="w-4 h-4" />,
      },
      {
        id: "submitting",
        label: "Submit On-Chain",
        icon: <Zap className="w-4 h-4" />,
      },
      {
        id: "success",
        label: "Complete",
        icon: <CheckCircle className="w-4 h-4" />,
      },
    ];

  const currentStepIndex = steps.findIndex((step) => step.id === state.step);
  const formattedSize = state.file ? formatBytes(state.file.size) : null;
  const submitDisabled =
    !state.file || !walletAddress || isProcessing || state.step === "success";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={resetAndClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <div>
              <h3 className="text-xl font-bold text-white">Submit Data</h3>
              <p className="text-gray-400 text-sm">
                Request #{bounty.id} • {bounty.bounty} tFIL Bounty
              </p>
            </div>
            <button
              onClick={resetAndClose}
              disabled={isProcessing}
              className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Progress Steps */}
            <div className="flex flex-wrap items-center gap-2 bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              {steps.map((step, index) => {
                const isActive = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;
                return (
                  <React.Fragment key={step.id}>
                    <div
                      className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs border transition-all ${
                        isCurrent
                          ? "bg-blue-500 text-white border-blue-400"
                          : isActive
                          ? "bg-blue-500/20 text-blue-300 border-blue-400/30"
                          : "bg-gray-800 text-gray-500 border-gray-700"
                      }`}
                    >
                      {isCurrent && isProcessing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        step.icon
                      )}
                      {step.label}
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`w-4 h-px transition-colors ${
                          isActive ? "bg-blue-400" : "bg-gray-700/70"
                        }`}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Bounty Details */}
            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <FileText className="w-4 h-4 text-blue-400" />
                <span className="font-medium text-white">Required Data</span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                {bounty.description}
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-300 pt-2 border-t border-gray-700/50">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span className="font-medium text-white">Requirements</span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                {bounty.requirements}
              </p>
            </div>

            {/* Wallet Warning */}
            {!walletAddress && (
              <div className="flex items-center gap-2 bg-amber-500/10 text-amber-300 border border-amber-400/30 rounded-lg px-4 py-3 text-sm">
                <AlertCircle className="w-4 h-4" />
                Connect your wallet to continue.
              </div>
            )}

            {/* Description Input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-white">
                Submission Notes (optional)
              </label>
              <textarea
                value={state.description}
                onChange={handleDescriptionChange}
                rows={3}
                disabled={isProcessing}
                placeholder="Add context or metadata for the requester..."
                className="w-full resize-none rounded-lg border border-gray-700 bg-gray-900/70 px-4 py-3 text-sm text-gray-200 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-60 transition-colors"
              />
            </div>

            {/* File Upload Zone */}
            <div
              className={`rounded-2xl border-2 border-dashed transition-all duration-200 ${
                isDragging
                  ? "border-blue-400 bg-blue-500/5 scale-[1.02]"
                  : "border-gray-700 bg-gray-900/40"
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
            >
              <label className="flex flex-col items-center justify-center gap-4 px-6 py-12 cursor-pointer">
                <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-blue-400" />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-white text-sm font-medium">
                    {state.file
                      ? "Replace data file"
                      : "Drag & drop your file or click to browse"}
                  </p>
                  <p className="text-xs text-gray-400">
                    CSV, JSON, ZIP, PDF or images up to 100 MB
                  </p>
                </div>
                <input
                  type="file"
                  accept=".csv,.json,.txt,.pdf,.jpeg,.jpg,.png,.zip"
                  className="hidden"
                  onChange={handleFileSelect}
                  disabled={isProcessing}
                />
              </label>
            </div>

            {/* Selected File Info */}
            {state.file && (
              <div className="rounded-xl border border-gray-700 bg-gray-900/60 p-4 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-white font-medium truncate">
                        {state.file.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {state.file.type || "Unknown type"} • {formattedSize}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveFile}
                    disabled={isProcessing}
                    className="text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50 shrink-0"
                    title="Remove file"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Upload Result */}
                {state.uploadResult && (
                  <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-3 text-xs space-y-2">
                    <div className="flex items-center gap-2 text-blue-300 font-medium">
                      <LinkIcon className="w-4 h-4" />
                      <span>Uploaded to Pinata IPFS</span>
                    </div>
                    <div className="text-blue-200/80 space-y-1">
                      <div className="font-mono break-all">
                        CID: {state.uploadResult.cid}
                      </div>
                      <div>Type: {state.uploadResult.type}</div>
                      <div>Size: {formatBytes(state.uploadResult.size)}</div>
                    </div>
                    <a
                      href={`https://gateway.pinata.cloud/ipfs/${state.uploadResult.cid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-300 hover:text-blue-200 transition-colors mt-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Preview on Gateway</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                {/* Verification Result */}
                {state.verificationResult && (
                  <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-xs space-y-1">
                    <div className="flex items-center gap-2 text-emerald-300 font-medium">
                      <Shield className="w-4 h-4" />
                      <span>AI Verification Passed</span>
                    </div>
                    <div className="text-emerald-200/80 space-y-1">
                      {state.verificationResult.confidence !== undefined && (
                        <div>
                          Confidence Score:{" "}
                          {Math.round(state.verificationResult.confidence)}%
                        </div>
                      )}
                      {state.verificationResult.reason && (
                        <div>{state.verificationResult.reason}</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Submitting State */}
                {state.step === "submitting" && (
                  <div className="rounded-lg border border-indigo-500/30 bg-indigo-500/5 p-3 text-xs text-indigo-200 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Broadcasting transaction to Filecoin Calibration testnet...
                  </div>
                )}
              </div>
            )}

            {/* Error State */}
            {state.step === "error" && state.error && (
              <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm space-y-3">
                <div className="flex items-center gap-2 text-red-300 font-semibold">
                  <AlertCircle className="w-5 h-5" />
                  Submission Failed
                </div>
                <p className="text-red-200/80 leading-relaxed">{state.error}</p>
                <button
                  onClick={handleRetry}
                  className="inline-flex items-center gap-2 text-xs text-red-200 hover:text-red-100 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  Try Again
                </button>
              </div>
            )}

            {/* Success State */}
            {state.step === "success" && (
              <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 space-y-3">
                <div className="flex items-center gap-2 text-emerald-300 font-semibold text-lg">
                  <CheckCircle className="w-6 h-6" />
                  Submission Successful! 🎉
                </div>
                <p className="text-sm text-emerald-100/80 leading-relaxed">
                  Your data has been successfully submitted to the blockchain
                  and is now pending requester review. The file is permanently
                  stored on IPFS via Pinata.
                </p>
                {state.uploadResult && (
                  <div className="text-xs text-emerald-200/70 space-y-1 pt-2 border-t border-emerald-500/20">
                    <div>IPFS CID: {state.uploadResult.cid}</div>
                    <div>Request ID: #{bounty.id}</div>
                  </div>
                )}
                <div className="flex flex-wrap gap-3 pt-3">
                  {state.submissionResult?.transactionHash && (
                    <a
                      href={`https://calibration.filfox.info/en/tx/${state.submissionResult.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200 hover:bg-emerald-500/20 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Transaction
                    </a>
                  )}
                  {state.uploadResult && (
                    <a
                      href={`https://gateway.pinata.cloud/ipfs/${state.uploadResult.cid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200 hover:bg-emerald-500/20 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View on IPFS
                    </a>
                  )}
                  <button
                    onClick={resetAndClose}
                    className="inline-flex items-center gap-2 rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200 hover:bg-emerald-500/20 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
              <button
                onClick={resetAndClose}
                disabled={isProcessing}
                className="rounded-lg border border-gray-700 px-5 py-2.5 text-sm text-gray-300 hover:bg-gray-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={startSubmissionProcess}
                disabled={submitDisabled}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-400/30 to-blue-500/90 hover:bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] hover:shadow-blue-500/30 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <UploadIcon className="w-4 h-4" />
                    Submit to Request
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SubmissionModal;

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  const value = bytes / Math.pow(1024, exponent);
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[exponent]}`;
}
