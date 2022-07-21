import { Avatar } from '../Profile/Avatar'
import { Tag } from '../Profile/Tag'
import { useDispatch, useSelector } from 'react-redux'
import { closeModal, openModal } from '../../app/contactSlice'

export const Slice = ({ contact }) => {
  const store = useSelector((state) => state.contact)
  const dispatch = useDispatch()

  function onContactClick() {
    dispatch(openModal({ address: contact.bio.address }))
  }

  return (
    <div
      // TODO: make this a grid.
      className="bg-indigo-200 dark:bg-slate-800 dark:text-snow p-2 mx-6 my-2 max-w-11/12 flex-row gap-3 rounded-xl grid grid-cols-16 grid-flow-col justify-start items-center text-slate-900  "
    >
      <div onClick={onContactClick} className="w-10 ml-0 hover:cursor-pointer">
        <div className="hover:scale-105 transition-all duration-300 transform-gpu">
          <Avatar scale={110} />
        </div>
      </div>
      <button
        onClick={onContactClick}
        className="mr-11 col-span-2 self-center hover:font-semibold transition-all duration-300 transform-gpu"
      >
        {contact.bio.name || contact.address}
      </button>
      <div
        // TODO: align tags to the left
        className="mr-11 w-44 space-x-1 col-span-2 flex flex-row overflow-x-scroll scrollbar-hide"
      >
        {contact.tags.privTags.map((tag) => (
          <Tag tagText={tag.name} color={tag.color} key={tag.id} />
        ))}
      </div>
      <div
        // TODO: align tags to the left
        className="mr-11 w-44 space-x-1 col-span-2 flex flex-row overflow-x-scroll scrollbar-hide"
      >
        {contact.tags.pubTags.map((tag) => (
          <Tag tagText={tag.name} color={tag.color} key={tag.id} isPub={true} />
        ))}
      </div>
      <button className="rounded-lg bg-slate-900 p-2 bg-opacity-10 hover:bg-opacity-20">
        {
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 stroke-indigo-600 dark:stroke-indigo-50"
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
            className="h-6 w-6 stroke-indigo-600 dark:stroke-indigo-50"
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
      </button>
    </div>
  )
}
