import * as algokit from "@algorandfoundation/algokit-utils";

import { Buffer } from "buffer"; // If needed

async function addMetadata() {
  const algorand = algokit.AlgorandClient.fromConfig({ algodConfig });
  const creator = algorand.account.random();

  console.log("Wallet address", creator.addr);
  console.log("wallet Private key", creator.account.sk);
  console.log(creator.addr);
  // dispense testnet algo
  const dispenser_url = `https://bank.testnet.algorand.network/?account=${creator.addr}`;
  console.log(`Fund the wallet via Algorand Dispenser: ${dispenser_url}`);
  console.log("Press any key when the account is funded");
  await keypress();

  const reconfigTxn = algosdk.makeAssetConfigTxnWithSuggestedParamsFromObject({
    from: creator.addr,
    assetIndex: assetId,
    manager: newManagerAddr, // new manager address
    reserve: creator.addr,
    freeze: creator.addr,
    clawback: creator.addr,
    suggestedParams,
  });

  const signedReconfig = reconfigTxn.signTxn(creator.privateKey);
  await algodClient.sendRawTransaction(signedReconfig).do();
}
