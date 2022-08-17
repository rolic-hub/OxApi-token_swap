import React from 'react'

const Main = () => {
  return (
    <div className="mt-24 border bg-black text-white justify-center w-fit flex p-8 flex-col">
      <p>
        Swap
      </p>
      <label for="to-tokens">from</label>
      <div className="flex p-3 flex-row bg-slate-600 w-fit mb-8" >
     
        <select name="tokens to swap" type="from-tokens">
            <option>tokens</option>
            <option>polygon</option>
        </select>
        <input className="ml-4" type="number"/>
      </div>
      <label for="to-tokens">to</label>
      <div className="flex p-3 flex-row bg-slate-600 w-fit" >
     
      <select name="tokens to swap" id="to-tokens">
            <option>tokens</option>
            <option>polygon</option>
        </select>
        <input className="ml-4" type="number"/>
      </div>
      <button></button>
    </div>
  )
}

export default Main