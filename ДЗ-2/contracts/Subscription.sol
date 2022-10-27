pragma solidity;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

interface Subscription {
    function isSubscribed(uint subscriptionId) external returns (bool);
    function addNewSubscription(address token, uint amout, uint updateTimestamp) external;
    function subscribeBySubscriptionId(uint subscriptionId) external;
    function cancelSubscription(uint subscriptionId) external;
    function pay(address subscriber, uint subscriptionId) external;
}