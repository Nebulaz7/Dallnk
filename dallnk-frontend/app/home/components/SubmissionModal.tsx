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
} from "lucide-react";
import { uploadToWeb3Storage, UploadResult } from "../../utils/web3storage";
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
  canSubmitToBounty,
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
      const validation = validateFileSubmission(
        state.file,
        walletAddress,
        bounty.description,
        bounty.requirements
      );

      if (!validation.isValid) {
        setState((prev) => ({
          ...prev,
          step: "error",
          error: validation.errors.join(". "),
        }));
        return;
      }

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

      const directEligibility = canSubmitToBounty(walletAddress, bounty.id);
      if (!directEligibility.canSubmit) {
        setState((prev) => ({
          ...prev,
          step: "error",
          error:
            directEligibility.reason ||
            "Cannot submit to this bounty right now.",
        }));
        return;
      }

      setState((prev) => ({ ...prev, step: "uploading", error: null }));

      const uploadResult = await uploadToWeb3Storage(state.file);
      setState((prev) => ({ ...prev, uploadResult }));

      setState((prev) => ({ ...prev, step: "verifying" }));

      const verificationResult = await verifyDataWithAI(
        uploadResult.cid,
        bounty.description,
        bounty.requirements,
        uploadResult.type,
        uploadResult.size
      );

      setState((prev) => ({ ...prev, verificationResult }));

      if (!verificationResult.isApproved) {
        setState((prev) => ({
          ...prev,
          step: "error",
          error: `AI Verification Failed: ${verificationResult.reason}`,
        }));
        return;
      }

      setState((prev) => ({ ...prev, step: "submitting" }));

      trackSubmissionAttempt(walletAddress, bounty.id);

      const submissionResult = await submitDataToContract(
        bounty.id,
        uploadResult.cid,
        state.description || `Data submission for bounty #${bounty.id}`
      );

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
      console.error("Submission process failed:", error);
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
        label: "Processing File",
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
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <div>
              <h3 className="text-xl font-bold text-white">Submit Data</h3>
              <p className="text-gray-400 text-sm">
                Bounty #{bounty.id} • {bounty.bounty} tFIL
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
            <div className="flex flex-wrap items-center gap-2 bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              {steps.map((step, index) => {
                const isActive = index <= currentStepIndex;
                return (
                  <React.Fragment key={step.id}>
                    <div
                      className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs border transition-colors ${
                        isActive
                          ? "bg-blue-500/20 text-blue-300 border-blue-400/30"
                          : "bg-gray-800 text-gray-500 border-gray-700"
                      }`}
                    >
                      {step.icon}
                      {step.label}
                    </div>
                    {index < steps.length - 1 && (
                      <div className="w-4 h-px bg-gray-700/70" />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

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

            {!walletAddress && (
              <div className="flex items-center gap-2 bg-amber-500/10 text-amber-300 border border-amber-400/30 rounded-lg px-4 py-3 text-sm">
                <AlertCircle className="w-4 h-4" />
                Connect your wallet to continue.
              </div>
            )}

            <div className="space-y-4">
              <label className="block text-sm font-semibold text-white">
                Submission Notes (optional)
              </label>
              <textarea
                value={state.description}
                onChange={handleDescriptionChange}
                rows={3}
                disabled={isProcessing}
                placeholder="Add context or metadata for reviewers..."
                className="w-full resize-none rounded-lg border border-gray-700 bg-gray-900/70 px-4 py-3 text-sm text-gray-200 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-60"
              />
            </div>

            <div
              className={`rounded-2xl border-2 border-dashed transition-colors ${
                isDragging
                  ? "border-blue-400 bg-blue-500/5"
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
                    CSV, JSON, ZIP, PDF or images up to 100&nbsp;MB
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

            {state.file && (
              <div className="rounded-xl border border-gray-700 bg-gray-900/60 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium">
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
                    className="text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50"
                    title="Remove file"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {state.uploadResult && (
                  <div className="mt-4 rounded-lg border border-blue-500/30 bg-blue-500/5 p-3 text-xs text-blue-200 space-y-1">
                    <div className="flex items-center gap-2">
                      <LinkIcon className="w-4 h-4" />
                      <span>IPFS CID: {state.uploadResult.cid}</span>
                    </div>
                    <div>Type: {state.uploadResult.type}</div>
                    <div>Size: {formatBytes(state.uploadResult.size)}</div>
                  </div>
                )}

                {state.verificationResult && (
                  <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-xs text-emerald-200 space-y-1">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      <span>AI Verification Passed</span>
                    </div>
                    {state.verificationResult.confidence !== undefined && (
                      <div>
                        Confidence Score:{" "}
                        {Math.round(state.verificationResult.confidence * 100)}%
                      </div>
                    )}
                    {state.verificationResult.reason && (
                      <div>{state.verificationResult.reason}</div>
                    )}
                  </div>
                )}

                {state.step === "submitting" && (
                  <div className="mt-4 rounded-lg border border-indigo-500/30 bg-indigo-500/5 p-3 text-xs text-indigo-200 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Broadcasting transaction on-chain...
                  </div>
                )}
              </div>
            )}

            {state.step === "error" && state.error && (
              <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300 space-y-3">
                <div className="flex items-center gap-2 font-semibold">
                  <AlertCircle className="w-4 h-4" />
                  Submission Failed
                </div>
                <p className="text-red-200/80">{state.error}</p>
                <button
                  onClick={handleRetry}
                  className="inline-flex items-center gap-2 text-xs text-red-200 hover:text-red-100 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  Try Again
                </button>
              </div>
            )}

            {state.step === "success" && (
              <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 space-y-3">
                <div className="flex items-center gap-2 text-emerald-300 font-semibold">
                  <CheckCircle className="w-5 h-5" />
                  Submission Successful
                </div>
                <p className="text-sm text-emerald-100/80">
                  Your data has been submitted and is pending requester review.
                </p>
                {state.submissionResult && (
                  <pre className="max-h-48 overflow-y-auto rounded-lg bg-black/40 p-3 text-xs text-emerald-200/80">
                    {JSON.stringify(state.submissionResult, null, 2)}
                  </pre>
                )}
                <div className="flex flex-wrap gap-3 pt-2">
                  {state.submissionResult &&
                  state.submissionResult.success &&
                  state.submissionResult.transactionHash ? (
                    <a
                      href={`https://calibration.filfox.info/en/tx/${state.submissionResult.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200 hover:bg-emerald-500/20 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View transaction
                    </a>
                  ) : null}
                  <button
                    onClick={resetAndClose}
                    className="inline-flex items-center gap-2 rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200 hover:bg-emerald-500/20 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
              <button
                onClick={resetAndClose}
                disabled={isProcessing}
                className="rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 transition-colors disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={startSubmissionProcess}
                disabled={submitDisabled}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-blue-500/20 transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <UploadIcon className="w-4 h-4" />
                    Submit to bounty
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
