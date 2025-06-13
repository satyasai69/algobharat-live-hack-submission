// deploymint.js
import algosdk from 'algosdk';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const ALGOD = new algosdk.Algodv2('', 'https://testnet-api.algonode.cloud', '');
const MNEMONIC_FILE = '.env';
const MNEMONIC_KEY = 'WALLET_MNEMONIC';


import { 
  compileProgram, 
  deploySmartASA, 
  createASA, 
  linkAssetToContract, 
  optInToAsset, 
  unfreezeAsset,
  mintASA, 
  addToWhitelist, 
  transferASA 
} from './index.js';


function getWallet() {
  if (process.env[MNEMONIC_KEY]) {
    const mnemonic = process.env[MNEMONIC_KEY];
    const sk = algosdk.mnemonicToSecretKey(mnemonic);
    console.log("🔁 Reusing Wallet:", sk.addr);
    return sk;
  }

  const acc = algosdk.generateAccount();
  const mnemonic = algosdk.secretKeyToMnemonic(acc.sk);
  const address = acc.addr.toString(); 
  console.log("🚀 New Wallet Created:");
  console.log("🔑 the public key Address:", address);
  console.log("🧠 Mnemonic:", mnemonic);


  fs.appendFileSync(MNEMONIC_FILE, `\n${MNEMONIC_KEY}="${mnemonic}"\n`);
  return acc;
}


function getSecondWallet() {
  const acc = algosdk.generateAccount();
  console.log("🚀 Second Test Wallet Created:");
  console.log("🔑 Address:", acc.addr);
  return acc;
}


async function waitForFunds(addr) {
  console.log("👉 Fund this wallet via https://bank.testnet.algorand.network");
  let retries = 0;
  while (retries < 20) {
    const info = await ALGOD.accountInformation(addr).do();
    if (info.amount > 0) return info.amount;
    console.log("⏳ Waiting for funds... Balance:", info.amount);
    await new Promise(r => setTimeout(r, 5000));
    retries++;
  }
  throw new Error("❌ Wallet not funded after 60s. Aborting.");
}


async function fundAccount(fromAccount, toAddress, amount) {
  console.log(`💸 Funding ${toAddress.substring(0, 8)}... with ${amount} microAlgos`);
  const params = await ALGOD.getTransactionParams().do();
  
  const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: fromAccount.addr,
    to: toAddress,
    amount: amount,
    suggestedParams: params
  });
  
  const signedTxn = txn.signTxn(fromAccount.sk);
  const { txId } = await ALGOD.sendRawTransaction(signedTxn).do();
  await waitForConfirmation(txId);
  console.log(`✅ Funded ${toAddress.substring(0, 8)}... with ${amount} microAlgos`);
}

async function waitForConfirmation(txId) {
  let lastRound = (await ALGOD.status().do())['last-round'];
  while (true) {
    const pending = await ALGOD.pendingTransactionInformation(txId).do();
    if (pending['confirmed-round'] && pending['confirmed-round'] > 0) {
      return pending;
    }
    lastRound++;
    await ALGOD.statusAfterBlock(lastRound).do();
  }
}

async function getAppState(appId) {
  try {
    const appInfo = await ALGOD.getApplicationByID(appId).do();
    console.log("📊 Application State:");
    console.log(JSON.stringify(appInfo.params['global-state'], null, 2));
    return appInfo;
  } catch (error) {
    console.error("❌ Error fetching app state:", error);
    return null;
  }
}

async function getAssetInfo(assetId) {
  try {
    const assetInfo = await ALGOD.getAssetByID(assetId).do();
    console.log("🪙 Asset Information:");
    console.log(JSON.stringify({
      name: assetInfo.params.name,
      unitName: assetInfo.params['unit-name'],
      total: assetInfo.params.total,
      decimals: assetInfo.params.decimals,
      defaultFrozen: assetInfo.params['default-frozen']
    }, null, 2));
    return assetInfo;
  } catch (error) {
    console.error("❌ Error fetching asset info:", error);
    return null;
  }
}


