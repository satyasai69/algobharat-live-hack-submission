# Multisig Asset Management on Algorand

## Results

Successfully implemented multisig asset management with the following details:

- **Multisig Address**: LXBPBHZLI4PCMEHLFB773JBTZP75KBBOGMUVMLZNQLPHKR7ANAVZNMIU7Y
- **Participating Wallets**:
  - LLDCJZKXNWKSHG33OJX6PYHYJ77Q2CPPKZQ3FQX2WE3EI3NQZZEMYNP4CE
  - YBBKCYUUE25345UU7KQGTPRNDF5SMIPG3GOJWBZEY5OXHJAMO3DLDDAYUQ
- **Threshold**: 2/2 signatures required
- **Asset ID**: 741167934
- **Asset Explorer**: [View on Algorand Explorer](https://lora.algokit.io/testnet/asset/741167934)

The multisig address was successfully assigned to the following ASA roles:
- Reserve
- Freeze
- Clawback

Asset creation transaction confirmed in round 52551396.

## Implementation Details

This project demonstrates how to create and use multisig accounts for secure asset management on Algorand. The implementation allows for collective approval of sensitive asset operations.

### Features

- **Multisig Creation**: Create multisig accounts with configurable number of participants and threshold
- **Asset Management**: Create assets with multisig controls for sensitive roles
- **Multisig Transactions**: Perform asset operations requiring multiple signatures
- **Role Assignment**: Assign multisig to existing assets

### How It Works

1. **Multisig Account Creation**
   ```javascript
   const multisigParams = {
     version: 1,
     threshold: 2,
     addrs: [wallet1.addr, wallet2.addr]
   };
   const multisigAddr = algosdk.multisigAddress(multisigParams);
   ```

2. **Asset Creation with Multisig Controls**
   ```javascript
   const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
     from: creator.addr,
     total: 1000000,
     decimals: 0,
     defaultFrozen: false,
     manager: creator.addr,
     reserve: multisigAddr,
     freeze: multisigAddr,
     clawback: multisigAddr,
     unitName: "MST",
     assetName: "MultisigToken",
     suggestedParams: params
   });
   ```

3. **Multisig Transaction Signing**
   ```javascript
   // First signature
   let partialSigned = algosdk.signMultisigTransaction(
     transaction, 
     multisigParams, 
     wallet1.sk
   ).blob;
   
   // Second signature
   partialSigned = algosdk.appendSignMultisigTransaction(
     partialSigned, 
     multisigParams, 
     wallet2.sk
   ).blob;
   ```

## Asset Details

```json
{
  "index": 741167934,
  "params": {
    "creator": "LLDCJZKXNWKSHG33OJX6PYHYJ77Q2CPPKZQ3FQX2WE3EI3NQZZEMYNP4CE",
    "decimals": 0,
    "total": 1000000,
    "clawback": "LXBPBHZLI4PCMEHLFB773JBTZP75KBBOGMUVMLZNQLPHKR7ANAVZNMIU7Y",
    "default-frozen": false,
    "freeze": "LXBPBHZLI4PCMEHLFB773JBTZP75KBBOGMUVMLZNQLPHKR7ANAVZNMIU7Y",
    "manager": "LLDCJZKXNWKSHG33OJX6PYHYJ77Q2CPPKZQ3FQX2WE3EI3NQZZEMYNP4CE",
    "name": "MultisigToken",
    "reserve": "LXBPBHZLI4PCMEHLFB773JBTZP75KBBOGMUVMLZNQLPHKR7ANAVZNMIU7Y",
    "unit-name": "MST"
  }
}
```

## Usage

1. Install dependencies:
   ```
   npm install
   ```

2. Run the script:
   ```
   node src/index.js
   ```

3. Choose from the following options:
   - Create multisig address only
   - Create a new ASA owned by multisig
   - Assign multisig to an existing ASA
   - Perform a multisig transaction

## Security Considerations

1. **Private Key Management**: Keep all private keys secure and never share them
2. **Threshold Selection**: Choose an appropriate threshold based on security needs and operational requirements
3. **Wallet Funding**: Ensure all participating wallets have sufficient funds for transaction fees
4. **Role Separation**: Consider separating manager role from multisig for additional security layers

## Future Enhancements

- Support for larger multisig groups
- Integration with hardware wallets for enhanced security
- Automated signature collection for distributed teams
- Web interface for multisig management
