import { useFrame, useThree } from '@react-three/fiber'
import { Float, RoundedBox } from '@react-three/drei'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { scrollState } from '../scroll'

/*
  Physically-based props that drift past the page edges as you scroll.
  They react to mouse and touch: CCTV cameras track the pointer, everything
  leans away from it, hovering grows them, dragging spins them with inertia,
  and a tap gives them a kick.
*/

const housing = { color: '#e9e4da', roughness: 0.32, metalness: 0.05, clearcoat: 0.8, clearcoatRoughness: 0.15 }
const darkMetal = { color: '#1d1b18', roughness: 0.35, metalness: 0.9 }

// Shared pointer state for the whole prop layer, in world space.
const aim = { point: new THREE.Vector3(), active: false, lastMove: 0 }

// A wall-mounted bullet CCTV camera. Patrols on its own, locks onto the pointer when it moves.
function CCTV({ phase = 0, hot }) {
  const head = useRef()
  const led = useRef()
  const local = useMemo(() => new THREE.Vector3(), [])
  useFrame((s) => {
    const t = s.clock.elapsedTime + phase
    let yaw = Math.sin(t * 0.45) * 0.7
    let pitch = -0.25 + Math.sin(t * 0.3) * 0.08
    const tracking = aim.active && t - phase - aim.lastMove < 2.5
    if (tracking && head.current.parent) {
      local.copy(aim.point)
      head.current.parent.worldToLocal(local)
      yaw = THREE.MathUtils.clamp(Math.atan2(local.x, local.z), -1.3, 1.3)
      pitch = THREE.MathUtils.clamp(-Math.atan2(local.y - 0.2, Math.hypot(local.x, local.z)), -0.7, 0.5)
    }
    head.current.rotation.y = THREE.MathUtils.lerp(head.current.rotation.y, yaw, tracking ? 0.12 : 0.03)
    head.current.rotation.x = THREE.MathUtils.lerp(head.current.rotation.x, pitch, tracking ? 0.12 : 0.03)
    const solid = tracking || hot.current
    led.current.emissiveIntensity = solid ? 8 : Math.sin(t * 4) > 0 ? 6 : 0.3
  })
  return (
    <group>
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
      <group ref={head} position={[0, 0.2, -0.08]}>
        <group position={[0, 0.16, 0.45]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <capsuleGeometry args={[0.2, 0.7, 16, 48]} />
            <meshPhysicalMaterial {...housing} />
          </mesh>
          <mesh position={[0, 0.16, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.26, 0.26, 0.95, 48, 1, true, -Math.PI / 2.4, Math.PI / 1.2]} />
            <meshPhysicalMaterial {...housing} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 0, 0.52]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.15, 0.17, 0.12, 48]} />
            <meshStandardMaterial {...darkMetal} />
          </mesh>
          <mesh position={[0, 0, 0.585]} scale={[1, 1, 0.45]}>
            <sphereGeometry args={[0.12, 48, 48]} />
            <meshPhysicalMaterial color="#0a0d14" roughness={0.02} metalness={0.2} clearcoat={1} iridescence={1} iridescenceIOR={1.6} iridescenceThicknessRange={[200, 600]} />
          </mesh>
          <mesh position={[0.11, -0.11, 0.55]}>
            <sphereGeometry args={[0.018, 16, 16]} />
            <meshStandardMaterial ref={led} color="#ff4b3e" emissive="#ff4b3e" emissiveIntensity={4} toneMapped={false} />
          </mesh>
        </group>
      </group>
    </group>
  )
}

function GlassKnot() {
  return (
    <mesh>
      <torusKnotGeometry args={[0.7, 0.22, 300, 48]} />
      <meshPhysicalMaterial color="#ffd27a" transmission={1} thickness={1.2} roughness={0.05} ior={1.45} clearcoat={1} attenuationColor="#ffb000" attenuationDistance={1.5} />
    </mesh>
  )
}

function ChromeOrb() {
  return (
    <mesh>
      <sphereGeometry args={[0.75, 96, 96]} />
      <meshPhysicalMaterial color="#ffffff" metalness={1} roughness={0.06} clearcoat={1} />
    </mesh>
  )
}

function FrostedPill() {
  return (
    <mesh>
      <capsuleGeometry args={[0.38, 1.1, 24, 64]} />
      <meshPhysicalMaterial color="#ff8a7a" transmission={0.95} thickness={0.8} roughness={0.35} ior={1.4} attenuationColor="#ff4b3e" attenuationDistance={1.2} />
    </mesh>
  )
}

