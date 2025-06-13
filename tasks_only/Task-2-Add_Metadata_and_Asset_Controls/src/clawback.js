const clawbackTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
  from: manager.addr,
  to: creator.addr,
  // revocationTarget is the account that is being clawed back from
  revocationTarget: receiver.addr,
  suggestedParams,
  assetIndex,
  amount: 1,
});

const signedClawbackTxn = clawbackTxn.signTxn(manager.privateKey);
await algodClient.sendRawTransaction(signedClawbackTxn).do();
await algosdk.waitForConfirmation(
  algodClient,
  clawbackTxn.txID().toString(),
  3
);
