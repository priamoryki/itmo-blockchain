const {expect} = require("chai");
const {ethers} = require("hardhat");

const WETH_ADDRESS = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
const DAI_ADDRESS = "0x6b175474e89094c44da98b954eedeac495271d0f"
const WBTC_ADDRESS = "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599"

const capture = (varToCapture) => {
    return (value) => {
        varToCapture.result = value
        return true
    }
}

describe("Flashloan", function () {
    it("Transfer", async function () {
        const owner = await ethers.getImpersonatedSigner("0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619");
        const balance = ethers.utils.parseEther("0.001");
        const flashloanAmount = ethers.utils.parseEther("0.005");

        const Flashloan = await ethers.getContractFactory("Flashloan");
        const flashloan = await Flashloan.deploy(
            "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5",
            "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
            [WETH_ADDRESS, DAI_ADDRESS, WBTC_ADDRESS, WETH_ADDRESS]
        );

        const WETH = await ethers.getContractAt("@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20", WETH_ADDRESS);

        const prevBalance = await WETH.balanceOf(owner.address)
        expect(prevBalance).to.greaterThan(balance);
        await WETH.connect(owner).transfer(flashloan.address, balance)

        expect(await WETH.balanceOf(owner.address)).to.equal(prevBalance.sub(balance));
        expect(await WETH.balanceOf(flashloan.address)).to.equal(balance);

        let [capturedValue1, capturedValue2] = [{result: 0}, {result: 0}]
        await expect(flashloan.flashloan(flashloanAmount)).to.emit(flashloan, "Log").withArgs(
            capture(capturedValue1), capture(capturedValue2)
        );
        console.log(`balance: ${capturedValue1.result.toString()}, total: ${capturedValue2.result.toString()}`);

        expect(await WETH.balanceOf(flashloan.address)).to.lessThan(balance).and.greaterThan(0);
    });
});
