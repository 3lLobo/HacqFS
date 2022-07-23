// import { Disclosure } from '@chakra-ui/react'
import { ColorModeToggle } from './colorModeToggle'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { MyButton } from '../Buttons/MyButton'
import { useState } from 'react'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { reset as resetEvm, setConnection, setPoaps } from '../../app/evmSlice'
import { reset as resetContacts } from '../../app/contactSlice'
import { ethers } from 'ethers'

import { useViewerConnection } from '@self.id/react'
import { EthereumAuthProvider } from '@self.id/web'
import { useRouter } from 'next/router'
import { useLazyGetPoapsQuery } from '../../app/poapApi'

async function createAuthProvider() {
  // The following assumes there is an injected `window.ethereum` provider
  const provider = await window.ethereum
    .request({ method: 'eth_requestAccounts' })
    .then(() => {
      const address = window.ethereum.selectedAddress
      provider = new EthereumAuthProvider(window.ethereum, address)
      return provider
    })
    .catch((error) => {
      if (error.code === 4001) {
        // EIP-1193 userRejectedRequest error
        console.log('Please connect to MetaMask.')
      } else {
        console.error(error)
      }
    })
  return provider
}

export default function Header() {
  const router = useRouter()
  const [isAbleToRefresh, setIsAbleToRefresh] = useState(false)
  const store = useSelector((state) => state.evm)
  const dispatch = useDispatch()
  const [poapTrigger, poapResult, poapLastPromiseInfo] = useLazyGetPoapsQuery()

  // Wait for poap result and store it.
  useEffect(() => {
    if (poapResult.isSuccess) {
      if (poapResult.data.length !== store.poaps.length) {
        const poaps = poapResult.data.map((poap) => {
          return poap.event.id
        })
        dispatch(setPoaps({ poaps }))
      }
    }
  }, [poapResult, store.poaps, dispatch])

  const [connection, connect, disconnect] = useViewerConnection()

  const [isConnected, setIsConnected] = useState(false)
  useEffect(() => {
    const checkIfRefresh = async () => {
      if (isAbleToRefresh) {
        connectCeramic()
      }
    }
    console.log('Ceramic client: ', connection)
    if (connection.status === 'idle') {
      if (store.isConnected && !isAbleToRefresh) {
        setIsAbleToRefresh(true)
      }
      checkIfRefresh()
    }
  }, [connection.status, isAbleToRefresh])

  async function connectCeramic() {
    const authProvider = await createAuthProvider()
    // trigger POAP fetching
    poapTrigger({ address: window.ethereum.selectedAddress }, true)
    await connect(authProvider).then(() => {
      setIsConnected(true)
      setIsAbleToRefresh(true)
      const chainId =
        ethers.utils.arrayify(window.ethereum.chainId, {
          hexPad: 'left',
        })[0] || 1
      dispatch(
        setConnection({
          connected: true,
          account: window.ethereum.selectedAddress,
          chainId: chainId.toString(),
        })
      )
      router.push('/rotarydial')
    }).catch((error) => {
      console.log(error)
      dispatch(resetEvm())
      dispatch(resetContacts())
      setIsConnected(false)
    })
  }

  async function connectButtonHit() {
    if (connection.status === 'connected') {
      //since there's no way to disconnect metamask from frontend and
      //we check if there's an account to rehydrate our app. We need a
      //toast here to ask to disconnect metamask aswell
      disconnect()
      setIsAbleToRefresh(false)
    } else {
      connectCeramic()
    }
    // Set event listener for disconnecting a wallet
    window.ethereum.on('accountsChanged', (accounts) => {
      // If user has locked/logout from MetaMask, this resets the accounts array to empty
      if (!accounts.length) {
        console.log('Metamask disconnected!')
        disconnect()
        dispatch(resetEvm())
      }
    })
  }


  return (
    <>
      <div
        as="nav"
        className="backdrop-blur-sm dark:backdrop-brightness-150 z-30 sticky top-0 shadow-xl overflow-hidden"
      >
        <div className=" mx-auto px-2 sm:px-6 ">
          <div className=" flex items-center justify-between h-16">
            <MyButton
              text={isConnected ? 'Disconnect' : 'Connect'}
              onClick={connectButtonHit}
              primary={false}
            >
              {!isConnected && (
                <div className="relative flex col-span-1 h-6 w-6 rounded-full ml-1">
                  <Image alt="metamask" layout="fill" src="/metamask.png" />
                </div>
              )}
            </MyButton>
            <motion.div
              initial={false}
              animate={isConnected ? 'visible' : 'hidden'}
              exit={{ opacity: 0 }}
              transition={{ ease: 'easeInOut', duration: 0.5 }}
              variants={{
                visible: { opacity: 1, x: 0 },
                hidden: { opacity: 0, x: -500 },
              }}
              title={store.account}
              className="ml-3 mr-auto px-2 py-1 bg-indigo-500 bg-opacity-80 rounded-tr-xl rounded-bl-xl text-snow text-xs hover:text-snow-muted hover:bg-indigo-600 transition-colors duration-300 truncate"
            >
              {store.account}
            </motion.div>
            <div className="sm:inset-auto sm:ml-6 flex gap-2">
              <ColorModeToggle />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
