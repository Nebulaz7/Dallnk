"use client";
import { useState, useEffect } from "react";
import {
  connectWallet,
  announceDataRequest,
  getActiveRequests,
} from "../utils/contract";

interface DataRequest {
  id: string;
  description: string;
  bounty: string;
  requester: string;
  ipfsHash: string;
  isVerified: boolean;
  isPaid: boolean;
}

export default function AnnounceDataRequest() {
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [requirements, setRequirements] = useState<string>("");
  const [bounty, setBounty] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [activeRequests, setActiveRequests] = useState<DataRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState<boolean>(false);

  const handleConnect = async () => {
    try {
      setLoading(true);
      const address = await connectWallet();
      setWalletAddress(address);

      // Load active requests after connecting
      await loadActiveRequests();
    } catch (error) {
      alert(
        "Failed to connect wallet. Make sure you have MetaMask installed and are on Filecoin Calibration testnet."
      );
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadActiveRequests = async () => {
    try {
      setLoadingRequests(true);
      const requests = await getActiveRequests();
      setActiveRequests(requests);
    } catch (error) {
      console.error("Failed to load requests:", error);
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletAddress) {
      alert("Please connect your wallet first");
      return;
    }

    if (!description.trim() || !requirements.trim() || !bounty.trim()) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      await announceDataRequest(description, requirements, bounty);
      alert("Data request announced successfully!");

      // Clear form
      setDescription("");
      setRequirements("");
      setBounty("");

      // Reload active requests
      await loadActiveRequests();
    } catch (error: any) {
      alert(`Failed to announce data request: ${error.message}`);
      console.error(error);
    }
    setLoading(false);
  };

  // Load active requests on component mount
  useEffect(() => {
    loadActiveRequests();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Announce Data Request Form */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            Request Data
          </h2>

          {!walletAddress ? (
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Connect your wallet to start requesting data
              </p>
              <button
                onClick={handleConnect}
                disabled={loading}
                className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
              >
                {loading ? "Connecting..." : "Connect Wallet"}
              </button>
              <p className="text-sm text-gray-500 mt-2">
                Make sure you're on Filecoin Calibration testnet
              </p>
            </div>
          ) : (
            <div>
              <div className="mb-4 p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-600">
                  ✅ Wallet Connected: {walletAddress.slice(0, 6)}...
                  {walletAddress.slice(-4)}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Data Description *
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe the data you need (e.g., Customer demographics for ML training)"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Requirements *
                  </label>
                  <textarea
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Format, size, quality requirements (e.g., CSV format, 10,000+ records, verified emails)"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Bounty (tFIL) *
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    min="0.001"
                    value={bounty}
                    onChange={(e) => setBounty(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.1"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Amount in test FIL to pay for the data
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {loading ? "Announcing..." : "Announce Data Request"}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Active Requests List */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              Active Requests
            </h2>
            <button
              onClick={loadActiveRequests}
              disabled={loadingRequests}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              {loadingRequests ? "↻" : "Refresh"}
            </button>
          </div>

          {loadingRequests ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading requests...</p>
            </div>
          ) : activeRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No active data requests yet.</p>
              <p className="text-sm mt-2">Be the first to request data!</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {activeRequests.map((request) => (
                <div
                  key={request.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-800">
                      Request #{request.id}
                    </h3>
                    <span className="text-lg font-bold text-green-600">
                      {request.bounty} tFIL
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mb-2">
                    {request.description}
                  </p>

                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="px-2 py-1 bg-gray-100 rounded-full">
                      By: {request.requester.slice(0, 6)}...
                      {request.requester.slice(-4)}
                    </span>

                    {request.ipfsHash && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                        Data Submitted
                      </span>
                    )}

                    {request.isVerified && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full">
                        Verified ✓
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
