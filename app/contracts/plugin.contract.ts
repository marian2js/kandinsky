import Safe, { EthersAdapter } from '@safe-global/protocol-kit'
import { ethers } from 'ethers'
import Chain from '../models/chain'

export const enablePlugin = async (
  web3Provider: ethers.providers.Web3Provider,
  safeAddress: string,
  plugin: string,
) => {
  const safeOwner = web3Provider.getSigner(0)
  const ethAdapter = new EthersAdapter({
    ethers,
    signerOrProvider: safeOwner,
  })
  const safeSdk = await Safe.create({ ethAdapter, safeAddress })

  // if not enabled, enable it
  if (!(await safeSdk.isModuleEnabled(plugin))) {
    const tx = await safeSdk.createEnableModuleTx(plugin)
    const txHash = await safeSdk.getTransactionHash(tx)
    const approveTxResponse = await safeSdk.approveTransactionHash(txHash)
    await approveTxResponse.transactionResponse?.wait()

    const executeTxResponse = await safeSdk.executeTransaction(tx)
    await executeTxResponse.transactionResponse?.wait()
  }
}
