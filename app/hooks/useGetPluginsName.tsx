import { useEffect, useState } from 'react'
import { useAccountAbstraction } from '../store/accountAbstractionContext'
import { getContractName } from '../utils/getContractName'

export default function useGetPluginsName(pluginAddresses: string[]) {
  const { web3Provider } = useAccountAbstraction()
  const [names, setNames] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      if (web3Provider && pluginAddresses.length) {
        let names = []
        for (const pluginAddress of pluginAddresses) {
          const name = await getContractName(pluginAddress, web3Provider)
          names.push(name)
        }
        setNames(names)
        setLoading(false)
      }
    }

    run()
  }, [web3Provider, pluginAddresses])

  return {
    names,
    loading,
  }
}
