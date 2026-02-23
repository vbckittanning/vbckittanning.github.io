#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const esbuild = require('esbuild');

const DIST_DIR = path.join(__dirname, 'dist');
const DIST_ASSETS_DIR = path.join(DIST_DIR, 'assets');
const ASSETS_DIR = path.join(__dirname, 'assets');
const SCRIPTS_DIR = path.join(ASSETS_DIR, 'scripts');
const STYLES_DIR = path.join(ASSETS_DIR, 'styles');

// Configuration: Define bundle order and which pages use which bundles
const BUNDLES = {
  js: [
    {
      name: 'app',
      files: [
        path.join(SCRIPTS_DIR, 'libs.js'),
        path.join(SCRIPTS_DIR, 'script.js'),
      ],
      pages: ['index.html', 'about.html', 'contact.html'],
    },
    {
      name: 'sermons',
      files: [
        path.join(SCRIPTS_DIR, 'libs.js'),
        path.join(SCRIPTS_DIR, 'script.js'),
        path.join(SCRIPTS_DIR, 'youtube-api.js'),
      ],
      pages: ['sermons.html'],
    },
    {
      name: 'events',
      files: [
        path.join(SCRIPTS_DIR, 'libs.js'),
        path.join(SCRIPTS_DIR, 'script.js'),
        path.join(SCRIPTS_DIR, 'calendar-utils.js'),
        path.join(SCRIPTS_DIR, 'events.js'),
      ],
      pages: ['events.html'],
    },
    {
      name: 'event-detail',
      files: [
        path.join(SCRIPTS_DIR, 'libs.js'),
        path.join(SCRIPTS_DIR, 'script.js'),
        path.join(SCRIPTS_DIR, 'calendar-utils.js'),
        path.join(SCRIPTS_DIR, 'lightbox.js'),
        path.join(SCRIPTS_DIR, 'event-detail.js'),
      ],
      pages: ['event-details.html'],
    },
  ],
  css: [
    {
      name: 'styles',
      files: [path.join(STYLES_DIR, 'styles.css')],
      pages: ['index.html', 'about.html', 'contact.html', 'sermons.html', 'events.html'],
    },
    {
      name: 'event-details',
      files: [
        path.join(STYLES_DIR, 'styles.css'),
        path.join(STYLES_DIR, 'event-details.css'),
      ],
      pages: ['event-details.html'],
    },
  ],
};

// Utility: Calculate hash of content
function hashContent(content) {
  return crypto.createHash('md5').update(content).digest('hex').slice(0, 8);
}

// Utility: Ensure directory exists
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Utility: Concatenate files in order (preserves global scope)
function concatenateFiles(filePaths) {
  return filePaths
    .map((filePath) => {
      if (!fs.existsSync(filePath)) {
        console.warn(`Warning: File not found: ${filePath}`);
        return '';
      }
      return fs.readFileSync(filePath, 'utf-8');
    })
    .join('\n');
}

// Step 1: Bundle and minify JavaScript
async function bundleJavaScript() {
  console.log('\n📦 Bundling JavaScript...');
  const hashes = {};

  for (const bundle of BUNDLES.js) {
    const concatenated = concatenateFiles(bundle.files);

    const result = await esbuild.build({
      stdin: {
        contents: concatenated,
        loader: 'js',
      },
      minify: true,
      write: false,
      target: 'es2015',
    });

    const minified = result.outputFiles[0].text;
    const hash = hashContent(minified);
    const filename = `${bundle.name}.${hash}.js`;
    const scriptsDir = path.join(DIST_ASSETS_DIR, 'scripts');
    const filepath = path.join(scriptsDir, filename);

    fs.mkdirSync(scriptsDir, { recursive: true });
    fs.writeFileSync(filepath, minified);

    hashes[bundle.name] = { filename, hash };

    console.log(`  ✓ ${bundle.name}: ${filename} (${minified.length} bytes)`);
  }

  return hashes;
}

// Step 2: Bundle and minify CSS
async function bundleCSS() {
  console.log('\n🎨 Bundling CSS...');
  const hashes = {};

  for (const bundle of BUNDLES.css) {
    const concatenated = concatenateFiles(bundle.files);

    // Simple CSS minification (remove comments, extra whitespace)
    const minified = concatenated
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
      .replace(/\s+/g, ' ') // Collapse whitespace
      .replace(/\s*([{}:;,])\s*/g, '$1') // Remove spaces around punctuation
      .trim();

    const hash = hashContent(minified);
    const filename = `${bundle.name}.${hash}.css`;
    const stylesPath = path.join(DIST_ASSETS_DIR, 'styles');
    const filepath = path.join(stylesPath, filename);

    fs.mkdirSync(stylesPath, { recursive: true });
    fs.writeFileSync(filepath, minified);

    hashes[bundle.name] = { filename, hash };

    console.log(`  ✓ ${bundle.name}: ${filename} (${minified.length} bytes)`);
  }

  return hashes;
}

