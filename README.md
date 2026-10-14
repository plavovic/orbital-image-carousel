# Image Orbit Carousel

Standalone React image carousel with smooth circle, ellipse, infinity and diagonal paths. Includes TypeScript declarations, ESM, CommonJS and CSS. Next.js and GSAP are no longer required; React and React DOM are peer dependencies.

## Installation

This package has not been published to npm. Build an installable tarball:

```sh
npm install
npm pack
# In a consuming React project:
npm install /path/to/image-orbit-carousel-0.1.0.tgz
```

Choose the final available npm name and license before publishing. After publication consumers can install by the package name.

## Usage

To test locally, run `npm install` followed by `npm run dev`, then open the URL Vite prints (usually http://127.0.0.1:5173). The demo in `demo/main.tsx` includes local sample images, live settings, optional image links and a configuration preview. Run `npm run build:demo` for a production demo build. The demo uses the library source directly so edits update immediately; it is excluded from the npm package.

```jsx
import { ImageOrbitCarousel } from 'image-orbit-carousel';
import 'image-orbit-carousel/styles.css';

const images = [
  { src: '/lake.jpg', alt: 'Mountain lake', href: '/gallery/lake' },
  { src: '/forest.jpg', alt: 'Forest', href: 'https://example.com', target: '_blank' },
  { src: '/desert.jpg', alt: 'Desert dunes' },
];

export default function Gallery() {
  return <ImageOrbitCarousel images={images} path="ellipse"
    radiusX={300} radiusY={140} visibleCount={3}
    direction="counterclockwise" duration={30} style={{ height: 600 }} />;
}
```

Next.js App Router: render from a client component and import CSS in your layout or another allowed global CSS entry. Images use native `img`; no Next image domain configuration is needed.

## Paths

```jsx
<ImageOrbitCarousel images={images} path="circle" radius={250} />
<ImageOrbitCarousel images={images} path="ellipse" radiusX={320} radiusY={130} />
<ImageOrbitCarousel images={images} path="ellipse" radiusX={130} radiusY={320} />
<ImageOrbitCarousel images={images} path="infinity" radiusX={300} radiusY={120} />
<ImageOrbitCarousel images={images} path="diagonal" rotation={-45} />
```

Cards stay upright. A horizontal ellipse has radiusX greater than radiusY; reverse those values for a vertical ellipse. Rotation turns any path clockwise in degrees. Infinity is a figure eight (`x = radiusX * cos(angle)`, `y = radiusY * sin(2 * angle)`). Its lobes turn in opposite directions; `direction` reverses traversal. Images may overlap at the crossing. Noncircular paths have varying geometric speed.

## API

| Prop | Default | Purpose |
| --- | --- | --- |
| `images` | required | Array of image objects described below |
| `path` | `diagonal` | `circle`, `ellipse`, `infinity`, `diagonal` |
| `direction` | `clockwise` | `clockwise` or `counterclockwise` |
| `radius` | `400` | Circle radius / default horizontal radius in CSS pixels |
| `radiusX` | `radius` | Horizontal radius; both circle axes use this |
| `radiusY` | `radius * 0.6125` | Vertical radius for other paths |
| `rotation` | diagonal: `45`, others: `0` | Path rotation in degrees |
| `visibleCount` | `images.length` | First N images, capped at supplied count |
| `duration` | `24` | Seconds per complete traversal |
| `imageWidth` | `185` | Card width before responsive scaling |
| `autoPlay` | `true` | Initial playback; changing this prop updates playback |
| `animated` | `true` | Automatic entrance fade/slide on mount |
| `pauseOnHover` | `true` | Pause while hovered |
| `grayscaleOnHover` | `false` | While an image is hovered, turn the other images black and white |
| `responsive` | `true` | Scale down path and cards to fit container |
| `showControls` | `true` | Previous, play/pause, next buttons |
| `centerContent` | none | Decorative content at center |
| `className`, `style` | none | Container customization (default height: 700px) |
| `ariaLabel` | `Image orbit carousel` | Accessible section label |

Image objects require `src` and descriptive `alt`; optional fields are `href`, `target` (`_self` or `_blank`), `rel`, `id`, `objectPosition`, and `aspect` (`landscape`, `portrait`, `square`). New-tab links include `noopener noreferrer`. Supply trusted URLs. Landscape is 16:9, portrait is 3:4, square is 1:1.

Set each image's destination with `href`; omit it for a non-clickable image. Use `target: '_blank'` to open a new tab, or omit `target` to navigate in the current tab. `direction` controls orbit movement, not link destinations.

```jsx
const images = [
  { src: '/project-one.jpg', alt: 'Project one', href: '/projects/one' },
  { src: '/project-two.jpg', alt: 'Project two', href: 'https://example.com', target: '_blank' },
];

<ImageOrbitCarousel images={images} grayscaleOnHover={true} />
```

The hover effect restores color when the pointer leaves the image and works independently of `pauseOnHover`. It applies on devices that support hover and uses CSS `:has()`.

Radii, width and duration must be finite positive numbers. Visible count must be a positive integer; empty arrays are supported. Extra images beyond visibleCount are omitted, rather than cycled into view. Responsive fitting can reduce displayed radii: disable it and provide sufficient container space for exact pixel sizes.

Focus the section and use arrow keys, swipe horizontally, or use the buttons. Manual steps move one image spacing immediately. Playback pauses on focus, offscreen, and while the document is hidden. Reduced motion disables autoplay and transitions and responds to preference changes. Keep controls available for autoplay.

The optional ref exposes `play()`, `pause()`, `next()`, `previous()`, and `playEntrance()`. Entrance runs automatically; playEntrance remains an idempotent compatibility method. Manual pause persists until play is requested or autoPlay changes. Focus/hover can still suspend a play request. Override the exported `ioc-*` classes for styling.

## Development and migration

```sh
npm run typecheck
npm test
npm run build
npm pack
```

Prepack runs type checking, tests and build. Only dist and README are shipped. React is externalized; there are no runtime dependencies beyond React peers.

Replace the old CSS module import with the package stylesheet. The old component required exactly 14 images and filled the viewport; this component accepts any count and uses a relative container. Fixed branding is replaced by centerContent.
