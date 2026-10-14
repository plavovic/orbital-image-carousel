export type OrbitPath = 'circle' | 'ellipse' | 'infinity' | 'diagonal';
export type OrbitDirection = 'clockwise' | 'counterclockwise';
export function orbitPoint(angle: number, path: OrbitPath, radiusX: number, radiusY: number, rotation: number) {
  const x = radiusX * Math.cos(angle);
  const y = path === 'infinity' ? radiusY * Math.sin(2 * angle) : (path === 'circle' ? radiusX : radiusY) * Math.sin(angle);
  const tilt = rotation * Math.PI / 180;
  return { x: x * Math.cos(tilt) - y * Math.sin(tilt), y: x * Math.sin(tilt) + y * Math.cos(tilt) };
}
export function positive(value: number, name: string) {
  if (!Number.isFinite(value) || value <= 0) throw new Error(`${name} must be a finite positive number.`);
  return value;
}