function BrassRing() {
  return (
    <mesh>
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
const REPEL_RADIUS = 3.2

// Wraps one prop with hover / drag / tap / repel behaviour.
function Interactive({ item, slotRef }) {
  const { C, r, s = 1, phase } = item
  const isCam = C === CCTV
  const body = useRef() // spins (drag/tap)
  const lean = useRef() // repel offset + hover scale
  const st = useRef({ hover: false, drag: false, lx: 0, ly: 0, vx: 0, vy: 0, kick: 0, moved: 0 })
  const hot = useRef(false)
  const tmp = useMemo(() => new THREE.Vector3(), [])
  const { size } = useThree()

  useEffect(() => {
    const move = (e) => {
      const d = st.current
      if (!d.drag) return
      const dx = e.clientX - d.lx, dy = e.clientY - d.ly
      d.lx = e.clientX; d.ly = e.clientY
      d.moved += Math.abs(dx) + Math.abs(dy)
      d.vy += dx * 0.004
      d.vx += dy * 0.004
    }
    const up = () => {
      const d = st.current
      if (!d.drag) return
      d.drag = false
      if (d.moved < 6) { d.vy += (Math.random() > 0.5 ? 1 : -1) * 0.35; d.kick = 1 } // a tap
      document.body.style.cursor = d.hover ? 'grab' : ''
    }
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up) }
  }, [])

  useFrame((state, dt) => {
    const d = st.current
    const k = Math.min(dt * 60, 3)
    // spin with inertia; cameras only wobble so they keep "looking"
    if (body.current) {
      if (isCam) {
        body.current.rotation.z += d.vy * 0.3 * k
        body.current.rotation.z *= 0.9
      } else {
        body.current.rotation.y += (0.004 + d.vy) * k
        body.current.rotation.x += (0.002 + d.vx) * k
      }
    }
    const damp = d.drag ? 0.85 : 0.94
    d.vx *= damp; d.vy *= damp
    d.kick *= 0.9

    // lean away from the pointer, spring back when it leaves
    const g = lean.current
    if (g && slotRef.current) {
      slotRef.current.getWorldPosition(tmp)
      let ox = 0, oy = 0
      if (aim.active) {
        const dx = tmp.x - aim.point.x, dy = tmp.y - aim.point.y
        const dist = Math.hypot(dx, dy)
        if (dist < REPEL_RADIUS && !d.drag) {
          const f = (1 - dist / REPEL_RADIUS) * 0.9
          ox = (dx / (dist || 1)) * f
          oy = (dy / (dist || 1)) * f
        }
      }
      g.position.x = THREE.MathUtils.lerp(g.position.x, ox, 0.08)
      g.position.y = THREE.MathUtils.lerp(g.position.y, oy, 0.08)
      const base = s * THREE.MathUtils.clamp(size.width / 1280, 0.62, 1)
      const target = base * (d.hover || d.drag ? 1.12 : 1) * (1 + d.kick * 0.18)
      g.scale.setScalar(THREE.MathUtils.lerp(g.scale.x, target, 0.15))
    }
    hot.current = d.hover || d.drag
  })

  const handlers = {
    onPointerOver: (e) => { e.stopPropagation(); st.current.hover = true; if (!st.current.drag) document.body.style.cursor = 'grab' },
    onPointerOut: () => { st.current.hover = false; if (!st.current.drag) document.body.style.cursor = '' },
    onPointerDown: (e) => {
      e.stopPropagation()
      const d = st.current
      d.drag = true; d.moved = 0
      d.lx = e.clientX ?? e.nativeEvent.clientX; d.ly = e.clientY ?? e.nativeEvent.clientY
      document.body.style.cursor = 'grabbing'
    },
  }

  return (
    <group ref={lean}>
      <Float speed={1.2} rotationIntensity={isCam ? 0.15 : 0.6} floatIntensity={0.8}>
        {/* cheap invisible hit volume: raycasting the high-poly meshes on every move would be wasteful */}
        <mesh {...handlers}>
          <sphereGeometry args={[isCam ? 0.95 : 1.05, 16, 16]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
        <group ref={body} rotation={r || [0, 0, 0]}>
          {isCam ? <CCTV phase={phase} hot={hot} /> : <C />}
        </group>
      </Float>
    </group>
  )
}

export default function Props() {
  const rig = useRef()
  const slots = useRef(LAYOUT.map(() => ({ current: null })))
  const { camera, size, pointer } = useThree()
  const last = useRef({ x: 0, y: 0 })
  const ray = useMemo(() => new THREE.Vector3(), [])

  useFrame((state) => {
    // keep the prop plane locked in front of the camera
    rig.current.position.set(camera.position.x * 0.5, camera.position.y, camera.position.z - DIST)
    const halfH = DIST * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
    const halfW = halfH * (size.width / size.height)
    const p = scrollState.progress
    const narrow = size.width < 760

    // pointer → world point on the prop plane (works for mouse and touch)
    if (pointer.x !== last.current.x || pointer.y !== last.current.y) {
      last.current = { x: pointer.x, y: pointer.y }
      aim.active = true
      aim.lastMove = state.clock.elapsedTime
    }
    ray.set(pointer.x, pointer.y, 0.5).unproject(camera).sub(camera.position).normalize()
    aim.point.copy(camera.position).addScaledVector(ray, DIST / Math.max(0.2, -ray.z))

    LAYOUT.forEach((it, i) => {
      const g = slots.current[i].current
      if (!g) return
      const y = (p - it.at) * TRAVEL
      g.position.set(it.side * halfW * (narrow ? 0.98 : 0.84), y, 0)
      g.visible = Math.abs(y) < halfH + 3
    })
  })

  return (
    <group ref={rig}>
      {LAYOUT.map((it, i) => (
        <group key={i} ref={(g) => (slots.current[i].current = g)}>
          <Interactive item={it} slotRef={slots.current[i]} />
        </group>
      ))}
    </group>
  )
}
