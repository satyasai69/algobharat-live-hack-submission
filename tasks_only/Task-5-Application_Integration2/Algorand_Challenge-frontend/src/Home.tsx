// src/components/Home.tsx
import { useWallet } from '@txnlab/use-wallet-react'
import React, { useState } from 'react'
import ConnectWallet from './components/ConnectWallet'
import Transact from './components/Transact'
import AppCalls from './components/AppCalls'
import AppCallsAlgo from './components/AppCallClaimAlgo'
import AppCallsAssert from './components/AppCallClaimAssert'

interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
  const [openWalletModal, setOpenWalletModal] = useState<boolean>(false)
  const [openDemoModal, setOpenDemoModal] = useState<boolean>(false)
  const [appCallsDemoModal, setAppCallsDemoModal] = useState<boolean>(true)
  const [openDemoModalAlgo, setOpenDemoModalAlgo] = useState<boolean>(false)
  const [appCallsDemoModalAlgo, setAppCallsDemoModalAlgo] = useState<boolean>(false)
  const [openDemoModalAssert, setOpenDemoModalAssert] = useState<boolean>(false)
  const [appCallsDemoModalAssert, setAppCallsDemoModalAssert] = useState<boolean>(false)
  const { activeAddress } = useWallet()

  const toggleWalletModal = () => {
    setOpenWalletModal(!openWalletModal)
  }

  const toggleDemoModal = () => {
    setOpenDemoModal(!openDemoModal)
  }

  const toggleAppCallsModal = () => {
    setAppCallsDemoModal(!appCallsDemoModal)
  }
  //setAppCallsDemoModal(!appCallsDemoModal)
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-400 to-cyan-300 flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 max-w-2xl w-full relative transform hover:scale-[1.02] transition-transform duration-300">
        <div className="absolute top-6 right-6">
          <button
            data-test-id="connect-wallet"
            className="btn btn-primary shadow-lg hover:shadow-xl transition-shadow duration-300 px-6 py-3 rounded-xl font-semibold"
            onClick={toggleWalletModal}
          >
            Wallet Connection
          </button>
        </div>
        <div className="flex flex-col items-center space-y-8">
          <div className="text-center">
            <h1 className="text-6xl font-extrabold text-teal-600 mb-4 drop-shadow-lg animate-fade-in">
              Elon Claim <span role="img" aria-label="smile" className="hover:rotate-12 inline-block transition-transform duration-300">🙂</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 animate-slide-up">
              Claim your <span className="font-semibold text-teal-500 hover:text-teal-600 transition-colors duration-300">Elon tokens</span> below!
            </p>
          </div>
          <div className="w-full flex flex-col gap-8 animate-fade-in">
            {activeAddress ? (
              <>
                <AppCallsAlgo />
                <AppCallsAssert />
              </>
            ) : (
              <div className="text-center text-gray-500 py-8">
                Please connect your wallet to claim tokens
              </div>
            )}
          </div>
        </div>
        <ConnectWallet openModal={openWalletModal} closeModal={toggleWalletModal} />
      </div>
    </div>
  )
}

export default Home

/**
            {activeAddress && (
              <button data-test-id="transactions-demo" className="btn m-2" onClick={toggleDemoModal}>
                Transactions Demo
              </button>
            )}

            {activeAddress && (
              <button data-test-id="appcalls-demo" className="btn m-2" onClick={toggleAppCallsModal}>
                Contract Interactions Demo
              </button>
            )} */
