// @vitest-environment jsdom
import { act, createRef } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { ImageOrbitCarousel, type ImageOrbitCarouselHandle } from '../ImageOrbitCarousel';
import { orbitPoint } from '../orbit';
const images = Array.from({ length: 5 }, (_, i) => ({ src: `/${i}.jpg`, alt: `Image ${i}`, href: `/gallery/${i}`, target: '_blank' as const }));
let root: Root, host: HTMLDivElement, callbacks: Map<number, FrameRequestCallback>, id: number;
beforeEach(() => {
  (globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
  host = document.createElement('div'); document.body.append(host); root = createRoot(host);
  callbacks = new Map(); id = 0;
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => { callbacks.set(++id, cb); return id; });
  vi.stubGlobal('cancelAnimationFrame', (key: number) => callbacks.delete(key));
  vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
});
afterEach(() => { act(() => root.unmount()); host.remove(); vi.unstubAllGlobals(); });
function tick(time: number) {
  const pending = [...callbacks.values()]; callbacks.clear(); act(() => pending.forEach(cb => cb(time)));
}
it('computes circle, ellipse, diagonal and infinity paths', () => {
  expect(orbitPoint(Math.PI / 2, 'circle', 100, 30, 0).y).toBeCloseTo(100);
  expect(orbitPoint(Math.PI / 2, 'ellipse', 100, 30, 0).y).toBeCloseTo(30);
  expect(orbitPoint(0, 'diagonal', 100, 30, 45).y).toBeCloseTo(Math.sqrt(5000));
  for (const a of [Math.PI / 2, 3 * Math.PI / 2]) {
    const p = orbitPoint(a, 'infinity', 100, 30, 0);
    expect(p.x).toBeCloseTo(0); expect(p.y).toBeCloseTo(0);
  }
});
it('limits count, preserves links and updates props', () => {
  act(() => root.render(<ImageOrbitCarousel images={images} visibleCount={3} autoPlay={false} responsive={false} />));
  expect(host.querySelectorAll('img')).toHaveLength(3);
  expect(host.querySelector('a')?.getAttribute('href')).toBe('/gallery/0');
  expect(host.querySelector('a')?.getAttribute('rel')).toContain('noopener');
  act(() => root.render(<ImageOrbitCarousel images={images} visibleCount={5} radius={200} path="circle" autoPlay={false} responsive={false} />));
  expect(host.querySelectorAll('img')).toHaveLength(5);
  expect((host.querySelector('.ioc-item') as HTMLElement).style.transform).toContain('200px');
});
it.each(['clockwise', 'counterclockwise'] as const)('travels %s and cleans up', direction => {
  act(() => root.render(<ImageOrbitCarousel images={images} path="circle" direction={direction} responsive={false} />));
  tick(0); tick(100);
  const transform = (host.querySelector('.ioc-item') as HTMLElement).style.transform;
  const y = Number(transform.match(/translate\([^,]+px, ([^)]+)px\)$/)?.[1]);
  expect(direction === 'clockwise' ? y > 0 : y < 0).toBe(true);
  act(() => root.unmount()); expect(callbacks.size).toBe(0); root = createRoot(host);
});
it('respects reduced motion and allows manual navigation', () => {
  vi.stubGlobal('matchMedia', () => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  const ref = createRef<ImageOrbitCarouselHandle>();
  act(() => root.render(<ImageOrbitCarousel ref={ref} images={images} responsive={false} />));
  expect(callbacks.size).toBe(0);
  const item = host.querySelector('.ioc-item') as HTMLElement, before = item.style.transform;
  act(() => ref.current?.next()); expect(item.style.transform).not.toBe(before);
});
it('supports SSR and empty galleries, and validates inputs', () => {
  expect(renderToString(<ImageOrbitCarousel images={[]} />)).not.toContain('<img');
  expect(() => renderToString(<ImageOrbitCarousel images={images} duration={0} />)).toThrow('duration');
  expect(() => renderToString(<ImageOrbitCarousel images={images} visibleCount={1.5} />)).toThrow('visibleCount');
});
it('pauses and resumes through the imperative API without resetting positions', () => {
  const ref = createRef<ImageOrbitCarouselHandle>();
  act(() => root.render(<ImageOrbitCarousel ref={ref} images={images} responsive={false} />));
  tick(0); tick(100);
  const before = (host.querySelector('.ioc-item') as HTMLElement).style.transform;
  act(() => ref.current?.pause()); expect(callbacks.size).toBe(0);
  expect((host.querySelector('.ioc-item') as HTMLElement).style.transform).toBe(before);
  act(() => ref.current?.play()); expect(callbacks.size).toBe(1);
});
it('responds to reduced-motion preference changes', () => {
  let listener = () => {};
  const query = { matches: false, addEventListener: (_: string, cb: () => void) => { listener = cb; }, removeEventListener: vi.fn() };
  vi.stubGlobal('matchMedia', () => query);
  act(() => root.render(<ImageOrbitCarousel images={images} responsive={false} />));
  expect(callbacks.size).toBe(1);
  act(() => { query.matches = true; listener(); }); expect(callbacks.size).toBe(0);
  act(() => { query.matches = false; listener(); }); expect(callbacks.size).toBe(1);
});
