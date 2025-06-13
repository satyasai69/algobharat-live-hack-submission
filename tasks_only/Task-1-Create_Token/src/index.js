import * as algokit from "@algorandfoundation/algokit-utils";

function keypress() {
  return new Promise((resolve) => {
    process.stdin.once("data", () => {
      resolve();
    });
  });
}

async function create_asset() {
  const algodConfig = {
    server: "https://testnet-api.algonode.cloud",
    port: "",
    token: "",
  };

  const algorand = algokit.AlgorandClient.fromConfig({ algodConfig });
  const creator = algorand.account.random();

  console.log("Wallet address", creator.addr);
  console.log("wallet Private key", creator.account.sk);
  const dispenser_url = `https://bank.testnet.algorand.network/?account=${creator.addr}`;
  console.log(`Fund the wallet via Algorand Dispenser: ${dispenser_url}`);
  console.log("Press any key when the account is funded");
  await keypress();

  const asset = await algorand.send.assetCreate({
    sender: creator.addr,
    total: 1000000n,
    decimals: 2,
    unitName: "RUG",
    assetName: "Really Useful Gift",
    manager: creator.addr,
    reserve: creator.addr,
    freeze: creator.addr,
    clawback: creator.addr,
    defaultFrozen: false,
  });

  console.log(
    `Asset created ${asset.assetName} on testnet with id ${asset.assetId}`
  );
  console.log(
    `Explorer URL: https://lora.algokit.io/testnet/asset/${asset.assetId}`
  );
}

create_asset();
