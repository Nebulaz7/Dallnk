// utils/bountyManagement.ts
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

export interface BountySubmission {
  bountyId: string;
  description: string;
  requirements: string;
  bounty: string;
  requester: string;
  submitter: string;
  ipfsHash: string;
  isVerified: boolean;
  isPaid: boolean;
  timestamp: number;
  submissionDescription?: string;
}

export interface ManagementResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
}

// Get all bounties created by a specific user with their submission status
export const getUserBountiesWithSubmissions = async (
  userAddress: string
): Promise<BountySubmission[]> => {
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
    const userBounties: BountySubmission[] = [];

    for (let i = 1; i <= Number(requestCounter); i++) {
      try {
        const requestData = await contract.dataRequests(i);

        // Only include bounties created by this user
        if (requestData[4].toLowerCase() === userAddress.toLowerCase()) {
          userBounties.push({
            bountyId: i.toString(),
            description: requestData[1],
            requirements: requestData[2],
            bounty: ethers.formatEther(requestData[3]),
            requester: requestData[4],
            submitter: requestData[5],
            ipfsHash: requestData[6],
            isVerified: requestData[7],
            isPaid: requestData[8],
            timestamp: Number(requestData[9]),
          });
        }
      } catch (error) {
        console.error(`Error fetching bounty ${i}:`, error);
      }
    }

    return userBounties.reverse(); // Show newest first
  } catch (error) {
    console.error("Error fetching user bounties:", error);
    return [];
  }
};

// Accept a submission (verify the data)
export const acceptSubmission = async (
  bountyId: string
): Promise<ManagementResult> => {
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

    // Check if user is the bounty owner
    const requestData = await contract.dataRequests(bountyId);
    const userAddress = await signer.getAddress();

    if (requestData[4].toLowerCase() !== userAddress.toLowerCase()) {
      throw new Error("Only the bounty creator can accept submissions");
    }

    if (requestData[5] === "0x0000000000000000000000000000000000000000") {
      throw new Error("No submission found for this bounty");
    }

    if (requestData[7]) {
      // isVerified
      throw new Error("Submission already verified");
    }

    // Estimate gas
    const gasEstimate = await contract.verifySubmittedData.estimateGas(
      bountyId,
      true
    );
    const gasLimit = Math.floor(Number(gasEstimate) * 1.2);

    // Accept the submission by verifying it
    const transaction = await contract.verifySubmittedData(bountyId, true, {
      gasLimit,
    });

    console.log("Accept transaction submitted:", transaction.hash);

    const receipt = await transaction.wait();

    if (receipt.status === 1) {
      return {
        success: true,
        transactionHash: transaction.hash,
      };
    } else {
      return {
        success: false,
        error: "Transaction failed",
        transactionHash: transaction.hash,
      };
    }
  } catch (error: any) {
    console.error("Accept submission failed:", error);

    let errorMessage = "Failed to accept submission";

    if (error.message?.includes("user rejected")) {
      errorMessage = "Transaction rejected by user";
    } else if (error.message?.includes("insufficient funds")) {
      errorMessage = "Insufficient funds for gas";
    } else if (error.reason) {
      errorMessage = error.reason;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
};

// Decline a submission (reject and reset)
export const declineSubmission = async (
  bountyId: string
): Promise<ManagementResult> => {
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

    // Check if user is the bounty owner
    const requestData = await contract.dataRequests(bountyId);
    const userAddress = await signer.getAddress();

    if (requestData[4].toLowerCase() !== userAddress.toLowerCase()) {
      throw new Error("Only the bounty creator can decline submissions");
    }

    if (requestData[5] === "0x0000000000000000000000000000000000000000") {
      throw new Error("No submission found for this bounty");
    }

    if (requestData[7]) {
      // isVerified
      throw new Error("Cannot decline already verified submission");
    }

    if (requestData[8]) {
      // isPaid
      throw new Error("Cannot decline already paid submission");
    }

    // Estimate gas
    const gasEstimate = await contract.verifySubmittedData.estimateGas(
      bountyId,
      false
    );
    const gasLimit = Math.floor(Number(gasEstimate) * 1.2);

    // Decline the submission by rejecting it
    const transaction = await contract.verifySubmittedData(bountyId, false, {
      gasLimit,
    });

    console.log("Decline transaction submitted:", transaction.hash);

    const receipt = await transaction.wait();

    if (receipt.status === 1) {
      return {
        success: true,
        transactionHash: transaction.hash,
      };
    } else {
      return {
        success: false,
        error: "Transaction failed",
        transactionHash: transaction.hash,
      };
    }
  } catch (error: any) {
    console.error("Decline submission failed:", error);

    let errorMessage = "Failed to decline submission";

    if (error.message?.includes("user rejected")) {
      errorMessage = "Transaction rejected by user";
    } else if (error.message?.includes("insufficient funds")) {
      errorMessage = "Insufficient funds for gas";
    } else if (error.reason) {
      errorMessage = error.reason;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
};

// Release payment to submitter (after verification)
export const releasePayment = async (
  bountyId: string
): Promise<ManagementResult> => {
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

    // Check if user is the bounty owner
    const requestData = await contract.dataRequests(bountyId);
    const userAddress = await signer.getAddress();

    if (requestData[4].toLowerCase() !== userAddress.toLowerCase()) {
      throw new Error("Only the bounty creator can release payment");
    }

    if (!requestData[7]) {
      // isVerified
      throw new Error("Submission must be verified before payment release");
    }

    if (requestData[8]) {
      // isPaid
      throw new Error("Payment already released");
    }

    // Estimate gas
    const gasEstimate = await contract.confirmAndPay.estimateGas(bountyId);
    const gasLimit = Math.floor(Number(gasEstimate) * 1.2);

    // Release payment
    const transaction = await contract.confirmAndPay(bountyId, { gasLimit });

    console.log("Payment release transaction submitted:", transaction.hash);

    const receipt = await transaction.wait();

    if (receipt.status === 1) {
      return {
        success: true,
        transactionHash: transaction.hash,
      };
    } else {
      return {
        success: false,
        error: "Transaction failed",
        transactionHash: transaction.hash,
      };
    }
  } catch (error: any) {
    console.error("Release payment failed:", error);

    let errorMessage = "Failed to release payment";

    if (error.message?.includes("user rejected")) {
      errorMessage = "Transaction rejected by user";
    } else if (error.message?.includes("insufficient funds")) {
      errorMessage = "Insufficient funds for gas";
    } else if (error.reason) {
      errorMessage = error.reason;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
};

// Download file from IPFS
export const downloadFromIPFS = async (
  ipfsHash: string,
  filename?: string
): Promise<void> => {
  try {
    const response = await fetch(`https://w3s.link/ipfs/${ipfsHash}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }

    const blob = await response.blob();

    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename || `data-${ipfsHash.substring(0, 8)}.bin`;

    // Trigger download
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Download failed:", error);
    throw new Error("Failed to download file from IPFS");
  }
};
