import esbuild from 'esbuild';
import path from 'path';

const entryPoints = [
  path.resolve('node_modules/puppeteer/lib/cjs/puppeteer/node/puppeteer.js'),
  path.resolve('node_modules/@google/generative-ai/index.js'),
  path.resolve('node_modules/cloudinary/index.js'),
];

const outdir = path.resolve('modules/third-party');

esbuild.build({
  entryPoints,
  bundle: true,
  platform: 'node',
  target: 'node14',
  outdir,
  external: [
    'puppeteer', 
    '@google/generative-ai', 
    'cloudinary'
  ],
}).catch(() => process.exit(1));
