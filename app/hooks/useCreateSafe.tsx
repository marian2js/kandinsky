import Safe, { EthersAdapter, SafeAccountConfig, SafeFactory } from '@safe-global/protocol-kit'
import { ethers } from 'ethers'
import { useCallback } from 'react'

export default function useCreateSafe() {
  const createSafe = useCallback(
    async ({
      web3Provider,
      ownerAddress,
    }: {
      web3Provider: ethers.providers.Web3Provider | undefined
      ownerAddress: string | undefined
    }) => {
      if (!web3Provider || !ownerAddress) {
        return
      }
      // const provider = new ethers.providers.Web3Provider(web3Provider)
      const safeOwner = web3Provider.getSigner(0)
      console.log('safeOwner:', safeOwner)

      const ethAdapter = new EthersAdapter({
        ethers,
        signerOrProvider: safeOwner,
      })

      console.log('ethAdapter:', ethAdapter)

      const safeFactory = await SafeFactory.create({ ethAdapter })

      console.log('safeFactory:', safeFactory)

      const owners = [ownerAddress]
      const threshold = 1
      const safeAccountConfig: SafeAccountConfig = {
        owners,
        threshold,
      }

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
