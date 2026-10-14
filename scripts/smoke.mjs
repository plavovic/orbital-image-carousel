import { ImageOrbitCarousel } from 'image-orbit-carousel';
import { createRequire } from 'node:module';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
const require = createRequire(import.meta.url);
if (!require('image-orbit-carousel').ImageOrbitCarousel) throw new Error('Missing CommonJS export');
const html = renderToString(createElement(ImageOrbitCarousel, {
  images: [{ src: '/test.jpg', alt: 'Test image' }], animated: false,
}));
if (!html.includes('Test image')) throw new Error('Server rendering failed');
console.log('ESM, CommonJS and SSR passed');
console.log('Stylesheet:', require.resolve('image-orbit-carousel/styles.css'));
