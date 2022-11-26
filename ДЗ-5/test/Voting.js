const {expect} = require("chai");
const {ethers} = require("hardhat");
const {time} = require("@nomicfoundation/hardhat-network-helpers");

const SECONDS_IN_DAY = 24 * 60 * 60;

describe("RAPHICoin", function () {
    it("6 decimals", async function () {
        const RAPHICoin = await (await ethers.getContractFactory("RaphiCoin")).deploy();

        expect(await RAPHICoin.decimals()).to.equal(6);
    });

    it("Owner has 100000000", async function () {
        const [owner] = await ethers.getSigners();
        const RAPHICoin = await (await ethers.getContractFactory("RaphiCoin")).deploy();

        const ownerBalance = await RAPHICoin.balanceOf(owner.address);
        const balance = ethers.BigNumber.from("100000000")
        expect(ownerBalance).to.equal(balance);
    });
});

describe("Voting bad", function () {
    it("Reached maximum of active proposals", async function () {
        const [owner, user1, user2, user3] = await ethers.getSigners();
        const RAPHICoin = await (await ethers.getContractFactory("RaphiCoin")).deploy();
        const voting = await (await ethers.getContractFactory("Voting")).deploy(RAPHICoin.address);

        const id1 = ethers.BigNumber.from(1);
        const id2 = ethers.BigNumber.from(2);
        const id3 = ethers.BigNumber.from(3);
        const id4 = ethers.BigNumber.from(4);

        await voting.connect(user1).createNewProposal(id1);
        await voting.connect(user1).createNewProposal(id2);
        await voting.connect(user1).createNewProposal(id3);

        await expect(voting.connect(user1).createNewProposal(id4)).to.revertedWith("Reached maximum of active proposals");
    });

    it("Proposal with this id exists", async function () {
        const [owner, user1, user2, user3] = await ethers.getSigners();
        const RAPHICoin = await (await ethers.getContractFactory("RaphiCoin")).deploy();
        const voting = await (await ethers.getContractFactory("Voting")).deploy(RAPHICoin.address);

        const id = ethers.BigNumber.from(1);

        await voting.connect(user1).createNewProposal(id);

        await expect(voting.connect(user1).createNewProposal(id)).to.revertedWith("Proposal with this id exists");
    });

    it("Value should be positive", async function () {
        const [owner, user1, user2, user3] = await ethers.getSigners();
        const RAPHICoin = await (await ethers.getContractFactory("RaphiCoin")).deploy();
        const voting = await (await ethers.getContractFactory("Voting")).deploy(RAPHICoin.address);

        RAPHICoin.transfer(user1.address, 25);

        const id = ethers.BigNumber.from(1);

        await voting.connect(user1).createNewProposal(id);

        await expect(voting.connect(user1).vote(id, false, 0)).to.revertedWith("Value should be positive");
    });

    it("This voter doesn't have enough tokens", async function () {
        const [owner, user1, user2, user3] = await ethers.getSigners();
        const RAPHICoin = await (await ethers.getContractFactory("RaphiCoin")).deploy();
        const voting = await (await ethers.getContractFactory("Voting")).deploy(RAPHICoin.address);

        RAPHICoin.transfer(user1.address, 25);

        const id = ethers.BigNumber.from(1);

        await voting.connect(user1).createNewProposal(id);

        await expect(voting.connect(user1).vote(id, false, 50)).to.revertedWith("This voter doesn't have enough tokens");
    });

    it("No such proposal", async function () {
        const [owner, user1, user2, user3] = await ethers.getSigners();
        const RAPHICoin = await (await ethers.getContractFactory("RaphiCoin")).deploy();
        const voting = await (await ethers.getContractFactory("Voting")).deploy(RAPHICoin.address);

        RAPHICoin.transfer(user1.address, 25);

        const id1 = ethers.BigNumber.from(1);
        const id2 = ethers.BigNumber.from(2);

        await voting.connect(user1).createNewProposal(id1);

        await expect(voting.connect(user1).vote(id2, false, 25)).to.revertedWith("No such proposal");
    });

    it("Proposal has expired", async function () {
        const [owner, user1, user2, user3] = await ethers.getSigners();
        const RAPHICoin = await (await ethers.getContractFactory("RaphiCoin")).deploy();
        const voting = await (await ethers.getContractFactory("Voting")).deploy(RAPHICoin.address);

        RAPHICoin.transfer(user1.address, 25);

        const id = ethers.BigNumber.from(1);

        await voting.connect(user1).createNewProposal(id);
        await time.increase(3 * SECONDS_IN_DAY);

        await expect(voting.connect(user1).vote(id, false, 25)).to.revertedWith("Proposal has expired");
    });

    it("Already voted for proposal", async function () {
        const [owner, user1, user2, user3] = await ethers.getSigners();
        const RAPHICoin = await (await ethers.getContractFactory("RaphiCoin")).deploy();
        const voting = await (await ethers.getContractFactory("Voting")).deploy(RAPHICoin.address);

        RAPHICoin.transfer(user1.address, 25);

        const id = ethers.BigNumber.from(1);

        await voting.connect(user1).createNewProposal(id);
        await voting.connect(user1).vote(id, true, 25);

        await expect(voting.connect(user1).vote(id, false, 25)).to.revertedWith("Already voted for proposal");
    });
});

