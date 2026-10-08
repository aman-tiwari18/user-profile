import { Canvas, useFrame } from '@react-three/fiber'
import { Text, Billboard } from '@react-three/drei'
import { useMemo, useRef, useState, Suspense } from 'react'
import * as THREE from 'three'

function Word({ children, position }) {
  const ref = useRef()
  const [hovered, setHovered] = useState(false)
  const color = useMemo(() => new THREE.Color(), [])
  useFrame(() => {
    if (!ref.current) return
    ref.current.material.color.lerp(color.set(hovered ? '#ffb000' : '#f2ebdd'), 0.15)
    const s = THREE.MathUtils.lerp(ref.current.scale.x, hovered ? 1.35 : 1, 0.15)
    ref.current.scale.setScalar(s)
  })
  return (
    <Billboard position={position}>
      <Text
        ref={ref}
        fontSize={0.42}
        letterSpacing={-0.02}
        anchorX="center"
        anchorY="middle"
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = '' }}
      >
        {children}
      </Text>
    </Billboard>
  )
}

function Cloud({ words, radius = 4.2 }) {
  const group = useRef()
  const positions = useMemo(() => {
    const n = words.length
    return words.map((_, i) => {
      // Fibonacci sphere for an even distribution
      const y = 1 - (i / (n - 1)) * 2
      const r = Math.sqrt(1 - y * y)
      const theta = Math.PI * (3 - Math.sqrt(5)) * i
      return new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r).multiplyScalar(radius)
    })
  }, [words, radius])
  useFrame((state, dt) => {
    group.current.rotation.y += dt * 0.12 + state.pointer.x * dt * 0.6
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -state.pointer.y * 0.5, 0.05)
  })
  return (
    <group ref={group}>
      {words.map((w, i) => <Word key={w} position={positions[i]}>{w}</Word>)}
      <mesh>
        <icosahedronGeometry args={[radius * 0.55, 1]} />
        <meshBasicMaterial color="#ffb000" wireframe transparent opacity={0.12} />
      </mesh>
    </group>
  )
}

export default function SkillSphere({ words }) {
  return (
    <Canvas dpr={[1, 1.75]} camera={{ position: [0, 0, 11], fov: 50 }}>
      <fog attach="fog" args={['#0c0b09', 8, 15]} />
      <Suspense fallback={null}>
        <Cloud words={words} />
      </Suspense>
    </Canvas>
  )
}
