// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    struct Voter {
        bool voted;
        uint vote;
    }

    address public admin;
    mapping(uint => Candidate) public candidates;
    mapping(address => Voter) public voters;
    uint public candidatesCount;
    bool public votingStarted;

    event VotedEvent(address indexed voter, uint indexed candidateId);
    event CandidateAdded(uint indexed candidateId, string name);
    event VotingStarted();

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    constructor() {
        admin = msg.sender;
        _addCandidate("Alice");
        _addCandidate("Bob");
        votingStarted = true;
    }

    function startVoting() external onlyAdmin {
        require(!votingStarted, "Voting has already started");
        votingStarted = true;
        emit VotingStarted();
    }

    function addCandidate(string calldata _name) external onlyAdmin {
        require(!votingStarted, "Cannot add candidates after voting has started");
        _addCandidate(_name);
    }

    function _addCandidate(string memory _name) internal {
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
        emit CandidateAdded(candidatesCount, _name);
    }

    function vote(uint _candidateId) external {
        require(votingStarted, "Voting has not started yet");
        require(!voters[msg.sender].voted, "You have already voted");
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Invalid candidate ID");

        voters[msg.sender] = Voter(true, _candidateId);
        candidates[_candidateId].voteCount++;

        emit VotedEvent(msg.sender, _candidateId);
    }

    function getCandidateVotes(uint _candidateId) external view returns (uint) {
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Invalid candidate ID");
        return candidates[_candidateId].voteCount;
    }

    function getCandidate(uint _candidateId) external view returns (string memory, uint) {
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Invalid candidate ID");
        Candidate memory c = candidates[_candidateId];
        return (c.name, c.voteCount);
    }

    function hasVoted(address _voter) external view returns (bool) {
        return voters[_voter].voted;
    }
}
