import Safe, { EthersAdapter } from '@safe-global/protocol-kit'
import { ethers } from 'ethers'
import MANAGER_ABI from '../abis/manager.json'
import RECOVERY_ABI from '../abis/recovery-plugin.json'
import Chain from '../models/chain'

export interface PluginMetadata {
  name: string
  version: string
  requiresRootAccess: boolean
  iconUrl: string
  appUrl: string
}

export const getSafeSdk = async (web3Provider: ethers.providers.Web3Provider, safeAddress: string) => {
  const safeOwner = web3Provider.getSigner(0)
  const ethAdapter = new EthersAdapter({
    ethers,
    signerOrProvider: safeOwner,
  })
  const safeSdk = await Safe.create({ ethAdapter, safeAddress })
  return safeSdk
}

export const enablePlugin = async (
  chain: Chain,
  web3Provider: ethers.providers.Web3Provider,
  safeAddress: string,
  plugin: string,
) => {
  const safeSdk = await getSafeSdk(web3Provider, safeAddress)

  // if not enabled, enable it
  if (!(await safeSdk.isModuleEnabled(chain.managerAddress!))) {
    const tx = await safeSdk.createEnableModuleTx(chain.managerAddress!)
    const txHash = await safeSdk.getTransactionHash(tx)
    const approveTxResponse = await safeSdk.approveTransactionHash(txHash)
    await approveTxResponse.transactionResponse?.wait()
    const executeTxResponse = await safeSdk.executeTransaction(tx)
    await executeTxResponse.transactionResponse?.wait()
  }

  if (!(await isPluginEnabled(plugin, web3Provider, chain, safeAddress))) {
    const manager = await getManager(web3Provider, chain)
    const enablePluginTxData = {
      to: chain.managerAddress!,
      value: '0',
      data: (await manager.populateTransaction.enablePlugin(plugin, true)).data!,
    }

    // Create and approve the transaction for enabling the plugin
    const enablePluginTx = await safeSdk.createTransaction({ safeTransactionData: enablePluginTxData })
    const enablePluginTxHash = await safeSdk.getTransactionHash(enablePluginTx)
    const approvePluginTxResponse = await safeSdk.approveTransactionHash(enablePluginTxHash)
    await approvePluginTxResponse.transactionResponse?.wait()

    // Execute the transaction
    const executePluginTxResponse = await safeSdk.executeTransaction(enablePluginTx)
    await executePluginTxResponse.transactionResponse?.wait()
  }
}

export const getManager = async (web3Provider: ethers.providers.Web3Provider, chain: Chain) => {
  const signer = web3Provider.getSigner()
  return new ethers.Contract(chain.managerAddress!, MANAGER_ABI, signer)
}

export const getRecoveryPlugin = async (web3Provider: ethers.providers.Web3Provider, chain: Chain) => {
  const signer = web3Provider.getSigner()
  return new ethers.Contract(chain.recoveryPluginAddress!, RECOVERY_ABI, signer)
}

export const isPluginEnabled = async (
  plugin: string,
  web3Provider: ethers.providers.Web3Provider,
  chain: Chain,
  safeAddress: string,
) => {
  const manager = await getManager(web3Provider, chain)
  const pluginInfo = await manager.enabledPlugins(safeAddress, plugin)
  return pluginInfo.nextPluginPointer !== '0x0000000000000000000000000000000000000000'
}
