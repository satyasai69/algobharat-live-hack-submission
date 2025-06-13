import algosdk from "algosdk";
import fs from "fs";
import readline from "readline";
import dotenv from "dotenv";
dotenv.config();

// === CONFIG ===
const MNEMONIC_FILE = ".env";
const NETWORK = "https://testnet-api.algonode.cloud";
const algod = new algosdk.Algodv2("", NETWORK, "");

// === 👤 Wallet Load/Create ===
function getWallet(index) {
  const MNEMONIC_KEY = `MNEMONIC_WALLET_${index}`;
  if (process.env[MNEMONIC_KEY]) {
    const mnemonic = process.env[MNEMONIC_KEY];
    const sk = algosdk.mnemonicToSecretKey(mnemonic);
    console.log(`🔁 Reusing Wallet ${index}: ${sk.addr}`);
    return sk;
  }

  const acc = algosdk.generateAccount();
  const mnemonic = algosdk.secretKeyToMnemonic(acc.sk);
  fs.appendFileSync(MNEMONIC_FILE, `\n${MNEMONIC_KEY}="${mnemonic}"\n`);
  console.log(`🚀 New Wallet ${index} Created: ${acc.addr}`);
  return acc;
}

// === 📜 Confirmation Helper ===
async function waitForConfirmation(txId) {
  const status = await algod.status().do();
  let lastRound = status["last-round"];
  while (true) {
    const info = await algod.pendingTransactionInformation(txId).do();
    if (info["confirmed-round"] && info["confirmed-round"] > 0) {
      console.log("🎉 Confirmed in round", info["confirmed-round"]);
      return info;  // ✅ return info here!
    }
    lastRound++;
    await algod.statusAfterBlock(lastRound).do();
  }
}


// === 🤖 Prompt Helper ===
function ask(query) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans);
  }));
}

// === 💰 Check Account Balance ===
async function checkBalance(address) {
  try {
    const accountInfo = await algod.accountInformation(address).do();
    console.log(`💰 Account ${address.substring(0, 8)}... has ${accountInfo.amount / 1000000} Algos`);
    return accountInfo.amount;
  } catch (error) {
    console.log(`❌ Account ${address.substring(0, 8)}... not found or has no Algos`);
    return 0;
  }
}

// === 🪙 Create ASA ===
async function createASA(creator, multisigAddr) {
  const params = await algod.getTransactionParams().do();
  
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
    url: "",
    suggestedParams: params
  });

  const signedTxn = txn.signTxn(creator.sk);
  const { txId } = await algod.sendRawTransaction(signedTxn).do();
  const confirmation = await waitForConfirmation(txId);
  const assetId = confirmation["asset-index"];
  console.log(`✅ Created ASA with ID: ${assetId}`);
  console.log(`🔗 Asset Explorer: https://lora.algokit.io/testnet/asset/${assetId}`);
  return assetId;
}

