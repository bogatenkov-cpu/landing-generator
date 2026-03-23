#!/usr/bin/env node
/**
 * Landing Page Generator — Tranio
 * Supports multi-language (EN/RU), currency selection, custom forms
 * node generate.js data/anava-samui.json
 */

const fs = require('fs');
const path = require('path');

// ── Template Definitions ───────────────────────────────────────────
const TEMPLATES = {
  default: {
    id: 'default',
    name: 'Tranio Classic',
    description: 'Teal & cream, clean and professional',
    colors: {
      cream: '#F2EDE6', 'cream-light': '#FAF8F5',
      teal: '#2F5050', 'teal-dark': '#253F3F',
      gold: '#BFA177', 'gold-hover': '#A8895F',
      'text-dark': '#2C2C2C', 'text-mid': '#4A4A4A', 'text-muted': '#888',
      white: '#FFF', border: 'rgba(0,0,0,.12)'
    },
    fonts: {
      heading: "'Open Sans', sans-serif",
      body: "'Open Sans', sans-serif",
      ui: "'Poppins', sans-serif"
    },
    fontImport: "https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600&family=Poppins:wght@400;500;600;700&display=swap",
    layout: { amenities: 'numbered-list', floorplans: 'accordion', gallery: 'slider', concept: 'two-column' }
  },
  'anchan-indigo': {
    id: 'anchan-indigo',
    name: 'Anchan Indigo',
    description: 'Indigo & gold, elegant luxury',
    colors: {
      cream: '#F5F2ED', 'cream-light': '#FAF8F5',
      teal: '#2C3E6B', 'teal-dark': '#1A1F3A',
      gold: '#C9A96E', 'gold-hover': '#B8944F',
      'text-dark': '#2C2C2C', 'text-mid': '#3A3A4A', 'text-muted': '#7A7A8A',
      white: '#FFF', border: 'rgba(0,0,0,.12)'
    },
    fonts: {
      heading: "'Cormorant Garamond', Georgia, serif",
      body: "'Outfit', sans-serif",
      ui: "'Outfit', sans-serif"
    },
    fontImport: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600&display=swap",
    layout: { amenities: 'photo-cards', floorplans: 'tabs', gallery: 'masonry', concept: 'two-column' }
  },
  'angsana-oceanview': {
    id: 'angsana-oceanview',
    name: 'Angsana Oceanview',
    description: 'Navy blue & gold, premium resort',
    colors: {
      cream: '#f5f2ed', 'cream-light': '#FAF8F5',
      teal: '#0b1a2e', 'teal-dark': '#071220',
      gold: '#c9a96e', 'gold-hover': '#b8944f',
      'text-dark': '#2c2c2c', 'text-mid': '#4A4A4A', 'text-muted': '#6b6b6b',
      white: '#FFF', border: 'rgba(0,0,0,.08)'
    },
    fonts: {
      heading: "'Cormorant Garamond', Georgia, serif",
      body: "'Outfit', sans-serif",
      ui: "'Outfit', sans-serif"
    },
    fontImport: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600&display=swap",
    layout: { amenities: 'photo-cards', floorplans: 'tabs', gallery: 'grid-overlay', concept: 'two-column' }
  },
  'asi-village': {
    id: 'asi-village',
    name: 'Asi Village',
    description: 'Forest green & gold, eco-luxury',
    colors: {
      cream: '#efeae0', 'cream-light': '#f8f6f1',
      teal: '#1a3c34', 'teal-dark': '#0d1b16',
      gold: '#c9a96e', 'gold-hover': '#b08d4a',
      'text-dark': '#2C2C2C', 'text-mid': '#4A4A4A', 'text-muted': '#6b6b6b',
      white: '#FFF', border: 'rgba(0,0,0,.12)'
    },
    fonts: {
      heading: "'Playfair Display', Georgia, serif",
      body: "'Inter', sans-serif",
      ui: "'Inter', sans-serif"
    },
    fontImport: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap",
    layout: { amenities: 'photo-cards', floorplans: 'card-grid', gallery: 'grid-overlay', concept: 'two-column-features' }
  },
  'arise-vibe': {
    id: 'arise-vibe',
    name: 'Arise Vibe',
    description: 'Dark green & gold, modern tropical',
    colors: {
      cream: '#f0eeeb', 'cream-light': '#f8f6f3',
      teal: '#1a3a2a', 'teal-dark': '#0f2419',
      gold: '#c8a96e', 'gold-hover': '#b08d4a',
      'text-dark': '#2C2C2C', 'text-mid': '#3d3a34', 'text-muted': '#78746c',
      white: '#FFF', border: 'rgba(0,0,0,.12)'
    },
    fonts: {
      heading: "'Playfair Display', Georgia, serif",
      body: "'Inter', sans-serif",
      ui: "'Inter', sans-serif"
    },
    fontImport: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap",
    layout: { amenities: 'icon-grid', floorplans: 'card-grid', gallery: 'masonry', concept: 'cards-3' }
  },
  annara: {
    id: 'annara',
    name: 'Annara',
    description: 'Sage green & sand, warm sophistication',
    colors: {
      cream: '#f5f0e8', 'cream-light': '#fafaf7',
      teal: '#5a7a64', 'teal-dark': '#3d5a45',
      gold: '#c8a96e', 'gold-hover': '#b08d4a',
      'text-dark': '#2d2d2d', 'text-mid': '#4A4A4A', 'text-muted': '#6b6b6b',
      white: '#FFF', border: 'rgba(0,0,0,.12)'
    },
    fonts: {
      heading: "'Cormorant Garamond', Georgia, serif",
      body: "'Outfit', sans-serif",
      ui: "'Outfit', sans-serif"
    },
    fontImport: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600&display=swap",
    layout: { amenities: 'slider', floorplans: 'tabs', gallery: 'justified', concept: 'cards-4' }
  }
};

function getTemplate(id) {
  return TEMPLATES[id] || TEMPLATES.default;
}

