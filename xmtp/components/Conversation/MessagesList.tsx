import { Message } from '@xmtp/xmtp-js'
import React, { MutableRefObject } from 'react'
import Emoji from 'react-emoji-render'
import { formatTime } from '../../helpers/string'
import AddressPill from '../AddressPill'
import { AddressTag } from '../../../components/AddressTag'
import { useAddressAvatar } from '../../../hooks/useAddressAvatar.js'
import { PoapAvatar } from '../../../components/Poap'
import { Avatar } from '../../../components/Profile/Avatar'

export type MessageListProps = {
  messages: Message[]
  walletAddress: string | undefined
  messagesEndRef: MutableRefObject<null>
}

type MessageTileProps = {
  message: Message
  isSender: boolean
}

const isOnSameDay = (d1?: Date, d2?: Date): boolean => {
  return d1?.toDateString() === d2?.toDateString()
}

const formatDate = (d?: Date) =>
  d?.toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

const MessageTile = ({ message, isSender }: MessageTileProps): JSX.Element => {
  const savedAvatar = useAddressAvatar({
    address: message.senderAddress.toLowerCase(),
  })
  return (
    <div className="flex items-start mx-auto mb-4 w-full">
      <div className="relative w-11 h-11 ">
        <Avatar src={savedAvatar} scale={0} />
      </div>
      <div className="ml-2">
        <div className="flex items-center gap-2">
          {/**COVALENT IS BRINGING JUST LOWERCASE ADDRESSES */}
          <AddressTag
            address={message.senderAddress.toLowerCase()}
            isOneHop={false}
          />
          {/* <span className="flex overflowtext-sm font-normal place-self-end text-n-300 text-md uppercase">
            {formatTime(message.sent)}
          </span> */}
        </div>
        <span className="block text-md px-2 mt-2 text-black font-normal">
          {message.error ? (
            `Error: ${message.error?.message}`
          ) : (
            <Emoji text={message.content || ''} />
            // <div>{message.content}</div>
          )}
        </span>
      </div>
    </div>
  )
}

const DateDividerBorder: React.FC = ({ children }) => (
  <>
    <div className="grow h-0.5 bg-gray-300/25" />
    {children}
    <div className="grow h-0.5 bg-gray-300/25" />
  </>
)

const DateDivider = ({ date }: { date?: Date }): JSX.Element => (
  <div className="flex align-items-center items-center pb-8 pt-4">
    <DateDividerBorder>
      <span className="mx-11 flex-none text-gray-300 text-sm font-bold">
        {formatDate(date)}
      </span>
    </DateDividerBorder>
  </div>
)

const ConversationBeginningNotice = (): JSX.Element => (
  <div className="flex align-items-center justify-center pb-4">
    <span className="text-gray-300 text-sm font-semibold">
      This is the beginning of the conversation
    </span>
  </div>
)

const MessagesList = ({
  messages,
  walletAddress,
  messagesEndRef,
}: MessageListProps): JSX.Element => {
  let lastMessageDate: Date | undefined

  return (
    <div className="flex-grow flex ">
      <div className="pb-6 md:pb-0 w-full flex flex-col self-end">
        <div className="w-full bg-transparent px-4 pt-6 overflow-y-auto flex">
          <div className="">
            {messages && messages.length ? (
              <ConversationBeginningNotice />
            ) : null}
            {messages?.map((msg: Message) => {
              const isSender = msg.senderAddress === walletAddress
              const tile = (
                <MessageTile message={msg} key={msg.id} isSender={isSender} />
              )
              const dateHasChanged = !isOnSameDay(lastMessageDate, msg.sent)
              lastMessageDate = msg.sent
              return dateHasChanged ? (
                <div key={msg.id}>
                  <DateDivider date={msg.sent} />
                  {tile}
                </div>
              ) : (
                tile
              )
            })}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>
    </div>
  )
}
export default React.memo(MessagesList)
