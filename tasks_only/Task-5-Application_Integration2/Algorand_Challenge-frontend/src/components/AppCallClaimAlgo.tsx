import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'
import { useState } from 'react'
import { TokenClaimFactory } from '../contracts/TokenClaim'
import { OnSchemaBreak, OnUpdate } from '@algorandfoundation/algokit-utils/types/app'
import { getAlgodConfigFromViteEnvironment, getIndexerConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'
import { AlgorandClient } from '@algorandfoundation/algokit-utils'

const AppCallsAlgo = () => {
  const [loading, setLoading] = useState<boolean>(false)
  const { enqueueSnackbar } = useSnackbar()
  const { transactionSigner, activeAddress } = useWallet()

  const algodConfig = getAlgodConfigFromViteEnvironment()
  const indexerConfig = getIndexerConfigFromViteEnvironment()
  const algorand = AlgorandClient.fromConfig({
    algodConfig,
    indexerConfig,
  })
  algorand.setDefaultSigner(transactionSigner)

  const sendAppCall = async () => {
    setLoading(true)

    // Please note, in typical production scenarios,
    // you wouldn't want to use deploy directly from your frontend.
    // Instead, you would deploy your contract on your backend and reference it by id.
    // Given the simplicity of the starter contract, we are deploying it on the frontend
    // for demonstration purposes.
    const factory = new TokenClaimFactory({
      defaultSender: activeAddress ?? undefined,
      algorand,
    })
    const deployResult = await factory
      .deploy({
        onSchemaBreak: OnSchemaBreak.AppendApp,
        onUpdate: OnUpdate.AppendApp,
      })
      .catch((e: Error) => {
        enqueueSnackbar(`Error deploying the contract: ${e.message}`, { variant: 'error' })
        setLoading(false)
        return undefined
      })

    if (!deployResult) {
      return
    }

    const { appClient } = deployResult

    const response = await appClient.send.claimAlgo().catch((e: Error) => {
      enqueueSnackbar(`Error calling the contract: ${e.message}`, { variant: 'error' })
      setLoading(false)
      return undefined
    })

    if (!response) {
      return
    }

    enqueueSnackbar(`Response from the contract: ${response.return}`, { variant: 'success' })
    setLoading(false)
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
      <h3 className="text-2xl font-bold text-teal-600 mb-6">Claim your Algo</h3>
      <div className="relative">
        <button
          className={`w-full bg-gradient-to-r from-teal-400 to-cyan-400 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ${loading ? 'opacity-75 cursor-not-allowed' : 'hover:scale-[1.02]'}`}
          onClick={sendAppCall}
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <span className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></span>
              <span>Processing...</span>
            </div>
          ) : (
            'Claim Algo'
          )}
        </button>
      </div>
    </div>
  )
}

export default AppCallsAlgo
