type Chain = {
  id: string
  token: string
  rpcUrl: string
  shortName: string
  label: string
  color?: string
  icon?: string
  blockExplorerUrl: string
  transactionServiceUrl?: string
  isStripePaymentsEnabled: boolean // only available in Mumbai chain
  faucetUrl?: string
  managerAddress?: string
  recoveryPluginAddress?: string
}

export default Chain
