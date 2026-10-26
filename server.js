const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const MIME = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'text/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split('?')[0]);
  let filePath = path.join(__dirname, urlPath);

  // Exact file check
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    return sendFile(filePath, res);
  }

  // Standalone design site index
  if (urlPath === '/design' || urlPath === '/design/' || urlPath === '/design/index.html') {
    return sendFile(path.join(__dirname, 'design', 'index.html'), res);
  }

  // Fallback for /assets/, /figures/ or /site-data.json
  if (urlPath.startsWith('/assets/')) {
    const candidate = path.join(__dirname, 'design', urlPath);
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return sendFile(candidate, res);
    }
  }
  if (urlPath.startsWith('/figures/')) {
    const candidate = path.join(__dirname, 'design', urlPath);
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return sendFile(candidate, res);
    }
  }
  if (urlPath === '/site-data.json') {
    return sendFile(path.join(__dirname, 'design', 'site-data.json'), res);
  }

  // Clean URLs for resume
  if (urlPath === '/resume' && fs.existsSync(path.join(__dirname, 'resume.html'))) {
    return sendFile(path.join(__dirname, 'resume.html'), res);
  }

  // SPA routes -> index.html
  const spaRoutes = ['/', '/about', '/experience', '/skills', '/protosem', '/iot', '/contact'];
  if (spaRoutes.includes(urlPath) || !path.extname(urlPath)) {
    return sendFile(path.join(__dirname, 'index.html'), res);
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('404 Not Found');
});

function sendFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME[ext] || 'application/octet-stream';
  res.writeHead(200, {
    'Content-Type': contentType,
    'Cache-Control': 'no-cache'
  });
  fs.createReadStream(filePath).pipe(res);
}

server.listen(PORT, () => {
  console.log(`Portfolio server is running at http://localhost:${PORT}`);
});
