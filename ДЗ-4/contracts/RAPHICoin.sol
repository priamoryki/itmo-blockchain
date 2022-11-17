pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract RAPHICoin is ERC20 {
    constructor(uint256 initialSupply) ERC20("My token", "RAPHI_COIN") {
        _mint(msg.sender, initialSupply);
    }
}
