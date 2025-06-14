import algosdk from "algosdk";
import dotenv from "dotenv";
import * as crypto from "crypto";
dotenv.config();

const algodClient = new algosdk.Algodv2(
  process.env.ALGOD_TOKEN!,
  process.env.ALGOD_SERVER!,
  process.env.ALGOD_PORT || ""
);

export async function createASA(
  sender: algosdk.Account,
  metadata: any
): Promise<number> {
  const params = await algodClient.getTransactionParams().do();

  const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
    from: sender.addr,
    total: metadata.total,
    decimals: metadata.decimals,
    assetName: metadata.assetName,
    unitName: metadata.unitName,
    assetURL: metadata.assetURL,
    assetMetadataHash: metadata.assetMetadataHash || undefined,
    defaultFrozen: false,
    suggestedParams: params,
    manager: sender.addr,
    reserve: sender.addr,
    freeze: sender.addr,
    clawback: sender.addr,
  });

  const signed = txn.signTxn(sender.sk);
  const { txId } = await algodClient.sendRawTransaction(signed).do();
  const result = await algosdk.waitForConfirmation(algodClient, txId, 4);
  return result["asset-index"];
}

export function hashEmail(email: string): string {
  const hash = crypto.createHash("sha256").update(email).digest();
  return algosdk.encodeAddress(new Uint8Array(hash));
}
