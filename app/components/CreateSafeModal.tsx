import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Textarea } from '@nextui-org/react'
import { ethers } from 'ethers'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import useCreateSafe from '../hooks/useCreateSafe'
import getChain from '../utils/getChain'

interface Props {
  chainId: string
  web3Provider: ethers.providers.Web3Provider
  ownerAddress: string
  onClose: () => void
}

export default function CreateSafeModal({ chainId, web3Provider, ownerAddress, onClose }: Props) {
  const [owners, setOwners] = useState<string>(`${ownerAddress}\n`)
  const [threshold, setThreshold] = useState<string>('1')
  const { createSafe } = useCreateSafe()
  const [createLoading, setCreateLoading] = useState(false)
  const router = useRouter()

  const chain = useMemo(() => getChain(chainId), [chainId])

  const handleCreateSafe = async () => {
    setCreateLoading(true)
    try {
      const newSafeAddress = await createSafe({
        web3Provider,
        ownerAddress,
        owners: owners.trim().split('\n'),
        threshold: Number(threshold),
      })
      router.push(`/safe/${chain?.shortName}-${newSafeAddress}`)
    } catch (e) {
      console.log('error creating safe:', (e as Error).message)
    } finally {
      setCreateLoading(false)
    }
  }

  return (
    <Modal isOpen onOpenChange={() => onClose()}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">Deploy Safe</ModalHeader>
        <ModalBody>
          <div>
            <Textarea
              isRequired
              label="Owners"
              labelPlacement="outside"
              placeholder="Set a list of owners one per line"
              value={owners}
              onValueChange={(value) => setOwners(value)}
            />
          </div>
          <div className="mt-4">
            <Input
              type="number"
              label="Multisig threshold"
              value={threshold}
              onValueChange={(value) => setThreshold(value)}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            Close
          </Button>
          <Button color="primary" onPress={handleCreateSafe} isLoading={createLoading}>
            Create Safe
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
