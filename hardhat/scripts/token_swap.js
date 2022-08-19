const { expect } = require("chai");
const { utils } = require("ethers");
const { ethers, network } = require("hardhat");
const abi = require("../../src/components/constants/erc20abi.json");
// node-fetch version 2 needs to be added to your project
//const fetch = require("node-fetch");

const ONE_ETHER_BASE_UNITS = ethers.utils.parseEther("5"); // 1 ETH
const MINIMAL_ERC20_ABI = abi;

async function swap() {
  // Quote parameters
  const sellToken = "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984"; // uniswap   0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72
  const buyToken = "0x6B175474E89094C44Da98b954EedeAC495271d0F"; // dai - proxy
  const sellAmount = ONE_ETHER_BASE_UNITS;
  const takerAddress = "0xab5801a7d398351b8be11c439e05c5b3259aec9b"; // An account with sufficient balance on mainnet
  const approvalam = ethers.utils.parseEther("10");
  const approveAdd = "0xdef1c0ded9bec7f1a1670819833240f027b25eff";

  await network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [takerAddress],
  });

  // Get a signer for the account we are impersonating
  const signer = await ethers.getSigner(takerAddress);
  const uniswap = new ethers.Contract(sellToken, MINIMAL_ERC20_ABI, signer);
  const dai = new ethers.Contract(buyToken, MINIMAL_ERC20_ABI, signer);

  // Get pre-swap balances for comparison
  const uniswapBalance = await uniswap.balanceOf(takerAddress);
  console.log(uniswapBalance.toString());
  const daiBalalanceBefore = await dai.balanceOf(takerAddress);
  console.log(daiBalalanceBefore.toString());
  await uniswap.approve(approveAdd, approvalam);
  //console.log(await uniswapapprove.wait(1));
  await dai.approve(approveAdd, ethers.utils.parseEther("2"));
  const uniswapallowance = await uniswap.allowance(takerAddress, approveAdd);
  console.log("Uniswap Allowance", await uniswapallowance.toString());

  //   const params = {
  //     buyToken: buyToken,
  //     sellToken: sellToken,
  //     sellAmount: sellAmount,
  //     takerAddress: takerAddress
  //   }

  await ethers.utils
    .fetchJson(
      `https://api.0x.org/swap/v1/price?buyToken=${buyToken}&sellAmount=${sellAmount}&sellToken=${sellToken}`
    )
    .then((tx) => console.log(tx))
    .catch((error) => console.log(error));

  const quote = await ethers.utils
    .fetchJson(
      `https://api.0x.org/swap/v1/quote?buyToken=${buyToken}&sellAmount=${sellAmount}&sellToken=${sellToken}&takerAddress=${takerAddress}`
    )
    .then( async (tx) => {
     const txResponse = await signer.sendTransaction({
      //from: quote.from,
      to: tx.to,
      data: tx.data,
      value: ethers.BigNumber.from(tx.value || 0),
      gasPrice: ethers.BigNumber.from(tx.gasPrice + tx.gasPrice),
      gasLimit: ethers.BigNumber.from(tx.gas),
    });
    const txReceipt = await txResponse.wait();
    console.log(txReceipt)
    })
    .catch((error) => console.log(error));
  // Check for error from 0x API

  // Impersonate the taker account so that we can submit the quote transaction

  //Send the transaction
    
  // Wait for transaction to confirm
  //const txReceipt = await txResponse.wait();

  // Verify that the transaction was successful
  // expect(txReceipt.status).to.equal(1, "successful swap transaction");

  // Get post-swap balances
  const uniswapBalanceAfter = await uniswap.balanceOf(takerAddress);
  const daiBalanceAfter = await dai.balanceOf(takerAddress);

  console.log(
    `UNI: ${uniswapBalance.toString()} -> ${uniswapBalanceAfter.toString()}`
  );
  console.log(
    `DAI: ${daiBalalanceBefore.toString()} -> ${daiBalanceAfter.toString()}`
  );
}

swap()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
