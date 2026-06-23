import { streamText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { createGoogleGenerativeAI } from '@ai-sdk/google'

export const maxDuration = 30

export async function POST(req: Request) {
  const { messages, provider, keys } = await req.json()

  let model;

  try {
    if (provider === 'openai') {
      if (!keys.openai) {
        return new Response(JSON.stringify({ error: 'OpenAI API key is missing' }), { status: 400 })
      }
      const openai = createOpenAI({
        apiKey: keys.openai,
      })
      model = openai('gpt-4o') // Or gpt-3.5-turbo if prefered
    } else if (provider === 'anthropic') {
      if (!keys.anthropic) {
        return new Response(JSON.stringify({ error: 'Anthropic API key is missing' }), { status: 400 })
      }
      const anthropic = createAnthropic({
        apiKey: keys.anthropic,
      })
      model = anthropic('claude-3-5-sonnet-20240620')
    } else if (provider === 'gemini') {
      if (!keys.gemini) {
        return new Response(JSON.stringify({ error: 'Gemini API key is missing' }), { status: 400 })
      }
      const google = createGoogleGenerativeAI({
        apiKey: keys.gemini,
      })
      model = google('models/gemini-1.5-pro-latest')
    } else {
      return new Response(JSON.stringify({ error: 'Invalid provider selected' }), { status: 400 })
    }

    const result = await streamText({
      model,
      system: 'You are Jarvis, a highly advanced artificial intelligence created by Tony Stark. You are helpful, precise, slightly sarcastic but deeply loyal, and you communicate with concise and analytical language. You exist within a cutting-edge futuristic holographic interface.',
      messages,
    })

    return (result as any).toDataStreamResponse ? (result as any).toDataStreamResponse() : (result as any).toTextStreamResponse()
  } catch (error: any) {
    console.error('API Error:', error)
    return new Response(JSON.stringify({ error: error.message || 'An error occurred' }), { status: 500 })
  }
}
