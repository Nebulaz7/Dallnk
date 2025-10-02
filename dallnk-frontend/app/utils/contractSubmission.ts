// utils/contractSubmission.ts
import { ethers } from "ethers";

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

export interface SubmissionResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
  gasUsed?: number;
}

export const submitDataToContract = async (
  requestId: string,
  ipfsHash: string,
  description: string
): Promise<SubmissionResult> => {
  try {
    if (!window.ethereum) {
      throw new Error("MetaMask not found");
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      signer
    );

    // Validate inputs
    if (!requestId || !ipfsHash || !description) {
      throw new Error("Missing required submission data");
    }

    // Check if request exists and is still open
    const requestData = await contract.dataRequests(requestId);

    if (requestData[0] === 0) {
      // id is 0 means request doesn't exist
      throw new Error("Bounty request not found");
    }

    if (requestData[8]) {
      // isPaid
      throw new Error("Bounty request already completed");
    }

    if (requestData[5] !== "0x0000000000000000000000000000000000000000") {
      // assignedMiner
      throw new Error("Bounty request already has a submission");
    }

    // Estimate gas
    const gasEstimate = await contract.submitDataForRequest.estimateGas(
      requestId,
      ipfsHash
    );

    // Add 20% buffer to gas estimate
    const gasLimit = Math.floor(Number(gasEstimate) * 1.2);

    // Submit to contract
    const transaction = await contract.submitDataForRequest(
      requestId,
      ipfsHash,
      { gasLimit }
    );

    console.log("Transaction submitted:", transaction.hash);

    // Wait for confirmation
    const receipt = await transaction.wait();

    if (receipt.status === 1) {
      return {
        success: true,
        transactionHash: transaction.hash,
        gasUsed: Number(receipt.gasUsed),
      };
    } else {
      return {
        success: false,
        error: "Transaction failed",
        transactionHash: transaction.hash,
      };
    }
  } catch (error: unknown) {
    console.error("Contract submission failed:", error);

    const errorInfo =
      typeof error === "object" && error !== null ? error : undefined;

    let message: string | undefined;
    let reason: string | undefined;

    if (errorInfo && "message" in errorInfo) {
      const value = (errorInfo as { message?: unknown }).message;
      if (typeof value === "string") {
        message = value;
      }
    }

    if (errorInfo && "reason" in errorInfo) {
      const value = (errorInfo as { reason?: unknown }).reason;
      if (typeof value === "string") {
        reason = value;
      }
    }

    let errorMessage = "Submission failed";

    if (message?.includes("user rejected")) {
      errorMessage = "Transaction rejected by user";
    } else if (message?.includes("insufficient funds")) {
      errorMessage = "Insufficient funds for gas";
    } else if (message?.includes("Request does not exist")) {
      errorMessage = "Bounty request not found";
    } else if (message?.includes("Request already assigned")) {
      errorMessage = "This bounty already has a submission";
    } else if (message?.includes("Request already fulfilled")) {
      errorMessage = "This bounty has already been completed";
    } else if (reason) {
      errorMessage = reason;
    } else if (message) {
      errorMessage = message;
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
};

export const getBountyDetails = async (requestId: string) => {
  try {
    const provider = new ethers.JsonRpcProvider(
      "https://api.calibration.node.glif.io/rpc/v1"
    );
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      provider
    );

    const requestData = await contract.dataRequests(requestId);

    if (requestData[0] === 0) {
      throw new Error("Bounty not found");
    }

    return {
      id: requestData[0].toString(),
      description: requestData[1],
      requirements: requestData[2],
      bounty: ethers.formatEther(requestData[3]),
      requester: requestData[4],
      assignedMiner: requestData[5],
      ipfsHash: requestData[6],
      isVerified: requestData[7],
      isPaid: requestData[8],
      timestamp: Number(requestData[9]),
    };
  } catch (error) {
    console.error("Error fetching bounty details:", error);
    throw error;
  }
};

export const checkSubmissionEligibility = async (
  requestId: string,
  walletAddress: string
): Promise<{ eligible: boolean; reason?: string }> => {
  try {
    const bounty = await getBountyDetails(requestId);

    if (bounty.requester.toLowerCase() === walletAddress.toLowerCase()) {
      return { eligible: false, reason: "Cannot submit to your own bounty" };
    }

    if (bounty.isPaid) {
      return { eligible: false, reason: "Bounty already completed" };
    }

    if (bounty.assignedMiner !== "0x0000000000000000000000000000000000000000") {
      return { eligible: false, reason: "Bounty already has a submission" };
    }

    return { eligible: true };
  } catch (error) {
    console.error("Failed to check submission eligibility:", error);
    return { eligible: false, reason: "Unable to verify bounty status" };
  }
};
