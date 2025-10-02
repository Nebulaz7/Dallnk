"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  RefreshCw,
  User,
  Coins,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  ExternalLink,
} from "lucide-react";
import { ethers } from "ethers";
import { checkConnection } from "../../utils/contract";
import SubmissionModal from "./SubmissionModal";

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

// Skeleton Loading Component
const ListingSkeleton = () => {
  return (
    <div className="p-6 bg-gray-900/50 border border-gray-700 rounded-2xl animate-pulse">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 bg-gray-700 rounded-lg"></div>
        <div className="flex-1">
          <div className="h-6 bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-700 rounded w-full"></div>
        <div className="h-4 bg-gray-700 rounded w-5/6"></div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
        <div className="h-4 bg-gray-700 rounded"></div>
        <div className="h-4 bg-gray-700 rounded"></div>
        <div className="h-4 bg-gray-700 rounded"></div>
      </div>
      <div className="h-10 bg-gray-700 rounded w-32"></div>
    </div>
  );
};

// Bounty Card Component
const BountyCard = ({
  bounty,
  walletAddress,
  onSubmit,
}: {
  bounty: DataRequest;
  walletAddress: string | null;
  onSubmit: (bounty: DataRequest) => void;
}) => {
  const getStatusInfo = () => {
    if (bounty.isPaid) {
      return {
        status: "Completed",
        color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
        icon: <CheckCircle className="w-4 h-4" />,
      };
    }
    if (bounty.isVerified) {
      return {
        status: "Verified",
        color: "bg-green-500/20 text-green-400 border-green-500/30",
        icon: <CheckCircle className="w-4 h-4" />,
      };
    }
    if (
      bounty.assignedMiner &&
      bounty.assignedMiner !== "0x0000000000000000000000000000000000000000"
    ) {
      return {
        status: "In Review",
        color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
        icon: <AlertCircle className="w-4 h-4" />,
      };
    }
    return {
      status: "Open",
      color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      icon: <FileText className="w-4 h-4" />,
    };
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const canSubmit = () => {
    if (!walletAddress) return false;
    if (bounty.isPaid) return false;
    if (
      bounty.assignedMiner &&
      bounty.assignedMiner !== "0x0000000000000000000000000000000000000000"
    )
      return false;
    if (bounty.requester.toLowerCase() === walletAddress.toLowerCase())
      return false;
    return true;
  };

  const hasSubmission = () => {
    return (
      bounty.ipfsHash &&
      bounty.ipfsHash !== "" &&
      bounty.assignedMiner !== "0x0000000000000000000000000000000000000000"
    );
  };

  const statusInfo = getStatusInfo();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 bg-gray-900/50 border border-gray-700 rounded-2xl hover:border-gray-600 transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-1">
              Request #{bounty.id}
            </h3>
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <User className="w-4 h-4" />
              <span>By: {formatAddress(bounty.requester)}</span>
            </div>
          </div>
        </div>
        <div
          className={`px-3 py-1 rounded-full text-xs border flex items-center gap-1 ${statusInfo.color}`}
        >
          {statusInfo.icon}
          {statusInfo.status}
        </div>
      </div>

      {/* Description */}
      <div className="mb-4">
        <h4 className="text-white font-medium mb-2">Data Needed:</h4>
        <p className="text-gray-300 text-sm leading-relaxed">
          {bounty.description}
        </p>
      </div>

      {/* Requirements */}
      <div className="mb-4">
        <h4 className="text-white font-medium mb-2">Requirements:</h4>
        <p className="text-gray-300 text-sm leading-relaxed">
          {bounty.requirements}
        </p>
      </div>

      {/* Submitted Data Section */}
      {hasSubmission() && (
        <div className="mb-4 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-blue-400 font-medium mb-1 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Data Submitted
              </h4>
              <p className="text-gray-400 text-xs">
                By: {formatAddress(bounty.assignedMiner)}
              </p>
            </div>
            <a
              href={`https://gateway.pinata.cloud/ipfs/${bounty.ipfsHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
            >
              View Data
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
          <div className="mt-2 text-xs text-gray-500 font-mono break-all">
            IPFS: {bounty.ipfsHash}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="flex items-center gap-2 text-sm">
          <Coins className="w-4 h-4 text-yellow-400" />
          <span className="text-gray-400">Bounty:</span>
          <span className="text-green-400 font-medium">
            {bounty.bounty} tFIL
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-blue-400" />
          <span className="text-gray-400">Created:</span>
          <span className="text-white">{formatDate(bounty.timestamp)}</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <FileText className="w-4 h-4 text-purple-400" />
          <span className="text-gray-400">ID:</span>
          <span className="text-white">#{bounty.id}</span>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex gap-3">
        {canSubmit() ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSubmit(bounty)}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-400/30 to-blue-500/90 hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200 shadow-lg shadow-blue-600/25"
          >
            Submit Data
          </motion.button>
        ) : (
          <div className="flex-1 px-6 py-3 bg-gray-700/50 text-gray-400 rounded-lg font-medium text-center">
            {!walletAddress
              ? "Connect wallet to submit"
              : bounty.requester.toLowerCase() === walletAddress.toLowerCase()
              ? "Your bounty"
              : bounty.isPaid
              ? "Bounty completed"
              : "Submission pending"}
          </div>
        )}

        {/* View Submitted Data Button (for completed bounties) */}
        {bounty.isPaid && bounty.ipfsHash && (
          <a
            href={`https://gateway.pinata.cloud/ipfs/${bounty.ipfsHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            View Data
          </a>
        )}
      </div>
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

    const requestCounter = await contract.requestCounter();
    const requests = [];

    // Get all requests (both active and completed for display)
    for (let i = 1; i <= Number(requestCounter); i++) {
      try {
        const requestData = await contract.dataRequests(i);

        requests.push({
          id: i.toString(),
          description: requestData[1], // description
          requirements: requestData[2], // requirements
          bounty: ethers.formatEther(requestData[3]), // bounty
          requester: requestData[4], // requester
          assignedMiner: requestData[5], // assignedMiner
          ipfsHash: requestData[6], // ipfsHash
          isVerified: requestData[7], // isVerified
          isPaid: requestData[8], // isPaid
          timestamp: Number(requestData[9]), // timestamp
        });
      } catch (error) {
        console.error(`Error fetching request ${i}:`, error);
      }
    }

    return requests.reverse(); // Show newest first
  } catch (error) {
    console.error("Error fetching requests:", error);
    return [];
  }
};

const Marketplace = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [bounties, setBounties] = useState<DataRequest[]>([]);
  const [filteredBounties, setFilteredBounties] = useState<DataRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBounty, setSelectedBounty] = useState<DataRequest | null>(
    null
  );
  const [filterStatus, setFilterStatus] = useState<
    "all" | "open" | "completed"
  >("all");

  // Check wallet connection
  useEffect(() => {
    const savedAddress = checkConnection();
    setWalletAddress(savedAddress);
  }, []);

  // Fetch bounties from contract
  const fetchBounties = async () => {
    try {
      setIsLoading(true);
      const requests = await getActiveRequests();
      setBounties(requests);
      setFilteredBounties(requests);
    } catch (error) {
      console.error("Failed to fetch bounties:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchBounties();
  }, []);

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchBounties();
    setIsRefreshing(false);
  };

  // Handle search and filter
  useEffect(() => {
    let filtered = bounties;

    // Apply status filter
    if (filterStatus === "open") {
      filtered = filtered.filter(
        (b) =>
          !b.isPaid &&
          (!b.assignedMiner ||
            b.assignedMiner === "0x0000000000000000000000000000000000000000")
      );
    } else if (filterStatus === "completed") {
      filtered = filtered.filter((b) => b.isPaid);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (bounty) =>
          bounty.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          bounty.requirements
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          bounty.requester.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredBounties(filtered);
  }, [searchQuery, bounties, filterStatus]);

  const handleSubmit = (bounty: DataRequest) => {
    if (!walletAddress) {
      alert("Please connect your wallet first");
      return;
    }
    setSelectedBounty(bounty);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedBounty(null);
  };

  const handleSubmissionSuccess = () => {
    fetchBounties();
  };

  return (
    <div className="mx-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-2xl p-6 mb-8"
      >
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">Data Bounties</h1>
          <p className="text-gray-400">
            Discover and submit data for active bounty requests stored on IPFS
            via Pinata
          </p>
        </div>

        {/* Search, Filter and Refresh */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search bounties by description, requirements, or creator..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-4 py-3 rounded-lg font-medium transition-all ${
                filterStatus === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus("open")}
              className={`px-4 py-3 rounded-lg font-medium transition-all ${
                filterStatus === "open"
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              Open
            </button>
            <button
              onClick={() => setFilterStatus("completed")}
              className={`px-4 py-3 rounded-lg font-medium transition-all ${
                filterStatus === "completed"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              Completed
            </button>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-400/30 to-blue-500/90 hover:bg-blue-600 disabled:opacity-50 text-white rounded-lg font-medium transition-all duration-200 shadow-lg shadow-blue-600/25"
          >
            <RefreshCw
              className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`}
            />
            <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
          </motion.button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-900/30 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-white">
              {bounties.length}
            </div>
            <div className="text-gray-400 text-sm">Total Bounties</div>
          </div>
          <div className="bg-gray-900/30 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-emerald-400">
              {
                bounties.filter(
                  (b) =>
                    !b.isPaid &&
                    (!b.assignedMiner ||
                      b.assignedMiner ===
                        "0x0000000000000000000000000000000000000000")
                ).length
              }
            </div>
            <div className="text-gray-400 text-sm">Open</div>
          </div>
          <div className="bg-gray-900/30 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-yellow-400">
              {
                bounties.filter(
                  (b) =>
                    !b.isPaid &&
                    b.assignedMiner &&
                    b.assignedMiner !==
                      "0x0000000000000000000000000000000000000000"
                ).length
              }
            </div>
            <div className="text-gray-400 text-sm">In Review</div>
          </div>
          <div className="bg-gray-900/30 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-blue-400">
              {bounties.filter((b) => b.isPaid).length}
            </div>
            <div className="text-gray-400 text-sm">Completed</div>
          </div>
        </div>

        {/* Bounties List */}
        <div className="space-y-6">
          {isLoading ? (
            <>
              <ListingSkeleton />
              <ListingSkeleton />
              <ListingSkeleton />
            </>
          ) : filteredBounties.length > 0 ? (
            filteredBounties.map((bounty) => (
              <BountyCard
                key={bounty.id}
                bounty={bounty}
                walletAddress={walletAddress}
                onSubmit={handleSubmit}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-2">
                {searchQuery
                  ? "No bounties match your search"
                  : filterStatus === "open"
                  ? "No open bounties available"
                  : filterStatus === "completed"
                  ? "No completed bounties yet"
                  : "No bounties available"}
              </p>
              <p className="text-gray-500 text-sm">
                {searchQuery
                  ? "Try adjusting your search terms"
                  : "Check back later for new data requests"}
              </p>
            </div>
          )}
        </div>
      </motion.div>

      <SubmissionModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        bounty={selectedBounty}
        onSuccess={handleSubmissionSuccess}
      />
    </div>
  );
};

export default Marketplace;
