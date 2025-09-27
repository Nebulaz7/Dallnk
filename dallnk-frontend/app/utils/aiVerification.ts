// utils/aiVerification.ts

export interface VerificationResult {
  isApproved: boolean;
  confidence: number;
  reason: string;
  analysis: {
    formatMatch: boolean;
    contentRelevance: number;
    qualityScore: number;
  };
}

const allowedTypes = [
  "text/csv",
  "application/json",
  "text/plain",
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/zip",
  "application/x-zip-compressed",
];
const maxSize = 100 * 1024 * 1024; // 100MB

export const verifyDataWithAI = async (
  cid: string,
  description: string,
  requirements: string,
  fileType: string,
  fileSize: number
): Promise<VerificationResult> => {
  try {
    // Call our secure server-side API route
    const response = await fetch("/api/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cid,
        requirements: `${description} - ${requirements}`,
        fileType,
        fileSize,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const apiResult = await response.json();

    // If there's an error from the API
    if (apiResult.error) {
      throw new Error(apiResult.error);
    }

    // Convert API response format to our expected format
    return {
      isApproved: apiResult.isValid,
      confidence: Math.max(0, Math.min(100, apiResult.confidence * 100 || 50)),
      reason: apiResult.reasoning || "No reason provided",
      analysis: {
        formatMatch: !apiResult.issues?.includes("Wrong format"),
        contentRelevance: apiResult.confidence * 100 || 50,
        qualityScore: apiResult.isValid ? 70 : 30,
      },
    };
  } catch (error) {
    console.error("AI verification failed:", error);

    // Provide fallback verification based on basic checks
    const formatMatch = checkBasicFormat(fileType, description, requirements);
    const sizeAppropriate = checkFileSize(fileSize, requirements);

    return {
      isApproved: formatMatch && sizeAppropriate,
      confidence: 30, // Low confidence for fallback
      reason: `AI verification unavailable: ${
        error instanceof Error ? error.message : "Unknown error"
      }. Basic checks: Format ${formatMatch ? "OK" : "FAIL"}, Size ${
        sizeAppropriate ? "OK" : "FAIL"
      }`,
      analysis: {
        formatMatch,
        contentRelevance: 40,
        qualityScore: sizeAppropriate ? 60 : 20,
      },
    };
  }
};

// Fallback verification functions
const checkBasicFormat = (
  fileType: string,
  description: string,
  requirements: string
): boolean => {
  const desc = (description + " " + requirements).toLowerCase();

  // Basic format matching
  if (fileType.includes("csv") && desc.includes("csv")) return true;
  if (fileType.includes("json") && desc.includes("json")) return true;
  if (
    fileType.includes("image") &&
    (desc.includes("image") || desc.includes("photo"))
  )
    return true;
  if (fileType.includes("pdf") && desc.includes("pdf")) return true;

  // General data files
  if (fileType.includes("csv") || fileType.includes("json")) {
    return desc.includes("data") || desc.includes("dataset");
  }

  return true; // Default to true for unknown combinations
};

const checkFileSize = (size: number, requirements: string): boolean => {
  const req = requirements.toLowerCase();
  const sizeMB = size / (1024 * 1024);

  // Very basic size checks
  if (sizeMB < 0.001) return false; // Too small (less than 1KB)
  if (sizeMB > 500) return false; // Too large (more than 500MB)

  // If requirements mention size expectations
  if (req.includes("large") && sizeMB < 1) return false;
  if (req.includes("small") && sizeMB > 10) return false;

  return true;
};
