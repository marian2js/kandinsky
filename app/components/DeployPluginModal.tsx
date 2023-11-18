import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@nextui-org/react'
import { useMemo, useState } from 'react'
import { enablePlugin } from '../contracts/plugin.contract'
import { DeadManSwitchProps, ResponseWithPlugin, SocialRecoveryProps } from '../models/plugins'
import { useAccountAbstraction } from '../store/accountAbstractionContext'
import camelCaseToWord from '../utils/camelCaseToWord'
import getChain from '../utils/getChain'

interface Props {
  data: ResponseWithPlugin
  safeAddress: string
  onClose: () => void
}

export default function DeployPluginModal({ data, safeAddress, onClose }: Props) {
  const { web3Provider, loginWeb3Auth, isAuthenticated, ownerAddress, safes, chainId } = useAccountAbstraction()
  const [deployLoading, setDeployLoading] = useState(false)
  const [deployError, setDeployError] = useState<string | null>(null)

  const chain = useMemo(() => getChain(chainId), [chainId])

  const handleDeploy = async () => {
    try {
      setDeployLoading(true)
      await enablePlugin(web3Provider!, safeAddress, '0x2b18E7246d213676a0b9741fE860c7cC05D75cE2')
    } catch (e) {
      setDeployError((e as Error).message)
    } finally {
      setDeployLoading(false)
    }
  }

  const getPluginData = () => {
    switch (data.plugin) {
      case 'socialRecovery':
        const socialRecoveryData = data.parameters as SocialRecoveryProps
        return (
          <>
            <p>
              <strong>Contacts:</strong>
            </p>
            {socialRecoveryData.contacts.map((contact) => (
              <p key={contact}>{contact}</p>
            ))}
            <p>
              <strong>Min contacts</strong>: {socialRecoveryData.minContacts ?? socialRecoveryData.contacts.length}
            </p>
          </>
        )
      case 'deadManSwitch':
        const deadManSwitchData = data.parameters as DeadManSwitchProps
        return (
          <>
            <p>
              <strong>Heir</strong>: {deadManSwitchData.heir}
            </p>
            <p>
              <strong>Time to Switch</strong>: {deadManSwitchData.timeToSwitch}
            </p>
          </>
        )
      default:
        return <></>
    }
  }

  return (
    <Modal isOpen onOpenChange={() => onClose()}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">{camelCaseToWord(data.plugin)}</ModalHeader>
        <ModalBody>
          {deployError && <p className="text-red-500">{deployError}</p>}
          {getPluginData()}
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            Close
          </Button>
          <Button color="primary" onPress={handleDeploy} isLoading={deployLoading}>
            Deploy
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
