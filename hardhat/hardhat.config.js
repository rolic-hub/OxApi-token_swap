require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.9",
  defaultNetwork: "hardhat",
  networks:{
    hardhat : {
      chainId:31337,
      forking : {
        url : process.env.ALCHEMY_MAINNET_URL,
        blockNumber:15367861, //
      }
    },
    localhost: {
      chainId: 31337
    }

  }
};
