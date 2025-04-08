import React, { useState, useEffect } from "react";
import Web3 from "web3";
import axios from "axios";

const Vote = () => {
    const [candidates, setCandidates] = useState([]);
    const [account, setAccount] = useState("");

    useEffect(() => {
        const loadBlockchainData = async () => {
            const web3 = new Web3(Web3.givenProvider || "http://localhost:7545");
            const accounts = await web3.eth.requestAccounts();
            setAccount(accounts[0]);

            const response = await axios.get("http://localhost:5000/candidates");
            setCandidates(response.data);
        };

        loadBlockchainData();
    }, []);

    const vote = async (id) => {
        await axios.post("http://localhost:5000/vote", { candidateId: id, voterAddress: account });
        alert("Vote casted successfully!");
    };

    return (
        <div>
            <h2>Vote for Your Candidate</h2>
            {candidates.map((candidate) => (
                <div key={candidate.id}>
                    <h3>{candidate.name} - {candidate.votes} votes</h3>
                    <button onClick={() => vote(candidate.id)}>Vote</button>
                </div>
            ))}
        </div>
    );
};

export default Vote;