async function getAccountAssetHolding(account, assetId) {
  try {
    const accountInfo = await ALGOD.accountInformation(account.addr).do();
    const assets = accountInfo.assets;
    const asset = assets.find(a => a['asset-id'] === assetId);
    
    if (asset) {
      console.log(`💰 Account ${account.addr.substring(0, 8)}... holds ${asset.amount} units of asset ${assetId}`);
      return asset;
    } else {
      console.log(`❌ Account ${account.addr.substring(0, 8)}... does not hold asset ${assetId}`);
      return null;
    }
  } catch (error) {
    console.error("❌ Error fetching account asset holding:", error);
    return null;
  }
}

// 🔁 Main
(async () => {
  console.log("🚀 Starting enhanced Smart ASA deployment process with real ASA...");

  const mainAccount = getWallet();
  const receiverAccount = getSecondWallet();
  
  await waitForFunds(mainAccount.addr);

  await fundAccount(mainAccount, receiverAccount.addr, 1000000); 

  console.log("📝 Deploying Smart Contract...");
  const appId = await deploySmartASA(mainAccount);
  console.log("✅ Smart Contract deployed with ID:", appId);

  await getAppState(appId);
  
  // Create an actual ASA
  console.log("🪙 Creating Algorand Standard Asset (ASA)...");
  const assetId = await createASA(
    mainAccount,
    "MySmartToken",
    "MST",
    10000 // Total supply
  );
  console.log("✅ ASA created with ID:", assetId);
  

  await getAssetInfo(assetId);
  

  console.log("🔗 Linking ASA to Smart Contract...");
  await linkAssetToContract(appId, assetId, mainAccount);
  console.log("✅ ASA linked to Smart Contract");
  
  // Check state after linking
  await getAppState(appId);
  
  // Add main account to whitelist
  console.log("📋 Adding main account to whitelist...");
  await addToWhitelist(appId, mainAccount, mainAccount.addr);
  console.log("✅ Main account added to whitelist");
  
  // Opt-in receiver to the asset
  console.log("👍 Receiver opting in to the asset...");
  await optInToAsset(assetId, receiverAccount);
  console.log("✅ Receiver opted in to the asset");
  
  // Add receiver to whitelist
  console.log("📋 Adding receiver to whitelist...");
  await addToWhitelist(appId, mainAccount, receiverAccount.addr);
  console.log("✅ Receiver added to whitelist");

  await getAppState(appId);

  console.log("🔓 Unfreezing asset for receiver...");
  await unfreezeAsset(assetId, mainAccount, receiverAccount.addr);
  console.log("✅ Asset unfrozen for receiver");
  
  // Mint (transfer) tokens to receiver
  console.log("💰 Minting (transferring) 100 tokens to receiver...");
  await mintASA(assetId, appId, mainAccount, receiverAccount, 100);
  console.log("✅ Tokens minted to receiver");
  
  // Check receiver's balance
  await getAccountAssetHolding(receiverAccount, assetId);
  
  // Transfer tokens between accounts
  console.log("🔄 Transferring tokens from receiver back to main account...");
  try {
    // Main account needs to opt in first
    console.log("👍 Main account opting in to the asset...");
    await optInToAsset(assetId, mainAccount);
    
    console.log("🔓 Unfreezing asset for main account...");
    await unfreezeAsset(assetId, mainAccount, mainAccount.addr);
    

    await transferASA(assetId, appId, receiverAccount, mainAccount.addr, 50);
    console.log("✅ Tokens transferred from receiver to main account");

    await getAccountAssetHolding(mainAccount, assetId);
    await getAccountAssetHolding(receiverAccount, assetId);
  } catch (error) {
    console.error("❌ Error during transfer:", error);
  }
  
  console.log("🎉 Smart ASA deployment and testing complete!");
})().catch(e => {
  console.error("❌ Error:", e);
});
