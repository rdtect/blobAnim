import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = 3000;
const ROOT_DIR = resolve(__dirname, '../..');

// MIME types for different file extensions
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'font/otf',
  '.map': 'application/json'
};

// Create a simple HTTP server
const server = createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);
  
  // Parse the URL
  let url = req.url;
  
  // Handle root path
  if (url === '/') {
    url = '/index.html';
  }
  
  // Determine the file path
  let filePath;
  if (url.startsWith('/packages/') || url.startsWith('/apps/')) {
    // For package demos, serve from the root directory
    filePath = join(ROOT_DIR, url);
  } else {
    // For local files, serve from the current directory
    filePath = join(__dirname, url);
  }
  
  // Get the file extension
  const extname = String(filePath.split('.').pop()).toLowerCase();
  const contentType = MIME_TYPES['.' + extname] || 'application/octet-stream';
  
  // Read the file
  try {
    if (existsSync(filePath)) {
      const content = readFileSync(filePath);
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    } else {
      console.error(`File not found: ${filePath}`);
      res.writeHead(404);
      res.end('File not found');
    }
  } catch (error) {
    console.error(`Error serving ${filePath}:`, error);
    res.writeHead(500);
    res.end(`Server Error: ${error.message}`);
  }
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`Serving files from ${ROOT_DIR}`);
});
