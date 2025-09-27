const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "connect-src 'self' https://auth.privy.io https://api.node.glif.io https://api.calibration.node.glif.io https://api.web3.storage",
      // ...other directives...
    ].join("; "),
  },
];
