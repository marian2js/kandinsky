import protocolDeployments from '@safe-global/safe-core-protocol'
import { ethers } from 'ethers'

export const getManager = async (provider: ethers.providers.Web3Provider, chainId: string) => {
  const registryInfo = protocolDeployments[5][0].contracts.TestSafeProtocolManager
  return new ethers.Contract(registryInfo.address, registryInfo.abi, provider)
}
