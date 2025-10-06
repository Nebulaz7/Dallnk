"use client";

import React, { useState, useEffect } from "react";
import {
  ExternalLink,
  Gift,
  Clock,
  User,
  FileText,
  Coins,
  Eye,
  TrendingUp,
  TrendingDown,
  Lock,
  CheckCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { checkConnection } from "../utils/contract";
import { ethers } from "ethers";
import BountyManagement from "./components/BountyManagement";
import {
  getUserBountiesWithSubmissions,
  BountySubmission,
} from "../utils/bountyManagement";

const CONTRACT_ADDRESS = "0xbDE02aE57E7BeC2483Ae66d50671a22436227220";
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
        name: "requester",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "refundAmount",
        type: "uint256",
      },
    ],
    name: "BountyCancelled",
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
    name: "cancelBounty",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
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
    name: "verifyAndPay",
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
      className="rounded-xl sm:rounded-2xl flex items-center justify-center text-white font-bold shadow-lg"
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
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative mb-16 sm:mb-20 lg:mb-24"
    >
      {/* Banner Background */}
      <div className="h-32 sm:h-40 lg:h-48 bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f0f17] relative border border-white/10 rounded-xl sm:rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      </div>

      {/* Profile Info */}
      <div className="absolute -bottom-12 sm:-bottom-16 left-4 sm:left-6 lg:left-8 right-4 sm:right-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 sm:gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-xl sm:rounded-2xl bg-[#0f0f17] p-0.5 sm:p-1 border-2 border-white/20 shadow-xl">
              <Avatar
                address={walletAddress}
                size={
                  typeof window !== "undefined" && window.innerWidth < 640
                    ? 76
                    : typeof window !== "undefined" && window.innerWidth < 1024
                    ? 104
                    : 120
                }
              />
            </div>
            <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-[#0f0f17] flex items-center justify-center border-2 border-blue-500 shadow-lg">
              <User className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-blue-500" />
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1 mb-2 sm:mb-4">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1 sm:mb-2">
              <span className="hidden sm:inline">
                {walletAddress.slice(0, 8)}...
              </span>
              <span className="sm:hidden">{walletAddress.slice(0, 6)}...</span>
            </h1>
            <button
              onClick={() =>
                window.open(
                  `https://calibration.filscan.io/address/${walletAddress}`,
                  "_blank"
                )
              }
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-all text-xs sm:text-sm w-fit text-gray-300 hover:text-white group"
            >
              <span className="font-mono">
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </span>
              <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  trend?: "up" | "down";
  trendValue?: string;
}

