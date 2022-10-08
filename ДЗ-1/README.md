# ДЗ-1 К занятию “Обзорная лекция - смарт-контракты”

* https://github.com/gnosis/MultiSigWallet/blob/master/contracts/MultiSigWallet.sol - сделать, чтобы с баланса multisig-контракта за одну транзакцию не могло бы уйти больше, чем 66 ETH
  ```diff
  /*
   *  Constants
   */
   uint constant public MAX_OWNER_COUNT = 50; 
   + // Константа для чистоты кода
   + uint constant public MAX_TRANSFER_VALUE = 66 ether;
  ```
    
  ```diff
  + // Валидатор на сумму трансфера
  + modifier validateTransferValue(uint value) {
  +     require(value <= MAX_TRANSFER_VALUE);
  +     _;
  + }
  function submitTransaction(address destination, uint value, bytes data)
      public
  +    validateTransferValue(value)
  returns (uint transactionId)
  {
  ```

* https://github.com/OpenZeppelin/openzeppelin-contracts/blob/f2112be4d8e2b8798f789b948f2a7625b2350fe7/contracts/token/ERC20/ERC20.sol - сделать, чтобы токен не мог бы быть transferred по субботам
  ```diff
  function _transfer(address sender, address recipient, uint256 amount) internal virtual {
      require(sender != address(0), "ERC20: transfer from the zero address");
      require(recipient != address(0), "ERC20: transfer to the zero address");
  
      _beforeTokenTransfer(sender, recipient, amount);
  +    Время в секундах считая от 1 Января 1970, Среда
  +    uint currentUnixTime = block.timestamp;
  +    // Количество целых дней считая от 1 Января 1970
  +    uint dayNum = currentUnixTime / (60 * 60 * 24);
  +    // 0 - Понедельник, 6 - Воскресенье
  +    // weekDay = (dayNum - 2) % 7
  +    require(weekDay != 5, "ERC20: can't make transfer on Saturday")
      require(_balances[sender] >= amount, "ERC20: transfer amount exceeds balance");
  ```

* https://github.com/mixbytes/solidity/blob/076551041c420b355ebab40c24442ccc7be7a14a/contracts/token/DividendToken.sol - сделать чтобы платеж в ETH принимался только специальной функцией, принимающей помимо ETH еще комментарий к платежу (bytes[32]). Простая отправка ETH в контракт запрещена
  ```diff
  - event Deposit(address indexed sender, uint256 value);
  + event Deposit(address indexed sender, uint256 value, bytes32 message);
  ```
  
  ```diff
  - function() external payable {
  + function deposit(bytes32 message) external payable {
      if (msg.value > 0) {
  -         emit Deposit(msg.sender, msg.value);
  +         emit Deposit(msg.sender, msg.value, message);
          m_totalDividends = m_totalDividends.add(msg.value);
      }
  }
  ```
