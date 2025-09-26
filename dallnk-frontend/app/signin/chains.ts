import { defineChain } from "viem";

export const filecoin = defineChain({
  id: 314,
  name: "Filecoin",
  network: "filecoin",
  nativeCurrency: {
    decimals: 18,
    name: "Filecoin",
    symbol: "FIL",
  },
  rpcUrls: {
    default: { http: ["https://api.node.glif.io"] },
    public: { http: ["https://api.node.glif.io"] },
  },
  blockExplorers: {
    default: { name: "Filfox", url: "https://filfox.info/en" },
  },
});

export const filecoinCalibration = defineChain({
  id: 314159,
  name: "Filecoin Calibration",
  network: "filecoin-calibration",
  nativeCurrency: {
    decimals: 18,
    name: "Testnet Filecoin",
    symbol: "tFIL",
  },
  rpcUrls: {
    default: { http: ["https://api.calibration.node.glif.io/rpc/v1"] },
    public: { http: ["https://api.calibration.node.glif.io/rpc/v1"] },
  },
  blockExplorers: {
    default: { name: "Glif Explorer", url: "https://explorer.glif.io" },
  },
});
