## Smart Contract Tokenization Results

The smart contract and ASA were successfully deployed on Algorand TestNet with the following details:

- Account Address: BJYOYIKCC4T5MSJTYERVXSK5KA3BROOKW4E372RKY5JMF6QUUVEI3WO7RE
- Account Explorer URL: https://lora.algokit.io/testnet/account/BJYOYIKCC4T5MSJTYERVXSK5KA3BROOKW4E372RKY5JMF6QUUVEI3WO7RE
- Asset Name: MySmartToken (MST)

You can verify the smart contract, asset creation, and transactions using the provided URL above. A screenshot of the account activity is available in `screenshot.png`.

[![screenshot.png](https://i.postimg.cc/tTfG8YBj/screenshot.png)](https://postimg.cc/njvWDc8R)

# Smart Contract Tokenization with Algorand

This project demonstrates how to create an Algorand Standard Asset (ASA) linked to a smart contract that controls token behavior. The implementation includes programmable logic for minting control and transfer restrictions using a whitelist mechanism.

## Prerequisites

- Node.js installed on your system
- Basic understanding of Algorand blockchain and smart contracts
- Access to Algorand TestNet

## Installation

1. Clone the repository
2. Navigate to the project directory
3. Install dependencies:

```bash
npm install
```

## Project Structure

- `src/index.js`: Core implementation with smart contract code and helper functions
- `src/deploymint.js`: Deployment script that demonstrates the full workflow
- `package.json`: Project dependencies and scripts

## Features

### Smart Contract Capabilities

- **Minting Control**: Only the admin (contract creator) can mint new tokens
- **Transfer Restrictions**: Transfers are only allowed if either sender or receiver is whitelisted
- **Whitelist Management**: Admin can add addresses to a whitelist for approved transfers
- **Asset Freezing Control**: Unfreeze assets only for whitelisted addresses

### Global State Variables

- `admin`: The address of the contract creator (admin)
- `assetID`: The ID of the linked Algorand Standard Asset
- `whitelist1`: First whitelisted address
- `whitelist2`: Second whitelisted address
- `minted`: Status indicating if tokens have been minted

## Usage

1. Run the deployment script:

```bash
node src/deploymint.js
```

2. The script will:
   - Create wallets if they don't exist
   - Deploy the smart contract
   - Create an Algorand Standard Asset (ASA)
   - Link the ASA to the smart contract
   - Add addresses to the whitelist
   - Demonstrate minting and transfers between accounts

## Code Example

```javascript
// Deploy smart contract
const appId = await deploySmartASA(mainAccount);

// Create an actual ASA
const assetId = await createASA(
  mainAccount,
  "MySmartToken",
  "MST",
  10000 // Total supply
);

// Link ASA to Smart Contract
await linkAssetToContract(appId, assetId, mainAccount);

// Add accounts to whitelist
await addToWhitelist(appId, mainAccount, receiverAccount.addr);

// Mint (transfer) tokens to receiver
await mintASA(assetId, appId, mainAccount, receiverAccount, 100);
```

## Smart Contract Implementation

The TEAL smart contract implements the following operations:

- `setAssetID`: Links an ASA to the contract (admin only)
- `mint`: Verifies minting permission (admin only)
- `addToWhitelist`: Adds an address to the whitelist (admin only)
- `transfer`: Verifies a token transfer, checking whitelist restrictions

## Security Considerations

1. The contract uses global state to track the admin, asset ID, and whitelisted addresses
2. All sensitive operations are restricted to the admin
3. Transfers are verified through the smart contract before execution
4. Assets are frozen by default and only unfrozen for whitelisted addresses

## Viewing Your Smart Contract and Asset

After deployment, you can view your smart contract and asset on the Algorand TestNet explorer using the provided URL:

```
https://lora.algokit.io/testnet/account/BJYOYIKCC4T5MSJTYERVXSK5KA3BROOKW4E372RKY5JMF6QUUVEI3WO7RE
```

## Future Enhancements

- Add ability to remove addresses from whitelist
- Support more than two whitelisted addresses using arrays
- Implement balance tracking per address
- Add clawback functionality for regulatory compliance
- Implement more complex transfer rules
