//  multiple nullable

import { Fragment, useState } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, SelectorIcon } from '@heroicons/react/solid'
import { Tag } from './Tag'
import { getRandomTailwindColor } from '../../lib/randomColors'
import { useDispatch, useSelector } from 'react-redux'
import { updateContact } from '../../app/contactSlice'
import axios from 'axios'

// Call the tag-api to call the contract and submit the tag+target-address to the blockchain and theGrpah.
async function addTag2theGraph(targetAddress, tag) {
  const res = await axios.post(
    '/api/tags',
    {
      targetAddress,
      tag,
    },
    {
      timeout: 15000,
    }
  )
  console.log('Tag-api response: ', res)
}

// TODO: add these to global/user database
const publicTags = [
  { id: 1, name: 'human', color: 'cyan-300' },
  { id: 2, name: 'trust', color: 'green-300' },
  { id: 3, name: 'smrtCntrct', color: 'violet-300' },
  { id: 4, name: 'fraud', color: 'red-600' },
  { id: 5, name: 'spam', color: 'rose-400' },
]

export function PubTags() {
  const store = useSelector((state) => state.contact)
  const dispatch = useDispatch()

  const [tags, setTags] = useState(() => publicTags)
  const [selected, setSelected] = useState(() =>
    publicTags.filter((tag) => {
      if (store.contactInEdit.tags.pubTags.map((t) => t.id).includes(tag.id)) {
        return tag
      }
    })
  )

  function onChange(selectedTags) {
    setSelected(selectedTags)
    dispatch(
      updateContact({
        field1: 'tags',
        field2: 'pubTags',
        value: selectedTags,
      })
    )
    // add the selected tag to theGraph
    // TODO: check if this user already submitted this tag+target combo.
    const targetAddress = store.contactInEdit.bio.address
    const nTags = selectedTags.length
    if (nTags > 0) {
      const tag = selectedTags[nTags - 1]
      addTag2theGraph(targetAddress, tag.name)
    }
  }

  return (
    <div className="z-30 w-full flex flex-row-reverse items-center">
      <div className="flex flex-grow justify-between items-center mr-auto ml-1">
        {selected.length > 0 && (
          <ul className=" py-2 flex flex-row space-x-1 px-3 rounded-md overflow-x-scroll scrollbar-hide mx-auto">
            {selected.map((person) => (
              <li key={person.id}>
                <Tag tagText={person.name} color={person.color} />
              </li>
            ))}
          </ul>
        )}
      </div>
      {store.contactInEdit.isOneHop && (
        <div className={"w-full z-30 "}>
          <Listbox value={selected} onChange={onChange} name="assignee" multiple>
            <div className="relative mt-1 flex flex-col">
              <div className="relative w-fit cursor-default rounded-lg py-2 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                <Listbox.Button className=" inset-y-0 right-0 flex items-center px-1 ">
                  <SelectorIcon
                    className="h-5 w-5 text-indigo-400"
                    aria-hidden="true"
                  />
                </Listbox.Button>
              </div>
              <Transition
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options className="absolute w-40 top-10 max-h-60 scrollbar-hide rounded-md backdrop-blur-md backdrop-brightness-125 dark:bg-zinc-800 dark:bg-opacity-80 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm ">
                  {tags.map((person) => (
                    <Listbox.Option
                      key={person.id}
                      className={({ active }) =>
                        `relative cursor-default select-none py-2 pl-10 pr-4  ${active ? ' text-bold' : 'text-indigo-900 dark:text-snow'
                        }`
                      }
                      value={person}
                    >
                      {({ selected, active }) => (
                        <>
                          <span
                            className={`block truncate  ${selected ? 'font-medium' : 'font-normal'
                              }`}
                          >
                            {person.name}
                          </span>
                          {selected ? (
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600 ">
                              <CheckIcon className="h-5 w-5" aria-hidden="true" />
                            </span>
                          ) : null}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </Listbox>
        </div>
      )}
    </div>
  )
}
