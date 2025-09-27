// utils/web3storage.ts
export interface UploadResult {
  cid: string;
  size: number;
  type: string;
}

export const uploadToWeb3Storage = async (
  file: File
): Promise<UploadResult> => {
  if (!process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN) {
    throw new Error("Web3.Storage token not configured");
  }

  // Validate file
  if (!file) {
    throw new Error("No file provided");
  }

  // Check file size (max 100MB for hackathon)
  const maxSize = 100 * 1024 * 1024; // 100MB
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
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("https://api.web3.storage/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Upload failed: ${errorData.message || response.statusText}`
      );
    }

    const result = await response.json();

    return {
      cid: result.cid,
      size: file.size,
      type: file.type,
    };
  } catch (error) {
    if (error instanceof Error) {
      console.error("Upload failed:", error.message);
    } else {
      console.error("Upload failed:", error);
    }
    throw error;
  }
};

export const getFileFromIPFS = async (cid: string): Promise<Blob> => {
  const response = await fetch(`https://w3s.link/ipfs/${cid}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch file from IPFS: ${response.statusText}`);
  }
  return response.blob();
};
