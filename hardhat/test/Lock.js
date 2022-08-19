const { expect } = require("chai");
const { ethers, network } = require("hardhat");
const abi = require("../../src/components/constants/erc20abi.json")
// node-fetch version 2 needs to be added to your project
//const fetch = require("node-fetch");

const ONE_ETHER_BASE_UNITS = "1000000000000000000"; // 1 ETH
const MINIMAL_ERC20_ABI = abi

describe("0x API integration", function () {
  it("it should be able to use a 0x API mainnet quote", async function () {
    // Quote parameters
    const sellToken = "0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72"; // ens 0x514910771AF9Ca656af840dff83E8264EcF986CA
    const buyToken = "0x6B175474E89094C44Da98b954EedeAC495271d0F"; // dai - proxy
    const sellAmount = ONE_ETHER_BASE_UNITS;
    const takerAddress = "0xab5801a7d398351b8be11c439e05c5b3259aec9b"; // An account with sufficient balance on mainnet
    const approvalam = "20000000000000000000"
    const approveAdd = "0xdef1c0ded9bec7f1a1670819833240f027b25eff"

    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [takerAddress],
    });

    // Get a signer for the account we are impersonating
    const signer = await ethers.getSigner(takerAddress);
    const ens = new ethers.Contract(sellToken, MINIMAL_ERC20_ABI, signer);
    const dai = new ethers.Contract(buyToken, MINIMAL_ERC20_ABI, signer);

    // Get pre-swap balances for comparison
    const ensBalance = await ens.balanceOf(takerAddress)
    console.log(ensBalance.toString())
    const daiBalalanceBefore = await dai.balanceOf(takerAddress);
    console.log(daiBalalanceBefore.toString())
    const ensapprove = await ens.approve(approveAdd, approvalam)
    console.log(await ensapprove.wait(1))

    const quote = await ethers.utils
      .fetchJson(
        `https://api.0x.org/swap/v1/quote?buyToken=${buyToken}&sellAmount=${sellAmount}&sellToken=${sellToken}&takerAddress=${takerAddress}`
      )
      .then((tx) => console.log(tx)).catch((error) => console.log(error));
    // Check for error from 0x API

    // Impersonate the taker account so that we can submit the quote transaction
   

    // Send the transaction
    const txResponse = await signer.sendTransaction({
      from: quote.from,
      to: quote.to,
      data: quote.data,
      value: ethers.BigNumber.from(quote.value || 0),
      gasPrice: ethers.BigNumber.from(quote.gasPrice),
      gasLimit: ethers.BigNumber.from(quote.gas),
    });
    // Wait for transaction to confirm
    const txReceipt = await txResponse.wait();

    // Verify that the transaction was successful
   // expect(txReceipt.status).to.equal(1, "successful swap transaction");

    // Get post-swap balances
    const etherBalanceAfter = await signer.getBalance();
    const daiBalanceAfter = await dai.balanceOf(takerAddress);

    console.log(
      `ETH: ${etherBalanceBefore.toString()} -> ${etherBalanceAfter.toString()}`
    );
    console.log(
      `DAI: ${daiBalalanceBefore.toString()} -> ${daiBalanceAfter.toString()}`
    );
  });
});
