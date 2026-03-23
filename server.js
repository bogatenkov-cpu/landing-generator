/**
 * Landing Generator Server
 * node server.js → http://localhost:3333
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { generateHTML, TEMPLATES } = require('./generate.js');
const { deploy } = require('./deploy.js');

const PORT = process.env.PORT || 3333;

// Validate slug: only lowercase letters, digits, dashes
function isValidSlug(slug) {
  return typeof slug === 'string' && /^[a-z0-9][a-z0-9-]{0,100}$/.test(slug);
}

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
      try { resolve(JSON.parse(body)); } catch(e) { reject(new Error('Invalid JSON body')); }
    });
    req.on('error', reject);
  });
}

const MIME = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml'
};

const https = require('https');

function claudeRequest(body, apiKey) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request({
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      timeout: 120000
    }, res => {
      let buf = '';
      res.on('data', chunk => buf += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(buf)); }
        catch(e) { reject(new Error('Claude API parse error: ' + buf.slice(0, 200))); }
      });
    });
    req.on('timeout', () => { req.destroy(); reject(new Error('Claude API timeout (120s)')); });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Domain name suggestion generator
function generateDomainSuggestions(projectName, location) {
  var slug = projectName.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  var locSlug = location ? location.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') : '';

  var words = slug.split('-').filter(Boolean);
  var domains = [];

  // Base: project-name.com
  domains.push(slug + '.com');

  // project-location.com
  if (locSlug && locSlug !== slug) {
    domains.push(slug + '-' + locSlug + '.com');
  }

  // projectname.com (no hyphens)
  var nohyphen = words.join('');
  if (nohyphen !== slug) domains.push(nohyphen + '.com');

  // project-thailand.com, project-phuket.com etc.
  var thaiLocations = ['thailand', 'phuket', 'samui', 'bangkok', 'pattaya', 'chiangmai', 'krabi', 'huahin'];
  var hasLoc = thaiLocations.some(function(l) { return slug.includes(l); });
  if (!hasLoc) {
    if (locSlug && !slug.includes(locSlug)) {
      domains.push(slug + '-' + locSlug + '.com');
    }
    domains.push(slug + '-thailand.com');
  }

  // Buy/invest prefixes
  domains.push('buy-' + slug + '.com');
  domains.push('invest-' + slug + '.com');

  // With "villas/residences" suffix
  if (!slug.includes('villa') && !slug.includes('residence')) {
    domains.push(slug + '-villas.com');
    domains.push(slug + '-residences.com');
  }

  // Short: first word + location
  if (words.length > 1 && locSlug) {
    domains.push(words[0] + '-' + locSlug + '.com');
  }

  // Property/realestate suffix
  domains.push(slug + '-property.com');

  // Deduplicate
  var seen = {};
  return domains.filter(function(d) {
    if (seen[d]) return false;
    seen[d] = true;
    return true;
  }).slice(0, 10);
}

async function aiFillProject(query, apiKey, languages) {
  languages = languages && languages.length ? languages : ['en'];
  const multiLang = languages.length > 1;

  const jsonSchema = JSON.stringify({
    project_slug: "lowercase-dash-name",
    project_name: "Display Name",
    languages: languages,
    meta_title: multiLang ? {en: "SEO title EN", ru: "SEO заголовок"} : "SEO title",
    meta_description: multiLang ? {en: "SEO desc EN", ru: "SEO описание"} : "SEO description",
    crm_webhook: "",
    hero: {
      image: "URL",
      title: multiLang ? {en: "Main heading", ru: "Главный заголовок"} : "Main heading",
      description: multiLang ? {en: "2-3 sentences", ru: "2-3 предложения"} : "2-3 sentences",
      stats: [{ value: multiLang ? {en: "From $X", ru: "От $X"} : "From $X", label: multiLang ? {en: "Starting Price", ru: "Цена от"} : "Starting Price" }]
    },
    concept: {
      title: multiLang ? {en: "Section title", ru: "Название секции"} : "Section title",
      paragraphs: multiLang ? [{en: "paragraph EN with <strong>bold</strong>", ru: "параграф RU с <strong>выделением</strong>"}] : ["paragraph with <strong>bold</strong>"],
      specs: [{ key: multiLang ? {en: "Location", ru: "Расположение"} : "Location", value: multiLang ? {en: "Area Name", ru: "Название района"} : "Area Name" }]
    },
    sell_banner: { image: "", title: "", subtitle: "", show: false },
    amenities: {
      image: "URL",
      title: multiLang ? {en: "World-Class Amenities", ru: "Инфраструктура мирового класса"} : "World-Class Amenities",
      items: multiLang ? [{en: "amenity EN", ru: "удобство RU"}] : ["amenity"]
    },
    catalogue: { image: "", tags: multiLang ? [{en: "Floor Plans", ru: "Планировки"}] : ["Floor Plans", "Pricing"] },
    layouts: [{
      name: multiLang ? {en: "Studio", ru: "Студия"} : "Studio",
      price_from: "$105,000",
      specs: [{ key: multiLang ? {en: "Unit Size", ru: "Площадь"} : "Unit Size", value: "28-29 m²" }]
    }],
    roi: {
      title: multiLang ? {en: "Investment Returns", ru: "Доходность инвестиций"} : "Investment Returns",
      rows: [{ type: "Studio", size: "28 m²", price: "$105,000", roi: "6%", annual_income: "$6,300" }]
    },
    gallery: { images: ["URL1", "URL2"] },
    location: {
      title: multiLang ? {en: "Prime Location", ru: "Расположение"} : "Prime Location",
      description: multiLang ? {en: "Location desc EN", ru: "Описание расположения"} : "Location description",
      distances: [{ place: multiLang ? {en: "Airport", ru: "Аэропорт"} : "Airport", time: multiLang ? {en: "15 min", ru: "15 мин"} : "15 min" }],
      map_embed: "https://www.google.com/maps/embed?..."
    },
    developer: {
      image: "URL",
      name: "Developer Name",
      description: multiLang ? {en: "About developer EN", ru: "О застройщике"} : "About developer",
      facts: [{ key: multiLang ? {en: "Founded", ru: "Основан"} : "Founded", value: "2010" }]
    },
    contact: { address: "Address", email: "email@example.com", website: "www.example.com" }
  });

  const langInstruction = multiLang
    ? `- ALL text fields must be objects with keys for each language: ${JSON.stringify(languages)} (e.g. {"en": "English text", "ru": "Русский текст"})
- Write natural, professional text in each language (not machine translation)
- project_slug, project_name, images, URLs, prices, map_embed stay as plain strings`
    : '- Write all text in English';

  const prompt = `You are a real estate data researcher for Tranio (international real estate broker).
The user wants to create a landing page for a property development project.

Search the web for information about this project: "${query}"

Find: project name, location, developer, pricing, unit types/layouts, amenities, ROI/rental yields, gallery images, nearby landmarks with distances, and developer background.

Return a JSON object matching this exact schema (fill in as many fields as possible with real data found online):
${jsonSchema}

IMPORTANT RULES:
- project_slug should be lowercase with dashes (e.g. "anava-samui")
- For hero.stats provide exactly 4 items (e.g. starting price, ROI, completion date, total units)
- For concept.paragraphs provide 2-3 paragraphs with <strong> tags for key facts
- For concept.specs provide 5-8 key project specifications
- For amenities.items provide 8-12 amenities
- For layouts provide all available unit types with specs (size, bedrooms, bathrooms, view, furnishing)
- For roi.rows provide data for each unit type if available
- For gallery.images use real image URLs from official project website or developer site
- For location.distances provide 5-8 nearby places with drive/walk times
- For developer.facts provide 4-6 facts
- For map_embed create a Google Maps embed URL for the project location
- All prices in USD
${langInstruction}
- If you cannot find specific data, make a reasonable estimate based on similar projects in the area and mark with [estimated]

Return ONLY the JSON object, no markdown, no explanation.`;

  let response = await claudeRequest({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: multiLang ? 16000 : 8000,
    tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 10 }],
    messages: [{ role: 'user', content: prompt }]
  }, apiKey);

  if (response.error) {
    throw new Error('Claude API: ' + (response.error.message || JSON.stringify(response.error)));
  }

  // web_search is a server-side tool — Anthropic executes it automatically
  // The response may contain search results + text, or just text
  // Extract all text blocks from the final response
  let text = '';
  if (response.content) {
    for (const block of response.content) {
      if (block.type === 'text') text += block.text;
    }
  }

  // Parse JSON from response
  text = text.trim();
  // Remove markdown code fences if present
  if (text.startsWith('```')) {
    text = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }

  try {
    return JSON.parse(text);
  } catch(e) {
    // Try to extract JSON from text
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('Could not parse AI response as JSON');
  }
}

const server = http.createServer(async (req, res) => {
 try {
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
      if (!isValidSlug(slug)) { res.writeHead(400); res.end('Invalid slug'); return; }
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

  // List templates
  if (req.method === 'GET' && url.pathname === '/api/templates') {
    const list = Object.values(TEMPLATES).map(t => ({ id: t.id, name: t.name, description: t.description, colors: t.colors }));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(list));
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
    if (!isValidSlug(slug)) { res.writeHead(400, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: 'Invalid slug' })); return; }
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
      if (!isValidSlug(slug)) throw new Error('Invalid slug format');
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

  // Fetch image from URL and save to project folder
  // POST /api/fetch-image  body: { slug, url, filename }
  if (req.method === 'POST' && url.pathname === '/api/fetch-image') {
    let body;
    try { body = await parseBody(req); } catch(e) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message })); return;
    }
    const { slug, url: imageUrl, filename } = body;
    try {
      if (!slug || !imageUrl) throw new Error('slug and url are required');
      if (!isValidSlug(slug)) throw new Error('Invalid slug format');
      // Determine filename from URL or use provided one
      var fname = filename || path.basename(new URL(imageUrl).pathname) || 'image.jpg';
      fname = fname.replace(/[^a-zA-Z0-9._-]/g, '_');
      if (!fname.match(/\.(jpg|jpeg|png|gif|webp|svg|avif)$/i)) fname += '.jpg';
      // Fetch the image
      const proto = imageUrl.startsWith('https') ? https : require('http');
      const imgData = await new Promise(function(resolve, reject) {
        var chunks = [];
        var request = proto.get(imageUrl, { timeout: 30000 }, function(response) {
          if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
            // Follow redirect
            var rProto = response.headers.location.startsWith('https') ? https : require('http');
            rProto.get(response.headers.location, { timeout: 30000 }, function(r2) {
              r2.on('data', function(c) { chunks.push(c); });
              r2.on('end', function() { resolve(Buffer.concat(chunks)); });
              r2.on('error', reject);
            }).on('error', reject);
            return;
          }
          if (response.statusCode !== 200) {
            reject(new Error('HTTP ' + response.statusCode));
            return;
          }
          response.on('data', function(c) { chunks.push(c); });
          response.on('end', function() { resolve(Buffer.concat(chunks)); });
          response.on('error', reject);
        });
        request.on('error', reject);
        request.on('timeout', function() { request.destroy(); reject(new Error('Timeout')); });
      });
      var imgDir = path.join(__dirname, 'data', slug, 'images');
      fs.mkdirSync(imgDir, { recursive: true });
      fs.writeFileSync(path.join(imgDir, fname), imgData);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, path: 'images/' + fname, size: imgData.length }));
    } catch(e) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // Preview
  if (req.method === 'POST' && url.pathname === '/api/preview') {
    let data;
    try { data = await parseBody(req); } catch(e) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message })); return;
    }
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
    let data;
    try { data = await parseBody(req); } catch(e) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message })); return;
    }
    try {
      const slug = data.project_slug;
      if (!slug) throw new Error('project_slug is required');
      if (!isValidSlug(slug)) throw new Error('Invalid slug format (lowercase letters, digits, dashes only)');
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

  // Suggest SEO domain names
  if (req.method === 'POST' && url.pathname === '/api/suggest-domains') {
    let body;
    try { body = await parseBody(req); } catch(e) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message })); return;
    }
    const { project_name, location } = body;
    if (!project_name) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'project_name is required' })); return;
    }
    const domains = generateDomainSuggestions(project_name, location || '');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, domains: domains }));
    return;
  }

  // AI Fill — Claude with web search
  if (req.method === 'POST' && url.pathname === '/api/ai-fill') {
    let body;
    try { body = await parseBody(req); } catch(e) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message })); return;
    }
    const { query, languages } = body;
    try {
      if (!query) throw new Error('query is required (project name or URL)');
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set');
      const result = await aiFillProject(query, apiKey, languages);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, data: result }));
    } catch(e) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // Deploy
  if (req.method === 'POST' && url.pathname === '/api/deploy') {
    let body;
    try { body = await parseBody(req); } catch(e) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message })); return;
    }
    const { slug } = body;
    try {
      if (!isValidSlug(slug)) throw new Error('Invalid slug format');
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
 } catch(e) {
  console.error('Unhandled error:', e.message);
  if (!res.headersSent) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
 }
});

server.listen(PORT, () => {
  console.log(`\n🚀 Landing Generator running at http://localhost:${PORT}\n`);
  console.log(`🔑 ANTHROPIC_API_KEY: ${process.env.ANTHROPIC_API_KEY ? 'SET' : 'NOT SET'}`);
  if (process.env.ADMIN_PASSWORD) {
    console.log(`🔒 Password protection: ON\n`);
  } else {
    console.log(`⚠️  No ADMIN_PASSWORD set — access is open\n`);
  }
});
