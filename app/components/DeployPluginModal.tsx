import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@nextui-org/react'
import { DeadManSwitchProps, ResponseWithPlugin, SocialRecoveryProps } from '../models/plugins'
import camelCaseToWord from '../utils/camelCaseToWord'

interface Props {
  data: ResponseWithPlugin
  onClose: () => void
}

export default function DeployPluginModal({ data, onClose }: Props) {
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
        <ModalBody>{getPluginData()}</ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            Close
          </Button>
          <Button color="primary" onPress={onClose}>
            Deploy
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
