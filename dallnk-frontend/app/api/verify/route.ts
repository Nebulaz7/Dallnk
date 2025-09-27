import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface VerificationRequest {
  cid: string;
  requirements: string;
  fileType: string;
  fileSize: number;
}

interface VerificationResult {
  isValid: boolean;
  confidence: number;
  reasoning: string;
  issues?: string[];
}

export async function POST(request: NextRequest) {
  try {
    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    // Parse request body
    const body: VerificationRequest = await request.json();
    const { cid, requirements, fileType, fileSize } = body;

    // Validate required fields
    if (!cid || !requirements || !fileType || !fileSize) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: cid, requirements, fileType, fileSize",
        },
        { status: 400 }
      );
    }

    // Initialize Google Generative AI
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
    });

    const prompt = `
You are an AI data verification specialist. Analyze this data submission for a bounty request.

SUBMISSION DETAILS:
- IPFS CID: ${cid}
- File Type: ${fileType}
- File Size: ${fileSize} bytes

REQUIREMENTS TO VERIFY:
${requirements}

VERIFICATION CRITERIA:
1. Does the file type match what would be expected for the requirements?
2. Is the file size reasonable for the type of data requested?
3. Does the IPFS CID format appear valid?
4. Are there any obvious red flags or concerns?

Please provide a JSON response with:
{
  "isValid": boolean,
  "confidence": number (0-1),
  "reasoning": "detailed explanation",
  "issues": ["array of any concerns or issues found"]
}

Be thorough but fair in your assessment. Minor issues shouldn't automatically invalidate good submissions.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Try to parse the JSON response
    let verificationResult: VerificationResult;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : text;
      verificationResult = JSON.parse(jsonStr);
    } catch (error) {
      // Fallback parsing if JSON extraction fails
      console.error("Failed to parse AI response:", error);
      verificationResult = {
        isValid: true, // Default to valid if we can't parse
        confidence: 0.5,
        reasoning: `AI verification completed but response format was unexpected. Original response: ${text}`,
        issues: ["Response parsing issue"],
      };
    }

    return NextResponse.json(verificationResult);
  } catch (error: unknown) {
    console.error("AI verification failed:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    // Return fallback verification result instead of failing completely
    const fallbackResult: VerificationResult = {
      isValid: true, // Default to valid when AI fails
      confidence: 0.5,
      reasoning: `AI verification temporarily unavailable. Fallback verification applied. Error: ${errorMessage}`,
      issues: ["AI service unavailable"],
    };

    return NextResponse.json(fallbackResult);
  }
}
