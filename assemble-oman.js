#!/usr/bin/env node
/**
 * Assemble a project JSON from research-agent output.
 * Usage: node assemble-oman.js <research.json> <slug> <template>
 * Writes data/<slug>.json ready for the editor / generateSite.
 */

const fs = require('fs');
const path = require('path');
const { generateSite } = require('./generate.js');

// Research agents sometimes return HTML entities in plain text — decode them
function cleanEntities(v) {
  if (typeof v === 'string') {
    return v.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&#x27;/g, "'").replace(/&nbsp;/g, ' ');
  }
  if (Array.isArray(v)) return v.map(cleanEntities);
  if (v && typeof v === 'object') {
    const out = {};
    for (const k of Object.keys(v)) out[k] = cleanEntities(v[k]);
    return out;
  }
  return v;
}

function assemble(research, slug, template) {
  research = cleanEntities(research);
  const r = research;
  const name = r.project_name;
  return {
    project_slug: slug,
    project_name: name,
    template: template,
    languages: ['en', 'ru'],
    currency: 'OMR',
    country_code: 'OM',
    meta_title: r.meta_title,
    meta_description: r.meta_description,
    canonical_url: '',            // set when the domain is bought
    crm_webhook: '',
    hero: {
      image: '',                  // fill via editor / Drive import
      title: r.hero.title,
      description: r.hero.description,
      stats: r.hero.stats || []
    },
    concept: {
      title: r.concept.title,
      paragraphs: r.concept.paragraphs || [],
      specs: r.concept.specs || [],
      image: ''
    },
    amenities: {
      title: r.amenities.title,
      image: '',
      items: (r.amenities.items || []).map(it => ({ title: it.title, description: it.description, image: '' }))
    },
    catalogue: { image: '', tags: r.catalogue && r.catalogue.tags || [] },
    layouts: (r.layouts || []).map(l => ({
      name: l.name, price_from: l.price_from, image: '', specs: l.specs || []
    })),
    roi: r.roi || null,
    gallery: { images: [] },
    location: {
      title: r.location.title,
      description: r.location.description,
      distances: r.location.distances || [],
      map_embed: ''
    },
    developer: {
      image: '',
      name: r.developer.name,
      description: r.developer.description,
      facts: r.developer.facts || []
    },
    contact: { phone: '', whatsapp: '', email: '', website: '' },
    sell_banner: { show: false, image: '', title: '', subtitle: '' },
    faq: r.faq || null,
    _sources: r.sources || []
  };
}

function validate(data) {
  const problems = [];
  const checkMl = (v, name) => {
    if (!v) { problems.push(`missing ${name}`); return; }
    if (typeof v === 'object' && (!v.en || !v.ru)) problems.push(`${name} incomplete: en=${!!v.en} ru=${!!v.ru}`);
  };
  checkMl(data.project_name, 'project_name');
  checkMl(data.meta_title, 'meta_title');
  checkMl(data.meta_description, 'meta_description');
  checkMl(data.hero.title, 'hero.title');
  if (!data.hero.stats || data.hero.stats.length < 3) problems.push('hero.stats < 3');
  if (!data.layouts || data.layouts.length < 2) problems.push('layouts < 2');
  if (!data.faq || !data.faq.items || data.faq.items.length < 4) problems.push('faq < 4');
  if (!data.amenities.items || data.amenities.items.length < 4) problems.push('amenities < 4');
  // Render both engines to make sure nothing throws
  const files = generateSite(data);
  ['index.html', 'ru/index.html'].forEach(p => {
    if (!files[p] || files[p].length < 10000) problems.push(`render ${p} too small`);
    if (files[p] && files[p].includes('[object Object]')) problems.push(`[object Object] in ${p}`);
  });
  return problems;
}

if (require.main === module) {
  const [srcPath, slug, template] = process.argv.slice(2);
  if (!srcPath || !slug || !template) {
    console.error('Usage: node assemble-oman.js <research.json> <slug> <template>');
    process.exit(1);
  }
  const research = JSON.parse(fs.readFileSync(srcPath, 'utf8'));
  const data = assemble(research, slug, template);
  const problems = validate(data);
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
  fs.writeFileSync(path.join(__dirname, 'data', slug + '.json'), JSON.stringify(data, null, 2), 'utf8');
  console.log(`✓ data/${slug}.json (template: ${template})`);
  if (problems.length) console.log('  ⚠ ' + problems.join('\n  ⚠ '));
}

module.exports = { assemble, validate };
