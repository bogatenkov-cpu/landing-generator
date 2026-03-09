/**
 * Landing Generator Server
 * node server.js → http://localhost:3333
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { generateHTML } = require('./generate.js');
const { deploy } = require('./deploy.js');

const PORT = process.env.PORT || 3333;

function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) return;
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const [key, ...vals] = line.split('=');
    if (key && vals.length) process.env[key.trim()] = vals.join('=').trim();
  });
}
loadEnv();

function checkAuth(req) {
  const pass = process.env.ADMIN_PASSWORD;
  if (!pass) return true; // no password set = open access
  return req.headers['x-admin-password'] === pass;
}

function parseBody(req, maxBytes = 25 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    let body = '';
    let size = 0;
    req.on('data', chunk => {
      size += chunk.length;
      if (size > maxBytes) { req.destroy(); reject(new Error('Request too large')); return; }
      body += chunk;
    });
    req.on('end', () => {
      try { resolve(JSON.parse(body)); } catch(e) { resolve({}); }
    });
    req.on('error', reject);
  });
}

const MIME = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml'
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,x-admin-password');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // Serve editor.html (no auth required — login overlay is inside the page)
  if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/editor.html')) {
    const html = fs.readFileSync(path.join(__dirname, 'editor.html'), 'utf8');
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
    return;
  }

  // All /api/* routes require auth
  if (url.pathname.startsWith('/api/') && !checkAuth(req)) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Unauthorized' }));
    return;
  }

  // Serve project image for editor preview
  // GET /api/image/:slug/:filename
  if (req.method === 'GET' && url.pathname.startsWith('/api/image/')) {
    const parts = url.pathname.replace('/api/image/', '').split('/');
    if (parts.length >= 2) {
      const slug = parts[0];
      const filename = path.basename(parts.slice(1).join('/'));
      const imgPath = path.join(__dirname, 'data', slug, 'images', filename);
      if (fs.existsSync(imgPath)) {
        const ext = path.extname(filename).toLowerCase();
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
        fs.createReadStream(imgPath).pipe(res);
        return;
      }
    }
    res.writeHead(404); res.end('Not found');
    return;
  }

  // List projects
  if (req.method === 'GET' && url.pathname === '/api/projects') {
    const dataDir = path.join(__dirname, 'data');
    let projects = [];
    if (fs.existsSync(dataDir)) {
      projects = fs.readdirSync(dataDir)
        .filter(f => f.endsWith('.json'))
        .map(f => {
          try {
            const d = JSON.parse(fs.readFileSync(path.join(dataDir, f), 'utf8'));
            return { slug: d.project_slug, name: d.project_name, file: f };
          } catch(e) { return null; }
        }).filter(Boolean);
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(projects));
    return;
  }

  // Load project data
  if (req.method === 'GET' && url.pathname.startsWith('/api/project/')) {
    const slug = url.pathname.replace('/api/project/', '');
    const jsonPath = path.join(__dirname, 'data', `${slug}.json`);
    if (!fs.existsSync(jsonPath)) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(fs.readFileSync(jsonPath, 'utf8'));
    return;
  }

  // Upload image
  // POST /api/upload  body: { slug, filename, data: base64 }
  if (req.method === 'POST' && url.pathname === '/api/upload') {
    let body;
    try { body = await parseBody(req); } catch(e) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
      return;
    }
    const { slug, filename, data } = body;
    try {
      if (!slug || !filename || !data) throw new Error('slug, filename and data are required');
      const safe = path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, '_');
      const imgDir = path.join(__dirname, 'data', slug, 'images');
      fs.mkdirSync(imgDir, { recursive: true });
      fs.writeFileSync(path.join(imgDir, safe), Buffer.from(data, 'base64'));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, path: `images/${safe}` }));
    } catch(e) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // Preview
  if (req.method === 'POST' && url.pathname === '/api/preview') {
    const data = await parseBody(req);
    try {
      const html = generateHTML(data);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
    } catch(e) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // Save project JSON + generate dist
  if (req.method === 'POST' && url.pathname === '/api/save') {
    const data = await parseBody(req);
    try {
      const slug = data.project_slug;
      if (!slug) throw new Error('project_slug is required');
      fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
      fs.writeFileSync(path.join(__dirname, 'data', `${slug}.json`), JSON.stringify(data, null, 2), 'utf8');
      const html = generateHTML(data);
      const distDir = path.join(__dirname, 'dist', slug);
      fs.mkdirSync(distDir, { recursive: true });
      fs.writeFileSync(path.join(distDir, 'index.html'), html, 'utf8');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, slug }));
    } catch(e) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // Deploy
  if (req.method === 'POST' && url.pathname === '/api/deploy') {
    const { slug } = await parseBody(req);
    try {
      const distPath = path.join(__dirname, 'dist', slug, 'index.html');
      if (!fs.existsSync(distPath)) throw new Error(`Run save first for ${slug}`);
      const html = fs.readFileSync(distPath, 'utf8');
      const result = await deploy(slug, html);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, ...result }));
    } catch(e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`\n🚀 Landing Generator running at http://localhost:${PORT}\n`);
  if (process.env.ADMIN_PASSWORD) {
    console.log(`🔒 Password protection: ON\n`);
  } else {
    console.log(`⚠️  No ADMIN_PASSWORD set — access is open\n`);
  }
});
