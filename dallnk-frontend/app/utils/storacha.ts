// utils/storacha.ts - Now using Pinata via API route
export interface UploadResult {
  cid: string;
  size: number;
  type: string;
}

export const uploadToStoracha = async (file: File): Promise<UploadResult> => {
  // Validate file
  if (!file) {
    throw new Error("No file provided");
  }

  // Check file size (max 100MB)
  const maxSize = 100 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error("File too large. Maximum size is 100MB");
  }

  // Allowed file types
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

  if (!allowedTypes.includes(file.type)) {
    throw new Error(`File type ${file.type} not allowed`);
  }

  try {
    console.log("📤 Uploading file:", file.name, file.size, "bytes");

    // Upload via YOUR server API route
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Upload failed");
    }

    const result = await response.json();

    console.log("✅ Upload successful!");
    console.log("   CID:", result.cid);
    console.log("   Gateway:", result.gatewayUrl);

    return {
      cid: result.cid,
      size: result.size,
      type: result.type,
    };
  } catch (error) {
    console.error("❌ Upload failed:", error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Failed to upload file to IPFS");
  }
};

// Keep backward compatibility
export const uploadToWeb3Storage = uploadToStoracha;

export const getFileFromIPFS = async (cid: string): Promise<Blob> => {
  try {
    console.log("📥 Fetching from IPFS:", cid);

    // Try Pinata gateway first
    const response = await fetch(`https://gateway.pinata.cloud/ipfs/${cid}`);

    if (!response.ok) {
      // Fallback to public gateway
      console.log("   Trying fallback gateway...");
      const fallbackResponse = await fetch(`https://ipfs.io/ipfs/${cid}`);

      if (!fallbackResponse.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }

      console.log("✅ File retrieved (via fallback gateway)");
      return fallbackResponse.blob();
    }

    console.log("✅ File retrieved successfully");
    return response.blob();
  } catch (error) {
    console.error("❌ Failed to fetch from IPFS:", error);
    throw new Error(`Failed to fetch file from IPFS: ${error}`);
  }
};
