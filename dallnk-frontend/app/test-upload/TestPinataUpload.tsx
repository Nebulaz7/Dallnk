"use client";

import { useState } from "react";
import { uploadToStoracha } from "../utils/storacha";

export default function TestPinataUpload() {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTestUpload = async () => {
    try {
      setUploading(true);
      setError(null);
      setResult(null);

      // Create a test file
      const testContent = JSON.stringify({
        message: "Test upload from dallnk marketplace",
        timestamp: new Date().toISOString(),
        uploader: "Nebulaz7",
      });

      const testFile = new File([testContent], "test-upload.json", {
        type: "application/json",
      });

      console.log("🧪 Starting test upload...");
      const uploadResult = await uploadToStoracha(testFile);

      console.log("✅ Test successful:", uploadResult);
      setResult(uploadResult);

      // Show success notification
      alert(
        `✅ Upload Successful!\n\nCID: ${uploadResult.cid}\n\nYou can view it at:\nhttps://gateway.pinata.cloud/ipfs/${uploadResult.cid}`
      );
    } catch (err) {
      console.error("❌ Test failed:", err);
      setError(err instanceof Error ? err.message : "Upload failed");
      alert(`❌ Upload Failed: ${err}`);
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setError(null);
      setResult(null);

      console.log("📤 Uploading:", file.name);
      const uploadResult = await uploadToStoracha(file);

      console.log("✅ Upload successful:", uploadResult);
      setResult(uploadResult);

      alert(
        `✅ Upload Successful!\n\nFile: ${file.name}\nCID: ${uploadResult.cid}\n\nView at:\nhttps://gateway.pinata.cloud/ipfs/${uploadResult.cid}`
      );
    } catch (err) {
      console.error("❌ Upload failed:", err);
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto border rounded-lg bg-white shadow-lg">
      <h2 className="text-2xl font-bold mb-4">🧪 Test Pinata Upload</h2>

      <div className="space-y-4">
        {/* Test JSON Upload */}
        <div>
          <button
            onClick={handleTestUpload}
            disabled={uploading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {uploading ? "Uploading..." : "Test Upload (JSON)"}
          </button>
          <p className="text-sm text-gray-600 mt-2">
            Creates and uploads a test JSON file
          </p>
        </div>

        {/* File Upload */}
        <div>
          <label className="block">
            <span className="text-sm font-medium text-gray-700 mb-2 block">
              Or upload your own file:
            </span>
            <input
              type="file"
              onChange={handleFileUpload}
              disabled={uploading}
              accept=".json,.csv,.txt,.pdf,.jpg,.jpeg,.png,.zip"
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
            />
          </label>
        </div>

        {/* Results */}
        {result && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">
              ✅ Upload Successful!
            </h3>
            <div className="text-sm space-y-1">
              <p>
                <strong>CID:</strong>{" "}
                <code className="bg-white px-2 py-1 rounded">{result.cid}</code>
              </p>
              <p>
                <strong>Size:</strong> {result.size} bytes
              </p>
              <p>
                <strong>Type:</strong> {result.type}
              </p>
              <a
                href={`https://gateway.pinata.cloud/ipfs/${result.cid}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                View on IPFS Gateway →
              </a>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-2">
              ❌ Upload Failed
            </h3>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Uploading State */}
        {uploading && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800">⏳ Uploading to Pinata IPFS...</p>
          </div>
        )}
      </div>
    </div>
  );
}
