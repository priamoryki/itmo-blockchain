# ETHMonitor

## Build and Run

Build:
```cmd
mvn clean install
```

Run:
* Set WEBSOCKET_LINK evn variable:
  * Windows: `set WEBSOCKET_LINK="YOUR WEBSOCKET LINK HERE"`
  * Linux: `export WEBSOCKET_LINK="YOUR WEBSOCKET LINK HERE"`
* Then:
    ```cmd
    mvn exec:java -Dexec.mainClass="com.priamoryki.ETHMonitor.Main"
    ```

## Output example
```
ETH_USDT update: ts=1667490947, current=154162000000, roundId=36208
New Block with params: ts=1667490947, number=15890523, hash=0x9f7cd0bd28c902e2b80b1777878e80cdf7810d8e979bd7edfc2d9a73cc767bb9
New Block with params: ts=1667490959, number=15890524, hash=0xe743f969aad39b51c45e21f7e1745686d53722f0e80ac313e310f38918d34478
New Block with params: ts=1667490971, number=15890525, hash=0xdb117f03af339f5f471777dc5054a5da73f23d2545d7bec73a990954936aceb8
New Block with params: ts=1667490983, number=15890526, hash=0x40cfa92b06c5111e67323d2d15b7fd8bf48f6d02ea342707a6c594e287c93105
New Block with params: ts=1667490995, number=15890527, hash=0x733663f4dbe9f8052ed7fc84d83ad11fdb0268cd236d3033bdf5910a987405a1
New Block with params: ts=1667491007, number=15890528, hash=0x4c5ed11048ef9eda670999627a019e9d623c03292adaa4b14fdb266cda1458dd
New Block with params: ts=1667491019, number=15890529, hash=0x634b88c593263cafacc3c5a4fe3e43034620d2eecf1384f139b9b340f3665faf
New Block with params: ts=1667491031, number=15890530, hash=0xaf26d029c5cbe87801de301fa829b4afc500de5665b5964a954fcdbee43baada
```
