import * as algokit from '@algorandfoundation/algokit-utils'
import { AdvMarketplaceClient } from './contracts/AdvMarketplace'

export function create(
  algorand: algokit.AlgorandClient,
  mkClient: AdvMarketplaceClient,
  sender: string,
  setAppId: (id: number) => void
) {
  return async () => {
    const result = await mkClient.create.bare();

    await algorand.send.payment({
      sender,
      receiver: result.appAddress,
      amount: algokit.algos(0.1),
    })

    setAppId(Number(result.appId))
  }
}

export function buy(
  algorand: algokit.AlgorandClient,
  mkClient: AdvMarketplaceClient,
  sender: string,
  sellerAddress: string,
  assetId: bigint,
  nonce: bigint,
  quantity: bigint,
  unitaryPrice: bigint
) {
  return async () => {
    await algorand.send.assetOptIn({
      sender,
      assetId
    })

    const buyerTxn = await algorand.transactions.payment({
      sender,
      receiver: sellerAddress,
      amount: algokit.algos(Number(quantity * unitaryPrice) / 1e3),
      extraFee: algokit.algos(0.001)
    })

    await mkClient.buy({
      owner: sellerAddress,
      asset: assetId,
      nonce,
      buyPay: buyerTxn,
      quantity
    })
  }
}


export function sell(
  algorand: algokit.AlgorandClient,
  mkClient: AdvMarketplaceClient,
  seller: string,
  amountToSell: bigint,
  unitaryPrice: bigint
) {
  return async () => {
    const newAssetId = await algorand.send.assetCreate({
      sender: seller,
      total: BigInt(100_000),
      decimals: 3
    })

    if (!newAssetId.confirmation.assetIndex) {
      throw new Error()
    }

    const { appAddress } = await mkClient.appClient.getAppReference();

    // Allow Asset Txt
    const mbrPayAllowAsaTxn = await algorand.transactions.payment({
      sender: seller,
      receiver: appAddress,
      amount: algokit.algos(0.1),
      extraFee: algokit.algos(0.01),
    });

    await mkClient.allowAsset({
      mbrPay: mbrPayAllowAsaTxn,
      asset: newAssetId.confirmation.assetIndex
    })


    const TransferXAsset = await algorand.transactions.assetTransfer({
      sender: seller,
      assetId: BigInt(newAssetId.confirmation.assetIndex),
      amount: amountToSell,
      receiver: appAddress
    })

    const PayDepositTxn = await algorand.transactions.payment({
      sender: seller,
      receiver: appAddress,
      amount: algokit.algos(0.1),
    })

    await mkClient.firstDeposit({
      mbrPay: PayDepositTxn,
      xfer: TransferXAsset,
      nonce: 0,
      unitaryPrice,
    })

    const secondXfer = await algorand.transactions.assetTransfer({
      sender: seller,
      assetId: BigInt(newAssetId.confirmation.assetIndex),
      amount: 1n,
      receiver: appAddress
    })

    await mkClient.deposit({
      xfer: secondXfer,
      nonce: 0
    })

  }
}
