import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Sparkles, Environment, Lightformer } from '@react-three/drei'
import { useMemo, useRef, Suspense } from 'react'
import * as THREE from 'three'
import { scrollState } from '../scroll'
import FeedWall from './FeedWall'
import Props from './Props'

const DEPTH = 60 // how far the camera travels through the scene over the full page

function Starfield({ count = 4000 }) {
  const ref = useRef()
  const [positions, colors] = useMemo(() => {
    const p = new Float32Array(count * 3)
    const c = new Float32Array(count * 3)
    const palette = [new THREE.Color('#ffb000'), new THREE.Color('#ff4b3e'), new THREE.Color('#f2ebdd'), new THREE.Color('#7ee0a1')]
    for (let i = 0; i < count; i++) {
      const r = 20 + Math.random() * 60
      const theta = Math.random() * Math.PI * 2
      p[i * 3] = Math.cos(theta) * r
      p[i * 3 + 1] = (Math.random() - 0.5) * 80
      p[i * 3 + 2] = -Math.random() * (DEPTH + 60) + 20
      const col = palette[Math.random() < 0.7 ? 2 : Math.floor(Math.random() * 4)]
      c.set([col.r, col.g, col.b], i * 3)
    }
    return [p, c]
  }, [count])
  useFrame((_, dt) => {
    ref.current.rotation.z += dt * 0.01
  })
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.12} vertexColors transparent opacity={0.85} sizeAttenuation depthWrite={false} />
    </points>
  )
}

function Rig() {
  const { camera, pointer } = useThree()
  const target = useMemo(() => new THREE.Vector3(), [])
  useFrame(() => {
    const z = 6 - scrollState.progress * DEPTH
    target.set(pointer.x * 0.6, pointer.y * 0.4 - scrollState.progress * 2, z)
    camera.position.lerp(target, 0.06)
    camera.rotation.z = THREE.MathUtils.lerp(camera.rotation.z, scrollState.velocity * -0.0008, 0.1)
    camera.lookAt(pointer.x * 0.3, pointer.y * 0.2, z - 8)
  })
  return null
}

export default function Scene() {
  return (
    <div className="webgl" aria-hidden="true">
      <Canvas dpr={[1, 1.75]} camera={{ position: [0, 0, 6], fov: 55 }} gl={{ antialias: true, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}>
        <color attach="background" args={['#0c0b09']} />
        <fog attach="fog" args={['#0c0b09', 8, 34]} />
        <ambientLight intensity={0.15} />
        <directionalLight position={[5, 6, 4]} intensity={2.2} color="#fff1d6" />
        <directionalLight position={[-6, -2, -3]} intensity={1.2} color="#ff4b3e" />
        <directionalLight position={[0, -4, 6]} intensity={0.6} color="#ffb000" />
        {/* procedural studio: softboxes + strip lights, so reflections look photographed (no HDR download) */}
        <Environment resolution={256} frames={1}>
          <color attach="background" args={['#0d0b08']} />
          <Lightformer form="rect" intensity={4} position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[12, 6, 1]} color="#fff3dc" />
          <Lightformer form="rect" intensity={2.5} position={[-6, 1, 2]} rotation-y={Math.PI / 2} scale={[3, 8, 1]} color="#ffd18a" />
          <Lightformer form="rect" intensity={2.5} position={[6, 1, 2]} rotation-y={-Math.PI / 2} scale={[3, 8, 1]} color="#ffffff" />
          <Lightformer form="ring" intensity={3} position={[2, 2, 7]} scale={2.5} color="#ffb000" />
          <Lightformer form="rect" intensity={1.5} position={[0, -5, -4]} rotation-x={-Math.PI / 2} scale={[10, 2, 1]} color="#ff4b3e" />
          <Lightformer form="rect" intensity={1} position={[0, 0, -8]} scale={[14, 1, 1]} color="#ffe6b0" />
        </Environment>
        <Starfield />
        <Sparkles count={120} scale={[16, 10, DEPTH]} position={[0, 0, -DEPTH / 2]} size={2.5} speed={0.4} color="#ffb000" />
        <FeedWall />
        <Suspense fallback={null}><Props /></Suspense>
        <Rig />
      </Canvas>
    </div>
  )
}
