pragma solidity ^0.8.9;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";

contract Voting {
    event Accepted(uint256 id);
    event Rejected(uint256 id);
    event Discarded(uint256 id);

    uint constant MAX_PROPOSALS_NUMBER = 3;
    uint constant TTL_OF_PROPOSAL = 60 * 60 * 24 * 3;
    ERC20 public token;
    Proposal[MAX_PROPOSALS_NUMBER] public proposals;

    constructor(ERC20 _token) {
        token = _token;
    }

    struct Proposal {
        uint256 id;
        bool isActive;
        address creatorAddress;
        Vote[] votesFor;
        Vote[] votesAgainst;
        uint256 deadlineTimestamp;
    }

    // simple struct for votes history
    struct Vote {
        address voter;
        uint256 value;
        bool isVoteFor; // true --- vote for, false --- vote against
    }

    // creates a new proposal
    function createNewProposal(uint256 id) public {
        uint idx = _findFreeProposalSlot();
        require(idx < MAX_PROPOSALS_NUMBER, "Reached maximum of active proposals");
        require(_findProposalIndexById(id) == MAX_PROPOSALS_NUMBER, "Proposal with this id exists");
        Proposal storage proposal = proposals[idx];

        // if proposal that we found still active, than we must emit Discarded for it
        if (proposal.isActive) {
            emit Discarded(proposal.id);
        }

        proposal.id = id;
        proposal.isActive = true;
        proposal.creatorAddress = msg.sender;
        delete proposal.votesFor;
        delete proposal.votesAgainst;
        proposal.deadlineTimestamp = block.timestamp + TTL_OF_PROPOSAL;
    }

    // sets vote of the user
    function vote(uint256 id, bool isVoteFor, uint256 value) public {
        require(value > 0, "Value should be positive");
        require(token.balanceOf(msg.sender) >= value, "This voter doesn't have enough tokens");

        uint idx = _findProposalIndexById(id);
        require(idx != MAX_PROPOSALS_NUMBER, "No such proposal");
        Proposal storage proposal = proposals[idx];
        require(!(proposal.deadlineTimestamp < block.timestamp), "Proposal has expired");
        require(_checkIfVoted(msg.sender, proposal), "Already voted for proposal");

        if (!_checkProposalVotesValid(proposal)) {
            proposal.isActive = false;
            emit Discarded(id);
            return;
        }

        Vote memory vote = Vote(msg.sender, value, isVoteFor);

        if (isVoteFor) {
            proposal.votesFor.push(vote);
        } else {
            proposal.votesAgainst.push(vote);
        }

        proposal.isActive = !_isCompleted(proposal);
    }

    // @return true if proposal is now active, false otherwise
    function getProposalActive(uint256 id) public view returns (bool) {
        uint idx = _findProposalIndexById(id);
        if (idx == MAX_PROPOSALS_NUMBER) {
            return false;
        }
        return proposals[idx].isActive;
    }

    // @return 2 numbers: first --- votes count for, second --- votes count against
    function getProposalResult(uint256 id) public view returns (uint256, uint256) {
        uint idx = _findProposalIndexById(id);
        require(idx != MAX_PROPOSALS_NUMBER, "No such proposal");
        Proposal storage proposal = proposals[idx];
        return (_count(proposal.votesFor), _count(proposal.votesAgainst));
    }

    // finds index of proposal with given id
    // @return MAX_PROPOSALS_NUMBER if such proposal doesn't exist or index of this slot in other case
    function _findProposalIndexById(uint256 id) internal view returns (uint) {
        for (uint i = 0; i < MAX_PROPOSALS_NUMBER; i++) {
            if (proposals[i].id == id) {
                return i;
            }
        }
        return MAX_PROPOSALS_NUMBER;
    }

    // finds index of free slot for creating a new proposal
    // @return MAX_PROPOSALS_NUMBER if such slot doesn't exist or index of this slot in other case
    function _findFreeProposalSlot() internal view returns (uint) {
        for (uint i = 0; i < MAX_PROPOSALS_NUMBER; i++) {
            if (!proposals[i].isActive) {
                return i;
            }
        }
        uint256 minDeadlineTimestamp = block.timestamp;
        uint result = MAX_PROPOSALS_NUMBER;
        for (uint i = 0; i < MAX_PROPOSALS_NUMBER; i++) {
            if (proposals[i].deadlineTimestamp < minDeadlineTimestamp) {
                minDeadlineTimestamp = proposals[i].deadlineTimestamp;
                result = i;
            }
        }
        return result;
    }

    // @return true if all votes are valid, false otherwise
    function _checkProposalVotesValid(Proposal storage proposal) internal view returns (bool) {
        return _areVotesValid(proposal.votesFor) && _areVotesValid(proposal.votesAgainst);
    }

    // @return true if all voters have valid amount of tokens, false otherwise
    function _areVotesValid(Vote[] storage votes) internal view returns (bool) {
        for (uint i = 0; i < votes.length; i++) {
            if (token.balanceOf(votes[i].voter) < votes[i].value) {
                return false;
            }
        }
        return true;
    }

    // @return true if voter hasn't voted yet, false otherwise
    function _checkIfVoted(address voter, Proposal storage proposal) internal view returns (bool) {
        return _hasAlreadyVoted(voter, proposal.votesFor) && _hasAlreadyVoted(voter, proposal.votesAgainst);
    }

    // @return true if voter hasn't voted yet, false otherwise
    function _hasAlreadyVoted(address voter, Vote[] storage votes) internal view returns (bool) {
        for (uint i = 0; i < votes.length; i++) {
            if (votes[i].voter == voter) {
                return false;
            }
        }
        return true;
    }

    // @return sum of votes values
    function _count(Vote[] storage votes) internal view returns (uint256) {
        uint256 result = 0;
        for (uint i = 0; i < votes.length; i++) {
            result += votes[i].value;
        }
        return result;
    }

    // @return true if proposal completed, false otherwise
    function _isCompleted(Proposal storage proposal) internal returns (bool) {
        if (_count(proposal.votesFor) >= 50) {
            emit Accepted(proposal.id);
            return true;
        }
        if (_count(proposal.votesAgainst) >= 50) {
            emit Rejected(proposal.id);
            return true;
        }
        return false;
    }
}
