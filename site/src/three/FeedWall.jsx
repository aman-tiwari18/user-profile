import { useFrame, useThree } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { scrollState } from '../scroll'

/*
  A curved wall of procedurally generated "exam hall" CCTV feeds.
  Each tile is a shader: a top-down grid of desks + candidates, CCTV noise,
  scanlines, and a YOLO-style bounding box that occasionally flips to an alert.
*/

const vert = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`

const frag = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uSeed;
  uniform float uAlert;
  uniform float uDim;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7)) + uSeed * 17.0) * 43758.5453); }

  float box(vec2 p, vec2 c, vec2 h, float t) {
    vec2 d = abs(p - c) - h;
    float outer = step(max(d.x, d.y), 0.0);
    vec2 d2 = abs(p - c) - (h - t);
    float inner = step(max(d2.x, d2.y), 0.0);
    return outer - inner;
  }

  void main() {
    vec2 uv = vUv;
    // slight barrel distortion like a cheap CCTV lens
    vec2 cc = uv - 0.5;
    uv = 0.5 + cc * (1.0 + 0.12 * dot(cc, cc));

    // floor
    vec3 col = vec3(0.05, 0.07, 0.08) + 0.03 * hash(floor(uv * 6.0));

    // exam hall grid: desks with seated candidates
    vec2 grid = vec2(5.0, 4.0);
    vec2 g = uv * grid;
    vec2 id = floor(g);
    vec2 f = fract(g) - 0.5;
    float occupied = step(0.18, hash(id));
    float desk = step(abs(f.x), 0.36) * step(abs(f.y + 0.12), 0.1);
    col += desk * vec3(0.16, 0.17, 0.15);
    vec2 jitter = vec2(sin(uTime * 0.7 + hash(id) * 30.0), cos(uTime * 0.5 + hash(id) * 20.0)) * 0.03;
    float head = smoothstep(0.17, 0.12, length(f - vec2(0.0, 0.14) - jitter)) * occupied;
    col = mix(col, vec3(0.28, 0.3, 0.27), head);

    // detection box around one candidate per feed
    vec2 target = vec2(floor(hash(vec2(uSeed, 1.0)) * grid.x), floor(hash(vec2(uSeed, 2.0)) * grid.y));
    vec2 bc = (target + vec2(0.5, 0.62)) / grid;
    float b = box(uv, bc + jitter / grid, vec2(0.075, 0.1), 0.006);
    vec3 boxCol = mix(vec3(1.0, 0.69, 0.0), vec3(1.0, 0.29, 0.24), uAlert);
    col = mix(col, boxCol, b);

    // CCTV treatment: tint, scanlines, rolling bar, noise, vignette
    float lum = dot(col, vec3(0.299, 0.587, 0.114));
    col = mix(col, vec3(lum) * vec3(1.0, 0.93, 0.78), 0.55) + b * boxCol * 0.6;
    col *= 0.85 + 0.15 * sin(uv.y * 420.0);
    col += 0.06 * smoothstep(0.03, 0.0, abs(fract(uv.y - uTime * 0.15) - 0.5));
    col += (hash(uv * 400.0 + uTime) - 0.5) * 0.09;
    col *= smoothstep(0.85, 0.25, length(cc));
    col += uAlert * 0.08 * vec3(1.0, 0.1, 0.2) * (0.5 + 0.5 * sin(uTime * 12.0));

    // frame
    float edge = step(0.985, max(abs(cc.x), abs(cc.y)) * 2.0);
    col = mix(col, mix(vec3(0.2, 0.25, 0.3), vec3(1.0, 0.25, 0.35), uAlert), edge);

    gl_FragColor = vec4(col * uDim, 1.0);
  }
`

const COLS = 5
const ROWS = 4
const W = 1.25
const H = 0.82
const GAP = 0.08
const RADIUS = 6

function Tile({ index, position, rotation, dim, labels = true }) {
  const mat = useRef()
  const label = useRef()
  const seed = useMemo(() => Math.random() * 100, [])
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uSeed: { value: seed }, uAlert: { value: 0 }, uDim: { value: dim } }), [seed, dim])
  const cam = useMemo(() => `CAM-${String(1000 + Math.floor(seed * 89)).padStart(4, '0')}`, [seed])
  useFrame((state) => {
    const t = state.clock.elapsedTime
    uniforms.uTime.value = t
    // each tile raises an alert for ~1.6s on its own cycle
    const cycle = (t + seed * 3.7) % (9 + (index % 5) * 2)
    const target = cycle < 1.6 ? 1 : 0
    uniforms.uAlert.value += (target - uniforms.uAlert.value) * 0.15
    if (label.current) label.current.color = uniforms.uAlert.value > 0.5 ? '#ff4b3e' : '#ffcf66'
  })
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <planeGeometry args={[W, H]} />
        <shaderMaterial ref={mat} vertexShader={vert} fragmentShader={frag} uniforms={uniforms} />
      </mesh>
      {labels && <Text ref={label} position={[-W / 2 + 0.06, H / 2 - 0.07, 0.01]} fontSize={0.055} anchorX="left" anchorY="middle" color="#ffcf66">
        {`● ${cam} · LIVE`}
      </Text>}
    </group>
  )
}

export default function FeedWall() {
  const group = useRef()
  const { pointer, viewport, camera } = useThree()
  const tiles = useMemo(() => {
    const out = []
    const arc = (W + GAP) / RADIUS
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const a = (c - (COLS - 1) / 2) * arc
        out.push({
          position: [Math.sin(a) * RADIUS, ((ROWS - 1) / 2 - r) * (H + GAP), RADIUS - Math.cos(a) * RADIUS],
          rotation: [0, -a, 0],
        })
      }
    }
    return out
  }, [])
  const narrow = viewport.width < 7
  const base = narrow ? [0, 1.6, -4] : [2.9, 0.1, -2.6]
  useFrame((state) => {
    const g = group.current
    const p = scrollState.progress
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, -0.35 + pointer.x * 0.15 + Math.sin(state.clock.elapsedTime * 0.2) * 0.04, 0.05)
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, -pointer.y * 0.08, 0.05)
    // ride along with the camera and scroll up and away like page content
    const s = Math.max(0, 1 - p * 8)
    g.position.z = camera.position.z - 6 + base[2]
    g.position.y = base[1] + p * 70
    g.scale.setScalar(THREE.MathUtils.lerp(g.scale.x, 0.6 + s * 0.4, 0.1))
    g.visible = s > 0.01
  })
  return (
    <group ref={group} position={base}>
      {tiles.map((t, i) => <Tile key={i} index={i} dim={narrow ? 0.28 : 1} labels={!narrow} {...t} />)}
    </group>
  )
}
