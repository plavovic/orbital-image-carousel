import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ImageOrbitCarousel, type CarouselImage, type OrbitDirection, type OrbitPath } from '../index';
import '../styles.css';
import './demo.css';

// Local SVG samples keep this demo usable without external image services.
const colors = ['#f97316', '#8b5cf6', '#22c55e', '#38bdf8', '#f43f5e', '#eab308', '#14b8a6', '#d946ef', '#6366f1', '#fb7185', '#84cc16', '#06b6d4'];
const images: CarouselImage[] = colors.map((color, index) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400"><rect width="640" height="400" fill="${color}"/><circle cx="500" cy="70" r="140" fill="white" opacity=".15"/><path d="M0 400L200 170L360 330L490 210L640 400Z" fill="black" opacity=".2"/><text x="36" y="85" fill="white" font-family="sans-serif" font-size="48" font-weight="bold">Image ${index + 1}</text></svg>`;
  return { id: String(index), src: `data:image/svg+xml,${encodeURIComponent(svg)}`,
    alt: `Colorful sample ${index + 1}`, href: `#image-${index + 1}` };
});

function Demo() {
  const [path, setPath] = useState<OrbitPath>('diagonal');
  const [direction, setDirection] = useState<OrbitDirection>('clockwise');
  const [radiusX, setRadiusX] = useState(300);
  const [radiusY, setRadiusY] = useState(160);
  const [rotation, setRotation] = useState(45);
  const [count, setCount] = useState(8);
  const [duration, setDuration] = useState(24);
  const [width, setWidth] = useState(130);
  const [autoPlay, setAutoPlay] = useState(true);
  const [pauseOnHover, setPauseOnHover] = useState(false);
  const [links, setLinks] = useState(true);
  const [grayscaleOnHover, setGrayscaleOnHover] = useState(false);
  const code = `<ImageOrbitCarousel\n  images={images}\n  path="${path}"\n  direction="${direction}"\n  radiusX={${radiusX}}\n  radiusY={${radiusY}}\n  rotation={${rotation}}\n  visibleCount={${count}}\n  duration={${duration}}\n  imageWidth={${width}}\n  autoPlay={${autoPlay}}\n  pauseOnHover={${pauseOnHover}}\n  grayscaleOnHover={${grayscaleOnHover}}\n/>`;
  return <main>
    <header><p className="eyebrow">COMPONENT PLAYGROUND</p><h1>Image Orbit Carousel</h1>
      <p>Change the settings below. Click an image to test its link, or use the carousel’s controls.</p></header>
    <div className="layout">
      <aside aria-label="Carousel settings">
        <label>Movement<select value={path} onChange={e => {
          const next = e.target.value as OrbitPath; setPath(next); setRotation(next === 'diagonal' ? 45 : 0);
        }}><option value="circle">Circle</option><option value="ellipse">Ellipse</option><option value="infinity">Infinity ∞</option><option value="diagonal">Diagonal ellipse</option></select></label>
        <label>Direction<select value={direction} onChange={e => setDirection(e.target.value as OrbitDirection)}>
          <option value="clockwise">Clockwise</option><option value="counterclockwise">Counterclockwise</option></select></label>
        <Slider label={path === 'circle' ? 'Radius' : 'Horizontal radius'} value={radiusX} min={60} max={450} onChange={setRadiusX} />
        {path !== 'circle' && <Slider label="Vertical radius" value={radiusY} min={40} max={350} onChange={setRadiusY} />}
        <Slider label="Axis rotation (degrees)" value={rotation} min={-90} max={90} onChange={setRotation} />
        <Slider label="Visible images" value={count} min={1} max={images.length} onChange={setCount} />
        <Slider label="Seconds per lap" value={duration} min={5} max={60} onChange={setDuration} />
        <Slider label="Image width" value={width} min={50} max={200} onChange={setWidth} />
        <label className="check"><input type="checkbox" checked={autoPlay} onChange={e => setAutoPlay(e.target.checked)} />Autoplay</label>
        <label className="check"><input type="checkbox" checked={pauseOnHover} onChange={e => setPauseOnHover(e.target.checked)} />Pause on hover</label>
        <label className="check"><input type="checkbox" checked={grayscaleOnHover} onChange={e => setGrayscaleOnHover(e.target.checked)} />Black and white on hover</label>
        <label className="check"><input type="checkbox" checked={links} onChange={e => setLinks(e.target.checked)} />Enable image links</label>
      </aside>
      <div className="preview">
        <ImageOrbitCarousel images={links ? images : images.map(({ href, ...image }) => image)} path={path}
          direction={direction} radiusX={radiusX} radiusY={radiusY} rotation={rotation}
          visibleCount={count} duration={duration} imageWidth={width} autoPlay={autoPlay}
          pauseOnHover={pauseOnHover} grayscaleOnHover={grayscaleOnHover} centerContent={<span className="center">{path === 'infinity' ? '∞' : 'ORBIT'}</span>}
          style={{ height: 620 }} />
        <p className="hint">The orbit scales to fit. Focus pauses autoplay; click outside the carousel to resume. Reduced motion disables autoplay.</p>
      </div>
    </div>
    <section className="usage"><h2>Current configuration</h2><pre><code>{code}</code></pre></section>
    <section className="destinations"><h2>Image link destinations</h2><p>Each sample links to its matching card below.</p>
      <div>{images.map((image, index) => <article key={image.id} id={`image-${index + 1}`}>
        <img src={image.src} alt={image.alt} /><p>Destination for image {index + 1}</p><a href="#root">Back to carousel ↑</a>
      </article>)}</div>
    </section>
  </main>;
}

function Slider({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (value: number) => void }) {
  return <label>{label} <output>{value}</output><input type="range" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))} /></label>;
}

createRoot(document.getElementById('root')!).render(<Demo />);
