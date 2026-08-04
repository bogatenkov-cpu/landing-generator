#!/usr/bin/env node
/**
 * QA checker for landing projects — enforces LANDING_RULES.md.
 * Usage:
 *   node qa-check.js <slug>       — check one project
 *   node qa-check.js --all        — check every project in data/
 * Exit code 1 if any ERROR-level problems found.
 *
 * Also exported as runQA(data, baseDir) for server-side use on save.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { generateSite } = require('./generate.js');

// ── helpers ────────────────────────────────────────────────────────
function words(s) { return String(s || '').trim().split(/\s+/).filter(Boolean).length; }

function mlIncomplete(v, langs) {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return false;
  if (!('en' in v) && !('ru' in v)) return false; // not a multilang object
  return langs.some(l => !String(v[l] || '').trim());
}

// Walk data and report multilang objects missing a language
function checkLangCompleteness(obj, langs, trail, out) {
  if (!obj || typeof obj !== 'object') return;
  if (!Array.isArray(obj) && ('en' in obj || 'ru' in obj)) {
    if (mlIncomplete(obj, langs)) out.push(trail);
    return;
  }
  for (const [k, v] of Object.entries(obj)) {
    if (k.startsWith('_')) continue;
    checkLangCompleteness(v, langs, trail ? trail + '.' + k : k, out);
  }
}

// Collect every image reference with its slot name
function collectImageSlots(d) {
  const slots = [];
  const add = (slot, val) => { if (val && typeof val === 'string') slots.push({ slot, file: val }); };
  add('hero.image', d.hero && d.hero.image);
  add('concept.image', d.concept && d.concept.image);
  add('amenities.image', d.amenities && d.amenities.image);
  (d.amenities && d.amenities.items || []).forEach((it, i) => add(`amenities.items[${i}]`, it.image));
  add('catalogue.image', d.catalogue && d.catalogue.image);
  (d.layouts || []).forEach((l, i) => add(`layouts[${i}]`, l.image));
  (d.gallery && d.gallery.images || []).forEach((g, i) => add(`gallery[${i}]`, typeof g === 'string' ? g : g && g.url));
  add('developer.image', d.developer && d.developer.image);
  add('sell_banner.image', d.sell_banner && d.sell_banner.image);
  return slots;
}

// ── main QA ────────────────────────────────────────────────────────
// Returns array of {level: 'error'|'warn', rule, message}
function runQA(d, baseDir) {
  const out = [];
  const err = (rule, message) => out.push({ level: 'error', rule, message });
  const warn = (rule, message) => out.push({ level: 'warn', rule, message });
  const langs = d.languages && d.languages.length ? d.languages : ['en'];

  // R1. Language completeness — every multilang field filled for all langs
  const gaps = [];
  checkLangCompleteness(d, langs, '', gaps);
  gaps.forEach(g => err('R1-langs', `Не заполнены все языки (${langs.join('/')}) в поле: ${g}`));

  // R2. Meta lengths
  const mt = d.meta_title || {};
  const mdesc = d.meta_description || {};
  for (const l of langs) {
    if (mt[l] && mt[l].length > 65) warn('R2-meta', `meta_title.${l} длиннее 65 символов (${mt[l].length})`);
    if (mdesc[l] && mdesc[l].length > 160) warn('R2-meta', `meta_description.${l} длиннее 160 символов (${mdesc[l].length})`);
  }

  // R3. Hero title ≤ 8 words
  const ht = d.hero && d.hero.title || {};
  for (const l of langs) {
    if (words(ht[l]) > 8) warn('R3-hero', `hero.title.${l} длиннее 8 слов (${words(ht[l])})`);
  }
  if (!d.hero || !d.hero.stats || d.hero.stats.length < 3) warn('R3-hero', 'hero.stats меньше 3 — блок статистики будет пустоват');

  // R4. Sections minimums
  if (!d.layouts || d.layouts.length < 2) err('R4-sections', 'Меньше 2 планировок (layouts)');
  if (!d.faq || !d.faq.items || d.faq.items.length < 4) warn('R4-sections', 'FAQ меньше 4 вопросов — слабо для SEO-сниппетов');
  if (!d.amenities || !d.amenities.items || d.amenities.items.length < 4) warn('R4-sections', 'Меньше 4 удобств (amenities)');

  // R5. Images — required slots
  const slots = collectImageSlots(d);
  const heroImg = d.hero && d.hero.image;
  if (!heroImg) err('R5-images', 'Нет hero-картинки — лендинг без обложки публиковать нельзя');
  const galleryCount = (d.gallery && d.gallery.images || []).filter(Boolean).length;
  if (galleryCount === 0) warn('R5-images', 'Галерея пуста — секция будет скрыта');
  else if (galleryCount < 4) warn('R5-images', `В галерее только ${galleryCount} фото (рекомендуется ≥4)`);

  // R6. Layouts: у всех есть картинка или ни у одной (никаких вперемешку)
  const layoutImgs = (d.layouts || []).map(l => !!l.image);
  if (layoutImgs.some(Boolean) && !layoutImgs.every(Boolean)) {
    err('R6-uniform', 'Картинки планировок вперемешку: либо у всех, либо ни у одной');
  }
  // R6b. Amenities: то же правило
  const amenityImgs = (d.amenities && d.amenities.items || []).map(it => !!it.image);
  if (amenityImgs.some(Boolean) && !amenityImgs.every(Boolean)) {
    err('R6-uniform', 'Картинки удобств вперемешку: либо у всех карточек, либо ни у одной');
  }

  // R7. Image files exist + no duplicates (by content hash — ловит копии под разными именами)
  if (baseDir) {
    const slugDir = path.join(baseDir, d.project_slug);
    const hashes = {};
    for (const { slot, file } of slots) {
      if (/^https?:/.test(file)) { warn('R7-files', `${slot}: внешний URL (${file.slice(0, 60)}…) — может протухнуть, лучше загрузить файл`); continue; }
      const p = path.join(slugDir, file.replace(/^\//, ''));
      if (!fs.existsSync(p)) { err('R7-files', `${slot}: файл не найден (${file})`); continue; }
      const h = crypto.createHash('md5').update(fs.readFileSync(p)).digest('hex');
      if (hashes[h]) err('R7-dupes', `Одинаковая картинка в двух слотах: ${hashes[h]} и ${slot} (${file})`);
      else hashes[h] = slot;
      const kb = fs.statSync(p).size / 1024;
      if (kb > 1200) warn('R7-files', `${slot}: файл ${Math.round(kb)}KB — тяжеловато, сожмите до ≤1MB`);
    }
  }

  // R8. Prices: должны содержать валюту и не быть голыми числами
  (d.layouts || []).forEach((l, i) => {
    const pf = l.price_from || {};
    for (const lang of langs) {
      const v = typeof pf === 'object' ? pf[lang] : pf;
      if (v && !/OMR|AED|USD|\$|€|запрос|request/i.test(v)) {
        warn('R8-prices', `layouts[${i}].price_from.${lang}: цена без валюты («${String(v).slice(0, 30)}»)`);
      }
    }
  });

  // R9. ROI/инвест-блок с прогнозами должен иметь дисклеймер
  if (d.roi && d.roi.rows && d.roi.rows.length && !(d.roi.disclaimer && Object.values(d.roi.disclaimer).some(v => String(v).trim()))) {
    err('R9-disclaimer', 'Инвест-таблица без дисклеймера — обязателен для прогнозов/цен');
  }

  // R10. Источники данных зафиксированы
  if (!d._sources || !d._sources.length) warn('R10-sources', 'Нет _sources — откуда взяты цены и факты?');

  // R11. Canonical URL — без него нет canonical, hreflang и sitemap
  if (!String(d.canonical_url || d.custom_domain || '').trim()) {
    err('R11-canonical', 'Пустой canonical_url — страница уйдёт без canonical, hreflang и sitemap');
  }

  // R12. Проверка отрендеренной страницы: пустые слоты и пустые контейнеры
  // ловят рассинхрон «шаблон ждёт одни поля, генератор отдаёт другие»
  try {
    const html = generateSite(d)['index.html'] || '';
    // слот вида <span class="location__distance-name"></span> — данные не доехали
    const emptySlots = {};
    const slotRe = /<(span|div|td|li|h3|p)\s+class="([^"]+)"\s*>\s*<\/\1>/g;
    let m;
    while ((m = slotRe.exec(html))) {
      const cls = m[2].split(/\s+/)[0];
      emptySlots[cls] = (emptySlots[cls] || 0) + 1;
    }
    // декоративные пустышки (разделители, бургер, подложки модалок) — норма
    const DECOR = /divider|burger|backdrop|overlay|line|dot|arrow|scroll|spacer|shape|blur|glow|bar\b|__bg|pattern/i;
    // необязательные текстовые слоты — предупреждение, не блокер
    const OPTIONAL = /-desc$|__desc$|-subtitle$|__subtitle$|-note$/i;
    Object.entries(emptySlots)
      .filter(([cls, n]) => n >= 2 && !DECOR.test(cls))
      .forEach(([cls, n]) => {
        const msg = `Пустые слоты в вёрстке: ${cls} × ${n} — данные не доехали до шаблона`;
        OPTIONAL.test(cls) ? warn('R12-render', msg) : err('R12-render', msg);
      });
    // контейнер цикла, в который не попало ни одного элемента
    const containerRe = /<div\s+class="([^"]*(?:__list|__grid|__items|__highlights|__distances|__cards)[^"]*)"\s*>\s*<\/div>/g;
    while ((m = containerRe.exec(html))) {
      err('R12-render', `Пустой контейнер: ${m[1].split(/\s+/)[0]} — цикл не получил данных`);
    }
    // телефонный код не из страны проекта
    const dialByCountry = { OM: '+968', TH: '+66', AE: '+971', SA: '+966', QA: '+974', BH: '+973', KW: '+965' };
    const expected = dialByCountry[schemaCountryOf(d)];
    if (expected) {
      const foreign = Object.entries(dialByCountry)
        .filter(([, code]) => code !== expected && html.includes(code + ' '))
        .map(([, code]) => code);
      if (foreign.length) warn('R12-render', `Чужие телефонные коды на странице: ${[...new Set(foreign)].join(', ')} (ожидался ${expected})`);
    }
    // R13. Секция ≈ один экран. Точную высоту без браузера не измерить,
    // но перегруз контентом виден по объёму: считаем «вес» секции.
    const SECTION_BUDGET = { concept: 900, location: 900, amenities: 1300, investment: 1200, developer: 800, faq: 2600 };
    Object.entries(SECTION_BUDGET).forEach(([id, budget]) => {
      const m = new RegExp('<section[^>]*id="' + id + '"[\\s\\S]*?</section>').exec(html);
      if (!m) return;
      const text = m[0].replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      // грубая оценка объёма; у FAQ ответы свёрнуты в аккордеон, поэтому бюджет выше
      if (text.length > budget) {
        warn('R13-height', `Секция «${id}» перегружена текстом (${text.length} симв. при бюджете ${budget}) — вероятно, вылезет за один экран`);
      }
    });

    // R14. Галерея должна быть слайдером (>3 фото в сетке растянут страницу)
    const galCount = (d.gallery && d.gallery.images || []).filter(Boolean).length;
    if (galCount > 3 && !html.includes('gal-wrap') && !html.includes('gal-nav')) {
      warn('R14-gallery', `${galCount} фото в галерее без слайдера — секция растянется`);
    }

    // R15. Карточка менеджера в контактах
    if (!(d.contact && d.contact.manager && (d.contact.manager.name || d.contact.manager.photo))) {
      warn('R15-manager', 'Нет карточки менеджера в контактах (contact.manager) — форма без живого человека конвертит хуже');
    }
  } catch (e) {
    warn('R12-render', 'Не удалось отрендерить страницу для проверки: ' + e.message);
  }

  return out;
}

// Страна проекта: явный country_code, иначе по валюте
function schemaCountryOf(d) {
  if (d.country_code) return d.country_code;
  return { THB: 'TH', OMR: 'OM', AED: 'AE', SAR: 'SA', QAR: 'QA', BHD: 'BH', KWD: 'KW' }[d.currency] || '';
}

// ── CLI ────────────────────────────────────────────────────────────
if (require.main === module) {
  const dataDir = path.join(__dirname, 'data');
  const args = process.argv.slice(2);
  const slugs = args.includes('--all')
    ? fs.readdirSync(dataDir).filter(f => f.endsWith('.json') && !f.includes('demo')).map(f => f.replace('.json', ''))
    : args;
  if (!slugs.length) { console.log('Usage: node qa-check.js <slug> | --all'); process.exit(0); }
  let errors = 0;
  for (const slug of slugs) {
    const p = path.join(dataDir, slug + '.json');
    if (!fs.existsSync(p)) { console.log(`✗ ${slug}: нет data/${slug}.json`); errors++; continue; }
    const d = JSON.parse(fs.readFileSync(p, 'utf8'));
    const problems = runQA(d, dataDir);
    const errs = problems.filter(x => x.level === 'error');
    const warns = problems.filter(x => x.level === 'warn');
    errors += errs.length;
    const mark = errs.length ? '✗' : warns.length ? '⚠' : '✓';
    console.log(`${mark} ${slug}: ${errs.length} ошибок, ${warns.length} предупреждений`);
    for (const x of [...errs, ...warns]) console.log(`   [${x.level.toUpperCase()}] ${x.rule}: ${x.message}`);
  }
  process.exit(errors ? 1 : 0);
}

module.exports = { runQA };
