import classNames from '../helpers/classNames'
import { truncate, formatDate } from '../helpers/string'
import Address from './Address'
import { useRouter } from 'next/router'
import { Conversation } from '@xmtp/xmtp-js/dist/types/src/conversations'
import useConversation from '../hooks/useConversation'
import { XmtpContext } from '../contexts/xmtp'
import { Message } from '@xmtp/xmtp-js'
import useEns from '../hooks/useEns'
import { Avatar } from '../../components/Profile/Avatar.js'
import { useContext } from 'react'
import { useAddressName } from '../../hooks/useAddressName.js'
import { useAddressAvatar } from '../../hooks/useAddressAvatar.js'

type ConversationsListProps = {
  conversations: Conversation[]
}

type ConversationTileProps = {
  conversation: Conversation
  isSelected: boolean
  onClick?: () => void
}

const getLatestMessage = (messages: Message[]): Message | null =>
  messages.length ? messages[messages.length - 1] : null

  const checkMessageType = (message) => {
    //Instead of slicing we can directly parse and check but
    //I think this is faster
    const sliced = message.content.slice(0,22)
    switch (sliced) {
      case '{"type":"media","cid":':
        return (JSON.parse(message.content))
      case '{"type":"file","cid":"':
        return (JSON.parse(message.content))
      default:
        return ({type: 'text'})
        break;
    }
  }

const ConversationTile = ({
  conversation,
  isSelected,
  onClick,
}: ConversationTileProps): JSX.Element | null => {
  const { loading: isLoadingEns } = useEns(conversation.peerAddress)
  const { messages, loading: isLoadingConversation } = useConversation(
    conversation.peerAddress
  )
  const loading = isLoadingEns || isLoadingConversation
  const router = useRouter()
  const latestMessage = getLatestMessage(messages)
  const nickname = useAddressName({
    address: conversation.peerAddress.toLowerCase(),
  })
  const savedAvatar = useAddressAvatar({
    address: conversation.peerAddress.toLowerCase(),
  })

  const handleClick = () => {
    router.push(
      {
        pathname: '/rotarydial',
        query: { to: conversation.peerAddress },
      },
      { shallow: true }
    )
  }
  if (!latestMessage) {
    return null
  }
  return (
    <div onClick={handleClick} className="cursor-pointer">
      <a onClick={onClick}>
        <div
          className={classNames(
            'h-20',
            'py-2',
            'px-4',
            'mt-1',
            'md:max-w-sm',
            'mx-auto',
            'bg-snow',
            'rounded-xl',
            'flex',
            'items-center',
            // 'space-y-0',
            // 'space-y-2',
            'space-x-4',
            // 'border-b-2',
            // 'border-gray-100',
            // 'hover:bg-bt-100',
            loading ? 'opacity-80' : 'opacity-100',
            isSelected ? 'bg-bt-200' : null
          )}
        >
          {/**IMPORTING OUR AVATAR IS NOT REALLY WORKING */}
          <div className="relative w-11 h-11 ">
            <Avatar src={savedAvatar} scale={0} />
          </div>
          <div className="py-4 sm:text-left ml-3 text min-w-96 w-full">
            <div className="flex justify-between px-2">
              {nickname.length < 41 ? (
                <div className="text-black text-lg md:text-md font-bold place-self-start">
                  {nickname}
                </div>
              ) : (
                <Address
                  address={conversation.peerAddress}
                  className="text-black text-lg md:text-md font-bold place-self-start"
                />
              )}
              <span
                className={classNames(
                  'text-lg md:text-sm font-normal place-self-end',
                  isSelected ? 'text-n-500' : 'text-n-300',
                  loading ? 'animate-pulse' : ''
                )}
              >
                {formatDate(latestMessage?.sent)}
              </span>
            </div>
            <p
              className={classNames(
                'text-[13px] md:text-sm font-normal text-ellipsis mt-0 px-2',
                isSelected ? 'text-n-500' : 'text-n-300',
                loading ? 'animate-pulse' : ''
              )}
            >
              {
                checkMessageType(latestMessage).type === "text" ? 
                  (
                    truncate(latestMessage.content, 75)
                  ) : (
                    "This message has an attached content."
                  )
              }
            </p>
          </div>
        </div>
      </a>
    </div>
  )
}

const ConversationsList = ({
  conversations,
}: ConversationsListProps): JSX.Element => {
  const router = useRouter()
  const { getMessages } = useContext(XmtpContext)
  const orderByLatestMessage = (
    convoA: Conversation,
    convoB: Conversation
  ): number => {
    const convoAMessages = getMessages(convoA.peerAddress)
    const convoBMessages = getMessages(convoB.peerAddress)
    const convoALastMessageDate =
      getLatestMessage(convoAMessages)?.sent || new Date()
    const convoBLastMessageDate =
      getLatestMessage(convoBMessages)?.sent || new Date()
    return convoALastMessageDate < convoBLastMessageDate ? 1 : -1
  }
  return (
    <div>
      {conversations &&
        conversations.sort(orderByLatestMessage).map((convo) => {
          const isSelected =
            router.query.to == convo.peerAddress
          return (
            <ConversationTile
              key={convo.peerAddress}
              conversation={convo}
              isSelected={isSelected}
            />
          )
        })}
    </div>
  )
}

export default ConversationsList
