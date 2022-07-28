import { useCallback, useEffect, useRef, useState } from 'react'
import useXmtp from '../hooks/useXmtp'
import { useRouter } from 'next/router'
// import Head from 'next/head'
// import Link from 'next/link'
// import useWallet from '../hooks/useWallet'
import NavigationView from './Views/NavigationView'
// import ConversationView from './Views/ConversationView'
// import RecipientControl from './Conversation/RecipientControl'
import Conversation from './Conversation/Conversation'
// import NewMessageButton from './NewMessageButton'
import NavigationPanel from './NavigationPanel'
// import XmtpInfoPanel from './XmtpInfoPanel'
// import UserMenu from './UserMenu'
// import BackArrow from './BackArrow'
import messageComposerStyles from '../styles/MessageComposer.module.css'
import { ethers } from 'ethers'
import { getWeb3Signer } from '../../lib/xmtpSigner'

const NavigationColumnLayout: React.FC = ({ children }) => (
  <aside className="flex w-1/4 text-xs flex-col flex-grow fixed inset-y-0 right-0 border-l border-gray-200 px-2">
    <div className="flex flex-col flex-grow overflow-y-auto ">
      {children}
    </div>
  </aside>
)

const TopBarLayout: React.FC = ({ children }) => (
  <>
    <span className="text-center text-xl font-bold bg-mybg-light dark:bg-mybg-dark dark:text-snow py-6 backdrop-blur-sm dark:backdrop-brightness-150 z-30 shadow-xl">
        Conversations - Powered by XMTP
    </span>
    {children}
  </>
)

const Layout: React.FC = ({ children }) => {
  const [addressToSend, setAddressToSend] = useState('')
  const {
    connect: connectXmtp,
    // disconnect: disconnectXmtp,
    walletAddress,
    client,
    // conversations,
    // loadingConversations,
  } = useXmtp()
  const router = useRouter()

  const recipientWalletAddr = router.query.to as string

  // const handleConnect = useCallback(async () => {
    // await connectWallet()
  // }, [connectWallet])

  async function onConnect() {

    await connectXmtp(getWeb3Signer())
  }

  const handleNewConversation = (e) => {
    e.preventDefault()
    router.push(
      {
        pathname: '/rotarydial',
        query: { to: ethers.utils.getAddress(addressToSend) },
      },
      { shallow: true }
    )
  }
  
  const usePrevious = <T,>(value: T): T | undefined => {
    const ref = useRef<T>()
    useEffect(() => {
      ref.current = value
    })
    return ref.current
  }
  // const prevSigner = usePrevious(signer)
  console.log("🚀 ~ file: Layout.tsx ~ line 130 ~ recipientWalletAddr", recipientWalletAddr)
  console.log("🚀 ~ file: Layout.tsx ~ line 130 ~ client", client)
  console.log("🚀 ~ file: Layout.tsx ~ line 130 ~ walletAddress", walletAddress)

  useEffect(() => setAddressToSend(''), [router.query.to])

  return (
    <div className="">
      <NavigationView>
        <NavigationColumnLayout>
          <span className="text-center font-bold bg-mybg-light dark:bg-mybg-dark dark:text-snow py-6 backdrop-blur-sm dark:backdrop-brightness-150 z-30 shadow-xl">
            Converations - powered by XMTP
          </span>
          {walletAddress && client && (
            <form onSubmit={handleNewConversation} className="flex items-center gap-1 w-full mt-5 px-3 mb-4">
              <input
                className="rounded-2xl w-11/12"
                type="text"
                onChange={(e) => setAddressToSend(e.target.value)}
                value={addressToSend}
                placeholder="New conversation"
              />
              <button
                className={messageComposerStyles.arrow}
              >
                {addressToSend.length === 42 ? (
                  <svg
                    viewBox="0 0 26 26"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M13 25.7999C20.0693 25.7999 25.8 20.0692 25.8 13C25.8 5.93071 20.0693 0.199951 13 0.199951C5.93077 0.199951 0.200012 5.93071 0.200012 13C0.200012 20.0692 5.93077 25.7999 13 25.7999ZM18.9314 11.8686L14.1314 7.06858C13.5065 6.44374 12.4935 6.44374 11.8686 7.06858L7.06864 11.8686C6.4438 12.4934 6.4438 13.5065 7.06864 14.1313C7.69348 14.7562 8.70654 14.7562 9.33138 14.1313L11.4 12.0627L11.4 17.8C11.4 18.6836 12.1164 19.4 13 19.4C13.8837 19.4 14.6 18.6836 14.6 17.8V12.0627L16.6686 14.1313C17.2935 14.7562 18.3065 14.7562 18.9314 14.1313C19.5562 13.5065 19.5562 12.4934 18.9314 11.8686Z"
                      fill="#2EC053"
                    />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 26 26"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M13 25.7999C20.0693 25.7999 25.8 20.0692 25.8 13C25.8 5.93071 20.0693 0.199951 13 0.199951C5.93077 0.199951 0.200012 5.93071 0.200012 13C0.200012 20.0692 5.93077 25.7999 13 25.7999ZM18.9314 11.8686L14.1314 7.06858C13.5065 6.44374 12.4935 6.44374 11.8686 7.06858L7.06864 11.8686C6.4438 12.4934 6.4438 13.5065 7.06864 14.1313C7.69348 14.7562 8.70654 14.7562 9.33138 14.1313L11.4 12.0627V17.7999C11.4 18.6836 12.1164 19.4 13 19.4C13.8837 19.4 14.6 18.6836 14.6 17.7999V12.0627L16.6686 14.1313C17.2935 14.7562 18.3065 14.7562 18.9314 14.1313C19.5562 13.5065 19.5562 12.4934 18.9314 11.8686Z"
                      fill="#989CA7"
                    />
                  </svg>
                )}
              </button>
            </form>
          )}
          <NavigationPanel onConnect={() => onConnect()} />
        </NavigationColumnLayout>
      </NavigationView>
      {/* <div className="w-3/4 flex"> */}
        {walletAddress && client && recipientWalletAddr !== undefined && (
          <Conversation recipientWalletAddr={recipientWalletAddr} />
        )}
      {/* </div> */}
    </div>
  )
}

export default Layout
