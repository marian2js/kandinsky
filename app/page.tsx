'use client'

import { Button } from '@nextui-org/react'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import CreateSafeModal from './components/CreateSafeModal'
import NavBar from './components/NavBar'
import { useAccountAbstraction } from './store/accountAbstractionContext'
import getChain from './utils/getChain'

export default function Home() {
  const { web3Provider, loginWeb3Auth, isAuthenticated, ownerAddress, safes, chainId } = useAccountAbstraction()
  const [createSafeModalOpen, setCreateSafeModalOpen] = useState(false)

  const chain = useMemo(() => getChain(chainId), [chainId])

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <NavBar />

      <div>
        {isAuthenticated ? (
          <>
            <div className="flex flex-row items-center justify-between">
              <div>You have {safes.length} safes.</div>
              <div className="text-right">
                <Button onPress={() => setCreateSafeModalOpen(true)} isLoading={createSafeModalOpen}>
                  Create a Safe
                </Button>
              </div>
            </div>
            <div className="mt-12">
              {safes.map((safeAddress) => (
                <div key={safeAddress}>
                  <Link href={`/safe/${chain?.shortName}-${safeAddress}`} className="underline">
                    {safeAddress}
                  </Link>
                </div>
              ))}
            </div>
            {/* <Table aria-label="Safe contraacts">
              <TableHeader>
                <TableColumn>ADDRESS</TableColumn>
                <TableColumn>ROLE</TableColumn>
                <TableColumn>STATUS</TableColumn>
              </TableHeader>
              <TableBody>
                {safes.map((safe) => (
                  <SafeTableRow key={safe} safeAddress={safe} chainId={chainId} />
                ))}
              </TableBody>
            </Table> */}
          </>
        ) : (
          <>
            Welcome to Kandinsky. <Button onPress={loginWeb3Auth}>Connect your wallet to get started</Button>
          </>
        )}
      </div>

      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left">
        <a
          href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Docs{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Find in-depth information about Next.js features and API.
          </p>
        </a>

        <a
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Learn{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Learn about Next.js in an interactive course with&nbsp;quizzes!
          </p>
        </a>

        <a
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Templates{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>Explore starter templates for Next.js.</p>
        </a>

        <a
          href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Deploy{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Instantly deploy your Next.js site to a shareable URL with Vercel.
          </p>
        </a>
      </div>

      {createSafeModalOpen && (
        <CreateSafeModal
          chainId={chainId}
          web3Provider={web3Provider!}
          ownerAddress={ownerAddress!}
          onClose={() => setCreateSafeModalOpen(false)}
        />
      )}
    </main>
  )
}
