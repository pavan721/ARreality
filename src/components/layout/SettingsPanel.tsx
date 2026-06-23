'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, X, Key, Cpu, Save } from 'lucide-react'
import { useAppStore, Provider } from '@/store/useAppStore'

export function SettingsPanel() {
  const {
    isSettingsOpen,
    setSettingsOpen,
    openaiKey,
    anthropicKey,
    geminiKey,
    setOpenaiKey,
    setAnthropicKey,
    setGeminiKey,
    selectedProvider,
    setSelectedProvider
  } = useAppStore()

  return (
    <AnimatePresence>
      {isSettingsOpen && (
        <motion.div
          initial={{ opacity: 0, x: -300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -300 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed left-0 top-0 bottom-0 w-80 bg-black/80 backdrop-blur-md border-r border-cyan-500/30 p-6 z-50 flex flex-col shadow-[0_0_30px_rgba(0,255,255,0.1)]"
        >
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-cyan-500/30">
            <h2 className="text-xl font-bold text-cyan-400 flex items-center gap-2 uppercase tracking-widest text-shadow-glow">
              <Settings className="w-5 h-5" /> SYSTEM CONFIG
            </h2>
            <button
              onClick={() => setSettingsOpen(false)}
              className="text-cyan-600 hover:text-cyan-400 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {/* Provider Selection */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-cyan-600 uppercase tracking-wider flex items-center gap-2">
                <Cpu className="w-4 h-4" /> Neural Network Provider
              </label>
              <div className="grid grid-cols-1 gap-2">
                {(['openai', 'anthropic', 'gemini'] as Provider[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setSelectedProvider(p)}
                    className={`px-4 py-2 text-sm uppercase tracking-wider border rounded transition-all duration-300 ${
                      selectedProvider === p
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(0,255,255,0.3)]'
                        : 'bg-black/50 border-cyan-900/50 text-cyan-700 hover:border-cyan-700'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* API Keys */}
            <div className="space-y-4 pt-4 border-t border-cyan-500/20">
              <label className="text-xs font-semibold text-cyan-600 uppercase tracking-wider flex items-center gap-2">
                <Key className="w-4 h-4" /> Security Clearance Keys
              </label>

              <div className="space-y-2">
                <label className="text-xs text-cyan-500 uppercase">OpenAI Key</label>
                <input
                  type="password"
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full bg-black/50 border border-cyan-900 rounded px-3 py-2 text-cyan-300 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-mono text-sm placeholder:text-cyan-900"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-cyan-500 uppercase">Anthropic Key</label>
                <input
                  type="password"
                  value={anthropicKey}
                  onChange={(e) => setAnthropicKey(e.target.value)}
                  placeholder="sk-ant-..."
                  className="w-full bg-black/50 border border-cyan-900 rounded px-3 py-2 text-cyan-300 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-mono text-sm placeholder:text-cyan-900"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-cyan-500 uppercase">Gemini Key</label>
                <input
                  type="password"
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder="AIza..."
                  className="w-full bg-black/50 border border-cyan-900 rounded px-3 py-2 text-cyan-300 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-mono text-sm placeholder:text-cyan-900"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-cyan-500/30 mt-auto">
            <button
              onClick={() => setSettingsOpen(false)}
              className="w-full flex items-center justify-center gap-2 bg-cyan-900/30 border border-cyan-500 text-cyan-300 px-4 py-2 rounded uppercase tracking-widest hover:bg-cyan-500/20 transition-all hover:shadow-[0_0_15px_rgba(0,255,255,0.4)]"
            >
              <Save className="w-4 h-4" /> Save Configuration
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
