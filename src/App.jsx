import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import "./App.css";
import abi from "./utils/WavePortal.json";

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  /*
   * All state property to store all waves
   */
  const [allWaves, setAllWaves] = useState([]);
  // This will handle your input message 
  const [inputMsg, setInputMsg] = useState("");
  const contractAddress = "0xfFc9813D6c465AeDab1e7DFf7553B2C308869Dcf";
  const contractABI = abi.abi;

  /*
   * Create a method that gets all waves from your contract
   */
  const getAllWaves = async () => {
    const { ethereum } = window;
    
    try {      
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        const waves = await wavePortalContract.getAllWaves();

        let wavesCleaned = waves.map((wave) => {
          return {
            address : wave.waver,
            timestamp : new Date(wave.timestamp * 1000),
            message : wave.message,
          };
        });

        setAllWaves(wavesCleaned);
      } 
      else {
        console.log("Ethereum object doesn't exist!")
      }
    } 
    catch (error) {
      console.log(error);
    }
  };

  // const handleMessage = (e) => {
  //   setInputMsg(e.target.value);
  // }

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  };

  const wave = async (message) => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        /*
        * Execute the actual wave from your smart contract
        */
        const waveTxn = await wavePortalContract.wave(message, { gasLimit: 300000 });
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
      } 
      else {
        console.log("Ethereum object doesn't exist!");
      }
    } 
    catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  useEffect(() => {
    let wavePortalContract;

    const onNewWave = (from, timestamp, message) => {
        console.log("NewWave", from, timestamp, message);
        setAllWaves((prevState) => [
            ...prevState,
            {
                address: from,
                timestamp: new Date(timestamp * 1000),
                message: message,
            },
        ]);
    };

    if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();

        wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
        wavePortalContract.on("NewWave", onNewWave);
    }

    return () => {
        if (wavePortalContract) {
            wavePortalContract.off("NewWave", onNewWave);
        }
    };
  }, []);  
  
  useEffect(() => {
    if (window.ethereum) {
      getAllWaves();
    }
  }, [window.ethereum]);
  
  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
          👋 Hey there!
        </div>

        <div className="bio">
          I am Yash and I worked on blockchain and quantum computing so that's pretty cool right? Connect your Ethereum wallet and wave at me!
        </div>

        <hr></hr>
    
        <input placeholder="Enter message here..." value={inputMsg} onChange={(event) => setInputMsg(event.target.value)}/>
        
        <button className="waveButton" onClick={() => wave(inputMsg)}>
          Wave at Me
        </button>

        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        {allWaves.map((wave, index) => {
          return (
            <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>)
        })}
      </div>
    </div>
  );
}

export default App