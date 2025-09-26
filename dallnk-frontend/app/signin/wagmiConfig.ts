import { createConfig, http } from "wagmi";
import { mainnet } from "wagmi/chains";
import { metaMask, injected } from "wagmi/connectors";

export const wagmiConfig = createConfig({
  chains: [mainnet],
  connectors: [ 
    metaMask({
      dappMetadata: {
        name: "Dallnk",
        url: "http://localhost:3000",
      },
      // Disable analytics to prevent the fetch error
      preferDesktop: false,
    }),
    injected()
  ],
  transports: {
    [mainnet.id]: http(),
  },
});
