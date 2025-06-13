import algosdk from "algosdk";
import fs from "fs";

async function deployAndFreezeToken() {
  try {
    // Read the account details from JSON
    const accountData = JSON.parse(fs.readFileSync("account.json", "utf8"));
    const { address, privateKey } = accountData;

    // Convert the private key from base64 string back to Uint8Array
    const privateKeyUint8 = new Uint8Array(Buffer.from(privateKey, "base64"));

    // Connect to the Algorand node
    console.log("Connecting to Algorand Testnet");

    const algodToken = "";
    const algodServer = "https://testnet-api.algonode.cloud";
    const algodPort = 443;
    const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);

    // Get suggested transaction parameters
    const suggestedParams = await algodClient.getTransactionParams().do();

    // Asset configuration
    const assetName = "MyToken";
    const unitName = "MTK";
    const totalIssuance = 1000000;
    const decimals = 0;
    const managerAddr = address;
    const freezeAddr = address;
    const clawbackAddr = address;
    const reserveAddr = address;

    // Create the asset
    const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
      from: address,
      assetName: assetName,
      unitName: unitName,
      total: totalIssuance,
      decimals: decimals,
      manager: managerAddr,
      freeze: freezeAddr,
      clawback: clawbackAddr,
      reserve: reserveAddr,
      suggestedParams: suggestedParams,
    });

    // Sign the transaction
    const signedTxn = txn.signTxn(privateKeyUint8);
    const { txId } = await algodClient.sendRawTransaction(signedTxn).do();

    // Wait for confirmation
    const confirmedTxn = await algosdk.waitForConfirmation(
      algodClient,
      txId,
      3
    );
    console.log(
      `Asset creation confirmed in round ${confirmedTxn["confirmed-round"]}`
    );

    const assetIndex = confirmedTxn["asset-index"];
    console.log(`Asset ID: ${assetIndex}`);

    // Now, perform the freeze operation
    console.log("Performing freeze operation on the asset");

    const freezeTxn = algosdk.makeAssetFreezeTxnWithSuggestedParamsFromObject({
      from: address,
      suggestedParams,
      assetIndex,
      // freezeState: false would unfreeze the account's asset holding
      freezeState: true,
      // freezeTarget is the account that is being frozen or unfrozen
      freezeTarget: address,
    });

    // Sign the freeze transaction
    const signedFreezeTxn = freezeTxn.signTxn(privateKeyUint8);
    await algodClient.sendRawTransaction(signedFreezeTxn).do();

    // Wait for confirmation of the freeze transaction
    await algosdk.waitForConfirmation(
      algodClient,
      freezeTxn.txID().toString(),
      3
    );
    console.log("Freeze operation confirmed.");
  } catch (err) {
    console.error("Failed to deploy and freeze token:", err);
  }
}

// Execute the function
deployAndFreezeToken();
