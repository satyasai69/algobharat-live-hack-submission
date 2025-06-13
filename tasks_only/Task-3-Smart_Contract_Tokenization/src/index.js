
import algosdk from 'algosdk';

const algod = new algosdk.Algodv2('', 'https://testnet-api.algonode.cloud', '');


const approvalProgram = `#pragma version 6
// Handle different transaction types
txn ApplicationID
int 0
==
bnz handle_create

// Check transaction type
txn OnCompletion
int NoOp
==
bnz handle_noop

// Default: approve all other actions like delete, update, etc.
int 1
return

handle_create:
    // Initialize global state for creator (admin) and asset ID
    byte "admin"
    txn Sender
    app_global_put
    
    byte "assetID"
    int 0
    app_global_put
    
    // Initialize whitelist keys for main account and receiver
    byte "whitelist1"
    byte ""
    app_global_put
    
    byte "whitelist2"
    byte ""
    app_global_put
    
    int 1
    return

handle_noop:
    // Get the first argument
    txna ApplicationArgs 0
    byte "setAssetID"
    ==
    bnz handle_set_asset
    
    txna ApplicationArgs 0
    byte "mint"
    ==
    bnz handle_mint
    
    txna ApplicationArgs 0
    byte "addToWhitelist"
    ==
    bnz handle_whitelist
    
    txna ApplicationArgs 0
    byte "transfer"
    ==
    bnz handle_transfer
    
    // If no recognized operation, reject
    err
    
handle_set_asset:
    // Only admin can set the asset ID
    byte "admin"
    app_global_get
    txn Sender
    ==
    // If not admin, fail
    assert
    
    // Get asset ID from args
    txna ApplicationArgs 1
    btoi
    
    // Store asset ID in global state
    byte "assetID"
    txna ApplicationArgs 1
    btoi
    app_global_put
    
    int 1
    return

handle_mint:
    // Only admin can mint
    byte "admin"
    app_global_get
    txn Sender
    ==
    // If not admin, fail
    assert
    
    // Check if asset ID is set
    byte "assetID"
    app_global_get
    int 0
    >
    assert
    
    // Record the mint in global state
    byte "minted"
    byte "yes"
    app_global_put
    
    int 1
    return

handle_whitelist:
    // Only admin can modify whitelist
    byte "admin"
    app_global_get
    txn Sender
    ==
    // If not admin, fail
    assert
    
    // Get address to whitelist from args
    txna ApplicationArgs 1
    
    // Check if whitelist1 is empty
    byte "whitelist1"
    app_global_get
    byte ""
    ==
    bnz use_whitelist1
    
    // If whitelist1 is not empty, use whitelist2
    byte "whitelist2"
    txna ApplicationArgs 1
    app_global_put
    
    int 1
    return
    
use_whitelist1:
    byte "whitelist1"
    txna ApplicationArgs 1
    app_global_put
    
    int 1
    return

handle_transfer:
    // Get sender and receiver addresses
    txn Sender
    store 0 // Store sender in temp 0
    
    txna ApplicationArgs 1
    store 1 // Store receiver in temp 1
    
    // Check if sender is in whitelist1
    byte "whitelist1"
    app_global_get
    load 0
    ==
    
    // Check if sender is in whitelist2
    byte "whitelist2"
    app_global_get
    load 0
    ==
    ||
    
    // Check if receiver is in whitelist1
    byte "whitelist1"
    app_global_get
    load 1
    ==
    ||
    
    // Check if receiver is in whitelist2
    byte "whitelist2"
    app_global_get
    load 1
    ==
    ||
    
    // If either sender or receiver is whitelisted, allow transfer
    assert
    
    int 1
    return`;

// Clear state program
const clearProgram = `#pragma version 6
int 1`;

export async function compileProgram(source) {
  const compile = await algod.compile(source).do();
  return new Uint8Array(Buffer.from(compile.result, 'base64'));
}

export async function deploySmartASA(appCreatorAccount) {
  const approval = await compileProgram(approvalProgram);
  const clear = await compileProgram(clearProgram);
  const params = await algod.getTransactionParams().do();

  const txn = algosdk.makeApplicationCreateTxnFromObject({
    from: appCreatorAccount.addr,
    approvalProgram: approval,
    clearProgram: clear,
    suggestedParams: params,
    numGlobalInts: 1,
    numGlobalByteSlices: 5,  // For admin, assetID, whitelist1, whitelist2, and minted
    numLocalInts: 0,
    numLocalByteSlices: 0,
    onComplete: algosdk.OnApplicationComplete.NoOpOC
  });

  const signedTxn = txn.signTxn(appCreatorAccount.sk);
  const { txId } = await algod.sendRawTransaction(signedTxn).do();
  const confirmation = await waitForConfirmation(txId);
  return confirmation['application-index'];
}

// Create an actual Algorand Standard Asset (ASA)
export async function createASA(creatorAccount, assetName, assetUnitName, totalSupply) {
  const params = await algod.getTransactionParams().do();
  
  const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
    from: creatorAccount.addr,
    total: totalSupply,
    decimals: 0,
    defaultFrozen: true,  // Assets are frozen by default
    manager: creatorAccount.addr,
    reserve: creatorAccount.addr,
    freeze: creatorAccount.addr,
    clawback: creatorAccount.addr,
    unitName: assetUnitName,
    assetName: assetName,
    url: "",
    suggestedParams: params
  });

  const signedTxn = txn.signTxn(creatorAccount.sk);
  const { txId } = await algod.sendRawTransaction(signedTxn).do();
  const confirmation = await waitForConfirmation(txId);
  return confirmation["asset-index"];
}

