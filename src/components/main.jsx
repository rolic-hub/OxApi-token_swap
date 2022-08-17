import React from 'react'
import {MdSwapVerticalCircle} from "react-icons/md"
import {ethers} from "ethers"
import {useState, useEffect} from "react"

const Main = () => {
    const [account, setAccount] = useState(null)
    const [connected, setConnected] = useState(false)
    const [tokenList, setTokenList] = useState([])
    const {ethereum} = window;
    const connectWallet = async() => {
         if(typeof ethereum == "undefined") return alert("please install metamask")
       try {
        console.log("connecting to metamask")
        await  ethereum.request({ method:  "eth_requestAccounts" });
         const accounts = await ethereum.request({ method: "eth_accounts" });
         //console.log(accounts[0])
         setAccount(accounts[0])
         setConnected(true)
       } catch (error) {
        console.log(error)
       }
    }
     const getListOfTokens = async () => {
        const listResult = await fetch("https://raw.githubusercontent.com/compound-finance/token-list/master/compound.tokenlist.json")
        const response = await listResult.json()
        const data = response.tokens;
        setTokenList(data)

        console.log(data)
     }
     useEffect(() => {
     getListOfTokens()
     }, [])

  return (
    <div >
        <button className="border-4 border-indigo-200 text-xl mt-24 p-2" onClick={connectWallet}>{ connected ? 
        <p>{account.slice(0,5)}...{account.slice(37,42)}</p> :
        <p> connect wallet</p>}</button>
    <div className="mt-16 border rounded-lg bg-black text-white justify-center w-fit flex p-8 flex-col">
      <p>
        Swap
      </p>
      
      <div className="bg-slate-600 w-fit mb-2 pb-8 p-2 rounded-md" >
      <label for="from-tokens">you pay</label>
      <div className="flex p-3 flex-row">
      <select selected="default" name="tokens-to-swap" id="from-tokens">
        <option value="default" selected="default">select a token</option>
            {tokenList.map((token) => (
           <option value={token.symbol} size={10}>{token.symbol}</option>))}
        </select>
        <input className="ml-4" type="number"/>
      </div>
      </div>
      <div  className="absolute mb-20" > 
              <MdSwapVerticalCircle size="50px"/>
      </div>

      <div className="bg-slate-600 pt-8 w-fit p-2 rounded-lg" >
         <label for="to-tokens">you recieve</label>
     <div className="flex p-3  flex-row">
      <select name="tokens to swap" id="to-tokens">
            <option>tokens</option>
            <option>polygon</option>
        </select>
        <input className="ml-4" type="number"/>
     </div>
     
      </div>
      <p className="mt-2"> Estimated Gas:</p>
      <button className="bg-sky-700 mt-8 ml-20 w-fit p-2 rounded-md">swap token </button>
    </div>
    </div>
   
  )
}

export default Main