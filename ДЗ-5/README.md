# HW-5

## Testing

* Install deps:
    ```shell
    npm install
    ```
* Run tests:
    ```shell
    npx hardhat test
    ```

## Output example

```shell
  RAPHICoin
    √ 6 decimals (1870ms)
    √ Owner has 100000000 (97ms)

  Voting bad
    √ Reached maximum of active proposals (221ms)
    √ Proposal with this id exists (127ms)
    √ Value should be positive (153ms)
    √ This voter doesn't have enough tokens (155ms)
    √ No such proposal (135ms)
    √ Proposal has expired (137ms)
    √ Already voted for proposal (146ms)

  Voting good
    √ Create simple proposal (103ms)
    √ Proposals TTL (174ms)
    √ Proposal result 1 (156ms)
    √ Proposal result 2 (213ms)
    √ Proposal result 3 (186ms)
    √ Voting two proposals (260ms)


  15 passing (4s)
```
