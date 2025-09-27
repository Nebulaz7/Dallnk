// utils/aiVerification.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

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

export const verifyDataWithAI = async (
  cid: string,
  description: string,
  requirements: string,
  fileType: string,
  fileSize: number
): Promise<VerificationResult> => {
  if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
    throw new Error("Gemini API key not configured");
  }

  try {
    const genAI = new GoogleGenerativeAI(
      process.env.NEXT_PUBLIC_GEMINI_API_KEY
    );
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
You are an AI data verification specialist. Analyze this data submission for a bounty request.

SUBMISSION DETAILS:
- IPFS CID: ${cid}
- File Type: ${fileType}
- File Size: ${Math.round((fileSize / 1024 / 1024) * 100) / 100}MB
- Required Description: "${description}"
- Requirements: "${requirements}"

EVALUATION CRITERIA:
1. Format Compatibility: Does the file type match what's typically needed for this request?
2. Size Appropriateness: Is the file size reasonable for the data described?
3. Content Relevance: Based on the CID and metadata, does this seem relevant?
4. Requirements Alignment: Does this submission align with stated requirements?

SCORING (0-100):
- Format Match: Score file type appropriateness
- Content Relevance: Score how relevant this seems to be
- Quality Indicators: Score based on file size and type combination

RESPONSE FORMAT (JSON):
{
  "approved": true/false,
  "confidence": 0-100,
  "reason": "Clear explanation of decision",
  "formatMatch": true/false,
  "contentRelevance": 0-100,
  "qualityScore": 0-100,
  "concerns": ["any concerns or red flags"]
}

DECISION RULES:
- APPROVE if: Format appropriate + Content relevant (>60) + Quality good (>50)
- REJECT if: Wrong format OR Content irrelevant (<40) OR Quality poor (<30)
- Be strict but fair - this is protecting buyers and maintaining marketplace quality.

Provide only the JSON response, no additional text.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Parse AI response
    let aiResponse;
    try {
      // Clean the response to extract JSON
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in AI response");
      }
      aiResponse = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("Failed to parse AI response:", responseText);
      // Fallback analysis
      const isApproved =
        responseText.toLowerCase().includes("approved") ||
        responseText.toLowerCase().includes('"approved": true');
      return {
        isApproved,
        confidence: 50,
        reason: "AI response parsing failed, using fallback analysis",
        analysis: {
          formatMatch: true,
          contentRelevance: 50,
          qualityScore: 50,
        },
      };
    }

    return {
      isApproved: aiResponse.approved,
      confidence: Math.max(0, Math.min(100, aiResponse.confidence || 50)),
      reason: aiResponse.reason || "No reason provided",
      analysis: {
        formatMatch: aiResponse.formatMatch || false,
        contentRelevance: Math.max(
          0,
          Math.min(100, aiResponse.contentRelevance || 0)
        ),
        qualityScore: Math.max(0, Math.min(100, aiResponse.qualityScore || 0)),
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
      reason: `AI verification unavailable. Basic checks: Format ${
        formatMatch ? "OK" : "FAIL"
      }, Size ${sizeAppropriate ? "OK" : "FAIL"}`,
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
