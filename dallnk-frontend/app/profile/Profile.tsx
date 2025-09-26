"use client";

import React, { useState, useEffect } from "react";
import { ExternalLink, Gift, Clock, User, FileText, Coins } from "lucide-react";
import { checkConnection } from "../utils/contract";
import { ethers } from "ethers";

const CONTRACT_ADDRESS = "0x28791bF1c9F1F4385831236A53204dD90A1DEFAA";
const CONTRACT_ABI = [
  {
    inputs: [
      {
        internalType: "string",
        name: "_description",
        type: "string",
      },
      {
        internalType: "string",
        name: "_requirements",
        type: "string",
      },
    ],
    name: "announceDataRequest",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_requestId",
        type: "uint256",
      },
    ],
    name: "confirmAndPay",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "requestId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "buyer",
        type: "address",
      },
    ],
    name: "DataPurchased",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "requestId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "string",
        name: "description",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "bounty",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "requester",
        type: "address",
      },
    ],
    name: "DataRequested",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "requestId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "miner",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "ipfsHash",
        type: "string",
      },
    ],
    name: "DataSubmitted",
    type: "event",
  },
  {
    inputs: [],
    name: "emergencyWithdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "miner",
        type: "address",
      },
    ],
    name: "MinerApproved",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "requestId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "miner",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "PaymentReleased",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_requestId",
        type: "uint256",
      },
    ],
    name: "purchaseVerifiedData",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_requestId",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "_ipfsHash",
        type: "string",
      },
    ],
    name: "submitDataForRequest",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_requestId",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "_isValid",
        type: "bool",
      },
    ],
    name: "verifySubmittedData",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "approvedMiners",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "dataRequests",
    outputs: [
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "description",
        type: "string",
      },
      {
        internalType: "string",
        name: "requirements",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "bounty",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "requester",
        type: "address",
      },
      {
        internalType: "address",
        name: "assignedMiner",
        type: "address",
      },
      {
        internalType: "string",
        name: "ipfsHash",
        type: "string",
      },
      {
        internalType: "bool",
        name: "isVerified",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "isPaid",
        type: "bool",
      },
      {
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getActiveRequests",
    outputs: [
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_requestId",
        type: "uint256",
      },
    ],
    name: "getRequestDetails",
    outputs: [
      {
        internalType: "string",
        name: "description",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "bounty",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "requester",
        type: "address",
      },
      {
        internalType: "string",
        name: "ipfsHash",
        type: "string",
      },
      {
        internalType: "bool",
        name: "isVerified",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "isPaid",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "requestCounter",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "requestSubmissions",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

// Simple avatar component
const Avatar = ({ address, size }: { address: string; size: number }) => {
  const colors = ["#6366f1", "#ec4899", "#eab308", "#10b981", "#f97316"];
  const color = colors[address.length % colors.length];

  return (
    <div
      className="rounded-2xl flex items-center justify-center text-white font-bold"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        background: `linear-gradient(135deg, ${color}, ${color}dd)`,
        fontSize: size / 6,
      }}
    >
      {address.slice(2, 4).toUpperCase()}
    </div>
  );
};

interface DataRequest {
  id: string;
  description: string;
  requirements: string;
  bounty: string;
  requester: string;
  assignedMiner: string;
  ipfsHash: string;
  isVerified: boolean;
  isPaid: boolean;
  timestamp: number;
}

interface ProfileBannerProps {
  walletAddress: string;
}

