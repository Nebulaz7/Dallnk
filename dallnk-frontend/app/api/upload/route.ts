import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Get the file from the request
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file size (max 100MB)
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 100MB" },
        { status: 400 }
      );
    }

    // Validate file type
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
      return NextResponse.json(
        { error: `File type ${file.type} not allowed` },
        { status: 400 }
      );
    }

    // Check if Pinata JWT is configured
    const pinataJWT = process.env.PINATA_JWT;
    if (!pinataJWT) {
      console.error("PINATA_JWT not found in environment variables");
      return NextResponse.json(
        { error: "Storage service not configured" },
        { status: 500 }
      );
    }

    console.log("📤 Uploading to Pinata:", file.name, file.size, "bytes");

    // Prepare form data for Pinata
    const pinataFormData = new FormData();
    pinataFormData.append("file", file);

    // Optional: Add metadata
    const metadata = JSON.stringify({
      name: file.name,
      keyvalues: {
        uploadedAt: new Date().toISOString(),
        marketplace: "dallnk",
      },
    });
    pinataFormData.append("pinataMetadata", metadata);

    // Optional: Pin options
    const options = JSON.stringify({
      cidVersion: 1,
    });
    pinataFormData.append("pinataOptions", options);

    // Upload to Pinata
    const pinataResponse = await fetch(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${pinataJWT}`,
        },
        body: pinataFormData,
      }
    );

    if (!pinataResponse.ok) {
      const errorText = await pinataResponse.text();
      console.error("Pinata upload failed:", pinataResponse.status, errorText);
      return NextResponse.json(
        { error: "Upload to IPFS failed" },
        { status: 500 }
      );
    }

    const result = await pinataResponse.json();
    const cid = result.IpfsHash;

    console.log("✅ Upload successful!");
    console.log("   CID:", cid);
    console.log("   Size:", result.PinSize, "bytes");
    console.log("   Timestamp:", result.Timestamp);

    return NextResponse.json({
      success: true,
      cid: cid,
      size: file.size,
      type: file.type,
      gatewayUrl: `https://gateway.pinata.cloud/ipfs/${cid}`,
      timestamp: result.Timestamp,
    });
  } catch (error) {
    console.error("❌ Upload error:", error);
    return NextResponse.json(
      {
        error: "Upload failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Optional: Add a GET endpoint to check API health
export async function GET() {
  const isConfigured = !!process.env.PINATA_JWT;

  return NextResponse.json({
    status: "ok",
    configured: isConfigured,
    service: "Pinata IPFS",
  });
}