// Step 3: Copy and rewrite HTML files
function rewriteHTMLFiles(jsHashes, cssHashes) {
  console.log('\n📄 Rewriting HTML files...');

  const htmlFiles = fs.readdirSync(__dirname).filter((f) => f.endsWith('.html'));

  for (const htmlFile of htmlFiles) {
    const srcPath = path.join(__dirname, htmlFile);
    let html = fs.readFileSync(srcPath, 'utf-8');

    // Find which JS bundle this page uses
    const jsBundle = BUNDLES.js.find((b) => b.pages.includes(htmlFile));
    const cssBundle = BUNDLES.css.find((b) => b.pages.includes(htmlFile));

    // Replace all script tags from assets/scripts/ with single bundled script
    if (jsBundle && jsHashes[jsBundle.name]) {
      const scriptTag = `<script src="assets/scripts/${jsHashes[jsBundle.name].filename}"><\/script>`;
      // Replace all consecutive script tags from assets/scripts/ with one
      html = html.replace(
        /(<script\s+src="assets\/scripts\/[^"]*"[^>]*><\/script>\s*)+/g,
        scriptTag
      );
    }

    // Replace all stylesheet links from assets/styles/ with single bundled CSS
    if (cssBundle && cssHashes[cssBundle.name]) {
      const linkTag = `<link rel="stylesheet" href="assets/styles/${cssHashes[cssBundle.name].filename}">`;
      // Replace all consecutive stylesheet links from assets/styles/ with one
      html = html.replace(
        /(<link\s+rel="stylesheet"\s+href="assets\/styles\/[^"]*"[^>]*>\s*)+/g,
        linkTag
      );
    }

    const distPath = path.join(DIST_DIR, htmlFile);
    fs.writeFileSync(distPath, html);
    console.log(`  ✓ ${htmlFile}`);
  }
}

// Step 4: Copy static assets (images, favicon, etc.)
function copyStaticAssets() {
  console.log('\n📸 Copying static assets...');

  const imagesDir = path.join(__dirname, 'assets', 'images');
  const distImagesDir = path.join(DIST_ASSETS_DIR, 'images');

  fs.mkdirSync(distImagesDir, { recursive: true });

  const images = fs.readdirSync(imagesDir);
  images.forEach((img) => {
    const src = path.join(imagesDir, img);
    const dest = path.join(distImagesDir, img);
    fs.copyFileSync(src, dest);
  });
  console.log(`  ✓ Copied ${images.length} images`);

  // Copy favicon
  const faviconSrc = path.join(__dirname, 'favicon.svg');
  if (fs.existsSync(faviconSrc)) {
    fs.copyFileSync(faviconSrc, path.join(DIST_DIR, 'favicon.svg'));
    console.log(`  ✓ Copied favicon.svg`);
  }

  // Copy data directory if it exists
  const dataDir = path.join(__dirname, 'data');
  const distDataDir = path.join(DIST_DIR, 'data');

  fs.mkdirSync(distDataDir, { recursive: true });

  fs.cpSync(dataDir, distDataDir, {
    recursive: true,
    force: true // Overwrites existing files in destination
  });
  console.log(`  ✓ Copied data directory`);
}

// Main build function
async function build() {
  try {
    console.log('🚀 Starting build...\n');

    // Clean dist directory
    if (fs.existsSync(DIST_DIR)) {
      fs.rmSync(DIST_DIR, { recursive: true });
    }
    ensureDir(DIST_DIR);

    // Bundle assets
    const jsHashes = await bundleJavaScript();
    const cssHashes = await bundleCSS();

    // Rewrite HTML
    rewriteHTMLFiles(jsHashes, cssHashes);

    // Copy static assets
    copyStaticAssets();

    console.log('\n✅ Build complete!\n');
    console.log('📁 Output: dist/\n');

    // Print manifest
    console.log('📋 Generated files:');
    console.log('  JavaScript:');
    Object.entries(jsHashes).forEach(([_, { filename }]) => {
      console.log(`    - ${filename}`);
    });
    console.log('  CSS:');
    Object.entries(cssHashes).forEach(([_, { filename }]) => {
      console.log(`    - ${filename}`);
    });
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

build().then(() => process.exit(0));
