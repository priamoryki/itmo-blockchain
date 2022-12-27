pragma solidity 0.6.12;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import {IUniswapV2Router02} from "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import {FlashLoanReceiverBase, ILendingPoolAddressesProvider} from "@aave/protocol-v2/contracts/flashloan/base/FlashLoanReceiverBase.sol";

contract Flashloan is FlashLoanReceiverBase {
    event Log(
        uint256 balance,
        uint256 total
    );

    address public router;
    address[] public path;

    constructor(
        address _addressProvider,
        address _router,
        address[] memory _path
    ) FlashLoanReceiverBase(ILendingPoolAddressesProvider(_addressProvider)) public {
        router = _router;
        path = _path;
    }

    function executeOperation(
        address[] calldata assets,
        uint256[] calldata amounts,
        uint256[] calldata premiums,
        address initiator,
        bytes calldata params
    ) external override returns (bool) {
        SafeERC20.safeApprove(IERC20(assets[0]), router, amounts[0]);
        IUniswapV2Router02(router).swapExactTokensForTokens(amounts[0], 0, path, address(this), block.timestamp);
        uint256 balance = IERC20(assets[0]).balanceOf(address(this));
        uint256 total = amounts[0] + premiums[0];
        emit Log(balance, total);
        SafeERC20.safeApprove(IERC20(assets[0]), address(LENDING_POOL), total);
        return true;
    }

    function flashloan(uint256 _amount) public {
        address receiverAddress = address(this);

        address[] memory assets = new address[](1);
        assets[0] = path[0];

        uint256[] memory amounts = new uint256[](1);
        amounts[0] = _amount;

        uint256[] memory modes = new uint256[](1);
        modes[0] = 0;

        LENDING_POOL.flashLoan(
            receiverAddress,
            assets,
            amounts,
            modes,
            address(this),
            "",
            0
        );
    }
}
