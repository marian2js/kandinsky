import { useEffect, useState } from 'react'
import { getSafeSdk } from '../contracts/plugin.contract'
import { useAccountAbstraction } from '../store/accountAbstractionContext'

export default function useGetEnabledPlugins(safeAddress: string) {
  const { web3Provider } = useAccountAbstraction()
  const [plugins, setPlugins] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      if (web3Provider) {
        const safeSdk = await getSafeSdk(web3Provider, safeAddress)
        const modules = await safeSdk.getModules()
        setPlugins(modules)
        setLoading(false)
      }
    }

    run()
  }, [safeAddress, web3Provider])

  return {
    plugins,
    loading,
  }
}
