module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*", // Match any network id
      gas: 29000000, // Increased gas limit (8M gas)
      gasPrice: 20000000000, // Optional: Adjust gas price (20 Gwei)
    },
  },
  compilers: {
    solc: {
      version: "0.8.0",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200, // Optimize for gas efficiency
        },
      },
    },
  },
};

  