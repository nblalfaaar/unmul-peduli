import { motion } from 'framer-motion'

function Hall({ x, y, w, h, fill, op = 1 }: { x: number; y: number; w: number; h: number; fill: string; op?: number }) {
  const cols = 7
  const gap = (w - 14) / (cols - 1)
  return (
    <g fill={fill} opacity={op}>
      <polygon points={`${x - 14},${y} ${x + w / 2},${y - h * 0.38} ${x + w + 14},${y}`} />
      <rect x={x - 14} y={y} width={w + 28} height={14} />
      {Array.from({ length: cols }).map((_, i) => (
        <rect key={i} x={x + i * gap} y={y + 14} width={14} height={h - 14} rx={2} />
      ))}
      <rect x={x - 22} y={y + h} width={w + 44} height={10} />
      <rect x={x - 32} y={y + h + 10} width={w + 64} height={10} />
      <rect x={x - 42} y={y + h + 20} width={w + 84} height={12} />
    </g>
  )
}

function Tree({ x, y, s = 1, fill }: { x: number; y: number; s?: number; fill: string }) {
  return <ellipse cx={x} cy={y - 60 * s} rx={15 * s} ry={64 * s} fill={fill} />
}

export default function HeroArt() {
  return (
    <svg className="hero-art" viewBox="0 0 1440 780" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <radialGradient id="sun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff3e8" stopOpacity="0.95" />
          <stop offset="55%" stopColor="#f6cfb6" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#f6cfb6" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#16394a" stopOpacity="0" />
          <stop offset="100%" stopColor="#16394a" stopOpacity="1" />
        </linearGradient>
      </defs>

      <motion.circle cx="1040" cy="430" r="330" fill="url(#sun)" initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1.6, ease: 'easeOut' }} />

      <motion.g fill="#fff" opacity="0.6" animate={{ x: [0, 40, 0] }} transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}>
        <ellipse cx="260" cy="190" rx="90" ry="20" />
        <ellipse cx="320" cy="176" rx="58" ry="20" />
        <ellipse cx="1180" cy="150" rx="100" ry="22" />
        <ellipse cx="1120" cy="136" rx="56" ry="20" />
      </motion.g>
      <motion.g fill="#fff" opacity="0.45" animate={{ x: [0, -30, 0] }} transition={{ duration: 34, repeat: Infinity, ease: 'easeInOut' }}>
        <ellipse cx="700" cy="110" rx="70" ry="15" />
        <ellipse cx="745" cy="100" rx="44" ry="14" />
      </motion.g>

      <path d="M0 430 C 160 380 320 420 480 400 C 660 376 800 440 980 410 C 1140 384 1300 420 1440 396 L1440 780 L0 780Z" fill="#b2d0de" />
      <Hall x={120} y={420} w={300} h={150} fill="#7fa9bd" op={0.85} />
      <Hall x={1020} y={430} w={300} h={140} fill="#7fa9bd" op={0.85} />

      <path d="M0 520 C 140 470 300 505 470 488 C 640 470 800 530 980 504 C 1160 480 1300 515 1440 492 L1440 780 L0 780Z" fill="#6c9db3" />
      <Hall x={60} y={500} w={340} h={170} fill="#3f7a92" />
      <Hall x={1040} y={506} w={340} h={160} fill="#3f7a92" />
      <Tree x={470} y={640} s={1.1} fill="#2c6a67" />
      <Tree x={500} y={650} s={0.8} fill="#34766f" />
      <Tree x={960} y={646} s={1} fill="#2c6a67" />
      <Tree x={930} y={654} s={0.75} fill="#34766f" />

      <path d="M0 610 C 200 570 380 610 560 596 C 740 582 900 636 1100 606 C 1250 586 1360 606 1440 592 L1440 780 L0 780Z" fill="#25586d" />
      <Tree x={200} y={720} s={0.9} fill="#1c4a52" />
      <Tree x={236} y={724} s={0.7} fill="#245a58" />
      <Tree x={1230} y={716} s={1} fill="#1c4a52" />
      <Tree x={1196} y={722} s={0.7} fill="#245a58" />
      <rect x="0" y="560" width="1440" height="220" fill="url(#fade)" />
    </svg>
  )
}
