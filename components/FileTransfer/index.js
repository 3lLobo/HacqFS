import { useEffect, useState } from 'react'
import { Web3Storage } from 'web3.storage'
import { Client } from '@xmtp/xmtp-js'
import { ethers } from 'ethers'
import { BezierSpinner } from '../Spinner/BezierSpinner'
import Link from 'next/link'
import { Avatar } from '../Profile/Avatar'
import { Tag } from '../Profile/Tag'
import { AddressTag } from '../AddressTag'
import TimeAgo from 'timeago-react'
import useXmtp from '../../xmtp/hooks/useXmtp.ts'
import { useAddressAvatar } from '../../hooks/useAddressAvatar'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/router'

const FileTransfer = () => {
  const token = process.env.NEXT_PUBLIC_WEB3STORAGE
  const [files, setFiles] = useState([])
  const [filesCID, setFilesCID] = useState([])
  const [description, setDescription] = useState('')
  const [address, setAddress] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [receivedMedia, setReceivedMedia] = useState([])
  const [isFetchingMedia, setIsFetchingMedia] = useState(false)

  const store = useSelector((state) => state.contact)
  const router = useRouter()
  const sendFileTo = router.query.to

  const {
    connect: connectXmtp,
    disconnect: disconnectXmtp,
    walletAddress,
    client,
    conversations,
    loadingConversations,
  } = useXmtp()

  async function handleUpload() {
    setIsUploading(true)
    try {
      console.log('> 📦 creating web3.storage client')
      const client = new Web3Storage({ token })

      console.log(
        '> 🤖 chunking and hashing the files to calculate the Content ID'
      )
      const cid = await client.put(files, {
        onRootCidReady: (localCid) => {
          console.log(`> 🔑 locally calculated Content ID: ${localCid} `)
          console.log('> 📡 sending files to web3.storage ')
        },
        onStoredChunk: (bytes) =>
          console.log(
            `> 🛰 sent ${bytes.toLocaleString()} bytes to web3.storage`
          ),
      })
      console.log(`> ✅ web3.storage now hosting ${cid}`)

      setFilesCID(cid)
    } catch (error) {
      console.log(error)
    }
    setIsUploading(false)
  }

  const sendFile = async () => {
    setIsUploading(true)
    try {
      const conversation = await client.conversations.newConversation(address)
      console.log('Sending file...')
      const messageToSend = JSON.stringify({
        type: 'file',
        cid: filesCID,
        description,
      })
      await conversation.send(messageToSend)
      setFiles([])
      setFilesCID([])
      setDescription('')
      setAddress('')
      console.log('Message sent.')
    } catch (error) {
      console.log(error)
    }
    setIsUploading(false)
  }

  const getFiles = async () => {
    for await (const interaction of conversations) {
      try {
        const conversation = await client.conversations.newConversation(
          interaction.peerAddress
        )
        const messages = await conversation.messages()
        for await (const message of messages) {
          addToMediaIfFile(message, walletAddress)
        }
      } catch (error) {
        console.log('TOAST: ', error)
      }
    }
    receivedMedia.sort((a, b) => {
      return Date.parse(b.block_signed_at) - Date.parse(a.block_signed_at)
    })
    setIsFetchingMedia(false)
    await backgroundStreaming(client, walletAddress)
  }

  const backgroundStreaming = async (client, walletAddress) => {
    const stream = await client.conversations.stream()
    console.log('Background stream...')
    for await (const conversation of stream) {
      console.log(`New message received from ${conversation.peerAddress}`)
      const messages = await conversation.messages()
      const lastMessage = messages[messages.length - 1]
      addToMediaIfFile(lastMessage, walletAddress)
      break
    }
    console.log('Background stream ended.')
    backgroundStreaming(client, walletAddress)
  }

  const addToMediaIfFile = (message, recipientAddress) => {
    const sliced = message?.content?.slice(0, 21)
    if (
      (sliced === '{"type":"file","cid":') &
      (message.recipientAddress === recipientAddress)
    ) {
      const newMedia = JSON.parse(message.content)
      newMedia['sender'] = message.senderAddress
      newMedia['timestamp'] = message.header.timestamp
      setReceivedMedia((prevState) => [newMedia, ...prevState])
    }
  }

  useEffect(() => {
    if (sendFileTo) setAddress(sendFileTo)
  }, [sendFileTo])

  useEffect(() => {
    if (files.length > 0) handleUpload()
  }, [files])

  useEffect(() => {
    if (!isFetchingMedia) getFiles()
  }, [])

  return (
    <div className="flex flex-col items-center w-full">
      <div className="flex flex-col items-center mt-4 w-11/12">
        <div className="text-2xl text-slate-800 dark:text-white text-left w-full">
          Send files to your friends
        </div>
        <div className="bg-white dark:bg-indigo-800 p-2 mx-6 my-2 w-full flex-row gap-3 rounded-xl grid grid-cols-16 grid-flow-col justify-start items-center text-slate-900  dark:text-snow relative">
          <label
            htmlFor="filePicker"
            className={`rounded-lg bg-slate-900 p-2  hover:bg-opacity-20 cursor-pointer ${
              files.length > 0 ? 'bg-opacity-20' : 'bg-opacity-10'
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 stroke-indigo-600 dark:stroke-indigo-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              ></path>
            </svg>
            <input
              type="file"
              id="filePicker"
              onChange={(e) => setFiles(e.target.files)}
              multiple
              required
              className="hidden w-full h-full"
            />
          </label>
          <input
            className="w-96 border-none active:border-blue-300 rounded-lg"
            type="text"
            value={address}
            placeholder="Search or paste your friend's address"
            onChange={(e) => setAddress(e.target.value)}
            required
          />
          <input
            className="w-full border-none active:border-blue-500 rounded-lg"
            type="text"
            placeholder="You can add a subject"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button
            disabled={isUploading || filesCID.length === 0}
            onClick={sendFile}
            className="bg-indigo-900 text-slate-300 hover:bg-indigo-900 disabled:bg-gray-400 hover:text-snow group flex items-center px-2 py-2 text-sm font-medium rounded-md absolute right-2"
          >
            {isUploading ? (
              <BezierSpinner />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 stroke-white dark:stroke-indigo-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1"
              >
                <path d="M17.218,2.268L2.477,8.388C2.13,8.535,2.164,9.05,2.542,9.134L9.33,10.67l1.535,6.787c0.083,0.377,0.602,0.415,0.745,0.065l6.123-14.74C17.866,2.46,17.539,2.134,17.218,2.268 M3.92,8.641l11.772-4.89L9.535,9.909L3.92,8.641z M11.358,16.078l-1.268-5.613l6.157-6.157L11.358,16.078z"></path>
              </svg>
            )}
          </button>
        </div>
      </div>
      <div className="flex flex-col items-center mt-8 w-11/12">
        <div className="w-full">
          <div className="text-2xl text-left text-slate-800 dark:text-snow mb-3">
            Files received
          </div>
        </div>
        {isFetchingMedia && <BezierSpinner />}
        {!isFetchingMedia && receivedMedia.length === 0 && (
          <div>No files were received.</div>
        )}
        {receivedMedia.length > 0 &&
          receivedMedia.map((m, i) => {
            const contactAvatar = Object.keys(store.contacts).includes(m.sender)
              ? store.contacts[address].bio?.avatar
              : '/blocqBookLogo/icon/blocqbookTransparent2.png'
            return (
              <div
                key={i}
                className=" even:shadow-lg rounded-bl-xl rounded-tr-xl even:border-t-2 border-zinc-300 dark:bg-slate-800 p-2 mx-6 w-full flex-row gap-3 grid grid-cols-16 grid-flow-col justify-start items-center text-slate-900  dark:text-snow relative"
              >
                {/**<Avatar src={contactAvatar} />**/}
                {/* <img className="w-12 h-full rounded-full" src={contactAvatar} /> */}
                <div className="relative w-11 h-11 ">
                  <Avatar src={contactAvatar} scale={0} />
                </div>
                <div className="mr-11  col-span-2 div-black dark:div-indigo-50 self-center ">
                  {/**WTF COVALENT IS BRINGING THE ADDRESS LOWERCASES!! */}
                  <AddressTag
                    address={m.sender.toLowerCase()}
                    isOneHop={true}
                  />
                </div>
                <button className="bg-zinc-300 text-zinc-900 hover:text-zinc-600 hover:bg-zinc-400 group px-2 py-1 text-sm font-mono rounded-md">
                  <Link href={`https://ipfs.io/ipfs/${m.cid}`}>
                    <a target="_blank">{m.description}</a>
                  </Link>
                </button>
                <div className="flex gap-4 absolute right-2 items-center text-sm pr-3">
                  <TimeAgo datetime={m.timestamp} />
                  {/* <div className="mr-11 space-x-1 col-span-2 flex flex-row">
                    <Tag tagText="dude.eth" color="indigo-300" />
                    <Tag tagText="dude.eth" />
                  </div> */}
                  {/* <button className="rounded-lg bg-slate-900 p-2 bg-opacity-10 hover:bg-opacity-20">
                    {
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 stroke-indigo-600 dark:stroke-indigo-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        {' '}
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                    }
                  </button>
                  <button className="rounded-lg bg-slate-900 p-2 bg-opacity-10 hover:bg-opacity-20">
                    {
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 stroke-indigo-600 dark:stroke-indigo-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                        />
                      </svg>
                    }
                  </button> */}
                </div>
              </div>
            )
          })}
      </div>
    </div>
  )
}

export default FileTransfer
