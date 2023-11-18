import Safe, { EthersAdapter, SafeAccountConfig, SafeFactory } from '@safe-global/protocol-kit'
import { ethers } from 'ethers'
import { useCallback } from 'react'

export default function useCreateSafe() {
  const createSafe = useCallback(
    async ({
      web3Provider,
      ownerAddress,
      owners,
      threshold,
    }: {
      web3Provider: ethers.providers.Web3Provider | undefined
      ownerAddress: string | undefined
      owners: string[]
      threshold: number
    }) => {
      if (!web3Provider || !ownerAddress) {
        return
      }
      const safeOwner = web3Provider.getSigner(0)
      const ethAdapter = new EthersAdapter({
        ethers,
        signerOrProvider: safeOwner,
      })
      const safeFactory = await SafeFactory.create({ ethAdapter })
      const safeAccountConfig: SafeAccountConfig = {
        owners,
        threshold,
      }
      console.log('safeAccountConfig:', safeAccountConfig)

      const safeSdk: Safe = await safeFactory.deploySafe({ safeAccountConfig })
      const newSafeAddress = await safeSdk.getAddress()

      console.log('newSafeAddress:', newSafeAddress)
      return newSafeAddress
    },
    [],
  )

  return {
    createSafe,
  }
}
