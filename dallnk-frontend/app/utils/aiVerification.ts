export interface VerificationResult {
  isApproved: boolean;
  confidence: number;
  reason: string;
  analysis: {
    formatMatch: boolean;
    contentRelevance: number;
    qualityScore: number;
  };
  issues?: string[];
  strengths?: string[];
}

const allowedTypes = [
  "text/csv",
  "text/txt",
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
    console.log("🔍 Starting AI verification...");
    console.log("📄 File details:", {
      type: fileType,
      size: `${(fileSize / 1024).toFixed(2)} KB`,
      cid: cid.slice(0, 20) + "...",
    });

    // Pre-validation checks
    if (!allowedTypes.includes(fileType)) {
      return {
        isApproved: false,
        confidence: 0,
        reason: `File type ${fileType} is not allowed. Accepted types: CSV, JSON, PDF, Images, ZIP, TXT`,
        analysis: {
          formatMatch: false,
          contentRelevance: 0,
          qualityScore: 0,
        },
        issues: [`File type ${fileType} not allowed`],
        strengths: [],
      };
    }

    if (fileSize > maxSize) {
      return {
        isApproved: false,
        confidence: 0,
        reason: `File size ${(fileSize / (1024 * 1024)).toFixed(
          2
        )}MB exceeds maximum of 100MB`,
        analysis: {
          formatMatch: true,
          contentRelevance: 0,
          qualityScore: 0,
        },
        issues: ["File too large"],
        strengths: [],
      };
    }

    if (fileSize < 100) {
      return {
        isApproved: false,
        confidence: 0,
        reason: "File is suspiciously small (< 100 bytes)",
        analysis: {
          formatMatch: true,
          contentRelevance: 0,
          qualityScore: 0,
        },
        issues: ["File too small"],
        strengths: [],
      };
    }

    // Call AI verification API
    console.log("🤖 Calling AI verification API...");
    const response = await fetch("/api/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cid,
        description,
        requirements,
        fileType,
        fileSize,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ API request failed:", response.status, errorText);
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const apiResult = await response.json();
    console.log("✅ AI verification result:", apiResult);

    // Handle API error responses
    if (apiResult.error) {
      throw new Error(apiResult.error);
    }

    // Convert API response to our format
    const result: VerificationResult = {
      isApproved: apiResult.isValid,
      confidence: Math.round(
        Math.max(0, Math.min(100, apiResult.confidence * 100))
      ),
      reason: apiResult.reasoning || "AI verification completed",
      analysis: {
        formatMatch: apiResult.analysis?.formatMatch ?? true,
        contentRelevance: Math.round(
          apiResult.analysis?.contentRelevance ?? 70
        ),
        qualityScore: apiResult.isValid ? 75 : 35,
      },
      issues: apiResult.issues || [],
      strengths: apiResult.strengths || [],
    };

    console.log("✅ Verification complete:", {
      approved: result.isApproved,
      confidence: result.confidence + "%",
      issues: result.issues?.length || 0,
    });

    return result;
  } catch (error) {
    console.error("❌ AI verification error:", error);

    // Perform basic fallback validation
    const basicValidation = performBasicFallbackValidation(
      fileType,
      fileSize,
      description,
      requirements
    );

    return {
      isApproved: basicValidation.isValid,
      confidence: 40, // Low confidence for fallback
      reason: `AI verification unavailable. Fallback validation: ${
        basicValidation.reason
      }. Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      analysis: {
        formatMatch: basicValidation.formatMatch,
        contentRelevance: 50,
        qualityScore: basicValidation.isValid ? 60 : 20,
      },
      issues: basicValidation.issues,
      strengths: basicValidation.strengths,
    };
  }
};

// Fallback validation when AI is unavailable
function performBasicFallbackValidation(
  fileType: string,
  fileSize: number,
  description: string,
  requirements: string
) {
  const combined = (description + " " + requirements).toLowerCase();
  const sizeMB = fileSize / (1024 * 1024);

  let formatMatch = true;
  let isValid = true;
  const issues: string[] = [];
  const strengths: string[] = [];

  // Format checks
  if (fileType.includes("csv")) {
    if (
      combined.includes("csv") ||
      combined.includes("data") ||
      combined.includes("dataset")
    ) {
      strengths.push("CSV format matches request");
    } else {
      issues.push("CSV format may not match requirements");
      formatMatch = false;
    }
  } else if (fileType.includes("json")) {
    if (
      combined.includes("json") ||
      combined.includes("api") ||
      combined.includes("structured")
    ) {
      strengths.push("JSON format appropriate");
    } else {
      issues.push("JSON format may not match requirements");
      formatMatch = false;
    }
  } else if (fileType.includes("pdf")) {
    if (
      combined.includes("pdf") ||
      combined.includes("document") ||
      combined.includes("report")
    ) {
      strengths.push("PDF format matches request");
    }
  } else if (fileType.includes("image")) {
    if (
      combined.includes("image") ||
      combined.includes("photo") ||
      combined.includes("picture")
    ) {
      strengths.push("Image format appropriate");
    }
  }

  // Size checks
  if (sizeMB < 0.001) {
    issues.push("File suspiciously small");
    isValid = false;
  } else if (sizeMB > 0.01 && sizeMB < 50) {
    strengths.push("File size reasonable");
  } else if (sizeMB > 50) {
    issues.push("File is quite large");
  }

  // Overall validation
  if (issues.length > strengths.length) {
    isValid = false;
  }

  return {
    isValid,
    formatMatch,
    reason: isValid
      ? "Basic validation passed"
      : `Validation concerns: ${issues.join(", ")}`,
    issues,
    strengths,
  };
}