function esc(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function sanitizeHtml(str) {
  let s = esc(str);
  s = s.replace(/&lt;(\/?(strong|em|b|i|br)\s*\/?)&gt;/gi, '<$1>');
  return s;
}

// Multi-lang text: handles both "string" and {en:"...",ru:"..."} formats
// Returns spans with data-lang attributes for multi-lang, or plain escaped text
function t(val, langs) {
  if (!val) return '';
  if (typeof val === 'string') return esc(val);
  if (typeof val === 'object' && !Array.isArray(val)) {
    return langs.map(l => `<span data-lang="${l}">${esc(val[l] || '')}</span>`).join('');
  }
  return esc(String(val));
}

// Same but allows safe HTML tags (for paragraphs)
function tHtml(val, langs) {
  if (!val) return '';
  if (typeof val === 'string') return sanitizeHtml(val);
  if (typeof val === 'object' && !Array.isArray(val)) {
    return langs.map(l => `<span data-lang="${l}">${sanitizeHtml(val[l] || '')}</span>`).join('');
  }
  return sanitizeHtml(String(val));
}

// For attribute values (no spans, pick first available language)
function tAttr(val, langs) {
  if (!val) return '';
  if (typeof val === 'string') return esc(val);
  if (typeof val === 'object' && !Array.isArray(val)) {
    for (const l of langs) { if (val[l]) return esc(val[l]); }
    return esc(Object.values(val)[0] || '');
  }
  return esc(String(val));
}

// UI translations for interface elements
const UI = {
  en: {
    concept: 'Concept', amenities: 'Amenities', layouts: 'Layouts',
    investment: 'Investment', gallery: 'Gallery', location: 'Location',
    request_call: 'Request a Call', explore_layouts: 'Explore Layouts',
    investment_details: 'Investment Details', download_catalogue: 'Download the Full Project Catalogue',
    get_catalogue: 'Get the Catalogue', available_layouts: 'Available Layouts',
    request_floor_plan: 'Request Floor Plan', floor_plan_note: 'Floor plan<br>available upon request',
    unit_type: 'Unit Type', size: 'Size', price_from: 'Price From',
    guaranteed_roi: 'Guaranteed ROI', annual_income: 'Est. Annual Income',
    get_investment_plan: 'Get a Personalized Investment Plan',
    about_developer: 'About the Developer',
    still_questions: 'Still Have Questions About',
    experts_help: 'Our experts will answer all questions about pricing, layouts, investment returns, and the purchase process.',
    request_callback: 'Request a Callback', send_request: 'Send a Request',
    your_name: 'Your name', phone: 'Phone number', email: 'Email',
    privacy: 'I confirm I have read and accept the', privacy_policy: 'Privacy Policy',
    thank_you: 'Thank you! We\'ll be in touch shortly.',
    rights: 'All rights reserved.', terms: 'Terms of Use',
    get_valuation: 'Get a Valuation'
  },
  ru: {
    concept: 'Концепция', amenities: 'Удобства', layouts: 'Планировки',
    investment: 'Инвестиции', gallery: 'Галерея', location: 'Расположение',
    request_call: 'Заказать звонок', explore_layouts: 'Смотреть планировки',
    investment_details: 'Детали инвестиций', download_catalogue: 'Скачайте полный каталог проекта',
    get_catalogue: 'Получить каталог', available_layouts: 'Доступные планировки',
    request_floor_plan: 'Запросить планировку', floor_plan_note: 'Планировка<br>по запросу',
    unit_type: 'Тип юнита', size: 'Площадь', price_from: 'Цена от',
    guaranteed_roi: 'Гарантированный ROI', annual_income: 'Годовой доход',
    get_investment_plan: 'Получить инвестиционный план',
    about_developer: 'О застройщике',
    still_questions: 'Остались вопросы по',
    experts_help: 'Наши эксперты ответят на все вопросы о ценах, планировках, доходности и процессе покупки.',
    request_callback: 'Заказать обратный звонок', send_request: 'Отправить заявку',
    your_name: 'Ваше имя', phone: 'Номер телефона', email: 'Email',
    privacy: 'Подтверждаю согласие с', privacy_policy: 'Политикой конфиденциальности',
    thank_you: 'Спасибо! Мы свяжемся с вами в ближайшее время.',
    rights: 'Все права защищены.', terms: 'Условия использования',
    get_valuation: 'Получить оценку'
  }
};

// Helper: get UI string for all active languages with data-lang spans
function ui(key, langs) {
  if (langs.length === 1) return UI[langs[0]][key] || UI.en[key] || key;
  return langs.map(l => `<span data-lang="${l}">${UI[l][key] || UI.en[key] || key}</span>`).join('');
}

function buildHeroStats(stats, langs) {
  return (stats || []).map(s => `
        <div class="hero__stat">
          <span class="hero__stat-value">${t(s.value, langs)}</span>
          <span class="hero__stat-label">${t(s.label, langs)}</span>
        </div>`).join('');
}
function buildConceptSpecs(specs, langs) {
  return (specs || []).map(s => `
          <div class="concept__spec-row">
            <span class="concept__spec-key">${t(s.key, langs)}</span>
            <span class="concept__spec-val">${t(s.value, langs)}</span>
          </div>`).join('');
}
function buildCatalogueTags(tags, langs) {
  return (tags || []).map(tg => `<span class="catalogue__tag">${t(tg, langs)}</span>`).join('\n          ');
}
function buildRoiRows(rows, langs) {
  return (rows || []).map(r => `
            <tr>
              <td>${t(r.type, langs)}</td><td>${t(r.size, langs)}</td><td>${t(r.price, langs)}</td>
              <td><span class="roi__badge">${t(r.roi, langs)}</span></td><td>${t(r.annual_income, langs)}</td>
            </tr>`).join('');
}
function buildDistances(distances, langs) {
  return (distances || []).map(d => `
            <div class="location__dist-row">
              <span class="location__place">${t(d.place, langs)}</span>
              <span class="location__time">${t(d.time, langs)}</span>
            </div>`).join('');
}
function buildDevFacts(facts, langs) {
  return (facts || []).map(f => `
            <div class="developer__stat-row">
              <span class="developer__stat-key">${t(f.key, langs)}</span>
              <span class="developer__stat-val">${t(f.value, langs)}</span>
            </div>`).join('');
}

// ── SVG Icons for icon-grid amenities ────────────────────────────
const AMENITY_ICONS = [
  '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
  '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
  '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
  '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
  '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',
  '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>',
  '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>'
];
const CONCEPT_FEATURE_ICONS = [
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>'
];

// ── AMENITIES Section Variants ───────────────────────────────────
function buildAmenitiesSection(variant, d, langs) {
  var items = d.amenities.items || [];
  var title = d.amenities.title;
  var image = d.amenities.image;

  if (variant === 'photo-cards') {
    // Photo card grid (Anchan Indigo, Angsana, Asi Village)
    var cards = items.map(function(item, i) {
      var name = typeof item === 'object' && item.title ? item.title : item;
      var desc = typeof item === 'object' && item.description ? item.description : '';
      var img = typeof item === 'object' && item.image ? item.image : image;
      return '      <div class="am-cards__card reveal">' +
        '\n        <div class="am-cards__card-image"><img src="' + esc(img) + '" alt="' + tAttr(name, langs) + '" loading="lazy" /></div>' +
        '\n        <div class="am-cards__card-body">' +
        '\n          <h3 class="am-cards__card-title">' + t(name, langs) + '</h3>' +
        (desc ? '\n          <p class="am-cards__card-text">' + t(desc, langs) + '</p>' : '') +
        '\n        </div>' +
        '\n      </div>';
    }).join('\n');
    return {
      html: '\n  <section class="section am-cards" id="amenities">\n    <div class="container">\n      <h2 class="section-title reveal">' + t(title, langs) + '</h2>\n      <div class="am-cards__grid">\n' + cards + '\n      </div>\n    </div>\n  </section>',
      css: '.am-cards{background:linear-gradient(135deg,var(--teal) 0%,var(--teal-dark) 100%);color:var(--white)}.am-cards .section-title{color:var(--white)}.am-cards__grid{display:grid;grid-template-columns:repeat(3,1fr);gap:32px;padding:0 var(--px)}.am-cards__card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);border-radius:8px;overflow:hidden;transition:all .3s}.am-cards__card:hover{background:rgba(255,255,255,.08);transform:translateY(-8px);border-color:rgba(201,169,110,.2);box-shadow:0 16px 40px rgba(0,0,0,.2)}.am-cards__card-image{height:200px;overflow:hidden}.am-cards__card-image img{width:100%;height:100%;object-fit:cover;transition:transform .6s}.am-cards__card:hover .am-cards__card-image img{transform:scale(1.08)}.am-cards__card-body{padding:28px 24px}.am-cards__card-title{font-family:var(--font-heading);font-size:22px;font-weight:400;color:var(--white);margin-bottom:12px}.am-cards__card-text{font-size:14px;line-height:1.7;color:rgba(255,255,255,.55)}@media(max-width:900px){.am-cards__grid{grid-template-columns:repeat(2,1fr);gap:20px}}@media(max-width:560px){.am-cards__grid{grid-template-columns:1fr}}',
      js: ''
    };
  }

  if (variant === 'slider') {
    // Horizontal slider/carousel (Annara)
    var slides = items.map(function(item, i) {
      var name = typeof item === 'object' && item.title ? item.title : item;
      var desc = typeof item === 'object' && item.description ? item.description : '';
      var img = typeof item === 'object' && item.image ? item.image : image;
      return '        <div class="am-slider__slide">' +
        '\n          <img src="' + esc(img) + '" alt="' + tAttr(name, langs) + '" loading="lazy" />' +
        '\n          <div class="am-slider__slide-content">' +
        '\n            <h3 class="am-slider__slide-title">' + t(name, langs) + '</h3>' +
        (desc ? '\n            <p class="am-slider__slide-text">' + t(desc, langs) + '</p>' : '') +
        '\n          </div>' +
        '\n        </div>';
    }).join('\n');
    return {
      html: '\n  <section class="section section--cream am-slider-section" id="amenities">\n    <div class="container">\n      <h2 class="section-title reveal">' + t(title, langs) + '</h2>\n      <div class="am-slider__wrapper">\n        <button class="am-slider__arrow am-slider__arrow--prev" id="amPrev" aria-label="Previous"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg></button>\n        <div class="am-slider__track" id="amTrack">\n' + slides + '\n        </div>\n        <button class="am-slider__arrow am-slider__arrow--next" id="amNext" aria-label="Next"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg></button>\n      </div>\n    </div>\n  </section>',
      css: '.am-slider__wrapper{position:relative}.am-slider__track{display:flex;gap:20px;overflow-x:auto;scroll-snap-type:x mandatory;scroll-behavior:smooth;-webkit-overflow-scrolling:touch;padding-bottom:16px;scrollbar-width:none}.am-slider__track::-webkit-scrollbar{display:none}.am-slider__slide{flex:0 0 340px;scroll-snap-align:start;border-radius:12px;overflow:hidden;background:var(--white);box-shadow:0 2px 16px rgba(0,0,0,.06);transition:transform .3s,box-shadow .3s}.am-slider__slide:hover{transform:translateY(-4px);box-shadow:0 16px 48px rgba(0,0,0,.1)}.am-slider__slide img{width:100%;height:240px;object-fit:cover}.am-slider__slide-content{padding:24px}.am-slider__slide-title{font-family:var(--font-heading);font-size:22px;font-weight:600;margin-bottom:8px}.am-slider__slide-text{font-size:14px;color:var(--text-muted);line-height:1.6}.am-slider__arrow{position:absolute;top:50%;transform:translateY(-50%);width:48px;height:48px;border-radius:50%;background:var(--white);color:var(--text-dark);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(0,0,0,.12);z-index:5;border:none;cursor:pointer;transition:background .3s}.am-slider__arrow:hover{background:var(--teal);color:var(--white)}.am-slider__arrow--prev{left:-16px}.am-slider__arrow--next{right:-16px}@media(max-width:640px){.am-slider__slide{flex:0 0 280px}.am-slider__arrow{display:none}}',
      js: 'var amTrack=document.getElementById("amTrack");if(amTrack){var amSlides=amTrack.querySelectorAll(".am-slider__slide");amSlides.forEach(function(s){amTrack.appendChild(s.cloneNode(true))});document.getElementById("amPrev").addEventListener("click",function(){var w=amTrack.querySelector(".am-slider__slide").offsetWidth+20;amTrack.scrollBy({left:-w,behavior:"smooth"})});document.getElementById("amNext").addEventListener("click",function(){var w=amTrack.querySelector(".am-slider__slide").offsetWidth+20;amTrack.scrollBy({left:w,behavior:"smooth"})});amTrack.addEventListener("scroll",function(){if(amTrack.scrollLeft+amTrack.clientWidth>=amTrack.scrollWidth-10)amTrack.scrollLeft=0})}'
    };
  }

  if (variant === 'icon-grid') {
    // Icon grid without photos (Arise Vibe)
    var grid = items.map(function(item, i) {
      var name = typeof item === 'object' && item.title ? item.title : item;
      var desc = typeof item === 'object' && item.description ? item.description : '';
      var icon = AMENITY_ICONS[i % AMENITY_ICONS.length];
      return '      <div class="am-icons__item reveal">' +
        '\n        <div class="am-icons__icon">' + icon + '</div>' +
        '\n        <h3 class="am-icons__title">' + t(name, langs) + '</h3>' +
        (desc ? '\n        <p class="am-icons__text">' + t(desc, langs) + '</p>' : '') +
        '\n      </div>';
    }).join('\n');
    return {
      html: '\n  <section class="section am-icons" id="amenities">\n    <div class="container">\n      <h2 class="section-title reveal" style="color:var(--white)">' + t(title, langs) + '</h2>\n      <div class="am-icons__grid">\n' + grid + '\n      </div>\n    </div>\n  </section>',
      css: '.am-icons{background:var(--teal-dark);color:var(--white)}.am-icons__grid{display:grid;grid-template-columns:repeat(3,1fr);gap:32px;padding:0 var(--px)}.am-icons__item{padding:32px;border-radius:12px;border:1px solid rgba(255,255,255,.06);transition:background .3s,border-color .3s}.am-icons__item:hover{background:rgba(255,255,255,.03);border-color:rgba(200,169,110,.2)}.am-icons__icon{color:var(--gold);margin-bottom:20px}.am-icons__title{font-family:var(--font-heading);font-size:20px;font-weight:600;margin-bottom:8px}.am-icons__text{font-size:15px;line-height:1.6;color:rgba(255,255,255,.55)}@media(max-width:900px){.am-icons__grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:560px){.am-icons__grid{grid-template-columns:1fr}}',
      js: ''
    };
  }

  // Default: numbered-list
  var listItems = items.map(function(item, i) {
    var name = typeof item === 'object' && item.title ? item.title : item;
    return '\n            <div class="amenities__item"><span class="amenities__num">' + String(i+1).padStart(2,'0') + '</span><span class="amenities__name">' + t(name, langs) + '</span></div>';
  }).join('');
  return {
    html: '\n  <section class="section section--cream" id="amenities">\n    <div class="container">\n      <div class="amenities__grid">\n        <div class="amenities__image reveal"><img src="' + esc(image) + '" alt="' + tAttr(title, langs) + '" loading="lazy" /></div>\n        <div class="reveal" style="transition-delay:.15s">\n          <h2 class="section-title">' + t(title, langs) + '</h2>\n          <div class="amenities__list">' + listItems + '\n          </div>\n        </div>\n      </div>\n    </div>\n  </section>',
    css: '.amenities__grid{display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center}.amenities__image{border-radius:12px;overflow:hidden;aspect-ratio:4/3}.amenities__list{display:flex;flex-direction:column}.amenities__item{display:flex;align-items:center;padding:22px 0;border-bottom:1px solid var(--border);font-size:16px}.amenities__item:first-child{border-top:1px solid var(--border)}.amenities__num{color:var(--text-muted);font-size:13px;min-width:32px}.amenities__name{flex:1;color:var(--text-dark);padding-left:16px}@media(max-width:900px){.amenities__grid{grid-template-columns:1fr;gap:40px}}',
    js: ''
  };
}

// ── FLOOR PLANS Section Variants ─────────────────────────────────
function buildFloorplansSection(variant, d, langs) {
  var layouts = d.layouts || [];

  if (variant === 'tabs') {
    // Tabbed layout (Anchan Indigo, Angsana, Annara)
    var tabBtns = layouts.map(function(l, i) {
      var slug = 'plan-' + i;
      return '<button class="fp-tabs__tab' + (i===0?' fp-tabs__tab--active':'') + '" data-tab="' + slug + '">' + t(l.name, langs) + '</button>';
    }).join('\n          ');
    var panels = layouts.map(function(l, i) {
      var slug = 'plan-' + i;
      var specs = (l.specs||[]).map(function(s){
        return '<div class="fp-tabs__spec"><span class="fp-tabs__spec-label">' + t(s.key, langs) + '</span><span class="fp-tabs__spec-value">' + t(s.value, langs) + '</span></div>';
      }).join('');
      return '        <div class="fp-tabs__panel' + (i===0?' fp-tabs__panel--active':'') + '" id="' + slug + '">' +
        '\n          <div class="fp-tabs__plan-grid">' +
        '\n            <div class="fp-tabs__plan-image"><div style="color:var(--text-muted);font-family:var(--font-ui);font-size:14px;text-align:center;padding:40px">' + ui('floor_plan_note', langs) + '</div></div>' +
        '\n            <div class="fp-tabs__plan-details">' +
        '\n              <h3 class="fp-tabs__plan-title">' + t(l.name, langs) + ' — ' + t(l.price_from, langs) + '</h3>' +
        '\n              <div class="fp-tabs__plan-specs">' + specs + '</div>' +
        '\n              <button class="btn btn--gold" style="width:100%;margin-top:24px" onclick="openModal(\'layouts\')">' + ui('request_floor_plan', langs) + '</button>' +
        '\n            </div>' +
        '\n          </div>' +
        '\n        </div>';
    }).join('\n');
    return {
      html: '\n  <section class="section section--cream" id="layouts">\n    <div class="container">\n      <h2 class="section-title reveal">' + ui('available_layouts', langs) + '</h2>\n      <div class="fp-tabs reveal" style="transition-delay:.1s">\n        <div class="fp-tabs__nav">\n          ' + tabBtns + '\n        </div>\n        <div class="fp-tabs__content">\n' + panels + '\n        </div>\n      </div>\n    </div>\n  </section>',
      css: '.fp-tabs__nav{display:flex;justify-content:center;gap:8px;margin-bottom:48px;flex-wrap:wrap}.fp-tabs__tab{padding:14px 32px;font-family:var(--font-ui);font-size:13px;font-weight:500;letter-spacing:.05em;text-transform:uppercase;color:var(--text-muted);border:1px solid var(--border);border-radius:4px;background:transparent;cursor:pointer;transition:all .3s}.fp-tabs__tab:hover{border-color:var(--teal);color:var(--teal)}.fp-tabs__tab--active{background:var(--teal);color:var(--white);border-color:var(--teal)}.fp-tabs__panel{display:none;animation:fadeInPlan .5s ease}.fp-tabs__panel--active{display:block}@keyframes fadeInPlan{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}.fp-tabs__plan-grid{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center}.fp-tabs__plan-image{border-radius:8px;overflow:hidden;background:var(--cream);min-height:300px;display:flex;align-items:center;justify-content:center}.fp-tabs__plan-title{font-family:var(--font-heading);font-size:28px;font-weight:400;margin-bottom:32px}.fp-tabs__plan-specs{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px}.fp-tabs__spec{display:flex;flex-direction:column;padding:16px;background:var(--cream-light);border-radius:6px}.fp-tabs__spec-label{font-size:11px;font-weight:500;letter-spacing:.1em;text-transform:uppercase;color:var(--text-muted)}.fp-tabs__spec-value{font-family:var(--font-heading);font-size:20px;font-weight:500;color:var(--teal)}@media(max-width:900px){.fp-tabs__plan-grid{grid-template-columns:1fr;gap:32px}}',
      js: 'document.querySelectorAll(".fp-tabs__tab").forEach(function(tab){tab.addEventListener("click",function(){var target=tab.dataset.tab;document.querySelectorAll(".fp-tabs__tab").forEach(function(t){t.classList.remove("fp-tabs__tab--active")});tab.classList.add("fp-tabs__tab--active");document.querySelectorAll(".fp-tabs__panel").forEach(function(p){p.classList.remove("fp-tabs__panel--active");if(p.id===target)p.classList.add("fp-tabs__panel--active")})})});'
    };
  }

  if (variant === 'card-grid') {
    // Card grid without tabs (Arise Vibe, Asi Village)
    var cards = layouts.map(function(l, i) {
      var specs = (l.specs||[]).map(function(s){
        return '<div class="fp-cards__spec"><span class="fp-cards__spec-val">' + t(s.value, langs) + '</span><span class="fp-cards__spec-label">' + t(s.key, langs) + '</span></div>';
      }).join('');
      var badge = i === 1 ? '\n          <span class="fp-cards__badge">Popular</span>' : '';
      return '      <div class="fp-cards__card' + (i===1?' fp-cards__card--featured':'') + ' reveal">' +
        '\n        <div class="fp-cards__card-image">' +
        '\n          <div style="width:100%;height:220px;background:var(--cream);display:flex;align-items:center;justify-content:center;color:var(--text-muted);font-size:14px">' + ui('floor_plan_note', langs) + '</div>' +
        '\n          <span class="fp-cards__price">' + t(l.price_from, langs) + '</span>' + badge +
        '\n        </div>' +
        '\n        <div class="fp-cards__card-body">' +
        '\n          <h3 class="fp-cards__card-title">' + t(l.name, langs) + '</h3>' +
        '\n          <div class="fp-cards__specs">' + specs + '</div>' +
        '\n          <button class="btn btn--gold" style="width:100%" onclick="openModal(\'layouts\')">' + ui('request_floor_plan', langs) + '</button>' +
        '\n        </div>' +
        '\n      </div>';
    }).join('\n');
    return {
      html: '\n  <section class="section" id="layouts">\n    <div class="container">\n      <h2 class="section-title reveal">' + ui('available_layouts', langs) + '</h2>\n      <div class="fp-cards__grid">\n' + cards + '\n      </div>\n    </div>\n  </section>',
      css: '.fp-cards__grid{display:grid;grid-template-columns:repeat(3,1fr);gap:32px;padding:0 var(--px)}.fp-cards__card{background:var(--white);border-radius:12px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,.06);border:1px solid var(--border);transition:transform .3s,box-shadow .3s}.fp-cards__card:hover{transform:translateY(-4px);box-shadow:0 16px 48px rgba(0,0,0,.1)}.fp-cards__card--featured{border-color:var(--gold)}.fp-cards__card-image{position:relative;overflow:hidden}.fp-cards__price{position:absolute;bottom:12px;left:12px;background:rgba(26,24,21,.85);color:var(--white);padding:6px 16px;border-radius:6px;font-size:14px;font-weight:600;backdrop-filter:blur(4px)}.fp-cards__badge{position:absolute;top:12px;right:12px;background:var(--gold);color:var(--white);padding:4px 14px;border-radius:4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em}.fp-cards__card-body{padding:28px}.fp-cards__card-title{font-family:var(--font-heading);font-size:22px;font-weight:600;margin-bottom:16px}.fp-cards__specs{display:flex;gap:24px;margin-bottom:20px;padding-bottom:20px;border-bottom:1px solid var(--border)}.fp-cards__spec{display:flex;flex-direction:column;gap:4px}.fp-cards__spec-val{font-size:16px;font-weight:700;color:var(--teal)}.fp-cards__spec-label{font-size:12px;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px}@media(max-width:900px){.fp-cards__grid{grid-template-columns:1fr;max-width:420px;margin:0 auto}}',
      js: ''
    };
  }

  // Default: accordion
  var accordionItems = layouts.map(function(l) {
    var specRows = (l.specs||[]).map(function(s){
      return '<div class="layout-item__spec-row"><span class="layout-item__spec-key">' + t(s.key, langs) + '</span><span class="layout-item__spec-val">' + t(s.value, langs) + '</span></div>';
    }).join('');
    return '        <div class="layout-item">' +
      '\n          <button class="layout-item__header" onclick="toggleLayout(this)"><span>' + t(l.name, langs) + ' — from ' + t(l.price_from, langs) + '</span><span class="toggle">+</span></button>' +
      '\n          <div class="layout-item__body">' +
      '\n            <div class="layout-item__plan"><div style="color:rgba(255,255,255,.4);font-family:var(--font-ui);font-size:14px;text-align:center">' + ui('floor_plan_note', langs) + '</div></div>' +
      '\n            <div class="layout-item__specs"><div>' + specRows + '</div><button class="btn btn--gold layout-item__cta" onclick="openModal(\'layouts\')">' + ui('request_floor_plan', langs) + '</button></div>' +
      '\n          </div>' +
      '\n        </div>';
  }).join('\n');
  return {
    html: '\n  <section class="section section--cream" id="layouts">\n    <div class="container">\n      <h2 class="section-title reveal">' + ui('available_layouts', langs) + '</h2>\n      <div class="layouts__accordion reveal" style="transition-delay:.1s">\n' + accordionItems + '\n      </div>\n    </div>\n  </section>',
    css: '.layouts__accordion{display:flex;flex-direction:column}.layout-item__header{width:100%;display:flex;justify-content:space-between;align-items:center;padding:20px 24px;background:var(--teal);cursor:pointer;border-radius:12px;margin-bottom:2px;font-family:var(--font-ui);font-size:15px;font-weight:500;color:var(--white);letter-spacing:.05em;text-transform:uppercase;border:none}.layout-item__header .toggle{width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,.9);color:var(--teal);display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:300;flex-shrink:0;transition:transform .3s}.layout-item.open .layout-item__header .toggle{transform:rotate(45deg)}.layout-item__body{display:none;grid-template-columns:1fr 1fr;background:var(--teal);border-radius:12px;overflow:hidden;margin-bottom:8px}.layout-item.open .layout-item__body{display:grid}.layout-item__plan{background:rgba(255,255,255,.07);display:flex;align-items:center;justify-content:center;padding:24px;min-height:320px}.layout-item__specs{padding:40px;display:flex;flex-direction:column;justify-content:space-between}.layout-item__spec-row{display:flex;justify-content:space-between;align-items:center;padding:16px 0;border-bottom:1px solid rgba(255,255,255,.15);font-size:14px}.layout-item__spec-row:first-child{border-top:1px solid rgba(255,255,255,.15)}.layout-item__spec-key{color:rgba(255,255,255,.6)}.layout-item__spec-val{color:var(--white);font-weight:500}.layout-item__cta{margin-top:32px;width:100%}@media(max-width:900px){.layout-item__body{grid-template-columns:1fr}}',
    js: 'function toggleLayout(btn){var i=btn.closest(".layout-item");var o=i.classList.contains("open");document.querySelectorAll(".layout-item").forEach(function(x){x.classList.remove("open")});if(!o)i.classList.add("open")}'
  };
}

// ── GALLERY Section Variants ─────────────────────────────────────
function buildGallerySection(variant, d, langs) {
  var images = d.gallery.images || [];

  if (variant === 'masonry') {
    // Asymmetric masonry grid (Anchan Indigo, Arise Vibe)
    var masonryItems = images.map(function(img, i) {
      var src = typeof img === 'string' ? img : (img.url || '');
      var caption = typeof img === 'object' && img.caption ? t(img.caption, langs) : '';
      var mod = '';
      if (i === 0) mod = ' gallery-m__item--large';
      else if (i === images.length - 2 || i === images.length - 1) mod = ' gallery-m__item--wide';
      return '      <div class="gallery-m__item' + mod + '">' +
        '\n        <img src="' + esc(src) + '" alt="Gallery ' + (i+1) + '" loading="lazy" />' +
        '\n        <div class="gallery-m__overlay">' + (caption ? '<span>' + caption + '</span>' : '') + '</div>' +
        '\n      </div>';
    }).join('\n');
    return {
      html: '\n  <section class="section section--cream" id="gallery">\n    <div class="container">\n      <h2 class="section-title reveal">' + ui('gallery', langs) + '</h2>\n      <div class="gallery-m__grid reveal" style="transition-delay:.1s">\n' + masonryItems + '\n      </div>\n    </div>\n  </section>',
      css: '.gallery-m__grid{display:grid;grid-template-columns:repeat(4,1fr);grid-auto-rows:220px;grid-auto-flow:dense;gap:16px;padding:0 var(--px)}.gallery-m__item{border-radius:12px;overflow:hidden;position:relative;cursor:pointer}.gallery-m__item img{width:100%;height:100%;object-fit:cover;transition:transform .6s}.gallery-m__item:hover img{transform:scale(1.05)}.gallery-m__item--large{grid-column:span 2;grid-row:span 2}.gallery-m__item--wide{grid-column:span 2}.gallery-m__overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.55) 0%,transparent 50%);display:flex;align-items:flex-end;padding:20px;opacity:0;transition:opacity .3s}.gallery-m__item:hover .gallery-m__overlay{opacity:1}.gallery-m__overlay span{font-size:14px;font-weight:500;color:var(--white)}@media(max-width:900px){.gallery-m__grid{grid-template-columns:repeat(2,1fr);grid-auto-rows:200px}.gallery-m__item--large{grid-column:span 2}}@media(max-width:560px){.gallery-m__grid{grid-template-columns:1fr;grid-auto-rows:240px}.gallery-m__item--large,.gallery-m__item--wide{grid-column:span 1;grid-row:span 1}}',
      js: ''
    };
  }

  if (variant === 'justified') {
    // Justified layout with flex-grow rows (Annara)
    var rows = [];
    var rowSizes = [2, 3, 2]; // items per row pattern
    var idx = 0;
    for (var r = 0; idx < images.length; r++) {
      var count = rowSizes[r % rowSizes.length];
      var rowItems = [];
      for (var c = 0; c < count && idx < images.length; c++, idx++) {
        var src = typeof images[idx] === 'string' ? images[idx] : (images[idx].url || '');
        var grow = (c === 0 && count === 2) ? '1.5' : '1';
        rowItems.push('        <div class="gallery-j__item" style="flex-grow:' + grow + '"><img src="' + esc(src) + '" alt="Gallery ' + (idx+1) + '" loading="lazy" /></div>');
      }
      rows.push('      <div class="gallery-j__row">\n' + rowItems.join('\n') + '\n      </div>');
    }
    return {
      html: '\n  <section class="section" id="gallery">\n    <div class="container">\n      <h2 class="section-title reveal">' + ui('gallery', langs) + '</h2>\n      <div class="gallery-j reveal" style="transition-delay:.1s">\n' + rows.join('\n') + '\n      </div>\n    </div>\n  </section>',
      css: '.gallery-j{display:flex;flex-direction:column;gap:8px;padding:0 var(--px)}.gallery-j__row{display:flex;gap:8px;width:100%}.gallery-j__item{border-radius:12px;overflow:hidden;position:relative;min-height:240px}.gallery-j__item img{width:100%;height:100%;object-fit:cover;display:block;position:absolute;inset:0;transition:transform .8s}.gallery-j__item:hover img{transform:scale(1.05)}@media(max-width:640px){.gallery-j__row{flex-direction:column}.gallery-j__item{min-height:200px}}',
      js: ''
    };
  }

  if (variant === 'grid-overlay') {
    // Uniform grid with overlay icon (Asi Village, Angsana)
    var gridItems = images.map(function(img, i) {
      var src = typeof img === 'string' ? img : (img.url || '');
      return '      <div class="gallery-g__item' + (i===0?' gallery-g__item--featured':'') + '">' +
        '\n        <img src="' + esc(src) + '" alt="Gallery ' + (i+1) + '" loading="lazy" />' +
        '\n        <div class="gallery-g__overlay"><div class="gallery-g__icon">&#43;</div></div>' +
        '\n      </div>';
    }).join('\n');
    return {
      html: '\n  <section class="section section--cream" id="gallery">\n    <div class="container">\n      <h2 class="section-title reveal">' + ui('gallery', langs) + '</h2>\n      <div class="gallery-g__grid reveal" style="transition-delay:.1s">\n' + gridItems + '\n      </div>\n    </div>\n  </section>',
      css: '.gallery-g__grid{display:grid;grid-template-columns:repeat(4,1fr);grid-template-rows:repeat(2,240px);gap:16px;padding:0 var(--px)}.gallery-g__item{border-radius:8px;overflow:hidden;position:relative;cursor:pointer}.gallery-g__item--featured{grid-column:span 2;grid-row:span 2}.gallery-g__item img{width:100%;height:100%;object-fit:cover;transition:transform .6s}.gallery-g__item:hover img{transform:scale(1.05)}.gallery-g__overlay{position:absolute;inset:0;background:rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .3s}.gallery-g__item:hover .gallery-g__overlay{opacity:1}.gallery-g__icon{width:50px;height:50px;border:2px solid rgba(255,255,255,.4);border-radius:50%;display:flex;align-items:center;justify-content:center;color:var(--white);font-size:20px}@media(max-width:900px){.gallery-g__grid{grid-template-columns:repeat(2,1fr);grid-template-rows:auto}.gallery-g__item--featured{grid-column:span 2}}@media(max-width:560px){.gallery-g__grid{grid-template-columns:1fr}.gallery-g__item--featured{grid-column:span 1}}',
      js: ''
    };
  }

  // Default: horizontal slider
  var slides = images.map(function(img, i) {
    var src = typeof img === 'string' ? img : (img.url || '');
    return '          <div class="gallery__slide"><img src="' + esc(src) + '" alt="Gallery ' + (i+1) + '" loading="lazy" /></div>';
  }).join('\n');
  return {
    html: '\n  <section class="section section--cream" id="gallery">\n    <div class="container">\n      <div class="gallery__header">\n        <h2 class="section-title reveal" style="margin-bottom:0">' + ui('gallery', langs) + '</h2>\n        <div class="gallery__nav"><button id="galPrev" aria-label="Previous">&#8592;</button><button id="galNext" aria-label="Next">&#8594;</button></div>\n      </div>\n      <div class="gallery__track-wrap reveal" style="transition-delay:.1s">\n        <div class="gallery__track" id="galTrack">\n' + slides + '\n        </div>\n      </div>\n    </div>\n  </section>',
    css: '.gallery__header{display:flex;justify-content:space-between;align-items:center;margin-bottom:28px}.gallery__nav{display:flex;gap:12px}.gallery__nav button{width:40px;height:40px;border-radius:50%;border:1.5px solid var(--border);background:transparent;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;transition:.2s}.gallery__nav button:hover{border-color:var(--teal);background:var(--teal);color:#fff}.gallery__track-wrap{overflow:hidden}.gallery__track{display:flex;gap:16px;transition:transform .45s cubic-bezier(.4,0,.2,1)}.gallery__slide{flex:0 0 calc(50% - 8px);border-radius:12px;overflow:hidden;aspect-ratio:16/10}.gallery__slide img{width:100%;height:100%;object-fit:cover}@media(max-width:900px){.gallery__slide{flex:0 0 85%}}',
    js: 'var galIndex=0;var galTrack=document.getElementById("galTrack");function getSlideW(){var s=galTrack.querySelector(".gallery__slide");return s?s.offsetWidth+16:0}document.getElementById("galNext").addEventListener("click",function(){var n=galTrack.querySelectorAll(".gallery__slide").length;if(galIndex<n-2)galIndex++;galTrack.style.transform="translateX(-"+(galIndex*getSlideW())+"px)"});document.getElementById("galPrev").addEventListener("click",function(){if(galIndex>0)galIndex--;galTrack.style.transform="translateX(-"+(galIndex*getSlideW())+"px)"})'
  };
}

// ── CONCEPT Section Variants ─────────────────────────────────────
function buildConceptSection(variant, d, langs) {
  var concept = d.concept || {};
  var title = concept.title;
  var paragraphs = concept.paragraphs || [];
  var specs = concept.specs || [];

  var conceptParas = paragraphs.map(function(p) {
    if (typeof p === 'object' && !Array.isArray(p)) {
      return langs.map(function(l) { return '<p data-lang="' + l + '">' + sanitizeHtml(p[l] || '') + '</p>'; }).join('\n        ');
    }
    return '<p>' + sanitizeHtml(p) + '</p>';
  }).join('\n        ');

  if (variant === 'cards-3') {
    // 3-card layout with 1 large (Arise Vibe)
    var cards = specs.slice(0, 3).map(function(s, i) {
      var img = typeof s === 'object' && s.image ? s.image : (d.concept.image || d.hero.image);
      return '      <div class="concept-c3__card' + (i===0?' concept-c3__card--large':'') + ' reveal">' +
        '\n        <img src="' + esc(img) + '" alt="' + tAttr(s.key || s.value, langs) + '" loading="lazy" class="concept-c3__card-img" />' +
        '\n        <div class="concept-c3__card-content">' +
        '\n          <h3 class="concept-c3__card-title">' + t(s.key, langs) + '</h3>' +
        '\n          <p class="concept-c3__card-text">' + t(s.value, langs) + '</p>' +
        '\n        </div>' +
        '\n      </div>';
    }).join('\n');
    return {
      html: '\n  <section class="section concept" id="concept">\n    <div class="container">\n      <h2 class="section-title reveal">' + t(title, langs) + '</h2>\n      ' + conceptParas + '\n      <div class="concept-c3__grid">\n' + cards + '\n      </div>\n    </div>\n  </section>',
      css: '.concept-c3__grid{display:grid;grid-template-columns:1fr 1fr;gap:32px;padding:0 var(--px);margin-top:48px}.concept-c3__card{position:relative;border-radius:12px;overflow:hidden;background:var(--white);box-shadow:0 2px 16px rgba(0,0,0,.06);transition:transform .3s,box-shadow .3s}.concept-c3__card:hover{transform:translateY(-4px);box-shadow:0 16px 48px rgba(0,0,0,.1)}.concept-c3__card--large{grid-column:1/-1}.concept-c3__card-img{width:100%;height:240px;object-fit:cover;transition:transform .6s}.concept-c3__card:hover .concept-c3__card-img{transform:scale(1.03)}.concept-c3__card--large .concept-c3__card-img{height:360px}.concept-c3__card-content{padding:32px}.concept-c3__card-title{font-family:var(--font-heading);font-size:22px;font-weight:600;margin-bottom:8px}.concept-c3__card-text{font-size:15px;line-height:1.6;color:var(--text-muted)}@media(max-width:640px){.concept-c3__grid{grid-template-columns:1fr}.concept-c3__card--large .concept-c3__card-img{height:240px}}',
      js: ''
    };
  }

  if (variant === 'cards-4') {
    // 4-card grid + hero image (Annara)
    var cards4 = specs.slice(0, 4).map(function(s, i) {
      var img = typeof s === 'object' && s.image ? s.image : (d.concept.image || d.hero.image);
      return '      <div class="concept-c4__card reveal">' +
        '\n        <div class="concept-c4__card-image"><img src="' + esc(img) + '" alt="' + tAttr(s.key || s.value, langs) + '" loading="lazy" /></div>' +
        '\n        <h3 class="concept-c4__card-title">' + t(s.key, langs) + '</h3>' +
        '\n        <p class="concept-c4__card-text">' + t(s.value, langs) + '</p>' +
        '\n      </div>';
    }).join('\n');
    var heroImg = d.concept.image || d.hero.image;
    return {
      html: '\n  <section class="section concept" id="concept">\n    <div class="container">\n      <h2 class="section-title reveal">' + t(title, langs) + '</h2>\n      <div class="concept-c4__intro reveal">' + conceptParas + '</div>\n      <div class="concept-c4__grid">\n' + cards4 + '\n      </div>\n      <div class="concept-c4__hero reveal"><img src="' + esc(heroImg) + '" alt="' + tAttr(title, langs) + '" loading="lazy" /></div>\n    </div>\n  </section>',
      css: '.concept-c4__intro{max-width:680px;margin-bottom:64px}.concept-c4__intro p{font-size:17px;color:var(--text-mid);line-height:1.8;margin-bottom:16px}.concept-c4__grid{display:grid;grid-template-columns:repeat(4,1fr);gap:24px;padding:0 var(--px);margin-bottom:64px}.concept-c4__card{background:var(--cream-light);border-radius:12px;border:1px solid var(--border);overflow:hidden;transition:transform .3s,box-shadow .3s}.concept-c4__card:hover{transform:translateY(-6px);box-shadow:0 20px 60px rgba(0,0,0,.08)}.concept-c4__card-image{overflow:hidden}.concept-c4__card-image img{width:100%;height:180px;object-fit:cover;transition:transform .6s}.concept-c4__card:hover .concept-c4__card-image img{transform:scale(1.06)}.concept-c4__card-title{font-family:var(--font-heading);font-size:20px;font-weight:600;margin:20px 24px 10px}.concept-c4__card-text{font-size:14px;color:var(--text-muted);line-height:1.7;padding:0 24px 24px}.concept-c4__hero{border-radius:16px;overflow:hidden}.concept-c4__hero img{width:100%;height:500px;object-fit:cover;transition:transform .8s}.concept-c4__hero:hover img{transform:scale(1.03)}@media(max-width:900px){.concept-c4__grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:560px){.concept-c4__grid{grid-template-columns:1fr}.concept-c4__hero img{height:280px}}',
      js: ''
    };
  }

  if (variant === 'two-column-features') {
    // 2-column with feature icons (Asi Village)
    var specRows = specs.map(function(s, i) {
      var icon = CONCEPT_FEATURE_ICONS[i % CONCEPT_FEATURE_ICONS.length];
      return '            <div class="concept-f__feature"><div class="concept-f__feature-icon">' + icon + '</div><span class="concept-f__feature-text">' + t(s.key, langs) + ': ' + t(s.value, langs) + '</span></div>';
    }).join('\n');
    var img = d.concept.image || d.hero.image;
    return {
      html: '\n  <section class="section concept" id="concept">\n    <div class="container">\n      <div class="concept-f__grid">\n        <div class="concept-f__image-wrapper reveal">\n          <img class="concept-f__image" src="' + esc(img) + '" alt="' + tAttr(title, langs) + '" loading="lazy" />\n          <div class="concept-f__accent"></div>\n        </div>\n        <div class="concept-f__text reveal" style="transition-delay:.15s">\n          <h2 class="section-title">' + t(title, langs) + '</h2>\n          ' + conceptParas + '\n          <div class="concept-f__features">\n' + specRows + '\n          </div>\n          <div class="concept__ctas" style="margin-top:40px">\n            <a href="#layouts" class="btn btn--gold">' + ui('explore_layouts', langs) + '</a>\n            <a href="#roi" class="btn btn--teal-outline">' + ui('investment_details', langs) + '</a>\n          </div>\n        </div>\n      </div>\n    </div>\n  </section>',
      css: '.concept-f__grid{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;padding:0 var(--px)}.concept-f__image-wrapper{position:relative;border-radius:8px;overflow:visible}.concept-f__image{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:8px}.concept-f__accent{position:absolute;bottom:-16px;right:-16px;width:120px;height:120px;border:2px solid var(--gold);border-radius:8px;z-index:-1}.concept-f__text p{font-size:16px;line-height:1.85;color:var(--text-mid);margin-bottom:16px}.concept-f__features{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:32px}.concept-f__feature{display:flex;align-items:flex-start;gap:12px}.concept-f__feature-icon{flex-shrink:0;width:40px;height:40px;background:var(--cream);border-radius:8px;display:flex;align-items:center;justify-content:center;color:var(--gold)}.concept-f__feature-icon svg{width:20px;height:20px}.concept-f__feature-text{font-size:14px;font-weight:500;color:var(--text-dark);line-height:1.5}@media(max-width:900px){.concept-f__grid{grid-template-columns:1fr;gap:40px}.concept-f__accent{display:none}}',
      js: ''
    };
  }

  // Default: two-column (text + specs)
  var specList = specs.map(function(s) {
    return '<div class="concept__spec-row"><span class="concept__spec-key">' + t(s.key, langs) + '</span><span class="concept__spec-val">' + t(s.value, langs) + '</span></div>';
  }).join('');
  return {
    html: '\n  <section class="section concept" id="concept">\n    <div class="concept__grid">\n      <div class="concept__text reveal">\n        <h2 class="section-title">' + t(title, langs) + '</h2>\n        ' + conceptParas + '\n        <div class="concept__ctas">\n          <a href="#layouts" class="btn btn--gold">' + ui('explore_layouts', langs) + '</a>\n          <a href="#roi" class="btn btn--teal-outline">' + ui('investment_details', langs) + '</a>\n        </div>\n      </div>\n      <div class="concept__specs reveal" style="transition-delay:.15s">' + specList + '</div>\n    </div>\n  </section>',
    css: '.concept__grid{display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:start;padding:0 var(--px)}.concept__text h2{margin-bottom:24px;font-size:clamp(36px,5vw,56px);line-height:1.1}.concept__text p{font-size:16px;line-height:1.85;color:var(--text-mid);margin-bottom:16px}.concept__text p strong{color:var(--text-dark);font-weight:600}.concept__ctas{display:flex;gap:16px;margin-top:40px;flex-wrap:wrap}.concept__ctas .btn{padding:18px 40px;font-size:16px}.concept__specs{padding-top:0}.concept__spec-row{display:flex;justify-content:space-between;align-items:baseline;padding:24px 0;border-bottom:1px solid var(--border)}.concept__spec-key{color:var(--text-muted);font-size:18px;font-weight:300}.concept__spec-val{color:var(--text-dark);font-weight:400;text-align:right;font-size:clamp(22px,2.5vw,32px)}@media(max-width:900px){.concept__grid{grid-template-columns:1fr;gap:40px}}',
    js: ''
  };
}

// Build form fields HTML
function buildFormFields(fields, langs, lightStyle) {
  const cls = lightStyle ? 'form-input form-input--light' : 'form-input';
  if (!fields || !fields.length) {
    // Default fields
    return `
          <div class="form-group"><input type="text" name="name" class="${cls}" placeholder="${ui('your_name', langs)}" required /></div>
          <div class="form-group"><input type="tel" name="phone" class="${cls}" placeholder="${ui('phone', langs)}" required /></div>
          <div class="form-group"><input type="email" name="email" class="${cls}" placeholder="${ui('email', langs)}" /></div>`;
  }
  return fields.map(f => {
    const ph = tAttr(f.placeholder || f.label, langs);
    const req = f.required ? ' required' : '';
    return `
          <div class="form-group"><input type="${esc(f.type||'text')}" name="${esc(f.name)}" class="${cls}" placeholder="${ph}"${req} /></div>`;
  }).join('');
}

function buildPrivacy(langs, lightStyle) {
  const cls = lightStyle ? 'form-privacy form-privacy--light' : 'form-privacy';
  return `
          <label class="form-consent"><input type="checkbox" name="privacy" required /> <span>${ui('privacy', langs)} <a href="#">${ui('privacy_policy', langs)}</a></span></label>`;
}

function generateHTML(data) {
  const d = data;
  const tmpl = getTemplate(d.template);
  const layout = tmpl.layout || { amenities: 'numbered-list', floorplans: 'accordion', gallery: 'slider', concept: 'two-column' };
  const langs = d.languages && d.languages.length ? d.languages : ['en'];
  const defaultLang = langs[0];
  const multiLang = langs.length > 1;
  const webhook = esc(d.crm_webhook || '');
  const formFields = d.form_fields || null;

  // Build variant sections
  const conceptResult = buildConceptSection(layout.concept, d, langs);
  const amenitiesResult = buildAmenitiesSection(layout.amenities, d, langs);
  const floorplansResult = buildFloorplansSection(layout.floorplans, d, langs);
  const galleryResult = buildGallerySection(layout.gallery, d, langs);

  // Collect variant CSS & JS
  const variantCSS = [conceptResult.css, amenitiesResult.css, floorplansResult.css, galleryResult.css].join('\n    ');
  const variantJS = [conceptResult.js, amenitiesResult.js, floorplansResult.js, galleryResult.js].filter(Boolean).join('\n    ');

  // Language switcher HTML for nav
  const langSwitcher = multiLang ? `
    <div class="lang-switch" id="langSwitch">
      ${langs.map(l => `<button class="lang-switch__btn${l === defaultLang ? ' active' : ''}" data-lang="${l}" onclick="switchLang('${l}')">${l.toUpperCase()}</button>`).join('')}
    </div>` : '';

  const sellBannerSection = d.sell_banner && d.sell_banner.show ? `
  <section class="sell-banner">
    <div class="sell-banner__bg" style="background-image:url('${esc(d.sell_banner.image)}')"></div>
    <div class="sell-banner__content">
      <div></div>
      <div class="sell-banner__form-box reveal">
        <div class="sell-banner__form-title">${tHtml(d.sell_banner.title, langs)}</div>
        <div class="sell-banner__form-subtitle">${t(d.sell_banner.subtitle, langs)}</div>
        <form onsubmit="submitForm(event,'sell')">
          ${buildFormFields(formFields, langs, true)}
          <input type="hidden" name="formname" value="Sell Banner" />
          <button type="submit" class="btn btn--gold" style="width:100%;margin-top:12px">${ui('get_valuation', langs)}</button>
          ${buildPrivacy(langs, true)}
          <div class="form-success">${ui('thank_you', langs)}</div>
        </form>
      </div>
    </div>
  </section>` : '';

  // SEO: Schema.org JSON-LD
  const canonicalUrl = d.canonical_url || '';
  const ogImage = d.og_image || d.hero.image || '';
  const priceMin = d.roi && d.roi.rows && d.roi.rows[0] ? tAttr(d.roi.rows[0].price, langs) : '';
  const schemaLD = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: tAttr(d.project_name, langs),
    description: tAttr(d.meta_description, langs),
    url: canonicalUrl,
    image: ogImage,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'TH',
      addressLocality: tAttr(d.location ? d.location.title : '', langs)
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
      opens: '09:00',
      closes: '18:00'
    },
    makesOffer: (d.roi && d.roi.rows || []).map(function(r) {
      return {
        '@type': 'Offer',
        name: tAttr(r.type, langs),
        price: tAttr(r.price, langs),
        priceCurrency: d.currency || 'USD'
      };
    })
  };
  if (d.contact && d.contact.phone) {
    schemaLD.telephone = d.contact.phone;
  }
  const schemaJSON = JSON.stringify(schemaLD);

  // Contact info: phone + WhatsApp (no email)
  const contactPhone = d.contact && d.contact.phone ? d.contact.phone : '';
  const contactWA = d.contact && d.contact.whatsapp ? d.contact.whatsapp : contactPhone;
  const waLink = contactWA ? 'https://wa.me/' + contactWA.replace(/[^0-9]/g, '') : '';

  return `<!DOCTYPE html>
<html lang="${defaultLang}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${tAttr(d.meta_title, langs)}</title>
  <meta name="description" content="${tAttr(d.meta_description, langs)}" />
  ${canonicalUrl ? `<link rel="canonical" href="${esc(canonicalUrl)}" />` : ''}
  <meta property="og:title" content="${tAttr(d.meta_title, langs)}" />
  <meta property="og:description" content="${tAttr(d.meta_description, langs)}" />
  <meta property="og:type" content="website" />
  ${canonicalUrl ? `<meta property="og:url" content="${esc(canonicalUrl)}" />` : ''}
  ${ogImage ? `<meta property="og:image" content="${esc(ogImage)}" />` : ''}
  <script type="application/ld+json">${schemaJSON}</script>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="${esc(tmpl.fontImport)}" rel="stylesheet" />
  <style>
    :root{--cream:${tmpl.colors.cream};--cream-light:${tmpl.colors['cream-light']};--teal:${tmpl.colors.teal};--teal-dark:${tmpl.colors['teal-dark']};--gold:${tmpl.colors.gold};--gold-hover:${tmpl.colors['gold-hover']};--text-dark:${tmpl.colors['text-dark']};--text-mid:${tmpl.colors['text-mid']};--text-muted:${tmpl.colors['text-muted']};--white:${tmpl.colors.white};--border:${tmpl.colors.border};--font-heading:${tmpl.fonts.heading};--font-body:${tmpl.fonts.body};--font-ui:${tmpl.fonts.ui};--px:clamp(24px,6vw,120px)}
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    html{scroll-behavior:smooth}
    body{font-family:var(--font-body);background:var(--cream-light);color:var(--text-dark);overflow-x:hidden}
    img{display:block;width:100%;object-fit:cover}
    a{text-decoration:none;color:inherit}
    ul{list-style:none}
    .container{padding:0 var(--px)}
    .section{padding:100px 0}
    .section--cream{background:var(--cream)}
    .btn{display:inline-flex;align-items:center;justify-content:center;font-family:var(--font-ui);font-size:15px;font-weight:500;padding:14px 32px;border-radius:100px;cursor:pointer;transition:background .2s,transform .15s;border:none;white-space:nowrap}
    .btn--gold{background:var(--gold);color:var(--white)}
    .btn--gold:hover{background:var(--gold-hover);transform:translateY(-1px)}
    .btn--teal-outline{background:transparent;color:var(--teal);border:1.5px solid var(--teal)}
    .btn--teal-outline:hover{background:var(--teal);color:var(--white)}
    .section-title{font-family:var(--font-heading);font-size:clamp(32px,4.5vw,52px);font-weight:300;color:var(--text-mid);margin-bottom:48px}
    .reveal{opacity:0;transform:translateY(28px);transition:opacity .65s ease,transform .65s ease}
    .reveal.visible{opacity:1;transform:none}
    ${multiLang ? `[data-lang]{display:none}body[data-lang="${defaultLang}"] [data-lang="${defaultLang}"]{display:revert}${langs.filter(l=>l!==defaultLang).map(l=>`body[data-lang="${l}"] [data-lang="${l}"]{display:revert}`).join('')}` : ''}
    .lang-switch{display:flex;gap:4px;margin-left:16px}
    .lang-switch__btn{font-family:var(--font-ui);font-size:11px;font-weight:600;padding:4px 10px;border-radius:4px;border:1.5px solid rgba(255,255,255,.4);background:transparent;color:rgba(255,255,255,.7);cursor:pointer;transition:.2s;letter-spacing:.05em}
    .lang-switch__btn.active{background:rgba(255,255,255,.9);color:var(--teal);border-color:rgba(255,255,255,.9)}
    .nav.solid .lang-switch__btn{border-color:rgba(0,0,0,.2);color:var(--text-mid)}
    .nav.solid .lang-switch__btn.active{background:var(--teal);color:var(--white);border-color:var(--teal)}
    .nav{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:0 var(--px);height:64px;background:rgba(242,237,230,.96);backdrop-filter:blur(8px);border-bottom:1px solid rgba(0,0,0,.06);transition:background .3s}
    .nav.transparent{background:transparent;border-bottom-color:transparent}
    .nav__logo{font-family:var(--font-heading);font-size:20px;font-weight:300;letter-spacing:.1em;text-transform:uppercase;color:var(--white)}
    .nav.solid .nav__logo{color:var(--text-dark)}
    .nav__links{display:flex;gap:28px;align-items:center}
    .nav__links a{font-family:var(--font-ui);font-size:11px;font-weight:500;letter-spacing:.1em;text-transform:uppercase;color:var(--white);opacity:.85;transition:opacity .2s}
    .nav.solid .nav__links a{color:var(--text-dark)}
    .nav__links a:hover{opacity:1}
    .nav__right{display:flex;align-items:center;gap:12px}
    .nav__call-btn{font-family:var(--font-ui);font-size:13px;padding:9px 22px;border-radius:100px;border:1.5px solid var(--white);color:var(--white);background:transparent;cursor:pointer;transition:background .2s,color .2s}
    .nav.solid .nav__call-btn{border-color:var(--teal);color:var(--teal)}
    .nav__call-btn:hover{background:var(--white);color:var(--teal)}
    .nav__burger{display:none;flex-direction:column;gap:5px;cursor:pointer}
    .nav__burger span{width:24px;height:2px;background:var(--white);border-radius:2px}
    .nav.solid .nav__burger span{background:var(--text-dark)}
    .hero{position:relative;height:100vh;min-height:600px;display:flex;flex-direction:column;justify-content:flex-end;background:#1a2a2a;overflow:hidden}
    .hero__bg{position:absolute;inset:0;background-size:cover;background-position:center top;transform:scale(1.04);transition:transform 8s ease-out}
    .hero__bg.loaded{transform:scale(1)}
    .hero__overlay{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,0) 0%,rgba(0,0,0,.18) 50%,rgba(0,0,0,.62) 100%)}
    .hero__content{position:relative;z-index:2;padding:0 var(--px);display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:flex-end;padding-bottom:120px}
    .hero__title{font-family:var(--font-heading);font-size:clamp(36px,5vw,64px);font-weight:300;line-height:1.15;color:var(--white)}
    .hero__desc{font-size:clamp(14px,1.5vw,17px);line-height:1.7;color:rgba(255,255,255,.9);align-self:flex-end}
    .hero__stats{position:relative;z-index:2;background:rgba(47,80,80,.88);backdrop-filter:blur(6px)}
    .hero__stats-inner{padding:0 var(--px);display:grid;grid-template-columns:repeat(4,1fr)}
    .hero__stat{padding:22px 0;border-right:1px solid rgba(255,255,255,.15);text-align:center}
    .hero__stat:first-child{text-align:left;padding-left:0}
    .hero__stat:last-child{border-right:none;text-align:right;padding-right:0}
    .hero__stat-value{font-family:var(--font-ui);font-size:clamp(15px,2vw,21px);font-weight:400;color:var(--white);display:block}
    .hero__stat-label{font-family:var(--font-ui);font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:rgba(255,255,255,.65);margin-top:4px;display:block}
    .concept{background:var(--cream-light)}
    .sell-banner{position:relative;overflow:hidden}
    .sell-banner__bg{position:absolute;inset:0;background-size:cover;background-position:center;filter:brightness(.4)}
    .sell-banner__content{position:relative;z-index:2;padding:100px var(--px);display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center}
    .sell-banner__form-box{background:rgba(255,255,255,.96);border-radius:16px;padding:40px}
    .sell-banner__form-title{font-family:var(--font-heading);font-size:clamp(18px,2.5vw,26px);font-weight:600;text-align:center;color:var(--text-dark);text-transform:uppercase;letter-spacing:.02em;margin-bottom:8px;line-height:1.3}
    .sell-banner__form-subtitle{font-size:13px;color:var(--text-muted);text-align:center;margin-bottom:28px;line-height:1.6}
    .catalogue{background:var(--teal);border-radius:20px;margin:0 var(--px);padding:60px clamp(32px,5vw,80px);display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center}
    .catalogue__left h3{font-family:var(--font-ui);font-size:clamp(28px,3.5vw,46px);font-weight:600;color:var(--white);margin-bottom:28px}
    .catalogue__tags{display:flex;flex-wrap:wrap}
    .catalogue__tag{font-family:var(--font-ui);font-size:13px;color:rgba(255,255,255,.75);padding:0 20px 0 0;border-right:1px solid rgba(255,255,255,.3);margin-right:20px;margin-bottom:12px;white-space:nowrap}
    .catalogue__tag:last-child{border-right:none}
    .catalogue__image{border-radius:12px;overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,.3);aspect-ratio:4/3}
    .roi__table-wrap{background:var(--teal);border-radius:16px;overflow:hidden}
    .roi__table{width:100%;border-collapse:collapse}
    .roi__table th{font-family:var(--font-ui);font-size:12px;font-weight:500;text-transform:uppercase;letter-spacing:.08em;color:rgba(255,255,255,.6);padding:20px 24px;text-align:left;border-bottom:1px solid rgba(255,255,255,.12)}
    .roi__table td{padding:24px;font-size:15px;color:var(--white);border-bottom:1px solid rgba(255,255,255,.08)}
    .roi__table tr:last-child td{border-bottom:none}
    .roi__badge{display:inline-flex;align-items:center;justify-content:center;background:var(--gold);color:var(--white);font-family:var(--font-ui);font-size:18px;font-weight:600;padding:8px 20px;border-radius:8px}
    .roi__cta-row td{text-align:center;padding:32px}
    .location__grid{display:grid;grid-template-columns:1fr 1fr;gap:80px}
    .location__desc{font-size:16px;line-height:1.85;color:var(--text-mid);margin-bottom:36px}
    .location__distances{display:flex;flex-direction:column}
    .location__dist-row{display:flex;justify-content:space-between;padding:18px 0;border-bottom:1px solid var(--border);font-size:15px}
    .location__dist-row:first-child{border-top:1px solid var(--border)}
    .location__place{color:var(--text-mid)}
    .location__time{color:var(--text-dark);font-weight:500}
    .location__map{border-radius:16px;overflow:hidden;background:#e5e0d8;min-height:420px}
    .location__map iframe{width:100%;height:100%;min-height:420px;border:none}
    .developer__grid{display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center}
    .developer__image{border-radius:16px;overflow:hidden;aspect-ratio:4/3}
    .developer__logo{font-family:var(--font-heading);font-size:36px;font-weight:300;letter-spacing:.08em;text-transform:uppercase;color:var(--text-dark);margin-bottom:24px}
    .developer__desc{font-size:16px;line-height:1.85;color:var(--text-mid);margin-bottom:36px}
    .developer__stats{display:flex;flex-direction:column}
    .developer__stat-row{display:flex;justify-content:space-between;padding:16px 0;border-bottom:1px solid var(--border);font-size:14px}
    .developer__stat-row:first-child{border-top:1px solid var(--border)}
    .developer__stat-key{color:var(--text-muted)}
    .developer__stat-val{color:var(--text-dark);font-weight:500;text-align:right;max-width:60%}
    .final-cta{background:var(--cream)}
    .final-cta__grid{display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center}
    .final-cta h2{font-family:var(--font-heading);font-size:clamp(32px,4vw,48px);font-weight:300;color:var(--text-dark);margin-bottom:20px}
    .final-cta p{font-size:14px;color:var(--text-muted);line-height:1.7;margin-bottom:24px}
    .final-cta__contact{font-size:14px;color:var(--text-mid);line-height:2.2}
    .final-cta__contact a{color:var(--teal)}
    .final-cta__form-box{background:var(--teal);border-radius:20px;padding:40px 36px}
    .final-cta__form-title{font-family:var(--font-ui);font-size:clamp(22px,3vw,32px);font-weight:600;color:var(--white);margin-bottom:28px;text-align:center}
    .form-group{margin-bottom:16px}
    .form-input{width:100%;background:transparent;border:none;border-bottom:1px solid rgba(255,255,255,.4);padding:12px 0;font-family:var(--font-body);font-size:14px;color:var(--white);outline:none;transition:border-color .2s}
    .form-input::placeholder{color:rgba(255,255,255,.5)}
    .form-input:focus{border-bottom-color:var(--gold)}
    .form-input--light{color:var(--text-dark);border-bottom-color:rgba(0,0,0,.2)}
    .form-input--light::placeholder{color:var(--text-muted)}
    .form-input--light:focus{border-bottom-color:var(--teal)}
    .form-consent{display:flex;align-items:flex-start;gap:8px;font-size:11px;color:rgba(255,255,255,.45);margin-top:12px;line-height:1.6;cursor:pointer}
    .form-consent input{margin-top:3px;flex-shrink:0}
    .form-consent a{text-decoration:underline}
    .form-consent--light{color:var(--text-muted)}
    .form-success{display:none;text-align:center;padding:20px;color:var(--white);font-size:16px}
    .footer{background:var(--teal-dark);padding:32px var(--px);display:flex;justify-content:space-between;align-items:center;font-family:var(--font-ui);font-size:12px;color:rgba(255,255,255,.4)}
    .footer a{color:rgba(255,255,255,.5)}
    .modal-overlay{display:none;position:fixed;inset:0;z-index:200;background:rgba(0,0,0,.55);backdrop-filter:blur(4px);align-items:center;justify-content:center}
    .modal-overlay.open{display:flex}
    .modal-box{background:var(--teal);border-radius:20px;padding:48px 40px;width:100%;max-width:440px;position:relative}
    .modal-box h3{font-family:var(--font-ui);font-size:28px;font-weight:600;color:var(--white);text-align:center;margin-bottom:24px}
    .modal-close{position:absolute;top:16px;right:20px;background:none;border:none;cursor:pointer;font-size:22px;color:rgba(255,255,255,.6)}
    .wa-float{position:fixed;bottom:24px;right:24px;z-index:90;width:56px;height:56px;border-radius:50%;background:#25D366;color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(0,0,0,.2);transition:transform .2s}.wa-float:hover{transform:scale(1.1)}
    @media(max-width:900px){
      .nav__links{display:none}.nav__burger{display:flex}
      .hero__content{grid-template-columns:1fr;padding-bottom:160px}
      .hero__stats-inner{grid-template-columns:repeat(2,1fr)}
      .hero__stat:nth-child(2){border-right:none}
      .catalogue,.developer__grid,.final-cta__grid,.location__grid{grid-template-columns:1fr;gap:40px}
      .sell-banner__content{grid-template-columns:1fr}
      .roi__table{font-size:13px}
      .roi__table th,.roi__table td{padding:16px 12px}
    }
    ${variantCSS}
  </style>
</head>
<body${multiLang ? ` data-lang="${defaultLang}"` : ''}>
  <nav class="nav transparent" id="mainNav">
    <a href="#" class="nav__logo">${t(d.project_name, langs)}</a>
    <ul class="nav__links" id="navLinks">
      <li><a href="#concept">${ui('concept', langs)}</a></li>
      <li><a href="#amenities">${ui('amenities', langs)}</a></li>
      <li><a href="#layouts">${ui('layouts', langs)}</a></li>
      <li><a href="#roi">${ui('investment', langs)}</a></li>
      <li><a href="#gallery">${ui('gallery', langs)}</a></li>
      <li><a href="#location">${ui('location', langs)}</a></li>
    </ul>
    <div class="nav__right">
      ${langSwitcher}
      <button class="nav__call-btn" onclick="openModal('nav')">${ui('request_call', langs)}</button>
    </div>
    <div class="nav__burger" id="burger"><span></span><span></span><span></span></div>
  </nav>

  <section class="hero">
    <div class="hero__bg" id="heroBg" style="background-image:url('${esc(d.hero.image)}')"></div>
    <div class="hero__overlay"></div>
    <div class="hero__content">
      <h1 class="hero__title">${t(d.hero.title, langs)}</h1>
      <p class="hero__desc">${t(d.hero.description, langs)}</p>
    </div>
    <div class="hero__stats">
      <div class="hero__stats-inner">${buildHeroStats(d.hero.stats, langs)}</div>
    </div>
  </section>

  ${conceptResult.html}

  ${sellBannerSection}

  ${amenitiesResult.html}

  <section class="section">
    <div class="catalogue reveal">
      <div class="catalogue__left">
        <h3>${ui('download_catalogue', langs)}</h3>
        <div class="catalogue__tags">${buildCatalogueTags(d.catalogue.tags, langs)}</div>
        <form onsubmit="submitForm(event,'catalogue')" style="margin-top:32px">
          ${buildFormFields(formFields, langs, false)}
          <input type="hidden" name="formname" value="Catalogue" />
          <button type="submit" class="btn btn--gold" style="width:100%;margin-top:12px">${ui('get_catalogue', langs)}</button>
          ${buildPrivacy(langs, false)}
          <div class="form-success">${ui('thank_you', langs)}</div>
        </form>
      </div>
      <div class="catalogue__image">
        <img src="${esc(d.catalogue.image)}" alt="${tAttr(d.project_name, langs)} catalogue" loading="lazy" />
      </div>
    </div>
  </section>

  ${floorplansResult.html}

  <section class="section" id="roi">
    <div class="container">
      <h2 class="section-title reveal">${t(d.roi.title, langs)}</h2>
      <div class="roi__table-wrap reveal" style="transition-delay:.1s">
        <table class="roi__table">
          <thead><tr><th>${ui('unit_type', langs)}</th><th>${ui('size', langs)}</th><th>${ui('price_from', langs)}</th><th>${ui('guaranteed_roi', langs)}</th><th>${ui('annual_income', langs)}</th></tr></thead>
          <tbody>${buildRoiRows(d.roi.rows, langs)}
            <tr class="roi__cta-row"><td colspan="5"><button class="btn btn--gold" onclick="openModal('roi')">${ui('get_investment_plan', langs)}</button></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>

  ${galleryResult.html}

  <section class="section" id="location">
    <div class="container">
      <h2 class="section-title reveal">${t(d.location.title, langs)}</h2>
      <div class="location__grid">
        <div class="reveal">
          <p class="location__desc">${t(d.location.description, langs)}</p>
          <div class="location__distances">${buildDistances(d.location.distances, langs)}</div>
        </div>
        <div class="location__map reveal" style="transition-delay:.15s">
          <iframe src="${esc(d.location.map_embed)}" allowfullscreen loading="lazy"></iframe>
        </div>
      </div>
    </div>
  </section>

  <section class="section section--cream">
    <div class="container">
      <h2 class="section-title reveal">${ui('about_developer', langs)}</h2>
      <div class="developer__grid">
        <div class="developer__image reveal">
          <img src="${esc(d.developer.image)}" alt="${tAttr(d.developer.name, langs)}" loading="lazy" />
        </div>
        <div class="reveal" style="transition-delay:.15s">
          <div class="developer__logo">${t(d.developer.name, langs)}</div>
          <p class="developer__desc">${t(d.developer.description, langs)}</p>
          <div class="developer__stats">${buildDevFacts(d.developer.facts, langs)}</div>
        </div>
      </div>
    </div>
  </section>

  <section class="section final-cta">
    <div class="container">
      <div class="final-cta__grid">
        <div class="reveal">
          <h2>${ui('still_questions', langs)} ${t(d.project_name, langs)}?</h2>
          <p>${ui('experts_help', langs)}</p>
          <div class="final-cta__contact">
            ${contactPhone ? `<div><a href="tel:${esc(contactPhone)}">${esc(contactPhone)}</a></div>` : ''}
            ${waLink ? `<div><a href="${esc(waLink)}" target="_blank" rel="noopener">WhatsApp</a></div>` : ''}
            ${d.contact && d.contact.website ? `<div><a href="https://${esc(d.contact.website)}" target="_blank">${esc(d.contact.website)}</a></div>` : ''}
          </div>
        </div>
        <div class="final-cta__form-box reveal" style="transition-delay:.15s">
          <div class="final-cta__form-title">${ui('request_callback', langs)}</div>
          <form id="mainForm" onsubmit="submitForm(event,'main')">
            ${buildFormFields(formFields, langs, false)}
            <input type="hidden" name="formname" value="Main Callback" />
            <button type="submit" class="btn btn--gold" style="width:100%;margin-top:12px">${ui('send_request', langs)}</button>
            ${buildPrivacy(langs, false)}
            <div class="form-success">${ui('thank_you', langs)}</div>
          </form>
        </div>
      </div>
    </div>
  </section>

  <footer class="footer">
    <span>&copy; ${new Date().getFullYear()} ${tAttr(d.project_name, langs)}. ${ui('rights', langs)}</span>
    <div style="display:flex;gap:24px">
      ${contactPhone ? `<a href="tel:${esc(contactPhone)}">${esc(contactPhone)}</a>` : ''}
      <a href="#">${ui('privacy_policy', langs)}</a><a href="#">${ui('terms', langs)}</a>
    </div>
  </footer>

  ${waLink ? `<a href="${esc(waLink)}" target="_blank" rel="noopener" class="wa-float" aria-label="WhatsApp"><svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></a>` : ''}

  <div class="modal-overlay" id="modal" onclick="closeModalOutside(event)">
    <div class="modal-box">
      <button class="modal-close" onclick="closeModal()">&times;</button>
      <h3>${ui('request_callback', langs)}</h3>
      <form id="modalForm" onsubmit="submitForm(event,'modal')">
        ${buildFormFields(formFields, langs, false)}
        <input type="hidden" name="formname" value="Modal" />
        <button type="submit" class="btn btn--gold" style="width:100%;margin-top:12px">${ui('send_request', langs)}</button>
        ${buildPrivacy(langs, false)}
        <div class="form-success">${ui('thank_you', langs)}</div>
      </form>
    </div>
  </div>

  <script>
    var WEBHOOK = '${webhook}';
    var PROJECT = '${tAttr(d.project_name, langs)}';

    // Language switcher
    function switchLang(lang) {
      document.body.setAttribute('data-lang', lang);
      document.querySelectorAll('.lang-switch__btn').forEach(function(b){
        b.classList.toggle('active', b.getAttribute('data-lang') === lang);
      });
    }

    // Nav scroll
    var nav = document.getElementById('mainNav');
    setTimeout(function(){ document.getElementById('heroBg').classList.add('loaded'); }, 100);
    window.addEventListener('scroll', function(){
      if(window.scrollY > 60){ nav.classList.remove('transparent'); nav.classList.add('solid'); }
      else { nav.classList.add('transparent'); nav.classList.remove('solid'); }
    });
    document.getElementById('burger').addEventListener('click', function(){
      var l = document.getElementById('navLinks');
      var o = l.style.display === 'flex';
      l.style.display = o ? 'none' : 'flex';
      if(!o) l.style.cssText = 'display:flex;flex-direction:column;position:absolute;top:64px;left:0;right:0;background:var(--cream);padding:20px 24px;gap:16px;z-index:99';
    });

    // Reveal
    var obs = new IntersectionObserver(function(e){ e.forEach(function(x){ if(x.isIntersecting) x.target.classList.add('visible'); }); }, {threshold:.12});
    document.querySelectorAll('.reveal').forEach(function(el){ obs.observe(el); });

    // Variant-specific JS
    ${variantJS}

    // Modal
    function openModal(src){ document.getElementById('modal').classList.add('open'); document.getElementById('modal').dataset.src = src||''; }
    function closeModal(){ document.getElementById('modal').classList.remove('open'); }
    function closeModalOutside(e){ if(e.target === e.currentTarget) closeModal(); }

    // Form submit
    function submitForm(e, formId) {
      e.preventDefault();
      var form = e.target;
      var privacy = form.querySelector('input[name=privacy]');
      if (privacy && !privacy.checked) { privacy.focus(); return; }
      var data = new FormData(form);
      data.append('project', PROJECT);
      data.append('formid', formId);
      data.append('language', document.body.getAttribute('data-lang') || '${defaultLang}');
      var body = new URLSearchParams(data).toString();
      if(!WEBHOOK) { showSuccess(form); return; }
      fetch(WEBHOOK, { method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body:body, mode:'no-cors' }).catch(function(){});
      showSuccess(form);
    }
    function showSuccess(form) {
      form.querySelectorAll('input:not([type=hidden]),button,label').forEach(function(el){ el.style.display='none'; });
      var s = form.querySelector('.form-success');
      if(s) s.style.display = 'block';
    }
  </script>
</body>
</html>`;
}

// CLI
function main() {
  var args = process.argv.slice(2).filter(function(a){ return !a.startsWith('--'); });
  if(args.length === 0){ console.log('Usage: node generate.js data/project.json'); process.exit(0); }
  for(var i=0; i<args.length; i++){
    var jsonPath = args[i];
    try {
      var data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      var slug = data.project_slug;
      var distDir = path.join(__dirname, 'dist', slug);
      fs.mkdirSync(distDir, {recursive:true});
      var html = generateHTML(data);
      var outPath = path.join(distDir, 'index.html');
      fs.writeFileSync(outPath, html, 'utf8');
      console.log('✓ ' + slug + ' → ' + outPath);
    } catch(err) {
      console.error('✗ ' + jsonPath + ': ' + err.message);
    }
  }
}

module.exports = { generateHTML, TEMPLATES };
if (require.main === module) main();
