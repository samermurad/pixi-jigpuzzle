

// LERP = linear interpolation
const lerp = (a: number, b: number, c: number): number => a * (1 - c) + b * c;
const minMax = (min: number, max: number, value: number): number => Math.min(min, Math.max(max, value));

// smoothstep easing (0..1)
const ease = (t: number): number => t * t * (3 - 2 * t);

// shortest-angle interpolation for each axis
const lerpAngle = (angleA: number, angleB: number, delta: number) => {
  let d = (angleB - angleA) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return angleA + d * delta;
};

const clamp = (v: number, a: number, b: number): number => Math.max(a, Math.min(b, v));
const randomRange = (min: number, max: number): number => Math.floor(Math.random() * max) + min;
const smoothstep = (t: number): number => t * t * (3 - 2 * t);

// take care of - sign around 180 / 360
const wrapPi = (a: number): number => {
  a = a % (Math.PI * 2);
  if (a > Math.PI) a -= Math.PI * 2;
  if (a < -Math.PI) a += Math.PI * 2;
  return a;
};


const lerpAngleShortest = (a: number, b: number, t: number): number => {
  const d = wrapPi(b - a);
  return a + d * t;
};

const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

const degToRadians = (deg: number): number => deg * Math.PI / 180;
const radToDegrees = (deg: number): number => deg * 180 / Math.PI;

// const PixiMath = Object.freeze();

const polyPointsAroundCircle = (
  sides: number,
  radius: number,
  indicesToSkip: number[] = []
): { x: number; y: number; }[] => {

  const points: { x: number; y: number; }[] = [];
  const angleJumps = 360 / sides;
  let angle = 0;
  let i = 0;
  do {
    const rad = degToRadians(angle);
    const x = radius * Math.cos(rad);
    const y = radius * Math.sin(rad);
    angle += angleJumps;
    i++
    // if (!indicesToSkip.includes(i))
      points.push({ x, y });
  } while (i < sides);

  return points;
}

const hexToHsb = (hex: string): { h: number; s: number; b: number } => {
  // 1. Convert hex to RGB
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex.split('').map(s => s + s).join('');
  }

  let r = parseInt(hex.substring(0, 2), 16) / 255;
  let g = parseInt(hex.substring(2, 4), 16) / 255;
  let b = parseInt(hex.substring(4, 6), 16) / 255;

  // 2. Find HSB values
  let max = Math.max(r, g, b);
  let min = Math.min(r, g, b);
  let d = max - min;

  let h;
  if (d === 0) h = 0;
  else if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / d + 2;
  else if (max === b) h = (r - g) / d + 4;

  h = Math.round(h! * 60); // Hue in degrees
  let s = max === 0 ? 0 : Math.round((d / max) * 100); // Saturation %
  let v = Math.round(max * 100); // Brightness %

  return { h, s, b: v };
}


export default {
  lerp,
  minMax,
  ease,
  smoothStepEase: ease,
  lerpAngle,
  wrapPi,
  lerpAngleShortest,
  easeOutCubic,
  degToRadians,
  deg: degToRadians,
  radToDegrees,
  rad: radToDegrees,
  clamp,
  smoothstep,
  randomRange,
  polyPointsAroundCircle,
  hexToHsb,
}
