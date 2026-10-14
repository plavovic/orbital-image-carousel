"use client";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { orbitPoint, positive, type OrbitPath, type OrbitDirection } from './orbit';

export type CarouselImage = {
  id?: string; src: string; alt: string; href?: string; target?: '_self' | '_blank'; rel?: string;
  objectPosition?: string; aspect?: 'landscape' | 'portrait' | 'square';
};
export type ImageOrbitCarouselProps = {
  images: readonly CarouselImage[]; path?: OrbitPath; direction?: OrbitDirection;
  radius?: number; radiusX?: number; radiusY?: number; rotation?: number; visibleCount?: number;
  duration?: number; imageWidth?: number; autoPlay?: boolean; animated?: boolean;
  pauseOnHover?: boolean; grayscaleOnHover?: boolean; responsive?: boolean; showControls?: boolean;
  centerContent?: ReactNode; className?: string; style?: CSSProperties; ariaLabel?: string;
};
export type ImageOrbitCarouselHandle = {
  playEntrance: () => void; play: () => void; pause: () => void; next: () => void; previous: () => void;
};

export const ImageOrbitCarousel = forwardRef<ImageOrbitCarouselHandle, ImageOrbitCarouselProps>(
  function ImageOrbitCarousel({ images, path = 'diagonal', direction = 'clockwise', radius = 400,
    radiusX = radius, radiusY = radius * .6125, rotation = path === 'diagonal' ? 45 : 0,
    visibleCount = images.length, duration = 24, imageWidth = 185, autoPlay = true, animated = true,
    pauseOnHover = true, grayscaleOnHover = false, responsive = true, showControls = true, centerContent, className, style,
    ariaLabel = 'Image orbit carousel' }, ref) {
    positive(radius, 'radius'); positive(radiusX, 'radiusX'); positive(radiusY, 'radiusY');
    positive(duration, 'duration'); positive(imageWidth, 'imageWidth');
    if (!Number.isFinite(rotation)) throw new Error('rotation must be finite.');
    if (!Number.isInteger(visibleCount) || visibleCount < 0 || (images.length > 0 && visibleCount === 0))
      throw new Error('visibleCount must be a positive integer (zero is allowed for an empty gallery).');
    if (!['circle', 'ellipse', 'infinity', 'diagonal'].includes(path)) throw new Error('Invalid orbit path.');
    if (!['clockwise', 'counterclockwise'].includes(direction)) throw new Error('Invalid orbit direction.');
    const displayed = images.slice(0, visibleCount);
    const count = displayed.length;
    const root = useRef<HTMLElement>(null);
    const items = useRef<(HTMLDivElement | null)[]>([]);
    const phase = useRef(0);
    const step = useRef<(delta: number) => void>(() => {});
    const pointer = useRef<{ x: number; y: number } | null>(null);
    const suppressClick = useRef(false);
    const [playing, setPlaying] = useState(autoPlay);
    const [entered, setEntered] = useState(false);
    const [hovered, setHovered] = useState(false);
    const [focused, setFocused] = useState(false);
    const [reduced, setReduced] = useState(false);
    const sign = direction === 'clockwise' ? 1 : -1;
    useEffect(() => { setPlaying(autoPlay); }, [autoPlay]);
    useEffect(() => { setEntered(true); }, []);
    useEffect(() => {
      const query = window.matchMedia('(prefers-reduced-motion: reduce)');
      const update = () => setReduced(query.matches);
      update(); query.addEventListener('change', update);
      return () => query.removeEventListener('change', update);
    }, []);
    useImperativeHandle(ref, () => ({ playEntrance: () => setEntered(true), play: () => setPlaying(true),
      pause: () => setPlaying(false), next: () => step.current(sign), previous: () => step.current(-sign) }), [sign]);

    useEffect(() => {
      const element = root.current;
      if (!element || !count) return;
      let scale = 1, visible = true, frame = 0;
      let last: number | null = null;
      const render = () => {
        items.current.slice(0, count).forEach((item, index) => {
          if (!item) return;
          const p = orbitPoint(index / count * Math.PI * 2 + phase.current, path, radiusX, radiusY, rotation);
          item.style.transform = `translate(-50%, -50%) translate(${p.x * scale}px, ${p.y * scale}px)`;
          item.style.width = `${imageWidth * scale}px`;
          item.style.zIndex = String(Math.round(p.y + radiusX + radiusY) + 1);
        });
      };
      const resize = () => {
        const tilt = rotation * Math.PI / 180, ry = path === 'circle' ? radiusX : radiusY;
        const ex = Math.abs(radiusX * Math.cos(tilt)) + Math.abs(ry * Math.sin(tilt));
        const ey = Math.abs(radiusX * Math.sin(tilt)) + Math.abs(ry * Math.cos(tilt));
        scale = responsive ? Math.min(1, element.clientWidth / (2 * ex + imageWidth * 1.2),
          element.clientHeight / (2 * ey + imageWidth * 1.8)) : 1;
        render();
      };
      step.current = (delta) => { phase.current = (phase.current + delta * Math.PI * 2 / count) % (Math.PI * 2); render(); };
      const tick = (now: number) => {
        if (visible && !document.hidden && last !== null) {
          phase.current = (phase.current + sign * Math.min(now - last, 100) / (duration * 1000) * Math.PI * 2) % (Math.PI * 2);
          render();
        }
        last = now; frame = requestAnimationFrame(tick);
      };
      const observer = typeof IntersectionObserver !== 'undefined' ? new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting; last = null;
      }) : null;
      observer?.observe(element);
      const resizer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
      resizer?.observe(element); window.addEventListener('resize', resize); resize();
      if (playing && !reduced && !(pauseOnHover && hovered) && !focused) frame = requestAnimationFrame(tick);
      return () => {
        cancelAnimationFrame(frame); observer?.disconnect(); resizer?.disconnect();
        window.removeEventListener('resize', resize); step.current = () => {};
      };
    }, [count, path, radiusX, radiusY, rotation, imageWidth, responsive, playing, reduced, pauseOnHover, hovered, focused, sign, duration]);

    return <section ref={root} className={['ioc', grayscaleOnHover && 'ioc-grayscale-on-hover', className].filter(Boolean).join(' ')} style={style}
      aria-label={ariaLabel} aria-roledescription="carousel" tabIndex={0}
      onPointerEnter={() => setHovered(true)} onPointerLeave={() => { setHovered(false); pointer.current = null; }}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false); }}
      onKeyDown={(e) => {
        if (e.target === e.currentTarget && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
          e.preventDefault(); step.current(e.key === 'ArrowRight' ? sign : -sign);
        }
      }}
      onPointerDown={(e) => {
        if (e.button !== 0 || (e.target as HTMLElement).closest('button')) return;
        pointer.current = { x: e.clientX, y: e.clientY }; suppressClick.current = false;
      }}
      onPointerMove={(e) => {
        const p = pointer.current;
        if (p && Math.abs(e.clientX - p.x) > 40 && Math.abs(e.clientX - p.x) > Math.abs(e.clientY - p.y)) suppressClick.current = true;
      }}
      onPointerUp={(e) => {
        const p = pointer.current; pointer.current = null;
        if (!p) return;
        const dx = e.clientX - p.x;
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(e.clientY - p.y)) {
          suppressClick.current = true; step.current(dx < 0 ? sign : -sign);
        }
      }}
      onPointerCancel={() => { pointer.current = null; }}
      onClickCapture={(e) => { if (suppressClick.current) { e.preventDefault(); e.stopPropagation(); suppressClick.current = false; } }}>
      <div className="ioc-orbit" role="list">
        {displayed.map((image, index) => {
          const p = orbitPoint(index / count * Math.PI * 2, path, radiusX, radiusY, rotation);
          const picture = <img src={image.src} alt={image.alt} draggable={false} className="ioc-image" style={{ objectPosition: image.objectPosition }} />;
          return <div key={image.id ?? `${image.src}-${index}`} ref={(node) => { items.current[index] = node; }}
            role="listitem" className="ioc-item" style={{ width: imageWidth,
              transform: `translate(-50%, -50%) translate(${p.x}px, ${p.y}px)`,
              aspectRatio: image.aspect === 'portrait' ? '3 / 4' : image.aspect === 'square' ? '1' : '16 / 9' }}>
            <div className={`ioc-frame${animated && !reduced ? ' ioc-entrance' : ''}`} data-entered={entered}>
              {image.href ? <a className="ioc-link" href={image.href} target={image.target}
                rel={image.target === '_blank' ? `${image.rel ?? ''} noopener noreferrer`.trim() : image.rel}>{picture}</a> : picture}
            </div>
          </div>;
        })}
      </div>
      {centerContent != null && <div className="ioc-center">{centerContent}</div>}
      {showControls && count > 0 && <div className="ioc-controls">
        <button type="button" onClick={() => step.current(-sign)} aria-label="Previous position">Previous</button>
        <button type="button" onClick={() => setPlaying(!playing)} disabled={reduced}
          aria-label={playing && !reduced ? 'Pause orbit' : 'Play orbit'}>{playing && !reduced ? 'Pause' : 'Play'}</button>
        <button type="button" onClick={() => step.current(sign)} aria-label="Next position">Next</button>
      </div>}
    </section>;
  });
