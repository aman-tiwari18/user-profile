import { useFrame, useThree } from '@react-three/fiber'
import { Float, RoundedBox } from '@react-three/drei'
import { useRef } from 'react'
import * as THREE from 'three'
import { scrollState } from '../scroll'

/*
  Physically-based props that drift through the scroll fly-through.
  Everything is smooth, high-segment geometry with PBR materials so it reads as
  real objects under the studio environment, not as flat-shaded polygons.
*/

const housing = { color: '#e9e4da', roughness: 0.32, metalness: 0.05, clearcoat: 0.8, clearcoatRoughness: 0.15 }
const darkMetal = { color: '#1d1b18', roughness: 0.35, metalness: 0.9 }

// A wall-mounted bullet CCTV camera that slowly pans like it's surveying the room.
function CCTV({ position, rotation = [0, 0, 0], scale = 1, phase = 0 }) {
  const head = useRef()
  const led = useRef()
  useFrame((s) => {
    const t = s.clock.elapsedTime + phase
    head.current.rotation.y = Math.sin(t * 0.45) * 0.7
    head.current.rotation.z = -0.25 + Math.sin(t * 0.3) * 0.08
    led.current.emissiveIntensity = Math.sin(t * 4) > 0 ? 6 : 0.3
  })
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* wall plate + arm */}
      <RoundedBox args={[0.5, 0.7, 0.08]} radius={0.03} smoothness={6} position={[0, 0.2, -0.55]}>
        <meshPhysicalMaterial {...housing} />
      </RoundedBox>
      <mesh position={[0, 0.2, -0.3]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.06, 0.07, 0.45, 32]} />
        <meshPhysicalMaterial {...housing} />
      </mesh>
      <mesh position={[0, 0.2, -0.08]}>
        <sphereGeometry args={[0.1, 32, 32]} />
        <meshStandardMaterial {...darkMetal} />
      </mesh>
      {/* pan/tilt head */}
      <group ref={head} position={[0, 0.2, -0.08]}>
        <group position={[0, 0.16, 0.45]}>
          {/* body */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <capsuleGeometry args={[0.2, 0.7, 16, 48]} />
            <meshPhysicalMaterial {...housing} />
          </mesh>
          {/* sun shield */}
          <mesh position={[0, 0.16, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.26, 0.26, 0.95, 48, 1, true, -Math.PI / 2.4, Math.PI / 1.2]} />
            <meshPhysicalMaterial {...housing} side={THREE.DoubleSide} />
          </mesh>
          {/* lens barrel */}
          <mesh position={[0, 0, 0.52]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.15, 0.17, 0.12, 48]} />
            <meshStandardMaterial {...darkMetal} />
          </mesh>
          {/* glass lens */}
          <mesh position={[0, 0, 0.585]} scale={[1, 1, 0.45]}>
            <sphereGeometry args={[0.12, 48, 48]} />
            <meshPhysicalMaterial color="#0a0d14" roughness={0.02} metalness={0.2} clearcoat={1} iridescence={1} iridescenceIOR={1.6} iridescenceThicknessRange={[200, 600]} />
          </mesh>
          {/* recording LED */}
          <mesh position={[0.11, -0.11, 0.55]}>
            <sphereGeometry args={[0.018, 16, 16]} />
            <meshStandardMaterial ref={led} color="#ff4b3e" emissive="#ff4b3e" emissiveIntensity={4} toneMapped={false} />
          </mesh>
        </group>
      </group>
    </group>
  )
}

function GlassKnot(props) {
  return (
    <mesh {...props}>
      <torusKnotGeometry args={[0.7, 0.22, 300, 48]} />
      <meshPhysicalMaterial color="#ffd27a" transmission={1} thickness={1.2} roughness={0.05} ior={1.45} clearcoat={1} attenuationColor="#ffb000" attenuationDistance={1.5} />
    </mesh>
  )
}

function ChromeOrb(props) {
  return (
    <mesh {...props}>
      <sphereGeometry args={[0.75, 96, 96]} />
      <meshPhysicalMaterial color="#ffffff" metalness={1} roughness={0.06} clearcoat={1} />
    </mesh>
  )
}

function FrostedPill(props) {
  return (
    <mesh {...props}>
      <capsuleGeometry args={[0.38, 1.1, 24, 64]} />
      <meshPhysicalMaterial color="#ff8a7a" transmission={0.95} thickness={0.8} roughness={0.35} ior={1.4} attenuationColor="#ff4b3e" attenuationDistance={1.2} />
    </mesh>
  )
}

function BrassRing(props) {
  return (
    <mesh {...props}>
      <torusGeometry args={[0.8, 0.09, 64, 200]} />
      <meshStandardMaterial color="#d9a441" metalness={1} roughness={0.22} />
    </mesh>
  )
}

// at: page progress (0..1) where the prop crosses the middle of the screen; side: -1 left, 1 right
const LAYOUT = [
  { C: CCTV, at: 0.1, side: 1, r: [0, -0.7, 0], s: 1.6, phase: 0 },
  { C: GlassKnot, at: 0.2, side: -1, s: 1.3 },
  { C: ChromeOrb, at: 0.32, side: 1, s: 1.2 },
  { C: CCTV, at: 0.43, side: -1, r: [0, 0.7, 0], s: 1.6, phase: 2 },
  { C: FrostedPill, at: 0.55, side: 1, r: [0.4, 0, 0.6], s: 1.3 },
  { C: BrassRing, at: 0.66, side: -1, r: [1.1, 0.3, 0], s: 1.4 },
  { C: GlassKnot, at: 0.78, side: 1, s: 1.1 },
  { C: CCTV, at: 0.9, side: -1, r: [0, 0.7, 0], s: 1.6, phase: 4 },
]

const DIST = 9 // props live on a plane this far in front of the camera
const TRAVEL = 70 // world units of vertical travel per full page scroll

export default function Props() {
  const rig = useRef()
  const slots = useRef([])
  const spin = useRef([])
  const { camera, viewport, size } = useThree()
  useFrame((_, dt) => {
    // keep the prop plane locked in front of the camera
    rig.current.position.set(camera.position.x * 0.5, camera.position.y, camera.position.z - DIST)
    const halfH = DIST * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
    const halfW = halfH * (size.width / size.height)
    const p = scrollState.progress
    LAYOUT.forEach((it, i) => {
      const g = slots.current[i]
      if (!g) return
      const y = (p - it.at) * TRAVEL
      g.position.set(it.side * halfW * (size.width < 760 ? 1.0 : 0.9), y, 0)
      g.visible = Math.abs(y) < halfH + 3
      const sp = spin.current[i]
      if (sp && it.C !== CCTV) { sp.rotation.y += dt * 0.3; sp.rotation.x += dt * 0.12 }
    })
  })
  return (
    <group ref={rig}>
      {LAYOUT.map(({ C, r, s = 1, phase }, i) => (
        <group key={i} ref={(g) => (slots.current[i] = g)}>
          <Float speed={1.2} rotationIntensity={C === CCTV ? 0.15 : 0.6} floatIntensity={0.8}>
            {C === CCTV ? (
              <CCTV rotation={r} scale={s} phase={phase} />
            ) : (
              <group ref={(g) => (spin.current[i] = g)} rotation={r || [0, 0, 0]} scale={s}>
                <C />
              </group>
            )}
          </Float>
        </group>
      ))}
    </group>
  )
}