const StatCard = ({ icon, title, value, trend, trendValue }: StatCardProps) => (
  <motion.div
    whileHover={{ y: -4 }}
    transition={{ duration: 0.2 }}
    className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border border-white/10 rounded-xl p-4 sm:p-6 hover:border-white/20 transition-all shadow-lg"
  >
    <div className="flex items-start justify-between mb-3">
      <div className="p-2 sm:p-2.5 bg-white/5 rounded-lg">{icon}</div>
      {trend && trendValue && (
        <div
          className={`flex items-center gap-1 text-xs ${
            trend === "up" ? "text-green-400" : "text-red-400"
          }`}
        >
          {trend === "up" ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          <span>{trendValue}</span>
        </div>
      )}
    </div>
    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1">
      {value}
    </div>
    <div className="text-gray-400 text-xs sm:text-sm">{title}</div>
  </motion.div>
);

interface BountyCardProps {
  request: DataRequest;
  isOwn: boolean;
  currentWallet: string;
}

const BountyCard = ({ request, isOwn, currentWallet }: BountyCardProps) => {
  const getStatusConfig = () => {
    if (request.isPaid)
      return {
        color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
        label: "Completed",
      };
    if (request.isVerified)
      return {
        color: "bg-green-500/20 text-green-400 border-green-500/30",
        label: "Verified",
      };
    if (
      request.assignedMiner &&
      request.assignedMiner !== "0x0000000000000000000000000000000000000000"
    ) {
      return {
        color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
        label: "In Review",
      };
    }
    return {
      color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      label: "Open",
    };
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // EXCLUSIVE ACCESS: Only requester can view data after payment
  const canViewData = () => {
    if (!request.isPaid) return false;
    return request.requester.toLowerCase() === currentWallet.toLowerCase();
  };

  const hasSubmission = () => {
    return (
      request.ipfsHash &&
      request.ipfsHash !== "" &&
      request.assignedMiner !== "0x0000000000000000000000000000000000000000"
    );
  };

  const status = getStatusConfig();

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border border-white/10 rounded-xl p-4 sm:p-6 hover:border-white/20 transition-all shadow-lg"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-2 line-clamp-2">
            {request.description}
          </h3>
          <p className="text-gray-400 text-xs sm:text-sm mb-3 line-clamp-2">
            {request.requirements}
          </p>
        </div>
        <div
          className={`px-2 sm:px-3 py-1 rounded-full text-xs border ${status.color} whitespace-nowrap shrink-0`}
        >
          {status.label}
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-1.5 text-[#6366f1]">
          <Coins className="w-4 h-4" />
          <span className="font-semibold text-sm sm:text-base">
            {request.bounty} tFIL
          </span>
        </div>
        {hasSubmission() && (
          <div className="flex items-center gap-1.5">
            {canViewData() ? (
              <div className="flex items-center gap-1.5 text-green-400">
                <CheckCircle className="w-4 h-4" />
                <span className="text-xs sm:text-sm">Data Available</span>
              </div>
            ) : request.isPaid ? (
              <div className="flex items-center gap-1.5 text-blue-400">
                <Lock className="w-4 h-4" />
                <span className="text-xs sm:text-sm">Data Submitted</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-yellow-400">
                <FileText className="w-4 h-4" />
                <span className="text-xs sm:text-sm">In Review</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm text-gray-400">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
          <span>{formatDate(request.timestamp)}</span>
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-3">
          <span className="text-xs">ID: #{request.id}</span>

          {/* ONLY show view button if user has access (requester + paid) */}
          {canViewData() && request.ipfsHash && (
            <a
              href={`https://gateway.pinata.cloud/ipfs/${request.ipfsHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-colors shadow-lg"
            >
              <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>View Data</span>
            </a>
          )}

          {/* Show locked state if data exists but not accessible */}
          {hasSubmission() && !canViewData() && request.isPaid && (
            <div className="flex items-center gap-1 px-3 py-1 bg-gray-800/50 border border-gray-700 text-gray-400 rounded-lg text-xs">
              <Lock className="w-3 h-3" />
              <span>Private</span>
            </div>
          )}
        </div>
      </div>

      {/* IPFS CID - Only show to requester after payment */}
      {canViewData() && request.ipfsHash && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-xs text-gray-500 mb-1">IPFS CID:</p>
          <p className="text-xs text-gray-400 font-mono bg-black/20 p-2 rounded break-all">
            {request.ipfsHash}
          </p>
        </div>
      )}

      {/* Privacy notice for locked data */}
      {hasSubmission() && !canViewData() && request.isPaid && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-start gap-2 text-xs text-gray-500">
            <Lock className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <p>This data is private - accessible only to the requester</p>
          </div>
        </div>
      )}
    </motion.div>
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
  const [userBountiesWithSubmissions, setUserBountiesWithSubmissions] =
    useState<BountySubmission[]>([]);
  const [loadingManagement, setLoadingManagement] = useState(false);

  useEffect(() => {
    const savedAddress = checkConnection();
    setWalletAddress(savedAddress);
  }, []);

  useEffect(() => {
    const loadAllData = async () => {
      if (!walletAddress) return;

      setLoading(true);
      try {
        const [requests, managementBounties] = await Promise.all([
          getActiveRequests(),
          getUserBountiesWithSubmissions(walletAddress),
        ]);
        setAllRequests(requests);
        setUserBountiesWithSubmissions(managementBounties);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, [walletAddress]);

  const loadBountiesForManagement = async () => {
    if (!walletAddress) return;

    setLoadingManagement(true);
    try {
      const bounties = await getUserBountiesWithSubmissions(walletAddress);
      setUserBountiesWithSubmissions(bounties);
    } catch (error) {
      console.error("Error loading bounties for management:", error);
    } finally {
      setLoadingManagement(false);
    }
  };

  if (!walletAddress) {
    return (
      <div className="min-h-screen bg-[#0f0f17] text-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
            <User className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-6">
            Please connect your wallet to view your profile and manage your data
            requests.
          </p>
          <a
            href="/signin"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-medium transition-all"
          >
            Connect Wallet
          </a>
        </motion.div>
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
    { id: "created", label: "My Requests", shortLabel: "Requests" },
    { id: "manage", label: "Review Submissions", shortLabel: "Review" },
    { id: "submitted", label: "My Submissions", shortLabel: "Submitted" },
  ];

  return (
    <div className="min-h-screen bg-[#0f0f17] text-white pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ProfileBanner walletAddress={walletAddress} />

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8"
        >
          <StatCard
            icon={<Gift className="w-5 h-5 sm:w-6 sm:h-6 text-[#ec4899]" />}
            title="Requests Created"
            value={createdRequests.length.toString()}
          />
          <StatCard
            icon={<FileText className="w-5 h-5 sm:w-6 sm:h-6 text-[#6366f1]" />}
            title="Data Submitted"
            value={submittedRequests.length.toString()}
          />
          <StatCard
            icon={<Coins className="w-5 h-5 sm:w-6 sm:h-6 text-[#10b981]" />}
            title="Total Earned"
            value={`${totalEarned.toFixed(2)}`}
          />
          <StatCard
            icon={<Coins className="w-5 h-5 sm:w-6 sm:h-6 text-[#f97316]" />}
            title="Total Spent"
            value={`${totalSpent.toFixed(2)}`}
          />
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-6 sm:mb-8 overflow-x-auto"
        >
          <div className="flex gap-1 sm:gap-2 bg-[#1a1a2e] p-1 rounded-xl border border-white/10 w-fit min-w-full sm:min-w-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 rounded-lg transition-all text-xs sm:text-sm font-medium whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading your data...</p>
          </div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "created" && (
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-lg sm:text-xl font-bold">
                  Your Created Requests
                </h3>
                {createdRequests.length === 0 ? (
                  <div className="text-center py-12 bg-[#1a1a2e] rounded-xl border border-white/10">
                    <Gift className="w-12 h-12 sm:w-16 sm:h-16 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 text-sm sm:text-base">
                      You haven&apos;t created any requests yet.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {createdRequests.map((request) => (
                      <BountyCard
                        key={request.id}
                        request={request}
                        isOwn={true}
                        currentWallet={walletAddress}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "manage" && (
              <div className="space-y-4 sm:space-y-6">
                {loadingManagement ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading submissions...</p>
                  </div>
                ) : (
                  <BountyManagement
                    bounties={userBountiesWithSubmissions}
                    onBountyUpdate={loadBountiesForManagement}
                  />
                )}
              </div>
            )}

            {activeTab === "submitted" && (
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-lg sm:text-xl font-bold">
                  Your Data Submissions
                </h3>
                {submittedRequests.length === 0 ? (
                  <div className="text-center py-12 bg-[#1a1a2e] rounded-xl border border-white/10">
                    <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 text-sm sm:text-base">
                      You haven&apos;t submitted any data yet.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {submittedRequests.map((request) => (
                      <BountyCard
                        key={request.id}
                        request={request}
                        isOwn={false}
                        currentWallet={walletAddress}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
