"use client";
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Link as LinkIcon
} from 'lucide-react';
import { uploadToWeb3Storage, UploadResult } from '../utils/web3storage';
import { verifyDataWithAI, VerificationResult } from '../utils/aiVerification';
import { submitDataToContract, SubmissionResult, checkSubmissionEligibility } from '../utils/contractSubmission';
import { validateFileSubmission, canSubmitToBounty, trackSubmissionAttempt } from '../utils/rateLimiting';
import { checkConnection } from '../utils/contract';

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

type SubmissionStep = 'upload' | 'uploading' | 'verifying' | 'submitting' | 'success' | 'error';

interface SubmissionState {
  step: SubmissionStep;
  file: File | null;
  uploadResult: UploadResult | null;
  verificationResult: VerificationResult | null;
  submissionResult: SubmissionResult | null;
  error: string | null;
  description: string;
}

const SubmissionModal: React.FC<SubmissionModalProps> = ({ 
  isOpen, 
  onClose, 
  bounty, 
  onSuccess 
}) => {
  const [state, setState] = useState<SubmissionState>({
    step: 'upload',
    file: null,
    uploadResult: null,
    verificationResult: null,
    submissionResult: null,
    error: null,
    description: ''
  });

  const walletAddress = checkConnection();

  // Reset state when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setState({
        step: 'upload',
        file: null,
        uploadResult: null,
        verificationResult: null,
        submissionResult: null,
        error: null,
        description: ''
      });
    }
  }, [isOpen, bounty?.id]);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setState(prev => ({ ...prev, file, error: null }));
  }, []);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (!file) return;

    setState(prev => ({ ...prev, file, error: null }));
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  const startSubmissionProcess = async () => {
    if (!state.file || !bounty || !walletAddress) return;

    try {
      // Step 1: Validation
      const validation = validateFileSubmission(
        state.file,
        walletAddress,
        bounty.description,
        bounty.requirements
      );

      if (!validation.isValid) {
        setState(prev => ({ 
          ...prev, 
          step: 'error', 
          error: validation.errors.join('. ') 
        }));
        return;
      }

      // Check submission eligibility
      const eligibilityCheck = canSubmitToBounty(walletAddress, bounty.id);
      if (!eligibilityCheck.canSubmit) {
        setState(prev => ({ 
          ...prev, 
          step: 'error', 
          error: eligibilityCheck.reason || 'Cannot submit to this bounty' 
        }));
        return;
      }

      // Step 2: Upload to IPFS
      setState(prev => ({ ...prev, step: 'uploading' }));
      
      const uploadResult = await uploadToWeb3Storage(state.file);
      setState(prev => ({ ...prev, uploadResult }));

      // Step 3: AI Verification
      setState(prev => ({ ...prev, step: 'verifying' }));
      
      const verificationResult = await verifyDataWithAI(
        uploadResult.cid,
        bounty.description,
        bounty.requirements,
        uploadResult.type,
        uploadResult.size
      );
      
      setState(prev => ({ ...prev, verificationResult }));

      // Check if AI approved
      if (!verificationResult.isApproved) {
        setState(prev => ({ 
          ...prev, 
          step: 'error', 
          error: `AI Verification Failed: ${verificationResult.reason}` 
        }));
        return;
      }

      // Step 4: Submit to Smart Contract
      setState(prev => ({ ...prev, step: 'submitting' }));
      
      // Track submission attempt for rate limiting
      trackSubmissionAttempt(walletAddress, bounty.id);
      
      const submissionResult = await submitDataToContract(
        bounty.id,
        uploadResult.cid,
        state.description || `Data submission for bounty #${bounty.id}`
      );

      setState(prev => ({ ...prev, submissionResult }));

      if (submissionResult.success) {
        setState(prev => ({ ...prev, step: 'success' }));
        onSuccess?.(bounty.id);
      } else {
        setState(prev => ({ 
          ...prev, 
          step: 'error', 
          error: submissionResult.error || 'Blockchain submission failed' 
        }));
      }

    } catch (error: any) {
      console.error('Submission process failed:', error);
      setState(prev => ({ 
        ...prev, 
        step: 'error', 
        error: error.message || 'Submission process failed' 
      }));
    }
  };

  const resetAndClose = () => {
    setState({
      step: 'upload',
      file: null,
      uploadResult: null,
      verificationResult: null,
      submissionResult: null,
      error: null,
      description: ''
    });
    onClose();
  };

  if (!bounty || !isOpen) return null;

  const isProcessing = ['uploading', 'verifying', 'submitting'].includes(state.step);

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
              <p className="text-gray-400 text-sm">Bounty #{bounty.id} • {bounty.bounty} tFIL</p>
            </div>
            <button
              onClick={resetAndClose}
              disabled={isProcessing}
              className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Bounty Info */}
            <div className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <h4 className="text-white font-medium mb-2">Required Data:</h4>
              <p className="text-gray-300 text-sm mb-3">{bounty.description}</p>
              <h4 className="text-white font-medium mb-2">Requirements:</h4>
              <p className="text-gray-300 text-sm">{bounty.requirements}</p>
            </div>