const express = require("express");
const Web3 = require("web3");
const contract = require("@truffle/contract");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Fix Web3 Instantiation
const web3 = new Web3("http://127.0.0.1:7545");

// ✅ Fix Path to Smart Contract JSON
const votingArtifact = require(path.join(__dirname, "../blockchain/build/contracts/Voting.json"));

// ✅ Fix Truffle Contract Setup
const Voting = contract(votingArtifact);
Voting.setProvider(web3.eth.currentProvider);

// ✅ Fetch Candidates API
app.get("/candidates", async (req, res) => {
    try {
        const accounts = await web3.eth.getAccounts();
        const instance = await Voting.deployed();
        let candidates = [];

        for (let i = 1; i <= 2; i++) {
            let candidate = await instance.candidates(i);
            candidates.push({ 
                id: candidate.id.toNumber(),  // Fix BigNumber conversion
                name: candidate.name, 
                votes: candidate.voteCount.toNumber() // Fix BigNumber conversion
            });
        }

        res.json(candidates);
    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
});

// ✅ Vote API
app.post("/vote", async (req, res) => {
    const { candidateId, voterAddress } = req.body;
    try {
        const instance = await Voting.deployed();
        await instance.vote(candidateId, { from: voterAddress });
        res.send("Vote cast successfully");
    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
});

// ✅ Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));

