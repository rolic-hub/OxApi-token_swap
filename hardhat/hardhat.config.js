require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.9",
  defaultNetwork: "hardhat",
  networks:{
    hardhat : {
      chainId:31337,
      forking : {
        url : "https://eth-mainnet.g.alchemy.com/v2/E5J16OtBss4K3ynCdpFxLjkmdRQQsfmt",
        blockNumber:15367861, //
      }
    },
    localhost: {
      chainId: 31337
    }

  }
};
