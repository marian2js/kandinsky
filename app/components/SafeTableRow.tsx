import { TableCell, TableRow } from '@nextui-org/react'
import { useCallback, useState } from 'react'
import useApi from '../hooks/useApi'
import usePolling from '../hooks/usePolling'
import { useAccountAbstraction } from '../store/accountAbstractionContext'
import getSafeInfo from '../utils/getSafeInfo'
import isContractAddress from '../utils/isContractAddress'

interface Props {
  safeAddress: string
  chainId: string
}

export default function SafeInfo({ safeAddress, chainId }: Props) {
  const { web3Provider, chain, safeBalance } = useAccountAbstraction()

  const [isDeployed, setIsDeployed] = useState<boolean>(false)
  const [isDeployLoading, setIsDeployLoading] = useState<boolean>(true)

  const detectSafeIsDeployed = useCallback(async () => {
    const isDeployed = await isContractAddress(safeAddress, web3Provider)

    setIsDeployed(isDeployed)
    setIsDeployLoading(false)
  }, [web3Provider, safeAddress])

  usePolling(detectSafeIsDeployed)

  const fetchInfo = useCallback(
    (signal: AbortSignal) => getSafeInfo(safeAddress, chainId, { signal }),
    [safeAddress, chainId],
  )

  const { data: safeInfo, isLoading: isGetSafeInfoLoading } = useApi(fetchInfo)

  const owners = safeInfo?.owners.length || 1
  const threshold = safeInfo?.threshold || 1
  const isLoading = isDeployLoading || isGetSafeInfoLoading

  return (
    <TableRow key="1">
      <TableCell>{safeAddress}</TableCell>
      <TableCell>CEO</TableCell>
      <TableCell>Active</TableCell>
    </TableRow>
  )
}
