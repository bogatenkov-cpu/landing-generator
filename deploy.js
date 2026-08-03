/**
 * Deploy a landing site to Cloudflare Pages:
 * 1. Ensures the Pages project exists
 * 2. Copies uploaded images into dist/<slug>/images/
 * 3. Uploads dist/<slug>/ via wrangler (direct upload)
 * 4. Attaches a custom domain and creates the DNS record when the
 *    zone lives in the same Cloudflare account
 *
 * Env: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) return;
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const [key, ...vals] = line.split('=');
    if (key && vals.length && !process.env[key.trim()]) process.env[key.trim()] = vals.join('=').trim();
  });
}

function cfRequest(method, apiPath, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: 'api.cloudflare.com',
      path: '/client/v4' + apiPath,
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }, res => {
      let buf = '';
      res.on('data', c => buf += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(buf) }); }
        catch(e) { resolve({ status: res.statusCode, body: buf }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function ensureProject(slug, token, accountId) {
  const check = await cfRequest('GET', `/accounts/${accountId}/pages/projects/${slug}`, null, token);
  if (check.status === 200) return check.body.result;
  const res = await cfRequest('POST', `/accounts/${accountId}/pages/projects`, {
    name: slug,
    production_branch: 'main'
  }, token);
  if (res.status === 200 || res.status === 201) {
    console.log(`  ✓ Cloudflare Pages project created: ${slug}`);
    return res.body.result;
  }
  throw new Error(`Failed to create Pages project: ${JSON.stringify(res.body.errors || res.body)}`);
}

// Copy uploaded project images into the dist folder so wrangler uploads them
function copyImages(slug) {
  const srcDir = path.join(__dirname, 'data', slug, 'images');
  const destDir = path.join(__dirname, 'dist', slug, 'images');
  if (!fs.existsSync(srcDir)) return 0;
  fs.mkdirSync(destDir, { recursive: true });
  let count = 0;
  for (const fname of fs.readdirSync(srcDir)) {
    fs.copyFileSync(path.join(srcDir, fname), path.join(destDir, fname));
    count++;
  }
  return count;
}

function runWrangler(args) {
  return new Promise((resolve, reject) => {
    const child = spawn('npx', ['--yes', 'wrangler', ...args], {
      cwd: __dirname,
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe']
    });
    let out = '', err = '';
    child.stdout.on('data', c => { out += c; });
    child.stderr.on('data', c => { err += c; });
    child.on('error', reject);
    child.on('close', code => {
      if (code === 0) resolve(out + err);
      else reject(new Error(`wrangler exited with code ${code}: ${(err || out).slice(-2000)}`));
    });
  });
}

// Attach custom domain to the Pages project; create DNS record if we own the zone
async function attachDomain(slug, domain, token, accountId) {
  const result = { domain, attached: false, dnsConfigured: false, instructions: null };

  const existing = await cfRequest('GET', `/accounts/${accountId}/pages/projects/${slug}/domains`, null, token);
  const already = existing.status === 200 && (existing.body.result || []).some(d => d.name === domain);
  if (!already) {
    const res = await cfRequest('POST', `/accounts/${accountId}/pages/projects/${slug}/domains`, { name: domain }, token);
    if (res.status !== 200 && res.status !== 201) {
      result.instructions = `Could not attach domain: ${JSON.stringify(res.body.errors || res.body)}`;
      return result;
    }
    console.log(`  ✓ Domain attached to Pages project: ${domain}`);
  }
  result.attached = true;

  // Zone = last two labels (works for .com/.net etc.)
  const apex = domain.split('.').slice(-2).join('.');
  const zones = await cfRequest('GET', `/zones?name=${apex}`, null, token);
  const zone = zones.status === 200 && zones.body.result && zones.body.result[0];
  const target = `${slug}.pages.dev`;

  if (zone) {
    const recs = await cfRequest('GET', `/zones/${zone.id}/dns_records?type=CNAME&name=${domain}`, null, token);
    const rec = recs.status === 200 && recs.body.result && recs.body.result[0];
    const payload = { type: 'CNAME', name: domain, content: target, proxied: true, ttl: 1 };
    const res = rec
      ? await cfRequest('PUT', `/zones/${zone.id}/dns_records/${rec.id}`, payload, token)
      : await cfRequest('POST', `/zones/${zone.id}/dns_records`, payload, token);
    if (res.status === 200 || res.status === 201) {
      result.dnsConfigured = true;
      console.log(`  ✓ DNS record: ${domain} CNAME ${target} (proxied)`);
    } else {
      result.instructions = `Zone found but DNS record failed: ${JSON.stringify(res.body.errors || res.body)}`;
    }
  } else {
    result.instructions = `Domain zone "${apex}" is not in this Cloudflare account. ` +
      `Either add the site to Cloudflare (recommended: point registrar nameservers to Cloudflare), ` +
      `or create a CNAME record: ${domain} → ${target}`;
  }
  return result;
}

async function deploy(slug, opts) {
  loadEnv();
  opts = opts || {};
  const token = process.env.CLOUDFLARE_API_TOKEN;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  if (!token) throw new Error('CLOUDFLARE_API_TOKEN not set (Railway env vars / .env)');
  if (!accountId) throw new Error('CLOUDFLARE_ACCOUNT_ID not set (Railway env vars / .env)');

  const distDir = path.join(__dirname, 'dist', slug);
  if (!fs.existsSync(path.join(distDir, 'index.html'))) {
    throw new Error(`No dist for ${slug}. Save the project first.`);
  }

  console.log(`\nDeploying ${slug} to Cloudflare Pages...`);
  await ensureProject(slug, token, accountId);
  const imgCount = copyImages(slug);
  if (imgCount) console.log(`  ✓ ${imgCount} images copied to dist`);

  const output = await runWrangler([
    'pages', 'deploy', distDir,
    '--project-name', slug,
    '--branch', 'main',
    '--commit-dirty=true'
  ]);
  const urlMatch = output.match(/https:\/\/[a-z0-9-]+\.[a-z0-9-]+\.pages\.dev/i);
  const pagesUrl = `https://${slug}.pages.dev`;
  console.log(`  ✓ Deployed: ${urlMatch ? urlMatch[0] : pagesUrl}`);

  let domainResult = null;
  if (opts.domain) {
    try {
      domainResult = await attachDomain(slug, opts.domain, token, accountId);
    } catch(e) {
      domainResult = { domain: opts.domain, attached: false, dnsConfigured: false, instructions: `Domain setup error: ${e.message}` };
    }
  }

  const deployUrl = domainResult && domainResult.attached ? `https://${opts.domain}` : pagesUrl;
  console.log(`\n✅ Done! ${slug} is live at: ${deployUrl}\n`);
  return { deployUrl, pagesUrl, domain: domainResult };
}

module.exports = { deploy };

// CLI: node deploy.js <slug> [domain]
if (require.main === module) {
  const slug = process.argv[2];
  if (!slug) { console.error('Usage: node deploy.js <slug> [domain]'); process.exit(1); }
  deploy(slug, { domain: process.argv[3] || null })
    .catch(err => { console.error(err.message); process.exit(1); });
}