const ProfileBanner = ({ walletAddress }: ProfileBannerProps) => {
  return (
    <div className="h-48 bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f0f17] relative mb-24 border border-white/10 rounded-2xl">
      <div className="absolute -bottom-16 left-8 flex items-end gap-6">
        <div className="relative">
          <div className="w-32 h-32 rounded-2xl bg-[#0f0f17] p-1 border-2 border-white/20">
            <Avatar address={walletAddress} size={120} />
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg bg-[#0f0f17] flex items-center justify-center border-2 border-blue-500">
            <User className="w-5 h-5 text-blue-500" />
          </div>
        </div>
        <div className="mb-4 flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">
              {walletAddress.slice(0, 8)}...
            </h1>
          </div>
          <button
            onClick={() =>
              window.open(
                `https://calibration.filscan.io/address/${walletAddress}`,
                "_blank"
              )
            }
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-sm w-fit text-gray-300 hover:text-white"
          >
            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
}

const StatCard = ({ icon, title, value }: StatCardProps) => (
  <div className="bg-[#1a1a2e] border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all">
    <div className="flex items-center justify-between mb-2">
      <div className="p-2 bg-white/5 rounded-lg">{icon}</div>
    </div>
    <div className="text-2xl font-bold text-white mb-1">{value}</div>
    <div className="text-gray-400 text-sm">{title}</div>
  </div>
);

interface BountyCardProps {
  request: DataRequest;
  isOwn: boolean;
}

const BountyCard = ({ request, isOwn }: BountyCardProps) => {
  const getStatusColor = () => {
    if (request.isPaid)
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    if (request.isVerified)
      return "bg-green-500/20 text-green-400 border-green-500/30";
    if (
      request.assignedMiner &&
      request.assignedMiner !== "0x0000000000000000000000000000000000000000"
    ) {
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    }
    return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  };

  const getStatus = () => {
    if (request.isPaid) return "Completed";
    if (request.isVerified) return "Verified";
    if (
      request.assignedMiner &&
      request.assignedMiner !== "0x0000000000000000000000000000000000000000"
    ) {
      return "Submitted";
    }
    return "Open";
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  return (
    <div className="bg-[#1a1a2e] border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-2">
            {request.description}
          </h3>
          <p className="text-gray-400 text-sm mb-3">{request.requirements}</p>
        </div>
        <div
          className={`px-3 py-1 rounded-full text-xs border ${getStatusColor()}`}
        >
          {getStatus()}
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1 text-[#6366f1]">
            <Coins className="w-4 h-4" />
            <span className="font-medium">{request.bounty} tFIL</span>
          </div>
          {request.ipfsHash && (
            <div className="flex items-center gap-1 text-gray-400">
              <FileText className="w-4 h-4" />
              <span>Data Submitted</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-400">
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>Created: {formatDate(request.timestamp)}</span>
        </div>
        <div className="text-xs">ID: #{request.id}</div>
      </div>

      {!isOwn &&
        request.assignedMiner ===
          "0x0000000000000000000000000000000000000000" && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <button className="text-[#6366f1] hover:text-[#5855eb] transition-colors text-sm font-medium">
              Submit Data
            </button>
          </div>
        )}
    </div>
  );
};

// Contract interaction functions
const getActiveRequests = async () => {
  try {
    const provider = new ethers.JsonRpcProvider(
      "https://api.calibration.node.glif.io/rpc/v1"
    );
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      provider
    );

    const activeRequestIds = await contract.getActiveRequests();
    const requests = [];

    for (const id of activeRequestIds) {
      const details = await contract.getRequestDetails(id);
      const requestData = await contract.dataRequests(id);

      requests.push({
        id: id.toString(),
        description: details[0],
        requirements: requestData[2],
        bounty: ethers.formatEther(details[1]),
        requester: details[2],
        assignedMiner: requestData[5],
        ipfsHash: details[3],
        isVerified: details[4],
        isPaid: details[5],
        timestamp: Number(requestData[9]),
      });
    }

    return requests;
  } catch (error) {
    console.error("Error fetching requests:", error);
    return [];
  }
};

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("created");
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [allRequests, setAllRequests] = useState<DataRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedAddress = checkConnection();
    setWalletAddress(savedAddress);
  }, []);

  useEffect(() => {
    const loadRequests = async () => {
      if (!walletAddress) return;

      setLoading(true);
      try {
        const requests = await getActiveRequests();
        setAllRequests(requests);
      } catch (error) {
        console.error("Error loading requests:", error);
      } finally {
        setLoading(false);
      }
    };

    loadRequests();
  }, [walletAddress]);

  if (!walletAddress) {
    return (
      <div className="min-h-screen bg-[#0f0f17] text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">
            Please Connect Your Wallet
          </h2>
          <p className="text-gray-400">
            You need to connect your wallet to view your profile.
          </p>
        </div>
      </div>
    );
  }

  const createdRequests = allRequests.filter(
    (req) => req.requester.toLowerCase() === walletAddress.toLowerCase()
  );

  const submittedRequests = allRequests.filter(
    (req) =>
      req.assignedMiner.toLowerCase() === walletAddress.toLowerCase() &&
      req.assignedMiner !== "0x0000000000000000000000000000000000000000"
  );

  const totalEarned = submittedRequests
    .filter((req) => req.isPaid)
    .reduce((sum, req) => sum + parseFloat(req.bounty), 0);

  const totalSpent = createdRequests
    .filter((req) => req.isPaid)
    .reduce((sum, req) => sum + parseFloat(req.bounty), 0);

  const tabs = [
    { id: "created", label: "Created Bounties" },
    { id: "submitted", label: "Submitted Data" },
  ];

  return (
    <div className="min-h-screen bg-[#0f0f17] text-white">
      <div className="max-w-6xl mx-auto p-6">
        <ProfileBanner walletAddress={walletAddress} />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Gift className="w-6 h-6 text-[#ec4899]" />}
            title="Bounties Created"
            value={createdRequests.length.toString()}
          />
          <StatCard
            icon={<FileText className="w-6 h-6 text-[#6366f1]" />}
            title="Data Submitted"
            value={submittedRequests.length.toString()}
          />
          <StatCard
            icon={<Coins className="w-6 h-6 text-[#10b981]" />}
            title="Total Earned"
            value={`${totalEarned.toFixed(2)} tFIL`}
          />
          <StatCard
            icon={<Coins className="w-6 h-6 text-[#f97316]" />}
            title="Total Spent"
            value={`${totalSpent.toFixed(2)} tFIL`}
          />
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1 mb-8 bg-[#1a1a2e] p-1 rounded-xl border border-white/10 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2 rounded-lg transition-all ${
                activeTab === tab.id
                  ? "bg-[#6366f1] text-white shadow-lg"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading your data...</p>
          </div>
        ) : (
          <>
            {activeTab === "created" && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold mb-4">
                  Your Created Bounties
                </h3>
                {createdRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <Gift className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">
                      You haven't created any bounties yet.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {createdRequests.map((request) => (
                      <BountyCard
                        key={request.id}
                        request={request}
                        isOwn={true}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "submitted" && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold mb-4">
                  Your Data Submissions
                </h3>
                {submittedRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">
                      You haven't submitted any data yet.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {submittedRequests.map((request) => (
                      <BountyCard
                        key={request.id}
                        request={request}
                        isOwn={false}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
