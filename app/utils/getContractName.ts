import { ethers } from 'ethers'

export async function getContractName(pluginAddress: string, web3Provider: ethers.providers.Web3Provider) {
  const nameABI = ['function NAME() view returns (string)']
  const contract = new ethers.Contract(pluginAddress, nameABI, web3Provider)
  const name = await contract.NAME()
  return name
}
