# Sample Hardhat Project

## Testing

* Install deps:
    ```shell
    npm install
    ```
* Set evn variable `ALCHEMY_URL` in `.env` file
* Run tests:
    ```shell
    npx hardhat test
    ```

## Output example

```shell
  RAPHI_COIN
--------------------------------------------------
user RAPHI_COIN balance before swap: 32000000000000000000
user USD_COIN balance before swap: 0
reserve before swap: 10000000000000000000,10000000000000000000,1668721146
--------------------------------------------------
user RAPHI_COIN after before swap: 31000000000000000000
user USD_COIN after before swap: 906610893880149131
reserve after swap: 9093389106119850869,11000000000000000000,1668721148
--------------------------------------------------
    ✔ Create pair and swap token with USD_COIN (9946ms)


  1 passing (10s)
```
