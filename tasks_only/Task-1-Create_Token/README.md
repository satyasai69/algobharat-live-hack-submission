## Asset Creation Results

The token was successfully created on Algorand TestNet with the following details:

- Asset ID: 741162702
- Asset Explorer URL: https://lora.algokit.io/testnet/asset/741162702
- Creation Transaction: https://lora.algokit.io/testnet/transaction/JDFVGO6LRU7GC23JWHIMJF3DVIHHFC3TPWH3HTAEC6B37ZCVQ5UQ

You can verify the token creation and its details using the provided URLs above. A screenshot of the successful creation is available in `Screenshot.png`.





# Create Token using AlgoKit

This project demonstrates how to create an Algorand Standard Asset (ASA) using AlgoKit utilities. The example creates a fungible token named "Really Useful Gift" (RUG) on the Algorand TestNet.

## Prerequisites

- Node.js installed on your system
- Basic understanding of Algorand blockchain
- Access to Algorand TestNet

## Installation

1. Clone the repository
2. Navigate to the project directory
3. Install dependencies:

```bash
npm install
```

## Project Structure

```
Task-1-Create_Token/
├── package.json        # Project dependencies and scripts
└── src/
    └── index.js       # Main token creation script
```

## Token Configuration

The token is created with the following parameters:

- Name: Really Useful Gift
- Unit Name: RUG
- Total Supply: 1,000,000
- Decimals: 2
- Default Frozen: false
- Asset Control Addresses (Manager, Reserve, Freeze, Clawback): Set to creator's address

## Usage

1. Run the token creation script:

```bash
npm run create
```

2. The script will:
   - Generate a random Algorand account
   - Display the wallet address and private key
   - Provide a TestNet dispenser URL to fund the account
   - Wait for user confirmation after funding
   - Create the asset on TestNet
   - Display the asset ID and explorer URL

## Code Example

```javascript
const asset = await algorand.send.assetCreate({
  sender: creator.addr,
  total: 1000000n,
  decimals: 2,
  unitName: "RUG",
  assetName: "Really Useful Gift",
  manager: creator.addr,
  reserve: creator.addr,
  freeze: creator.addr,
  clawback: creator.addr,
  defaultFrozen: false,
});
```

## Important Notes

1. Keep your private key secure and never share it
2. The created asset will be visible on Algorand TestNet
3. You can view the asset details using the provided explorer URL
4. Make sure to fund your account with TestNet ALGOs before creating the asset

## Viewing Your Asset

After creation, you can view your asset on the Algorand TestNet explorer using the provided URL:

```
https://lora.algokit.io/testnet/asset/<asset-id>
```

## Dependencies

- @algorandfoundation/algokit-utils: ^9.1.0

## License

ISC

