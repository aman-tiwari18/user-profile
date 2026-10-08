import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

const R = 2.2

function latLon(lat, lon, r = R) {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta))
}

// Kanpur + a few cities to draw arcs to
const HOME = [26.45, 80.33]
const CITIES = [[37.77, -122.42], [51.5, -0.12], [1.35, 103.82], [35.68, 139.69], [-33.87, 151.21], [52.52, 13.4], [40.71, -74.0]]

function Arc({ from, to }) {
  const ref = useRef()
  const geom = useMemo(() => {
    const a = latLon(...from), b = latLon(...to)
    const mid = a.clone().add(b).multiplyScalar(0.5).normalize().multiplyScalar(R + a.distanceTo(b) * 0.45)
    const pts = new THREE.QuadraticBezierCurve3(a, mid, b).getPoints(64)
    return new THREE.BufferGeometry().setFromPoints(pts)
  }, [from, to])
  useFrame((s) => { ref.current.material.opacity = 0.35 + Math.sin(s.clock.elapsedTime * 2 + to[1]) * 0.25 })
  return (
    <line ref={ref} geometry={geom}>
      <lineBasicMaterial color="#ffb000" transparent opacity={0.5} />
    </line>
  )
}

function Earth() {
  const group = useRef()
  const pulse = useRef()
  const dots = useMemo(() => {
    const n = 2600, arr = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      const y = 1 - (i / (n - 1)) * 2, r = Math.sqrt(1 - y * y), t = Math.PI * (3 - Math.sqrt(5)) * i
      arr.set([Math.cos(t) * r * R, y * R, Math.sin(t) * r * R], i * 3)
    }
    return arr
  }, [])
  const home = useMemo(() => latLon(...HOME, R + 0.02), [])
  useFrame((s, dt) => {
    group.current.rotation.y += dt * 0.12
    const k = 1 + ((s.clock.elapsedTime * 0.8) % 1) * 2.5
    pulse.current.scale.setScalar(k)
    pulse.current.material.opacity = 1 - (k - 1) / 2.5
  })
  return (
    <group ref={group} rotation={[0.35, -1.6, 0]}>
      <mesh>
        <sphereGeometry args={[R * 0.985, 64, 64]} />
        <meshBasicMaterial color="#14110c" />
      </mesh>
      <points>
        <bufferGeometry><bufferAttribute attach="attributes-position" count={dots.length / 3} array={dots} itemSize={3} /></bufferGeometry>
        <pointsMaterial size={0.025} color="#f2ebdd" transparent opacity={0.8} />
      </points>
      <mesh position={home}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshBasicMaterial color="#ffb000" />
      </mesh>
      <mesh ref={pulse} position={home}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshBasicMaterial color="#ffb000" transparent />
      </mesh>
      {CITIES.map((c) => <Arc key={c.join()} from={HOME} to={c} />)}
    </group>
  )
}

export default function Globe() {
  return (
    <Canvas dpr={[1, 1.75]} camera={{ position: [0, 0, 7], fov: 45 }}>
      <Earth />
    </Canvas>
  )
}