// === 🔄 Main Flow ===
(async () => {
  console.log("🔐 Algorand Multisig Tool 🔐");
  console.log("============================");
  
  const numWallets = parseInt(await ask("🔢 Number of multisig wallets (2-10): "));
  const threshold = parseInt(await ask("🛡️ Threshold (min required signatures): "));

  if (isNaN(numWallets) || numWallets < 2 || numWallets > 10 || isNaN(threshold) || threshold > numWallets) {
    console.error("❌ Invalid input");
    return;
  }

  const wallets = [];
  for (let i = 1; i <= numWallets; i++) {
    wallets.push(getWallet(i));
  }

  const multisigParams = {
    version: 1,
    threshold,
    addrs: wallets.map(w => w.addr),
  };

  const multisigAddr = algosdk.multisigAddress(multisigParams);
  console.log("\n🔐 Multisig Address:", multisigAddr);
  console.log("👥 Wallets:", multisigParams.addrs);
  console.log("🔑 Threshold:", multisigParams.threshold);
  
  // Check wallet balances
  console.log("\n💰 Checking wallet balances...");
  for (let i = 0; i < wallets.length; i++) {
    await checkBalance(wallets[i].addr);
  }
  
  console.log("\n⚠️ Make sure to fund your wallets at https://bank.testnet.algorand.network/");
  
  // Menu of options
  console.log("\n📋 Choose an action:");
  console.log("1️⃣ Create multisig address only (done)");
  console.log("2️⃣ Create a new ASA owned by multisig");
  console.log("3️⃣ Assign multisig to an existing ASA");
  console.log("4️⃣ Perform a multisig transaction");
  
  const action = await ask("Enter option (1-4): ");
  
  switch (action) {
    case "1":
      console.log("✅ Multisig address created successfully!");
      break;
      
    case "2":
      try {
        console.log("\n🪙 Creating new ASA owned by multisig...");
        const creator = wallets[0];
        const assetId = await createASA(creator, multisigAddr);
        console.log(`✅ Created ASA ${assetId} with multisig address as reserve, freeze, and clawback`);
      } catch (error) {
        console.error("❌ Error creating ASA:", error.message);
        console.log("💡 Make sure your wallet is funded with Algos");
      }
      break;
      
    case "3":
      try {
        const assetID = parseInt(await ask("🪙 Enter existing ASA ID: "));
        const managerAddr = await ask("👤 Enter current manager address: ");
        
        // Check if we have the private key for the manager
        let managerWallet = null;
        for (const wallet of wallets) {
          if (wallet.addr === managerAddr) {
            managerWallet = wallet;
            break;
          }
        }
        
        if (!managerWallet) {
          console.error("❌ Manager address not found in your wallets");
          return;
        }
        
        console.log("📝 Updating asset configuration...");
        const txParams = await algod.getTransactionParams().do();

        const configTxn = algosdk.makeAssetConfigTxnWithSuggestedParamsFromObject({
          from: managerWallet.addr,
          assetIndex: assetID,
          manager: managerWallet.addr,
          reserve: multisigAddr,
          freeze: multisigAddr,
          clawback: multisigAddr,
          suggestedParams: txParams,
        });

        const signedConfig = configTxn.signTxn(managerWallet.sk);
        const { txId: configTxId } = await algod.sendRawTransaction(signedConfig).do();
        await waitForConfirmation(configTxId);
        console.log("✅ Assigned multisig to ASA roles. TxID:", configTxId);
      } catch (error) {
        console.error("❌ Error updating asset:", error.message);
      }
      break;
      
    case "4":
      try {
        const assetID = parseInt(await ask("🔢 ASA ID to transfer: "));
        const revokeFrom = await ask("🧤 Address to revoke from: ");
        const sendTo = await ask("📬 Address to send revoked asset to: ");
        const amount = parseInt(await ask("💰 Amount (in micro-units): "));
        const txParams = await algod.getTransactionParams().do();

        const clawbackTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
          from: multisigAddr,
          to: sendTo,
          assetIndex: assetID,
          revocationTarget: revokeFrom,
          amount,
          suggestedParams: txParams,
        });

        // Sign by threshold number of wallets
        let partialSigned = algosdk.signMultisigTransaction(clawbackTxn, multisigParams, wallets[0].sk).blob;
        console.log(`✅ Transaction signed by ${wallets[0].addr.substring(0, 8)}...`);
        
        for (let i = 1; i < threshold; i++) {
          partialSigned = algosdk.appendSignMultisigTransaction(partialSigned, multisigParams, wallets[i].sk).blob;
          console.log(`✅ Transaction signed by ${wallets[i].addr.substring(0, 8)}...`);
        }

        const { txId } = await algod.sendRawTransaction(partialSigned).do();
        await waitForConfirmation(txId);
        console.log("✅ Multisig transfer success. TxID:", txId);
      } catch (error) {
        console.error("❌ Error performing multisig transaction:", error.message);
        console.log("💡 Make sure the asset exists and multisig has clawback authority");
      }
      break;
      
    default:
      console.log("❌ Invalid option selected");
  }

  console.log("\n✅ Done!");
})();
