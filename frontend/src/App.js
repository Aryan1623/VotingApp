import React, { useEffect, useState } from "react";
import Web3 from "web3";
import VotingContract from "./contracts/Voting.json"; // Ensure it's inside `src/` folder

const App = () => {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [web3, setWeb3] = useState(null);
  const [totalVotes, setTotalVotes] = useState(0); // ✅ Store total votes

  useEffect(() => {
    const loadBlockchainData = async () => {
      let web3Instance;

      if (window.ethereum) {
        web3Instance = new Web3(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });
      } else {
        const provider = new Web3.providers.HttpProvider("http://127.0.0.1:8545");
        web3Instance = new Web3(provider);
      }

      setWeb3(web3Instance);

      try {
        const accounts = await web3Instance.eth.getAccounts();
        setAccount(accounts[0]);

        const networkId = await web3Instance.eth.net.getId();
        const networkData = VotingContract.networks[networkId];

        if (networkData) {
          const voting = new web3Instance.eth.Contract(VotingContract.abi, networkData.address);
          setContract(voting);

          // ✅ Fetch all candidates and their votes
          const candidatesCount = await voting.methods.candidatesCount().call();
          let tempCandidates = [];
          let totalVotesCount = 0;

          for (let i = 1; i <= candidatesCount; i++) {
            const candidate = await voting.methods.candidates(i).call();
            const voteCount = parseInt(candidate.voteCount);
            totalVotesCount += voteCount;
            tempCandidates.push({
              id: candidate.id,
              name: candidate.name,
              votes: voteCount,
            });
          }

          setCandidates(tempCandidates);

          // ✅ Load & set total votes from localStorage (if available)
          const storedVotes = localStorage.getItem("totalVotes");
          if (storedVotes) {
            setTotalVotes(parseInt(storedVotes)); // Use stored value
          } else {
            setTotalVotes(totalVotesCount); // Otherwise, use blockchain value
          }
        } else {
          console.error("Smart contract not found on this network.");
        }
      } catch (error) {
        console.error("Error connecting to blockchain:", error);
      }
    };

    loadBlockchainData();
  }, [account]); // ✅ Reload when account changes

  // ✅ Fetch updated votes from the contract
  const updateVoteCount = async () => {
    if (contract) {
      const candidatesCount = await contract.methods.candidatesCount().call();
      let tempCandidates = [];
      let totalVotesCount = 0;

      for (let i = 1; i <= candidatesCount; i++) {
        const candidate = await contract.methods.candidates(i).call();
        const voteCount = parseInt(candidate.voteCount);
        totalVotesCount += voteCount;
        tempCandidates.push({
          id: candidate.id,
          name: candidate.name,
          votes: voteCount,
        });
      }

      setCandidates(tempCandidates);

      // ✅ Update total votes in state and localStorage
      setTotalVotes((prevVotes) => {
        const newTotalVotes = prevVotes + 1;
        localStorage.setItem("totalVotes", newTotalVotes); // ✅ Store updated votes
        return newTotalVotes;
      });
    }
  };

  const vote = async (id) => {
    if (contract && account && web3) {
      console.log("Voting for candidate ID:", id);
      try {
        await contract.methods.vote(id).send({
          from: account,
          gas: 2000000,
          gasPrice: web3.utils.toWei("2", "gwei"),
        });

        alert("Vote successfully cast!");

        // ✅ Fetch latest votes from blockchain
        updateVoteCount();
      } catch (error) {
        console.error("Error while voting:", error);

        if (error.message.includes("out of gas")) {
          alert("Transaction failed: Out of gas. Try increasing gas limit.");
        } else {
          alert("Voting failed! Please check the console for details.");
        }
      }
    } else {
      alert("Contract or account not found. Make sure you're connected to Metamask.");
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-blue-600">Blockchain Voting System</h1>
      <p className="text-lg mt-2">Connected Account: {account || "Not Connected"}</p>

      {/* ✅ Show total votes (Persisted) */}
      <div className="mt-4 text-xl font-semibold text-gray-800">
        Total Votes: {totalVotes}
      </div>

      <div className="mt-6 w-full max-w-md">
        {candidates.map((candidate) => (
          <div key={candidate.id} className="flex justify-between p-4 bg-white shadow-md rounded-lg mt-2">
            <span className="text-lg font-semibold">{candidate.name}</span>
            <span className="text-lg">Votes: {candidate.votes}</span>
            <button
              onClick={() => vote(candidate.id)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Vote
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
