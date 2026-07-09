'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Activity, Cpu, Database, HardDrive, Zap } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'

export function HudPanel() {
  const { messages } = useAppStore()
  const [memoryUsage, setMemoryUsage] = useState(0)

  // Memoize random durations for the Neural Net bars so they don't recalculate on every render
  const neuralNetDurations = useMemo(() => [1, 2, 3, 4].map(() => 1.5 + Math.random()), [])

  // Simulate dynamic memory/system stats based on time and messages
  useEffect(() => {
    const interval = setInterval(() => {
      // Calculate a base memory usage from number of messages
      const baseUsage = Math.min((messages.length / 50) * 100, 85)
      // Add some random jitter
      const jitter = Math.random() * 5 - 2.5
      setMemoryUsage(Math.max(0, Math.min(100, baseUsage + jitter)))
    }, 1000)
    return () => clearInterval(interval)
  }, [messages.length])

  return (
    <div className="absolute left-0 top-0 bottom-0 w-80 p-6 pointer-events-none flex flex-col justify-center z-10">
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="bg-black/40 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-4 shadow-[0_0_20px_rgba(0,255,255,0.1)] flex flex-col gap-6"
      >
        {/* Header */}
        <div className="border-b border-cyan-500/30 pb-2 flex items-center gap-2 text-cyan-400 font-bold uppercase tracking-widest text-sm">
          <Activity className="w-4 h-4" /> System Diagnostics
        </div>

        {/* Memory Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-cyan-300 uppercase tracking-widest">
            <span className="flex items-center gap-1"><Database className="w-3 h-3"/> Core Memory</span>
            <span>{memoryUsage.toFixed(1)}%</span>
          </div>
          <div className="h-2 w-full bg-cyan-950/50 rounded-full overflow-hidden border border-cyan-900">
            <motion.div
              className="h-full bg-cyan-400 shadow-[0_0_10px_rgba(0,255,255,0.8)]"
              animate={{ width: `${memoryUsage}%` }}
              transition={{ type: "spring", stiffness: 50 }}
            />
          </div>
          <div className="text-[10px] text-cyan-600 font-mono">
            {messages.length} Records Indexed
          </div>
        </div>

        {/* Power Draw */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-cyan-300 uppercase tracking-widest">
            <span className="flex items-center gap-1"><Zap className="w-3 h-3"/> Reactor Output</span>
            <span className="text-orange-400">98.2%</span>
          </div>
          <div className="h-2 w-full bg-orange-950/50 rounded-full overflow-hidden border border-orange-900">
            <div className="h-full w-[98.2%] bg-orange-500 shadow-[0_0_10px_rgba(255,165,0,0.8)]" />
          </div>
        </div>

        {/* Processing Units */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-cyan-300 uppercase tracking-widest">
            <span className="flex items-center gap-1"><Cpu className="w-3 h-3"/> Neural Net</span>
            <span>Stable</span>
          </div>
          <div className="grid grid-cols-4 gap-1">
            {[1, 2, 3, 4].map((i, index) => (
              <div key={i} className="h-6 border border-cyan-500/30 bg-cyan-950/30 rounded flex items-center justify-center relative overflow-hidden">
                <motion.div
                  className="absolute bottom-0 w-full bg-cyan-500/40"
                  animate={{ height: ['20%', '80%', '40%', '90%', '30%'] }}
                  transition={{ repeat: Infinity, duration: neuralNetDurations[index], ease: "linear" }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Storage */}
        <div className="space-y-2">
           <div className="flex justify-between text-xs text-cyan-300 uppercase tracking-widest">
            <span className="flex items-center gap-1"><HardDrive className="w-3 h-3"/> Local Cache</span>
            <span className="text-green-400">Active</span>
          </div>
           <div className="text-[10px] text-cyan-600 font-mono border-t border-cyan-500/20 pt-2">
              SESSION_PERSISTENCE: ENABLED<br/>
              AUTO_SYNC: ONLINE
           </div>
        </div>

      </motion.div>
    </div>
  )
}
