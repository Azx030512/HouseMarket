# BuyMyRoom Contract

Try running some of the following tasks:

```shell
# run test script
npx hardhat test
# run deploy script
npx hardhat run scripts/deploy.ts

# deploy on ganache
# you should start a ganache application before you run this command
npx hardhat run scripts/deploy.ts --network ganache
```

### Curl commands for windows

```
Invoke-WebRequest -Uri "http://localhost:8545" -Method POST -Body '{"jsonrpc":"2.0","method":"eth_coinbase", "id":1}' -ContentType "application/json"
```

```

```
