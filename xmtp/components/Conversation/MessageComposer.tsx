import React, { useCallback, useEffect, useState } from 'react'
import classNames from '../../helpers/classNames'
import messageComposerStyles from '../../styles/MessageComposer.module.css'
import { useRouter } from 'next/router'
import { BezierSpinner } from '../../../components/Spinner/BezierSpinner'
import { Web3Storage } from 'web3.storage'

type MessageComposerProps = {
  onSend: (msg: string) => Promise<void>
}

const MessageComposer = ({ onSend }: MessageComposerProps): JSX.Element => {
  const token = process.env.NEXT_PUBLIC_WEB3STORAGE
  const [message, setMessage] = useState('')
  const [files, setFiles] = useState(null)
  const [filesCID, setFilesCID] = useState('')
  const [extension, setExtension] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const router = useRouter()

  useEffect(() => setMessage(''), [router.query.recipientWalletAddr])

  const onMessageChange = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
        setMessage(e.currentTarget.value)
    },
    []
  )

  const onSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (!message) {
        return
      }
      if( filesCID ) {
        setMessage('')
        const messageWithMedia = JSON.stringify({
          type:'media',
          cid: filesCID,
          extension,
          message
        })
        setFilesCID('')
        setMessage('')
        await onSend(messageWithMedia)
      } else {
        setMessage('')
        await onSend(message)
      }
    },
    [onSend, message]
  )

  async function handleUpload(filesToUpload) {
    setIsUploading(true)
    try {
      console.log('> 📦 creating web3.storage client')
      const client = new Web3Storage({ token })

      console.log(
        '> 🤖 chunking and hashing the files to calculate the Content ID'
      )
      const cid = await client.put(filesToUpload, {
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

  useEffect(() => {
    const upload = async (file) => {
      await handleUpload(file)
      //To satisfy input required and update state and being able to add media as
      //last action. This can be done better
      setMessage(message+" ")
    }
    if (files?.length>0) {
      const file = files[0]
      const type = file.type
      const sufix = type.split('/')[1]
      const blob = file.slice(0, file.size, type); 
      const newFile = [new File([blob], `media.${sufix}`, {type})];
      setExtension(sufix);
      upload(newFile)
    }
  }, [files])
  

  return (
    <div className="sticky bottom-0 pl-4 mb-4 pt-2 flex-shrink-0 flex h-[68px] bg-transparent w-full">
      <form
        className={classNames(
          'flex',
          'w-full',
          'border',
          'py-2',
          'pl-4',
          'mr-3',
          messageComposerStyles.bubble
        )}
        autoComplete="off"
        onSubmit={onSubmit}
      >
        <input
          type="text"
          placeholder="Type something..."
          className={classNames(
            'block',
            'w-full',
            'text-md',
            'md:text-sm',
            messageComposerStyles.input
          )}
          name="message"
          value={message}
          onChange={onMessageChange}
          required
        />
        <div className='flex gap-1'>
          {isUploading? (
            <BezierSpinner />
          ):(
            <label htmlFor="filePicker" className={`cursor-pointer ${messageComposerStyles.arrow}`}>
              <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  fill={filesCID? "#2EC053" : "#989CA7"}
                d="M18.555,15.354V4.592c0-0.248-0.202-0.451-0.45-0.451H1.888c-0.248,0-0.451,0.203-0.451,0.451v10.808c0,0.559,0.751,0.451,0.451,0.451h16.217h0.005C18.793,15.851,18.478,14.814,18.555,15.354 M2.8,14.949l4.944-6.464l4.144,5.419c0.003,0.003,0.003,0.003,0.003,0.005l0.797,1.04H2.8z M13.822,14.949l-1.006-1.317l1.689-2.218l2.688,3.535H13.822z M17.654,14.064l-2.791-3.666c-0.181-0.237-0.535-0.237-0.716,0l-1.899,2.493l-4.146-5.42c-0.18-0.237-0.536-0.237-0.716,0l-5.047,6.598V5.042h15.316V14.064z M12.474,6.393c-0.869,0-1.577,0.707-1.577,1.576s0.708,1.576,1.577,1.576s1.577-0.707,1.577-1.576S13.343,6.393,12.474,6.393 M12.474,8.645c-0.371,0-0.676-0.304-0.676-0.676s0.305-0.676,0.676-0.676c0.372,0,0.676,0.304,0.676,0.676S12.846,8.645,12.474,8.645"
                />
              </svg>
              <input
                type="file"
                id="filePicker"
                onChange={(e) => setFiles(e.target.files)}
                className="hidden w-full h-full"
              />
            </label>
          )}
          <button type="submit" className={messageComposerStyles.arrow}>
              <svg
                viewBox="0 0 26 26"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  fill={isUploading || !message && !filesCID? "#989CA7" : "#2EC053"}
                  d="M13 25.7999C20.0693 25.7999 25.8 20.0692 25.8 13C25.8 5.93071 20.0693 0.199951 13 0.199951C5.93077 0.199951 0.200012 5.93071 0.200012 13C0.200012 20.0692 5.93077 25.7999 13 25.7999ZM18.9314 11.8686L14.1314 7.06858C13.5065 6.44374 12.4935 6.44374 11.8686 7.06858L7.06864 11.8686C6.4438 12.4934 6.4438 13.5065 7.06864 14.1313C7.69348 14.7562 8.70654 14.7562 9.33138 14.1313L11.4 12.0627L11.4 17.8C11.4 18.6836 12.1164 19.4 13 19.4C13.8837 19.4 14.6 18.6836 14.6 17.8V12.0627L16.6686 14.1313C17.2935 14.7562 18.3065 14.7562 18.9314 14.1313C19.5562 13.5065 19.5562 12.4934 18.9314 11.8686Z"
                />
              </svg>
          </button>
        </div>
      </form>
    </div>
  )
}

export default MessageComposer
