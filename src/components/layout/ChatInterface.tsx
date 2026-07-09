'use client'

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useChat } from '@ai-sdk/react'
import { Send, Mic, Settings as SettingsIcon, Terminal, Volume2, VolumeX } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'

// A small custom hook for Speech Synthesis
function useSpeechSynthesis() {
  const [isMuted, setIsMuted] = useState(false)
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : null
  const { setIsSpeaking } = useAppStore()
  const cachedVoiceRef = useRef<SpeechSynthesisVoice | null>(null)

  const speak = (text: string) => {
    if (isMuted || !synth) return

    // Stop currently speaking
    synth.cancel()

    const utterance = new SpeechSynthesisUtterance(text)

    if (!cachedVoiceRef.current) {
      // Try to find an English robotic/male voice, fallback to any available english voice
      const voices = synth.getVoices()
      let preferredVoice = voices.find(v => v.name.includes('Google UK English Male') || v.name.includes('Daniel') || v.name.includes('Male') || v.name.toLowerCase().includes('jarvis'))

      if (!preferredVoice) {
          preferredVoice = voices.find(v => v.lang.startsWith('en'))
      }

      if (preferredVoice) {
        cachedVoiceRef.current = preferredVoice
      }
    }

    if (cachedVoiceRef.current) {
      utterance.voice = cachedVoiceRef.current
    }

    utterance.pitch = 0.8 // Slightly deeper
    utterance.rate = 1.1  // Slightly faster, crisp

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    synth.speak(utterance)
  }

  return { speak, isMuted, setIsMuted, cancel: () => synth?.cancel() }
}

export function ChatInterface() {
  const {
    messages: storedMessages,
    addMessage,
    clearMessages,
    setSettingsOpen,
    openaiKey,
    anthropicKey,
    geminiKey,
    selectedProvider,
    setIsProcessing
  } = useAppStore()

  const { speak, isMuted, setIsMuted, cancel } = useSpeechSynthesis()

  // Speech Recognition State
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<any>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const keys = { openai: openaiKey, anthropic: anthropicKey, gemini: geminiKey }

  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages, setInput, error } = useChat({
    api: '/api/chat',
    body: { provider: selectedProvider, keys },
    initialMessages: storedMessages,
    onFinish: (message) => {
      addMessage(message as any)
      speak(message.content)
    },
    onError: (err) => {
      speak("Error encountered. Check system configuration.")
      setIsProcessing(false)
    }
  })

  // Sync state back to Zustand for processing visual
  useEffect(() => {
    setIsProcessing(isLoading)
  }, [isLoading, setIsProcessing])

  // Sync initial messages if changed in store (like clearing)
  useEffect(() => {
    if (storedMessages.length === 0 && messages.length > 0) {
      setMessages([])
    }
  }, [storedMessages, messages.length, setMessages])

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Custom handle submit to also save user message to store
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim()) return

    // Cancel any ongoing speech
    cancel()

    // Add user message to local store immediately (AI message added onFinish)
    addMessage({ id: Date.now().toString(), role: 'user', content: input })
    handleSubmit(e)
  }

  // Setup Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setInput(transcript)
        setIsListening(false)
        // Auto submit could be tricky, but let's let the user hit send for safety
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error)
        setIsListening(false)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }
  }, [setInput])

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop()
    } else {
      cancel() // stop talking when user wants to talk
      recognitionRef.current?.start()
      setIsListening(true)
    }
  }

  return (
    <div className="absolute inset-0 z-10 flex flex-col pointer-events-none">
      {/* Header Bar */}
      <div className="flex justify-between items-center p-6 pointer-events-auto">
        <div className="flex items-center gap-3 text-cyan-400 font-bold uppercase tracking-[0.3em] text-xl text-shadow-glow">
          <Terminal className="w-6 h-6" /> J.A.R.V.I.S.
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 bg-black/40 border border-cyan-500/50 rounded-full text-cyan-400 hover:bg-cyan-900/40 hover:border-cyan-400 transition-all shadow-[0_0_10px_rgba(0,255,255,0.1)] hover:shadow-[0_0_15px_rgba(0,255,255,0.4)]"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setSettingsOpen(true)}
            className="p-2 bg-black/40 border border-cyan-500/50 rounded-full text-cyan-400 hover:bg-cyan-900/40 hover:border-cyan-400 transition-all shadow-[0_0_10px_rgba(0,255,255,0.1)] hover:shadow-[0_0_15px_rgba(0,255,255,0.4)]"
          >
            <SettingsIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content Area - Invisible middle to let hologram show */}
      <div className="flex-1 overflow-hidden relative flex flex-col justify-end p-6">

        {/* Messages List */}
        <div className="max-h-[60%] overflow-y-auto mb-6 pr-4 pointer-events-auto custom-scrollbar flex flex-col gap-4">
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-3 border ${
                  m.role === 'user'
                    ? 'bg-orange-900/20 border-orange-500/30 text-orange-100 shadow-[0_0_15px_rgba(255,165,0,0.1)]'
                    : 'bg-cyan-950/40 border-cyan-500/30 text-cyan-100 shadow-[0_0_15px_rgba(0,255,255,0.1)]'
                }`}
              >
                <div className={`text-[10px] uppercase tracking-widest mb-1 opacity-60 font-semibold ${m.role === 'user' ? 'text-orange-400' : 'text-cyan-400'}`}>
                  {m.role === 'user' ? 'User_Command' : 'System_Response'}
                </div>
                <div className="text-sm leading-relaxed whitespace-pre-wrap font-mono">
                  {m.content}
                </div>
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
               <div className="bg-cyan-950/40 border border-cyan-500/30 rounded-lg px-4 py-3 text-cyan-400 font-mono text-sm uppercase tracking-widest flex items-center gap-2">
                 <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                 Processing...
               </div>
            </motion.div>
          )}
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center">
              <div className="bg-red-950/40 border border-red-500/50 rounded-lg px-4 py-3 text-red-400 font-mono text-xs uppercase tracking-widest text-center shadow-[0_0_15px_rgba(255,0,0,0.2)]">
                [ SYSTEM ERROR ]<br/>
                {error.message || "Failed to establish neural link. Verify API keys in settings."}
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="w-full max-w-4xl mx-auto pointer-events-auto">
          <form onSubmit={onSubmit} className="relative flex items-center group">
            {/* Sci-fi decorative elements */}
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-600 to-orange-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>

            <div className="relative flex w-full bg-black/60 backdrop-blur-md border border-cyan-500/50 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(0,255,255,0.15)]">

              {/* Mic Button */}
              <button
                type="button"
                onClick={toggleListening}
                className={`p-4 border-r border-cyan-500/30 transition-colors ${
                  isListening ? 'text-orange-500 bg-orange-950/30' : 'text-cyan-500 hover:bg-cyan-950/30 hover:text-cyan-300'
                }`}
              >
                <Mic className={`w-5 h-5 ${isListening ? 'animate-pulse' : ''}`} />
              </button>

              <input
                value={input}
                onChange={handleInputChange}
                placeholder="Awaiting command..."
                className="flex-1 bg-transparent px-4 py-4 text-cyan-100 placeholder:text-cyan-800 focus:outline-none font-mono text-sm"
              />

              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="p-4 border-l border-cyan-500/30 text-cyan-500 hover:bg-cyan-950/30 hover:text-cyan-300 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>

          {/* Quick Clear Command */}
          <div className="mt-2 text-center">
            <button
              onClick={clearMessages}
              className="text-[10px] text-cyan-800 hover:text-cyan-500 uppercase tracking-widest font-mono transition-colors"
            >
              [ Clear Session Log ]
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
