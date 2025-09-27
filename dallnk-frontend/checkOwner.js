// Utility script to check contract owner
import { ethers } from "ethers";

const CONTRACT_ADDRESS = "0x28791bF1c9F1F4385831236A53204dD90A1DEFAA";
const CONTRACT_ABI = [
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
];

export const checkContractOwner = async () => {
  try {
    const provider = new ethers.JsonRpcProvider(
      "https://api.calibration.node.glif.io/rpc/v1"
    );
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      provider
    );

    const owner = await contract.owner();
    console.log("Contract owner:", owner);
    return owner;
  } catch (error) {
    console.error("Error checking contract owner:", error);
    return null;
  }
};

// Call this function to check
checkContractOwner();
