declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ethereum?: any;
  }
}

import { ethers } from "ethers";

const CONTRACT_ADDRESS = "0xbDE02aE57E7BeC2483Ae66d50671a22436227220";
const CALIBRATION_CHAIN_ID = "0x4cb2f"; // 314159 in hex
const RPC_URL = "https://api.calibration.node.glif.io/rpc/v1";

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

// ===== Network Management =====

export const checkAndSwitchNetwork = async () => {
  if (!window.ethereum) throw new Error("MetaMask not found");

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: CALIBRATION_CHAIN_ID }],
    });
  } catch (switchError: unknown) {
    // Add type guard to check if it's an error with a code property
    if (
      switchError &&
      typeof switchError === "object" &&
      "code" in switchError &&
      switchError.code === 4902
    ) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: CALIBRATION_CHAIN_ID,
            chainName: "Filecoin Calibration",
            nativeCurrency: {
              name: "tFIL",
              symbol: "tFIL",
              decimals: 18,
            },
            rpcUrls: [RPC_URL],
            blockExplorerUrls: ["https://calibration.filfox.info/"],
          },
        ],
      });
    } else {
      throw switchError;
    }
  }
};

// ===== Wallet Connection =====

export const connectWallet = async () => {
  if (typeof window !== "undefined" && window.ethereum) {
    try {
      await checkAndSwitchNetwork();
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      return await signer.getAddress();
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      throw new Error("Failed to connect wallet");
    }
  }
  throw new Error("MetaMask not found");
};

export const connectWalletWithStorage = async (): Promise<string> => {
  const address = await connectWallet();
  saveWalletAddress(address);
  return address;
};

export const disconnectWallet = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("walletAddress");
  }
};

// ===== Wallet Listeners =====

export const setupWalletListeners = (
  onAccountsChanged: (accounts: string[]) => void,
  onChainChanged: () => void
) => {
  if (window.ethereum) {
    window.ethereum.on("accountsChanged", onAccountsChanged);
    window.ethereum.on("chainChanged", onChainChanged);
  }
};

export const removeWalletListeners = () => {
  if (window.ethereum) {
    window.ethereum.removeAllListeners("accountsChanged");
    window.ethereum.removeAllListeners("chainChanged");
  }
};

// ===== Local Storage =====

export const checkConnection = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("walletAddress");
  }
  return null;
};

export const saveWalletAddress = (address: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("walletAddress", address);
  }
};

// ===== Contract Write Functions =====

export const announceDataRequest = async (
  description: string,
  requirements: string,
  bountyInFIL: string
) => {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      signer
    );

    const bountyWei = ethers.parseEther(bountyInFIL);

    const tx = await contract.announceDataRequest(description, requirements, {
      value: bountyWei,
    });

    const receipt = await tx.wait();
    return { tx, receipt };
  } catch (error: unknown) {
    // Add proper type guards for error handling
    if (error && typeof error === "object" && "code" in error) {
      if (error.code === "ACTION_REJECTED") {
        throw new Error("Transaction rejected by user");
      }
      if (error.code === "INSUFFICIENT_FUNDS") {
        throw new Error("Insufficient tFIL balance");
      }
    }
    throw error;
  }
};

export const submitDataForRequest = async (
  requestId: string,
  ipfsHash: string
) => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

  const tx = await contract.submitDataForRequest(requestId, ipfsHash);
  const receipt = await tx.wait();
  return { tx, receipt };
};

export const verifyAndPay = async (requestId: string, isValid: boolean) => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

  const tx = await contract.verifyAndPay(requestId, isValid);
  const receipt = await tx.wait();
  return { tx, receipt };
};

export const cancelBounty = async (requestId: string) => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

  const tx = await contract.cancelBounty(requestId);
  const receipt = await tx.wait();
  return { tx, receipt };
};

export const purchaseVerifiedData = async (
  requestId: string,
  paymentInFIL: string
) => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

  const paymentWei = ethers.parseEther(paymentInFIL);

  const tx = await contract.purchaseVerifiedData(requestId, {
    value: paymentWei,
  });
  const receipt = await tx.wait();
  return { tx, receipt };
};

// ===== Contract Read Functions =====

export const getActiveRequests = async () => {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    CONTRACT_ABI,
    provider
  );

  const activeRequestIds = await contract.getActiveRequests();
  const requests = [];

  for (const id of activeRequestIds) {
    const details = await contract.getRequestDetails(id);
    requests.push({
      id: id.toString(),
      description: details[0],
      bounty: ethers.formatEther(details[1]),
      requester: details[2],
      ipfsHash: details[3],
      isVerified: details[4],
      isPaid: details[5],
    });
  }

  return requests;
};

export const getRequestDetails = async (requestId: string) => {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    CONTRACT_ABI,
    provider
  );

  const details = await contract.getRequestDetails(requestId);
  return {
    description: details[0],
    bounty: ethers.formatEther(details[1]),
    requester: details[2],
    ipfsHash: details[3],
    isVerified: details[4],
    isPaid: details[5],
  };
};

// ===== Utility Functions =====

export const getCurrentWalletAddress = async (): Promise<string | null> => {
  if (window.ethereum) {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return await signer.getAddress();
  }
  return null;
};

export const getBalance = async (address: string): Promise<string> => {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const balance = await provider.getBalance(address);
  return ethers.formatEther(balance);
};
