## Smart Contract Tokenization Results

The smart contract and ASA were successfully deployed on Algorand TestNet with the following details:

- Account Address: BJYOYIKCC4T5MSJTYERVXSK5KA3BROOKW4E372RKY5JMF6QUUVEI3WO7RE
- Account Explorer URL: https://lora.algokit.io/testnet/account/BJYOYIKCC4T5MSJTYERVXSK5KA3BROOKW4E372RKY5JMF6QUUVEI3WO7RE
- Asset Name: MySmartToken (MST)

You can verify the smart contract, asset creation, and transactions using the provided URL above. A screenshot of the account activity is available in `screenshot.png`.

[![screenshot.png](https://i.postimg.cc/tTfG8YBj/screenshot.png)](https://postimg.cc/njvWDc8R)

# Algorand Smart ASA (Algorand Standard Asset) with Contract Logic

This project demonstrates how to create a real Algorand Standard Asset (ASA) and link it with a smart contract that controls token minting and transfer restrictions through a whitelist mechanism.

![screenshot](Screenshot.png)

## Features

- **Smart Contract Deployment**: Deploy a TEAL smart contract that controls token behavior
- **Real ASA Creation**: Create an actual Algorand Standard Asset (ASA)
- **Contract-ASA Linking**: Link the ASA to the smart contract for controlled operations
- **Minting Control**: Only the admin (contract creator) can mint new tokens
- **Transfer Restrictions**: Transfers are only allowed if either the sender or receiver is whitelisted
- **Whitelist Management**: Admin can add addresses to a whitelist for approved transfers
- **Asset Freezing Control**: Unfreeze assets only for whitelisted addresses

## Smart Contract Logic

The contract implements the following functionality:

1. **Creation**: Initializes global state with admin address and empty whitelist slots
2. **ASA Linking**: Links a specific ASA to the contract by storing its ID
3. **Mint Verification**: Verifies that only admin can mint (transfer from reserve)
4. **Whitelist Management**: Admin can add addresses to the whitelist (supports multiple addresses)
5. **Transfer Control**: Verifies transfers are only allowed if either sender or receiver is whitelisted

## How to Run

1. Make sure you have Node.js installed
2. Install dependencies:
   ```
   npm install
   ```
3. Run the deployment script:
   ```
   node src/deploymint.js
   ```

The script will:

- Create a wallet if one doesn't exist (or reuse an existing one)
- Create a test receiver wallet
- Deploy the smart contract
- Create an actual Algorand Standard Asset (ASA)
- Link the ASA to the smart contract
- Add both accounts to the whitelist
- Have the receiver opt-in to the asset
- Unfreeze the asset for whitelisted accounts
- Mint (transfer) tokens to the receiver
- Demonstrate a transfer between accounts
- Display the contract state and asset holdings at each step

## Technical Details

### Global State Variables

- `admin`: The address of the contract creator (admin)
- `assetID`: The ID of the linked Algorand Standard Asset
- `whitelist1`: First whitelisted address
- `whitelist2`: Second whitelisted address
- `minted`: Status indicating if tokens have been minted

### Contract Operations

- `setAssetID`: Links an ASA to the contract (admin only)
- `mint`: Verifies minting permission (admin only)
- `addToWhitelist`: Adds an address to the whitelist (admin only)
- `transfer`: Verifies a token transfer, checking whitelist restrictions

### ASA Operations

- `createASA`: Creates a new Algorand Standard Asset
- `optInToAsset`: Allows an account to receive the asset
- `unfreezeAsset`: Unfreezes assets for whitelisted addresses
- `mintASA`: Transfers tokens from reserve to a recipient (requires contract verification)
- `transferASA`: Transfers tokens between accounts (requires contract verification)

## Implementation Details

1. **Smart Contract Structure**:

   - Uses TEAL (Transaction Execution Approval Language) for Algorand smart contracts
   - Implements branching logic for different operations
   - Uses global state to track admin, asset ID, and whitelisted addresses

2. **Whitelist Implementation**:

   - Supports multiple whitelisted addresses (currently two)
   - Checks if either sender or receiver is whitelisted before allowing transfers
   - Only admin can add addresses to the whitelist

3. **ASA Integration**:

   - Creates a frozen ASA by default for security
   - Unfreezes only for whitelisted addresses
   - Links the ASA to the smart contract via the asset ID

4. **Transaction Security**:
   - Uses atomic transactions (transaction groups) to ensure contract verification happens before asset transfers
   - Requires opt-in before receiving assets
   - Implements proper authorization checks for all operations

## Future Enhancements

- Add ability to remove addresses from whitelist
- Support more than two whitelisted addresses using arrays
- Implement balance tracking per address
- Add clawback functionality for regulatory compliance
- Implement more complex transfer rules
