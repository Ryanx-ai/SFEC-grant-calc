import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
const files = { '/': ['index.html', 'text/html'], '/index.html': ['index.html', 'text/html'], '/styles.css': ['styles.css', 'text/css'], '/app.js': ['app.js', 'text/javascript'], '/calculator.js': ['calculator.js', 'text/javascript'], '/favicon.svg': ['favicon.svg', 'image/svg+xml'] };
createServer(async (req, res) => {
  const file = files[new URL(req.url, 'http://localhost').pathname];
  if (!file) { res.writeHead(404); res.end('Not found'); return; }
  try { res.writeHead(200, { 'Content-Type': file[1], 'Cache-Control': 'no-store' }); res.end(await readFile(file[0])); }
  catch { res.writeHead(500); res.end('Unable to read file'); }
}).listen(4173, '127.0.0.1', () => console.log('Calculator: http://localhost:4173'));
