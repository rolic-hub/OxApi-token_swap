import React from "react";
import { MdSwapVerticalCircle } from "react-icons/md";
import { ethers } from "ethers";
import { useState, useEffect } from "react";
import { Alchemy, Network } from "alchemy-sdk";
import abi from "./constants/erc20abi.json";

const Main = () => {
  const [account, setAccount] = useState(null);
  const [connected, setConnected] = useState(false);
  const [tokenList, setTokenList] = useState([]);
  const [ownerTokens, setOwnerToken] = useState([]);
  const [fromselectValue, setFromSelectvalue] = useState("select a token");
  const [toSelectValue, setToSelectValue] = useState("select a token");
  const [inputValue, setInputValue] = useState(null);
  const [decimal, setDecimal] = useState(null);
  const [price, setPrice] = useState(0);
  const [gasEstimate, setGasEstimate] = useState(0);
  const [target, setTarget] = useState("");
  const [sellTokenAddress, setSellerAddress] = useState("");
  const [value, setValue] = useState(null)
  const { ethereum } = window;

  const address = "0x1b3cB81E51011b549d78bf720b0d924ac763A7C2";

  const config = {
    apiKey: process.env.ALCHEMY_GOERLI_APIKEY,
    network: Network.ETH_MAINNET,
  };

  const alchemy = new Alchemy(config);

  const connectWallet = async () => {
    if (typeof ethereum == "undefined") return alert("please install metamask");
    try {
      console.log("connecting to metamask");
      await ethereum.request({ method: "eth_requestAccounts" });
      const accounts = await ethereum.request({ method: "eth_accounts" });
      //console.log(accounts[0])
      setAccount(accounts[0]);

      setConnected(true);
    } catch (error) {
      console.log(error);
    }
  };

  const getPrice = async () => {
    ownerTokens.forEach((element) => {
      if (element.symbol == fromselectValue) {
        setDecimal(element.decimals);
      }
    });
    if (!fromselectValue) {
      console.log("fill from input");
    } else if (!toSelectValue) {
      console.log("fill to value");
    } else if (!inputValue) {
      console.log("No input value");
    } else if (!decimal) {
      console.log("no decimal");
    } else {
      try {
        const price = await fetch(
          `https://api.0x.org/swap/v1/price?sellToken=${fromselectValue}&buyToken=${toSelectValue}&sellAmount=${
            inputValue * 10 ** decimal
          }`
        );
        const response = await price.json();
        console.log(response);
        setPrice(response.price);
        setGasEstimate(response.estimatedGas);
        setTarget(response.allowanceTarget);
        setSellerAddress(response.sellTokenAddress);
        setValue(response.sellAmount + response.gasPrice + response.gas);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const getQuote = async (addressr) => {
    if(!toSelectValue || !fromselectValue || !inputValue || !decimal) return;
    try {
      const quote = await fetch(
        `https://api.0x.org/swap/v1/quote?buyToken=${toSelectValue}&sellToken=${fromselectValue}&sellAmount=${
          inputValue * 10 ** decimal
        }&takerAddress=${addressr}`
      );
      const response = await quote.json();
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  };

  const trySwap = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const erc20 = new ethers.Contract(sellTokenAddress, abi, signer);
      const approveSwap = await erc20.approve(target, value);
      const receipt = await approveSwap.wait(1)
      console.log(receipt)
      getQuote(account)

    } catch (error) {
      console.log(error);
    }
  };

  const getOwnertokens = async () => {
    const balances = await alchemy.core.getTokenBalances(address);
    //console.log(balances.tokenBalances)
    let tokens = [];
    balances.tokenBalances.forEach((element) => {
      if (element.tokenBalance.toString() > 0) {
        tokens.push(element);
        console.log(parseInt(element.tokenBalance));
      }
    });

    let tokenMetadata = [];
    for (let token of tokens) {
      // Get balance of token
      const balancet = token.tokenBalance.toString();

      const metadata = await alchemy.core.getTokenMetadata(
        token.contractAddress
      );
      tokenMetadata.push(metadata);
    }

    setOwnerToken(tokenMetadata);
  };

  const getListOfTokens = async () => {
    const listResult = await fetch(
      "https://raw.githubusercontent.com/compound-finance/token-list/master/compound.tokenlist.json"
    );
    const response = await listResult.json();
    const data = response.tokens;
    setTokenList(data);

    // console.log(data);
  };
  useEffect(() => {
    if (account == null) return alert("connect wallet");
    getListOfTokens();
    getOwnertokens();
  }, [account]);

  useEffect(() => {
    if (inputValue !== null) {
      getPrice();
      // getQuote(account);
    }
  }, [inputValue]);

  return (
    <div>
      <button
        className="border-4 border-indigo-200 text-xl mt-24 p-2"
        onClick={connectWallet}
      >
        {connected ? (
          <p>
            {account.slice(0, 5)}...{account.slice(37, 42)}
          </p>
        ) : (
          <p> connect wallet</p>
        )}
      </button>

      <div className="mt-16 border rounded-lg bg-black text-white justify-center w-fit flex p-8 flex-col">
        <p>Swap</p>

        <div className="bg-slate-600 w-fit mb-2 pb-8 p-2 rounded-md">
          <label className="ml-6" for="from-tokens">
            you pay
          </label>
          <div className="flex p-3 flex-row">
            <select
              className="text-xl p-2 bg-slate-600"
              name="tokens_to_swap"
              id="from-tokens"
              //defaultValue={fromselectValue}
              onChange={(e) => {
                setFromSelectvalue(e.target.value);
                console.log(e.target.value);
              }}
              value={fromselectValue}
            >
              {ownerTokens.map((token) => (
                <option value={token.symbol}>{token.symbol}</option>
              ))}
            </select>
            <button className="w-fit h-fit mt-2 ml-2 bg-blue-700">MAX</button>

            <div>
              <input
                className="ml-4 w-max rounded-md p-2 text-white text-center bg-black"
                type="number"
                onChange={(e) => setInputValue(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="absolute ml-16 mb-20">
          <MdSwapVerticalCircle size="50px" />
        </div>

        <div className="bg-slate-600 pt-8 w-fit p-3 rounded-lg">
          <label className="ml-6" for="to-tokens">
            you recieve
          </label>
          <div className="flex p-3 flex-row">
            <select
              className="text-xl p-2 bg-slate-600"
              name="tokens_to_swap"
              id="from-tokens"
              value={toSelectValue}
              onChange={(e) => {
                setToSelectValue(e.target.value);
                console.log(e.target.value);
              }}
            >
              {tokenList.map((token) => (
                <option value={token.symbol}>{token.symbol}</option>
              ))}
            </select>

            <div>
              <input
                className="ml-7 w-max rounded-md p-2 text-white text-center bg-black"
                type="number"
                readOnly
                value={price === 0 ? "" : price}
              />
            </div>
          </div>
        </div>
        <p className="mt-2">
          {" "}
          Estimated Gas: {gasEstimate === 0 ? "" : gasEstimate}
        </p>
        <button onClick={trySwap} className="bg-sky-700 mt-8 ml-20 w-fit p-2 rounded-md">
          swap token{" "}
        </button>
      </div>
    </div>
  );
};

export default Main;
