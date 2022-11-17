const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

const USD_COIN_ADDRESS = "0x0000000000085d4780B73119b644AE5ecd22b376";
const USD_COIN_WHALET_ADDRESS = "0x662353d1A53C88c85E546d7C4A72CE8fE1018e72";
const UNISWAP_FACTORY_ADDRESS = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
const UNISWAP_ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

describe("RAPHI_COIN", function () {
  async function buildAccounts() {
    let [user1, user2] = await ethers.getSigners();
    let UsdCoinUser = await ethers.getImpersonatedSigner(USD_COIN_WHALET_ADDRESS);
    await user2.sendTransaction({
      to: UsdCoinUser.address,
      value: ethers.utils.parseEther("1"),
    });

    let RAPHI_COIN = await (await ethers.getContractFactory("RAPHICoin")).deploy(ethers.utils.parseEther("42"));

    let USD_COIN = await ethers.getContractAt("IERC20", USD_COIN_ADDRESS);
    await USD_COIN.connect(UsdCoinUser).transfer(user1.address, ethers.utils.parseEther("10"));
    return { user: user1, RAPHI_COIN, USD_COIN };
  }

  it("Create pair and swap token with USD_COIN", async function () {
    let { user, RAPHI_COIN, USD_COIN } = await buildAccounts();

    let factory = await ethers.getContractAt("IUniswapV2Factory", UNISWAP_FACTORY_ADDRESS);
    await factory.createPair(USD_COIN.address, RAPHI_COIN.address);
    let pair = await ethers.getContractAt("IUniswapV2Pair", await factory.getPair(USD_COIN.address, RAPHI_COIN.address));
    await USD_COIN.connect(user).transfer(pair.address, ethers.utils.parseEther("10"));
    await RAPHI_COIN.transfer(pair.address, ethers.utils.parseEther("10"));
    await pair.mint(user.address);

    let user_RAPHI_COIN_balance_before_swap = await RAPHI_COIN.balanceOf(user.address);
    let user_USD_COIN_balance_before_swap = await USD_COIN.balanceOf(user.address);
    let reserve_before_swap = await pair.getReserves();
    console.log("-".repeat(50))
    console.log("user RAPHI_COIN balance before swap: " + user_RAPHI_COIN_balance_before_swap);
    console.log("user USD_COIN balance before swap: " + user_USD_COIN_balance_before_swap);
    console.log("reserve before swap: " + reserve_before_swap);
    console.log("-".repeat(50))

    let router = await ethers.getContractAt("IUniswapV2Router01", UNISWAP_ROUTER_ADDRESS);
    await RAPHI_COIN.approve(router.address, ethers.utils.parseEther("3"));
    await router.swapExactTokensForTokens(
      ethers.utils.parseEther("1"),
      0,
      [RAPHI_COIN.address, USD_COIN.address],
      user.address,
      Date.now() + 10 * 60 * 1000,
    );

    let user_RAPHI_COIN_balance_after_swap = await RAPHI_COIN.balanceOf(user.address);
    let user_USD_COIN_balance_after_swap = await USD_COIN.balanceOf(user.address);
    let reserve_after_swap = await pair.getReserves();
    console.log("user RAPHI_COIN after before swap: " + user_RAPHI_COIN_balance_after_swap);
    console.log("user USD_COIN after before swap: " + user_USD_COIN_balance_after_swap);
    console.log("reserve after swap: " + reserve_after_swap);
    console.log("-".repeat(50))
  });
});
