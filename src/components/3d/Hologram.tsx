'use client'

import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Cylinder, Torus, MeshDistortMaterial, Preload, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { useAppStore } from '@/store/useAppStore'

function ArcCore({ isSpeaking, isProcessing }: { isSpeaking: boolean; isProcessing: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null)

  const color = isSpeaking ? '#ffaa00' : isProcessing ? '#00ffff' : '#ffffff'
  const emissive = isSpeaking ? '#ff5500' : isProcessing ? '#00aaaa' : '#00aaff'
  const intensity = isSpeaking ? 3 : isProcessing ? 2 : 1
  const distort = isSpeaking ? 0.4 : isProcessing ? 0.2 : 0

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.5
      const scale = 1 + Math.sin(state.clock.elapsedTime * (isSpeaking ? 5 : 2)) * (isSpeaking ? 0.1 : 0.02)
      meshRef.current.scale.set(scale, scale, scale)
    }
  })

  return (
    <Cylinder ref={meshRef} args={[0.8, 0.8, 0.2, 32]} rotation={[Math.PI / 2, 0, 0]}>
      <MeshDistortMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={intensity}
        distort={distort}
        speed={isSpeaking ? 5 : 1}
        roughness={0.2}
        metalness={0.8}
        clearcoat={1}
      />
    </Cylinder>
  )
}

const COILS_ARRAY = Array.from({ length: 10 })

function ArcRings({ isSpeaking, isProcessing }: { isSpeaking: boolean; isProcessing: boolean }) {
  const groupRef = useRef<THREE.Group>(null)

  const speed = isSpeaking ? 2 : isProcessing ? 1.5 : 0.5

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = -state.clock.elapsedTime * 0.2 * speed
    }
  })

  return (
    <group ref={groupRef}>
      {/* Inner glowing ring */}
      <Torus args={[1.2, 0.05, 16, 64]}>
        <meshStandardMaterial color="#00ffff" emissive="#0088ff" emissiveIntensity={2} />
      </Torus>

      {/* Outer casing ring */}
      <Torus args={[1.8, 0.15, 16, 64]}>
        <meshStandardMaterial color="#222" metalness={0.9} roughness={0.4} />
      </Torus>

      {/* Segmented coils */}
      {COILS_ARRAY.map((_, i) => (
        <group key={i} rotation={[0, 0, (i / 10) * Math.PI * 2]}>
          <Cylinder args={[0.05, 0.05, 0.6, 8]} position={[0, 1.5, 0]} rotation={[0, 0, 0]}>
            <meshStandardMaterial color="#444" metalness={0.8} roughness={0.2} />
          </Cylinder>
          {/* Glowing wire on coil */}
          <Cylinder args={[0.06, 0.06, 0.2, 8]} position={[0, 1.5, 0]}>
            <meshStandardMaterial color={isSpeaking ? '#ffaa00' : '#00ffff'} emissive={isSpeaking ? '#ff5500' : '#0088ff'} emissiveIntensity={isSpeaking ? 4 : 2} />
          </Cylinder>
        </group>
      ))}
    </group>
  )
}

const STRUTS_ARRAY = Array.from({ length: 3 })

function ArcCasing() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = state.clock.elapsedTime * 0.05
    }
  })

  return (
    <group ref={groupRef}>
      {/* Large background plate */}
      <Cylinder args={[2.5, 2.5, 0.1, 32]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.2]}>
        <meshStandardMaterial color="#111" metalness={0.9} roughness={0.7} />
      </Cylinder>

      {/* Casing details / struts */}
      {STRUTS_ARRAY.map((_, i) => (
        <mesh key={i} rotation={[0, 0, (i / 3) * Math.PI * 2]} position={[0, 0, 0.1]}>
          <boxGeometry args={[0.2, 5.2, 0.1]} />
          <meshStandardMaterial color="#333" metalness={0.8} roughness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

export function Hologram() {
  const { isSpeaking, isProcessing } = useAppStore()

  return (
    <div className="absolute inset-0 pointer-events-none z-0">
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <ambientLight intensity={0.2} />
        <directionalLight position={[5, 5, 5]} intensity={1} color="#ffffff" />
        <pointLight position={[0, 0, 2]} intensity={isSpeaking ? 10 : 5} color={isSpeaking ? '#ffaa00' : '#00ffff'} distance={10} />

        <group rotation={[0.2, -0.2, 0]}> {/* Slight tilt to make it look like a chest piece */}
          <ArcCasing />
          <ArcRings isSpeaking={isSpeaking} isProcessing={isProcessing} />
          <ArcCore isSpeaking={isSpeaking} isProcessing={isProcessing} />
        </group>

        <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
        <Preload all />
      </Canvas>
    </div>
  )
}
