import Head from '../components/Head'
import Header from '../components/Header'
import { createAccountsDocument, updateAccountsDocument, initOrUpdateContacts } from '../lib/ceramicFunctions'

const ceramic = () => {
  const create = async () => {
    await initOrUpdateContacts(["acc1", "acc2", "acc3","acc4", "acc6"])
  }
  return (
    <div className="bg-mybg-light dark:bg-mybg-dark min-h-screen flex flex-col ">
      <Head />
      <Header />

      <main className="z-10 mx-auto max-w-6xl scrollbar-hide my-11 flex-grow ">
        <button onClick={() => create()}>check</button>
      </main>

      <footer className="mt-auto mb-0"></footer>
    </div>
  )
}

export default ceramic
