require("@nomicfoundation/hardhat-toolbox");
require('hardhat-contract-sizer');

module.exports = {
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  
  networks: {
    goerli: {
      url: `https://eth-goerli.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY_GOERLI}`,
      chainId: 5,
      accounts: {
        count: 16,
        mnemonic: `${process.env.MNEMONIC}`
      }
    }
  },

  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: true
  },

  mocha: {
    timeout: 60000
  }

}