describe("Voting good", function () {
    it("Create simple proposal", async function () {
        const [owner, user1, user2, user3] = await ethers.getSigners();
        const RAPHICoin = await (await ethers.getContractFactory("RaphiCoin")).deploy();
        const voting = await (await ethers.getContractFactory("Voting")).deploy(RAPHICoin.address);

        const id = ethers.BigNumber.from(1);

        await voting.connect(user1).createNewProposal(id);
        expect(await voting.getProposalActive(id)).to.true;
    });

    it("Proposals TTL", async function () {
        const [owner, user1, user2, user3] = await ethers.getSigners();
        const RAPHICoin = await (await ethers.getContractFactory("RaphiCoin")).deploy();
        const voting = await (await ethers.getContractFactory("Voting")).deploy(RAPHICoin.address);

        const id1 = ethers.BigNumber.from(1);
        const id2 = ethers.BigNumber.from(2);
        const id3 = ethers.BigNumber.from(3);
        const id4 = ethers.BigNumber.from(4);

        await voting.connect(user1).createNewProposal(id1);
        await time.increase(SECONDS_IN_DAY);
        await voting.connect(user1).createNewProposal(id2);
        await voting.connect(user1).createNewProposal(id3);
        await time.increase(2 * SECONDS_IN_DAY);

        expect(await voting.connect(user1).createNewProposal(id4)).to.not.reverted;
        expect(await voting.getProposalActive(id1)).to.false;
        expect(await voting.getProposalActive(id2)).to.true;
        expect(await voting.getProposalActive(id3)).to.true;
        expect(await voting.getProposalActive(id4)).to.true;
    });

    it("Proposal result 1", async function () {
        const [owner, user1, user2, user3] = await ethers.getSigners();
        const RAPHICoin = await (await ethers.getContractFactory("RaphiCoin")).deploy();
        const voting = await (await ethers.getContractFactory("Voting")).deploy(RAPHICoin.address);

        RAPHICoin.transfer(user1.address, 50);

        const id = ethers.BigNumber.from(1);

        await voting.connect(user1).createNewProposal(id);

        expect(await voting.connect(user1).vote(id, true, 50)).to.emit(voting, "Accepted").withArgs(id);
        expect(await voting.getProposalActive(id)).to.false;
    });

    it("Proposal result 2", async function () {
        const [owner, user1, user2, user3] = await ethers.getSigners();
        const RAPHICoin = await (await ethers.getContractFactory("RaphiCoin")).deploy();
        const voting = await (await ethers.getContractFactory("Voting")).deploy(RAPHICoin.address);

        RAPHICoin.transfer(user1.address, 25);
        RAPHICoin.transfer(user2.address, 40);

        const id = ethers.BigNumber.from(1);

        await voting.connect(user1).createNewProposal(id);
        await voting.connect(user1).vote(id, true, 25);

        expect(await voting.getProposalActive(id)).to.true;
        expect(await voting.connect(user2).vote(id, true, 40)).to.emit(voting, "Accepted").withArgs(id);
        expect(await voting.getProposalActive(id)).to.false;
    });

    it("Proposal result 3", async function () {
        const [owner, user1, user2, user3] = await ethers.getSigners();
        const RAPHICoin = await (await ethers.getContractFactory("RaphiCoin")).deploy();
        const voting = await (await ethers.getContractFactory("Voting")).deploy(RAPHICoin.address);

        RAPHICoin.transfer(user1.address, 25);
        RAPHICoin.transfer(user2.address, 50);

        const id = ethers.BigNumber.from(1);

        await voting.connect(user1).createNewProposal(id);
        await voting.connect(user1).vote(id, true, 25);

        expect(await voting.getProposalActive(id)).to.true;
        expect(await voting.connect(user2).vote(id, false, 50)).to.emit(voting, "Rejected").withArgs(id);
        expect(await voting.getProposalActive(id)).to.false;
    });

    it("Voting two proposals", async function () {
        const [owner, user1, user2, user3] = await ethers.getSigners();
        const RAPHICoin = await (await ethers.getContractFactory("RaphiCoin")).deploy();
        const voting = await (await ethers.getContractFactory("Voting")).deploy(RAPHICoin.address);

        RAPHICoin.transfer(user1.address, 25);
        RAPHICoin.transfer(user2.address, 40);

        const id1 = ethers.BigNumber.from(1);
        const id2 = ethers.BigNumber.from(2);

        await voting.connect(user2).createNewProposal(id1);
        await voting.connect(user2).createNewProposal(id2);
        await voting.connect(user2).vote(id1, true, 40);
        await voting.connect(user2).vote(id2, false, 40);

        expect(await voting.connect(user1).vote(id2, false, 25)).to.emit(voting, "Rejected").withArgs(id2);
        expect(await voting.connect(user1).vote(id1, true, 25)).to.emit(voting, "Accepted").withArgs(id1);
    });
});
