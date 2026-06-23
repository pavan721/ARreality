'use client'

import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sphere, MeshDistortMaterial, Line, Preload, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { useAppStore } from '@/store/useAppStore'

function Core({ isSpeaking, isProcessing }: { isSpeaking: boolean; isProcessing: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null)

  // Determine color and distortion based on state
  const color = isSpeaking ? '#ffaa00' : isProcessing ? '#00ffff' : '#0088ff'
  const distort = isSpeaking ? 0.6 : isProcessing ? 0.4 : 0.2
  const speed = isSpeaking ? 4 : isProcessing ? 2 : 1

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2 * speed
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3 * speed
    }
  })

  return (
    <Sphere ref={meshRef} args={[1, 64, 64]} scale={isSpeaking ? 1.2 : 1}>
      <MeshDistortMaterial
        color={color}
        envMapIntensity={1}
        clearcoat={1}
        clearcoatRoughness={0.1}
        metalness={0.8}
        roughness={0.2}
        distort={distort}
        speed={speed}
        transparent
        opacity={0.8}
      />
    </Sphere>
  )
}

function WireframeGlobe({ isSpeaking, isProcessing }: { isSpeaking: boolean; isProcessing: boolean }) {
  const groupRef = useRef<THREE.Group>(null)

  const speed = isSpeaking ? 2 : isProcessing ? 1.5 : 0.5

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1 * speed
      groupRef.current.rotation.z = state.clock.elapsedTime * 0.05 * speed
    }
  })

  return (
    <group ref={groupRef}>
      <Sphere args={[1.5, 32, 32]}>
        <meshBasicMaterial color={isSpeaking ? '#ff5500' : '#00ffff'} wireframe transparent opacity={0.15} />
      </Sphere>
      <Sphere args={[2, 16, 16]}>
        <meshBasicMaterial color={isSpeaking ? '#ffaa00' : '#0088ff'} wireframe transparent opacity={0.05} />
      </Sphere>
    </group>
  )
}

function WaveformRings({ isSpeaking }: { isSpeaking: boolean }) {
  const groupRef = useRef<THREE.Group>(null)

  const rings = useMemo(() => {
    return Array.from({ length: 3 }).map((_, i) => {
      const radius = 2.5 + i * 0.5
      const points = []
      for (let j = 0; j <= 64; j++) {
        const angle = (j / 64) * Math.PI * 2
        points.push(new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0))
      }
      return { radius, points, offset: i * Math.PI / 3 }
    })
  }, [])

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = state.clock.elapsedTime * 0.2
      groupRef.current.children.forEach((child, i) => {
        const scale = isSpeaking ? 1 + Math.sin(state.clock.elapsedTime * 5 + i) * 0.1 : 1
        child.scale.set(scale, scale, scale)
        // Subtle wobble
        child.rotation.x = Math.sin(state.clock.elapsedTime + i) * 0.1
        child.rotation.y = Math.cos(state.clock.elapsedTime + i) * 0.1
      })
    }
  })

  return (
    <group ref={groupRef} rotation={[Math.PI / 2, 0, 0]}>
      {rings.map((ring, i) => (
        <Line
          key={i}
          points={ring.points}
          color={isSpeaking ? '#ffaa00' : '#00ffff'}
          lineWidth={isSpeaking ? 3 : 1}
          transparent
          opacity={0.3 - i * 0.05}
        />
      ))}
    </group>
  )
}

export function Hologram() {
  const { isSpeaking, isProcessing } = useAppStore()

  return (
    <div className="absolute inset-0 pointer-events-none z-0">
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={2} color="#00ffff" />
        <directionalLight position={[-10, -10, -5]} intensity={2} color="#ffaa00" />
        <pointLight position={[0, 0, 0]} intensity={isSpeaking ? 5 : 2} color={isSpeaking ? '#ffaa00' : '#00ffff'} />

        <group>
          <Core isSpeaking={isSpeaking} isProcessing={isProcessing} />
          <WireframeGlobe isSpeaking={isSpeaking} isProcessing={isProcessing} />
          <WaveformRings isSpeaking={isSpeaking} />
        </group>

        {/* OrbitControls disabled so it doesn't interfere with page scroll,
            but could be enabled if interaction is desired */}
        <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
        <Preload all />
      </Canvas>
    </div>
  )
}
