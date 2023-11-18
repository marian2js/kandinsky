'use server'

import OpenAI from 'openai'

export default async function sendMessage(messages: OpenAI.Chat.ChatCompletionMessageParam[]) {
  console.debug(`sendMessage: ${messages[messages.length - 1].content}`)
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })

  const prompt = `You are a helpful assistant that helps the user setup plugins for their Safe Smart Wallet.
You must return a json object with the following type:

type Response = ResponseWithPlugin | ResponseWithFollowUp
interface ResponseWithPlugin {
  plugin: "socialRecovery" | "deadManSwitch"
  parameters: SocialRecoveryProps | DeadManSwitchProps
}
interface ResponseWithFollowUp {
  followUp: string
}
interface SocialRecoveryProps {
  friends: address[]
  threshold: number // defaults to number of friends
}
interface DeadManSwitchProps {
  heir: address
  timeToSwitch: number // in seconds
}

Your response must always be a JSON object with the Response type.
If you need to ask follow up questions to complete the parameters, respond with the ResponseWithFollowUp type. The followUp string will be sent to the user as a message.
If you have all the information you need, respond with the ResponseWithPlugin type. The plugin string must be either "socialRecovery" or "deadManSwitch". The parameters must be a JSON object with the SocialRecoveryProps or DeadManSwitchProps type.
  `.trim()

  const params: OpenAI.Chat.ChatCompletionCreateParams = {
    messages: [{ role: 'system', content: prompt }, ...messages],
    model: 'gpt-3.5-turbo',
  }
  let chatCompletion: OpenAI.Chat.ChatCompletion = await openai.chat.completions.create(params)
  const aiMessage = chatCompletion.choices[0].message
  if (!aiMessage.content?.trim()?.startsWith('{')) {
    console.debug(`response was not a json, retrying...`)
    const params: OpenAI.Chat.ChatCompletionCreateParams = {
      messages: [
        { role: 'system', content: prompt },
        ...messages,
        aiMessage,
        { role: 'user', content: 'You must return a JSON following the Response type.' },
      ],
      model: 'gpt-3.5-turbo',
    }
    chatCompletion = await openai.chat.completions.create(params)
  }
  return chatCompletion
}
