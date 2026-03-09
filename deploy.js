/**
 * Deploy a landing page:
 * 1. Creates GitHub repo (if not exists)
 * 2. Pushes index.html + images/
 * 3. Deploys to Vercel (with images)
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) return;
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const [key, ...vals] = line.split('=');
    if (key && vals.length) process.env[key.trim()] = vals.join('=').trim();
  });
}

function apiRequest(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch(e) { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
    req.end();
  });
}

async function githubRequest(method, reqPath, body, token) {
  const opts = {
    hostname: 'api.github.com',
    path: reqPath,
    method,
    headers: {
      'Authorization': `token ${token}`,
      'User-Agent': 'landing-generator',
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.github.v3+json'
    }
  };
  return apiRequest(opts, body);
}

async function createGitHubRepo(slug, token, username) {
  const check = await githubRequest('GET', `/repos/${username}/${slug}`, null, token);
  if (check.status === 200) {
    console.log(`  GitHub repo already exists: ${username}/${slug}`);
    return check.body;
  }
  const res = await githubRequest('POST', '/user/repos', {
    name: slug,
    description: `Landing page for ${slug}`,
    private: false,
    auto_init: false
  }, token);
  if (res.status === 201) {
    console.log(`  ✓ GitHub repo created: ${username}/${slug}`);
    return res.body;
  }
  throw new Error(`Failed to create GitHub repo: ${JSON.stringify(res.body)}`);
}

// content can be a string or Buffer
async function pushFileToGitHub(slug, filePath, content, token, username) {
  const encoded = Buffer.isBuffer(content)
    ? content.toString('base64')
    : Buffer.from(content).toString('base64');
  // Check if file exists (need sha for update)
  const check = await githubRequest('GET', `/repos/${username}/${slug}/contents/${filePath}`, null, token);
  const sha = check.status === 200 ? check.body.sha : undefined;
  const body = { message: `Update ${filePath}`, content: encoded };
  if (sha) body.sha = sha;
  const res = await githubRequest('PUT', `/repos/${username}/${slug}/contents/${filePath}`, body, token);
  if (res.status === 200 || res.status === 201) {
    console.log(`  ✓ Pushed ${filePath} to GitHub`);
    return res.body;
  }
  throw new Error(`Failed to push ${filePath}: ${JSON.stringify(res.body)}`);
}

async function vercelDeploy(slug, htmlContent, token) {
  // Build files list: index.html + any local images
  const files = [{ file: 'index.html', data: htmlContent }];

  const imagesDir = path.join(__dirname, 'data', slug, 'images');
  if (fs.existsSync(imagesDir)) {
    for (const fname of fs.readdirSync(imagesDir)) {
      const buf = fs.readFileSync(path.join(imagesDir, fname));
      files.push({ file: `images/${fname}`, data: buf.toString('base64'), encoding: 'base64' });
    }
  }

  const body = JSON.stringify({
    name: slug,
    files,
    projectSettings: { framework: null },
    target: 'production'
  });

  const opts = {
    hostname: 'api.vercel.com',
    path: '/v13/deployments',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body)
    }
  };

  const res = await apiRequest(opts, body);
  if (res.status === 200 || res.status === 201) {
    console.log(`  ✓ Deployed to Vercel: https://${res.body.url}`);
    return res.body;
  }
  throw new Error(`Vercel deploy failed: ${JSON.stringify(res.body)}`);
}

async function deploy(slug, htmlContent) {
  loadEnv();
  const token = process.env.GITHUB_TOKEN;
  const vercelToken = process.env.VERCEL_TOKEN;
  const username = process.env.GITHUB_USERNAME || 'bogatenkov-cpu';

  if (!token) throw new Error('GITHUB_TOKEN not set in .env');
  if (!vercelToken) throw new Error('VERCEL_TOKEN not set in .env');

  console.log(`\nDeploying ${slug}...`);

  // GitHub: create repo + push index.html
  await createGitHubRepo(slug, token, username);
  await new Promise(r => setTimeout(r, 2000));
  await pushFileToGitHub(slug, 'index.html', htmlContent, token, username);

  // GitHub: push local images if any
  const imagesDir = path.join(__dirname, 'data', slug, 'images');
  if (fs.existsSync(imagesDir)) {
    for (const fname of fs.readdirSync(imagesDir)) {
      const buf = fs.readFileSync(path.join(imagesDir, fname));
      await pushFileToGitHub(slug, `images/${fname}`, buf, token, username);
    }
  }

  // Vercel: deploy with images
  const deployment = await vercelDeploy(slug, htmlContent, vercelToken);
  const deployUrl = `https://${deployment.url}`;

  console.log(`\n✅ Done! ${slug} is live at: ${deployUrl}`);
  console.log(`   GitHub: https://github.com/${username}/${slug}`);
  console.log(`   Vercel: ${deployUrl}\n`);

  return { deployUrl, githubUrl: `https://github.com/${username}/${slug}` };
}

module.exports = { deploy };

// CLI: node deploy.js anava-samui
if (require.main === module) {
  const slug = process.argv[2];
  if (!slug) { console.error('Usage: node deploy.js <slug>'); process.exit(1); }
  const distPath = path.join(__dirname, 'dist', slug, 'index.html');
  if (!fs.existsSync(distPath)) {
    console.error(`No dist found for ${slug}. Run generate.js first.`);
    process.exit(1);
  }
  const html = fs.readFileSync(distPath, 'utf8');
  deploy(slug, html).catch(err => { console.error(err.message); process.exit(1); });
}
