'use client'

import chains from '@/app/chains/chains'
import NavBar from '@/app/components/NavBar'
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

  const handleAddRule = async () => {
    setCurrentMessage('')
    setSendMessageLoading(true)
    const newMessage: OpenAI.Chat.ChatCompletionMessageParam = { content: currentMessage, role: 'user' }
    setMessages([...messages, newMessage])
    try {
      const result: OpenAI.Chat.ChatCompletion = await sendMessage([...messages, newMessage])
      let aiMessage = result.choices[0].message
      const parsedJson = JSON.parse(JSON.stringify(aiMessage))
      setPluginJson(parsedJson)
      setMessages([...messages, newMessage, aiMessage])
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
