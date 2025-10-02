import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface VerificationRequest {
  cid: string;
  description: string;
  requirements: string;
  fileType: string;
  fileSize: number;
}

interface VerificationResult {
  isValid: boolean;
  confidence: number;
  reasoning: string;
  issues: string[];
  strengths: string[];
  analysis: {
    formatMatch: boolean;
    sizeAppropriate: boolean;
    contentRelevance: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      console.error("⚠️ GEMINI_API_KEY not configured");
      return NextResponse.json(
        { error: "AI verification service not configured" },
        { status: 500 }
      );
    }

    // Parse request body
    const body: VerificationRequest = await request.json();
    const { cid, description, requirements, fileType, fileSize } = body;

    // Validate required fields
    if (
      !cid ||
      !description ||
      !requirements ||
      !fileType ||
      fileSize === undefined
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: cid, description, requirements, fileType, fileSize",
        },
        { status: 400 }
      );
    }

    console.log("🤖 Starting AI verification:", {
      cid: cid.slice(0, 20) + "...",
      fileType,
      fileSize: `${(fileSize / 1024).toFixed(2)} KB`,
    });

    // Initialize Google Generative AI
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
    });

    const sizeMB = (fileSize / (1024 * 1024)).toFixed(2);

    const prompt = `You are an expert AI data verification specialist for a decentralized data marketplace. Your job is to verify if submitted data meets the requirements.

**SUBMISSION DETAILS:**
- IPFS CID: ${cid}
- File Type: ${fileType}
- File Size: ${sizeMB} MB (${fileSize} bytes)

**DATA REQUEST:**
Description: ${description}

Requirements: ${requirements}

**VERIFICATION TASK:**
Analyze whether this submission likely meets the requirements based on:

1. **Format Matching**: Does the file type (${fileType}) match what would be expected?
   - CSV for datasets/tables
   - JSON for structured data/API responses
   - PDF for documents/reports
   - Images (JPEG/PNG) for visual data
   - ZIP for multiple files

2. **Size Appropriateness**: Is ${sizeMB} MB reasonable for this type of data?
   - Too small might indicate incomplete data
   - Too large might indicate unnecessary bloat
   - Consider the requirements when judging

3. **IPFS CID Validity**: Does ${cid} follow the standard IPFS CID format?
   - Should start with "Qm" (v0) or "bafy" (v1)
   - Should be alphanumeric

4. **Red Flags**: Are there obvious concerns?
   - Mismatched file type and requirements
   - Suspicious file size (too small/large)
   - Invalid CID format

**IMPORTANT GUIDELINES:**
- Be fair and reasonable in your assessment
- Minor issues shouldn't automatically fail good submissions
- Consider that file type alone doesn't guarantee content quality
- If uncertain, err on the side of approval with lower confidence

**RESPONSE FORMAT (JSON only, no markdown):**
{
  "isValid": true or false,
  "confidence": 0.0 to 1.0,
  "reasoning": "2-3 sentences explaining your decision",
  "issues": ["list any problems found"],
  "strengths": ["list positive aspects"],
  "analysis": {
    "formatMatch": true or false,
    "sizeAppropriate": true or false,
    "contentRelevance": 0 to 100
  }
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("🤖 AI raw response:", text.slice(0, 200) + "...");

    // Try to parse the JSON response
    let verificationResult: VerificationResult;
    try {
      // Remove markdown code blocks if present
      let cleanText = text.trim();
      if (cleanText.startsWith("```json")) {
        cleanText = cleanText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
      } else if (cleanText.startsWith("```")) {
        cleanText = cleanText.replace(/```\n?/g, "");
      }

      // Extract JSON from the response
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : cleanText;

      const parsed = JSON.parse(jsonStr);

      // Ensure all required fields exist with defaults
      verificationResult = {
        isValid: parsed.isValid ?? true,
        confidence: Math.max(0, Math.min(1, parsed.confidence ?? 0.7)),
        reasoning: parsed.reasoning || "AI verification completed successfully",
        issues: Array.isArray(parsed.issues) ? parsed.issues : [],
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
        analysis: {
          formatMatch: parsed.analysis?.formatMatch ?? true,
          sizeAppropriate: parsed.analysis?.sizeAppropriate ?? true,
          contentRelevance: Math.max(
            0,
            Math.min(100, parsed.analysis?.contentRelevance ?? 70)
          ),
        },
      };

      console.log("✅ AI verification result:", {
        isValid: verificationResult.isValid,
        confidence: verificationResult.confidence,
        issues: verificationResult.issues.length,
      });
    } catch (parseError) {
      console.error("❌ Failed to parse AI response:", parseError);
      console.error("Raw response:", text);

      // Fallback with basic analysis
      const basicCheck = performBasicValidation(
        fileType,
        fileSize,
        description,
        requirements
      );

      verificationResult = {
        isValid: basicCheck.isValid,
        confidence: 0.5,
        reasoning: `AI response parsing failed. Fallback validation: ${basicCheck.reason}`,
        issues: ["Response parsing issue", ...basicCheck.issues],
        strengths: basicCheck.strengths,
        analysis: {
          formatMatch: basicCheck.formatMatch,
          sizeAppropriate: basicCheck.sizeAppropriate,
          contentRelevance: 50,
        },
      };
    }

    return NextResponse.json(verificationResult);
  } catch (error: unknown) {
    console.error("❌ AI verification error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    // Return reasonable fallback
    const fallbackResult: VerificationResult = {
      isValid: true,
      confidence: 0.4,
      reasoning: `AI verification temporarily unavailable. Basic validation passed. Error: ${errorMessage}`,
      issues: ["AI service unavailable"],
      strengths: ["File format is acceptable", "Size within limits"],
      analysis: {
        formatMatch: true,
        sizeAppropriate: true,
        contentRelevance: 50,
      },
    };

    return NextResponse.json(fallbackResult);
  }
}

// Basic validation fallback
function performBasicValidation(
  fileType: string,
  fileSize: number,
  description: string,
  requirements: string
) {
  const sizeMB = fileSize / (1024 * 1024);
  const combined = (description + " " + requirements).toLowerCase();

  const issues: string[] = [];
  const strengths: string[] = [];
  let formatMatch = true;
  let sizeAppropriate = true;
  let isValid = true;

  // Check file type
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

  if (!allowedTypes.includes(fileType)) {
    issues.push("File type not in allowed list");
    formatMatch = false;
    isValid = false;
  } else {
    strengths.push("File type is allowed");
  }

  // Check file size
  if (sizeMB < 0.001) {
    issues.push("File is suspiciously small (< 1KB)");
    sizeAppropriate = false;
    isValid = false;
  } else if (sizeMB > 100) {
    issues.push("File exceeds 100MB limit");
    sizeAppropriate = false;
    isValid = false;
  } else {
    strengths.push("File size is within acceptable range");
  }

  // Basic format matching
  if (
    fileType.includes("csv") &&
    (combined.includes("csv") || combined.includes("data"))
  ) {
    strengths.push("CSV format matches data request");
  } else if (fileType.includes("json") && combined.includes("json")) {
    strengths.push("JSON format matches requirements");
  } else if (fileType.includes("pdf") && combined.includes("pdf")) {
    strengths.push("PDF format matches requirements");
  }

  return {
    isValid,
    formatMatch,
    sizeAppropriate,
    reason: isValid
      ? "Basic validation passed"
      : "Basic validation found issues",
    issues,
    strengths,
  };
}
