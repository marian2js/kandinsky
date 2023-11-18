'use client'

import chains from '@/app/chains/chains'
import NavBar from '@/app/components/NavBar'
import { DeadManSwitchProps, ResponseWithPlugin, SocialRecoveryProps } from '@/app/models/plugins'
import sendMessage from '@/app/utils/sendMessage'
import { Button, Textarea } from '@nextui-org/react'
import OpenAI from 'openai'
import { useState } from 'react'

export default function SafePage({ params }: { params: { id: string } }) {
  const safeAddress = params.id.split('-')[1]
  const chainShortName = params.id.split('-')[0]
  const chain = chains.find((chain) => chain.shortName === chainShortName)
  const [currentMessage, setCurrentMessage] = useState('')
  const [messages, setMessages] = useState<OpenAI.Chat.ChatCompletionMessageParam[]>([])
  const [sendMessageLoading, setSendMessageLoading] = useState(false)
  const [pluginJson, setPluginJson] = useState<any>({})
  const [error, setError] = useState<string | null>(null)

  const validatePluginJson = (data: ResponseWithPlugin) => {
    switch (data.plugin) {
      case 'socialRecovery':
        const socialRecoveryData = data.parameters as SocialRecoveryProps
        if (!Array.isArray(socialRecoveryData.contacts) || !socialRecoveryData.contacts.length) {
          throw new Error(
            `Please provide a list of contacts' addresses that you would like to assign as your recovery contacts.`,
          )
        }
        break
      case 'deadManSwitch':
        const deadManSwitchData = data.parameters as DeadManSwitchProps
        if (!deadManSwitchData.heir) {
          throw new Error(`Please provide an address for your heir.`)
        }
        if (!deadManSwitchData.timeToSwitch) {
          throw new Error(`Please provide a time to switch.`)
        }
        break
      default:
        throw new Error('I could not undertand your request, please try again.')
    }
  }

  const handleAddRule = async () => {
    setCurrentMessage('')
    setSendMessageLoading(true)
    const newMessage: OpenAI.Chat.ChatCompletionMessageParam = { content: currentMessage, role: 'user' }
    setMessages([...messages, newMessage])
    try {
      const result: OpenAI.Chat.ChatCompletion = await sendMessage([...messages, newMessage])
      let aiMessage = result.choices[0].message
      if (!aiMessage.content) {
        setError('Invalid response, please try again.')
        setSendMessageLoading(false)
        return
      }
      const parsedJson = JSON.parse(aiMessage.content)
      console.log('parsedJson:', parsedJson, parsedJson.followUp)
      if (parsedJson.followUp) {
        setMessages([...messages, newMessage, aiMessage])
      } else {
        try {
          validatePluginJson(parsedJson)
          setPluginJson(parsedJson)
        } catch (e) {
          aiMessage.content = `{ followUp: "${(e as Error).message}" }`
        }
      }
      setSendMessageLoading(false)
    } catch (e) {
      console.log(e)
      setError((e as Error).message)
      setSendMessageLoading(false)
    }
  }

  const getMessageClasses = (role: string) => {
    return role === 'user'
      ? 'bg-blue-700 text-white text-right p-3 rounded-md m-1'
      : 'bg-gray-600 text-gray-200 text-left p-3 rounded-md m-1'
  }

  const getMessageContent = (message: OpenAI.Chat.ChatCompletionMessageParam) => {
    const content = message.content?.toString()?.trim() ?? ''
    if (content.startsWith('{')) {
      const parsed = JSON.parse(content)
      return parsed.followUp
    }
    return content
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div>
        <NavBar />
        {error && <div className="mt-8 text-red-500">Something bad happened: {error}</div>}
        <div className="mt-8 text-center">
          Smart Wallet: <a href={`https://app.safe.global/home?safe=${chainShortName}:${safeAddress}`}>{safeAddress}</a>
        </div>
        <div className="mt-8">
          <div className="mt-2">
            {messages.map((message, index) => (
              <div key={index} className={`message ${getMessageClasses(message.role)}`}>
                {getMessageContent(message)}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-20 w-full">
        <div>
          <Textarea
            isRequired
            label="What rules do you want your account to have?"
            labelPlacement="outside"
            placeholder="Describe the rules"
            className="w-full"
            value={currentMessage}
            onValueChange={(value) => setCurrentMessage(value)}
          />
        </div>
        <div className="mt-2">
          <Button color="primary" onPress={handleAddRule} isLoading={sendMessageLoading}>
            Add Rule
          </Button>
        </div>
      </div>
    </main>
  )
}
