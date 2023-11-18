import { Button } from '@nextui-org/react'
import Image from 'next/image'
import Link from 'next/link'
import { useAccountAbstraction } from '../store/accountAbstractionContext'

export default function NavBar() {
  const { loginWeb3Auth, isAuthenticated, ownerAddress, logoutWeb3Auth } = useAccountAbstraction()

  return (
    <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
      <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
        <Link href="/">
          <Image src="/logo.svg" alt="Kandinsky Logo" width="200" height="35" />
        </Link>
      </p>
      <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
        {isAuthenticated ? (
          <>
            <Button variant="light">{ownerAddress}</Button>
            <Button variant="light" onPress={logoutWeb3Auth}>
              Disconnect
            </Button>
          </>
        ) : (
          <Button color="primary" onPress={loginWeb3Auth}>
            Connect
          </Button>
        )}
      </div>
    </div>
  )
}
