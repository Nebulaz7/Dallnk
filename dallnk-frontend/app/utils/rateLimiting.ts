// utils/rateLimiting.ts
interface RateLimitStore {
  [key: string]: {
    requests: number;
    resetTime: number;
  };
}

class RateLimiter {
  private store: RateLimitStore = {};
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 5, windowMs: number = 60000) {
    // 5 requests per minute
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const key = identifier.toLowerCase();

    if (!this.store[key]) {
      this.store[key] = {
        requests: 1,
        resetTime: now + this.windowMs,
      };
      return true;
    }

    const record = this.store[key];

    // Reset if window has passed
    if (now > record.resetTime) {
      record.requests = 1;
      record.resetTime = now + this.windowMs;
      return true;
    }

    // Check if within limits
    if (record.requests >= this.maxRequests) {
      return false;
    }

    record.requests++;
    return true;
  }

  getRemainingRequests(identifier: string): number {
    const key = identifier.toLowerCase();
    const record = this.store[key];

    if (!record || Date.now() > record.resetTime) {
      return this.maxRequests;
    }

    return Math.max(0, this.maxRequests - record.requests);
  }

  getResetTime(identifier: string): number {
    const key = identifier.toLowerCase();
    const record = this.store[key];

    if (!record || Date.now() > record.resetTime) {
      return 0;
    }

    return record.resetTime;
  }
}

// Global rate limiters
export const uploadRateLimiter = new RateLimiter(3, 300000); // 3 uploads per 5 minutes
export const verificationRateLimiter = new RateLimiter(10, 60000); // 10 verifications per minute
export const submissionRateLimiter = new RateLimiter(5, 600000); // 5 submissions per 10 minutes
export const requestCreationRateLimiter = new RateLimiter(5, 300000); // 5 request creations per 5 minutes

export const validateFileSubmission = (
  file: File,
  walletAddress: string,
  requestId: string
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Wallet validation
  if (!walletAddress || !walletAddress.startsWith("0x")) {
    errors.push("Valid wallet connection required");
  }

  // Request ID validation
  if (!requestId || requestId === "0") {
    errors.push("Invalid request ID");
  }

  // File validation
  if (!file) {
    errors.push("File is required");
  } else {
    // File size check (max 100MB)
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      errors.push("File size exceeds 100MB limit");
    }

    // File size minimum (1KB)
    if (file.size < 1024) {
      errors.push("File too small (minimum 1KB)");
    }

    // File type validation
    const allowedTypes = [
      "text/csv",
      "application/json",
      "text/plain",
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/zip",
      "application/x-zip-compressed",
      "text/xml",
      "application/xml",
    ];

    if (!allowedTypes.includes(file.type)) {
      errors.push(
        `File type ${file.type} not supported. Allowed: CSV, JSON, TXT, PDF, JPG, PNG, ZIP, XML`
      );
    }
  }

  // Rate limiting check
  if (!uploadRateLimiter.isAllowed(walletAddress)) {
    const resetTime = uploadRateLimiter.getResetTime(walletAddress);
    const minutes = Math.ceil((resetTime - Date.now()) / 60000);
    errors.push(
      `Upload rate limit exceeded. Try again in ${minutes} minute(s)`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateDataRequest = (
  description: string,
  requirements: string,
  bountyInFIL: string,
  walletAddress: string
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Wallet validation
  if (!walletAddress || !walletAddress.startsWith("0x")) {
    errors.push("Valid wallet connection required");
  }

  // Description validation
  if (!description || description.trim().length < 10) {
    errors.push("Description must be at least 10 characters");
  }

  if (description && description.trim().length > 500) {
    errors.push("Description must not exceed 500 characters");
  }

  // Requirements validation
  if (!requirements || requirements.trim().length < 10) {
    errors.push("Requirements must be at least 10 characters");
  }

  if (requirements && requirements.trim().length > 1000) {
    errors.push("Requirements must not exceed 1000 characters");
  }

  // Bounty validation
  if (!bountyInFIL || parseFloat(bountyInFIL) <= 0) {
    errors.push("Bounty must be greater than 0 tFIL");
  }

  if (bountyInFIL && parseFloat(bountyInFIL) < 0.001) {
    errors.push("Minimum bounty is 0.001 tFIL");
  }

  // Rate limiting check
  if (!requestCreationRateLimiter.isAllowed(walletAddress)) {
    const resetTime = requestCreationRateLimiter.getResetTime(walletAddress);
    const minutes = Math.ceil((resetTime - Date.now()) / 60000);
    errors.push(
      `Request creation rate limit exceeded. Try again in ${minutes} minute(s)`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const canSubmitToRequest = (
  walletAddress: string,
  requestId: string
): { canSubmit: boolean; reason?: string } => {
  if (!walletAddress) {
    return { canSubmit: false, reason: "Wallet not connected" };
  }

  if (!requestId || requestId === "0") {
    return { canSubmit: false, reason: "Invalid request ID" };
  }

  if (!submissionRateLimiter.isAllowed(`${walletAddress}-${requestId}`)) {
    const resetTime = submissionRateLimiter.getResetTime(
      `${walletAddress}-${requestId}`
    );
    const minutes = Math.ceil((resetTime - Date.now()) / 60000);
    return {
      canSubmit: false,
      reason: `Submission rate limit exceeded for this request. Try again in ${minutes} minute(s)`,
    };
  }

  return { canSubmit: true };
};

export const trackSubmissionAttempt = (
  walletAddress: string,
  requestId: string
): void => {
  submissionRateLimiter.isAllowed(`${walletAddress}-${requestId}`);
};
