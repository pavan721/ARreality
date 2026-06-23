import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Provider = 'openai' | 'anthropic' | 'gemini'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

interface AppState {
  // API Keys
  openaiKey: string
  anthropicKey: string
  geminiKey: string
  setOpenaiKey: (key: string) => void
  setAnthropicKey: (key: string) => void
  setGeminiKey: (key: string) => void

  // Provider
  selectedProvider: Provider
  setSelectedProvider: (provider: Provider) => void

  // Chat
  messages: Message[]
  addMessage: (message: Message) => void
  clearMessages: () => void

  // Settings Panel
  isSettingsOpen: boolean
  setSettingsOpen: (isOpen: boolean) => void

  // Status
  isSpeaking: boolean
  setIsSpeaking: (isSpeaking: boolean) => void
  isProcessing: boolean
  setIsProcessing: (isProcessing: boolean) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // API Keys
      openaiKey: '',
      anthropicKey: '',
      geminiKey: '',
      setOpenaiKey: (key) => set({ openaiKey: key }),
      setAnthropicKey: (key) => set({ anthropicKey: key }),
      setGeminiKey: (key) => set({ geminiKey: key }),

      // Provider
      selectedProvider: 'openai',
      setSelectedProvider: (provider) => set({ selectedProvider: provider }),

      // Chat
      messages: [],
      addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
      clearMessages: () => set({ messages: [] }),

      // Settings Panel
      isSettingsOpen: false,
      setSettingsOpen: (isOpen) => set({ isSettingsOpen: isOpen }),

      // Status
      isSpeaking: false,
      setIsSpeaking: (isSpeaking) => set({ isSpeaking }),
      isProcessing: false,
      setIsProcessing: (isProcessing) => set({ isProcessing }),
    }),
    {
      name: 'jarvis-storage',
      // We don't want to persist UI state like isSettingsOpen, isSpeaking, or isProcessing
      partialize: (state) => ({
        openaiKey: state.openaiKey,
        anthropicKey: state.anthropicKey,
        geminiKey: state.geminiKey,
        selectedProvider: state.selectedProvider,
        messages: state.messages,
      }),
    }
  )
)