// Unfreeze asset for a specific account
export async function unfreezeAsset(assetId, managerAccount, targetAddress) {
  const params = await algod.getTransactionParams().do();
  
  const txn = algosdk.makeAssetFreezeTxnWithSuggestedParamsFromObject({
    from: managerAccount.addr,
    freezeTarget: targetAddress,
    assetIndex: assetId,
    freezeState: false, // false = unfreeze
    suggestedParams: params
  });

  const signedTxn = txn.signTxn(managerAccount.sk);
  const { txId } = await algod.sendRawTransaction(signedTxn).do();
  return await waitForConfirmation(txId);
}

// Link ASA to the smart contract
export async function linkAssetToContract(appId, assetId, senderAccount) {
  const params = await algod.getTransactionParams().do();

  const txn = algosdk.makeApplicationNoOpTxnFromObject({
    from: senderAccount.addr,
    appIndex: appId,
    appArgs: [
      new Uint8Array(Buffer.from("setAssetID")),
      algosdk.encodeUint64(assetId)
    ],
    suggestedParams: params
  });

  const signedTxn = txn.signTxn(senderAccount.sk);
  const { txId } = await algod.sendRawTransaction(signedTxn).do();
  return await waitForConfirmation(txId);
}

// Opt-in to the asset
export async function optInToAsset(assetId, account) {
  const params = await algod.getTransactionParams().do();
  
  const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: account.addr,
    to: account.addr,
    amount: 0,
    assetIndex: assetId,
    suggestedParams: params
  });

  const signedTxn = txn.signTxn(account.sk);
  const { txId } = await algod.sendRawTransaction(signedTxn).do();
  return await waitForConfirmation(txId);
}

// Mint tokens (transfer from reserve to recipient)
export async function mintASA(assetId, appId, fromAccount, toAccount, amount) {
  // First call the smart contract to verify minting is allowed
  const verifyParams = await algod.getTransactionParams().do();
  const verifyTxn = algosdk.makeApplicationNoOpTxnFromObject({
    from: fromAccount.addr,
    appIndex: appId,
    appArgs: [new Uint8Array(Buffer.from("mint"))],
    suggestedParams: verifyParams
  });
  
  // Then create the asset transfer transaction
  const transferParams = await algod.getTransactionParams().do();
  const transferTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: fromAccount.addr,
    to: toAccount.addr,
    amount: amount,
    assetIndex: assetId,
    suggestedParams: transferParams
  });
  
  // Group the transactions
  const txnGroup = algosdk.assignGroupID([verifyTxn, transferTxn]);
  
  // Sign both transactions
  const signedVerifyTxn = verifyTxn.signTxn(fromAccount.sk);
  const signedTransferTxn = transferTxn.signTxn(fromAccount.sk);
  
  // Send the transactions
  const { txId } = await algod.sendRawTransaction([signedVerifyTxn, signedTransferTxn]).do();
  return await waitForConfirmation(txId);
}

export async function addToWhitelist(appId, senderAccount, addressToWhitelist) {
  const params = await algod.getTransactionParams().do();

  const txn = algosdk.makeApplicationNoOpTxnFromObject({
    from: senderAccount.addr,
    appIndex: appId,
    appArgs: [
      new Uint8Array(Buffer.from("addToWhitelist")),
      new Uint8Array(Buffer.from(addressToWhitelist))
    ],
    suggestedParams: params
  });

  const signedTxn = txn.signTxn(senderAccount.sk);
  const { txId } = await algod.sendRawTransaction(signedTxn).do();
  return await waitForConfirmation(txId);
}

export async function transferASA(assetId, appId, fromAccount, toAddress, amount) {
  // First call the smart contract to verify transfer is allowed
  const verifyParams = await algod.getTransactionParams().do();
  const verifyTxn = algosdk.makeApplicationNoOpTxnFromObject({
    from: fromAccount.addr,
    appIndex: appId,
    appArgs: [
      new Uint8Array(Buffer.from("transfer")),
      new Uint8Array(Buffer.from(toAddress))
    ],
    suggestedParams: verifyParams
  });
  
  // Then create the asset transfer transaction
  const transferParams = await algod.getTransactionParams().do();
  const transferTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: fromAccount.addr,
    to: toAddress,
    amount: amount,
    assetIndex: assetId,
    suggestedParams: transferParams
  });
  
  // Group the transactions
  const txnGroup = algosdk.assignGroupID([verifyTxn, transferTxn]);
  
  // Sign both transactions
  const signedVerifyTxn = verifyTxn.signTxn(fromAccount.sk);
  const signedTransferTxn = transferTxn.signTxn(fromAccount.sk);
  
  // Send the transactions
  const { txId } = await algod.sendRawTransaction([signedVerifyTxn, signedTransferTxn]).do();
  return await waitForConfirmation(txId);
}

async function waitForConfirmation(txId) {
  let response = await algod.status().do();
  let lastRound = response['last-round'];
  while (true) {
    const pending = await algod.pendingTransactionInformation(txId).do();
    if (pending['confirmed-round'] && pending['confirmed-round'] > 0) {
      return pending;
    }
    lastRound++;
    await algod.statusAfterBlock(lastRound).do();
  }
}