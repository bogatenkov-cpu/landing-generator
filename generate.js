#!/usr/bin/env node
/**
 * Landing Page Generator — Tranio Thailand
 * node generate.js data/anava-samui.json
 */

const fs = require('fs');
const path = require('path');

function esc(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function sanitizeHtml(str) {
  // Escape everything, then restore only safe tags: <strong>, <em>, <br>
  let s = esc(str);
  s = s.replace(/&lt;(\/?(strong|em|b|i|br)\s*\/?)&gt;/gi, '<$1>');
  return s;
}

function buildHeroStats(stats) {
  return stats.map(s => `
        <div class="hero__stat">
          <span class="hero__stat-value">${esc(s.value)}</span>
          <span class="hero__stat-label">${esc(s.label)}</span>
        </div>`).join('');
}
function buildConceptSpecs(specs) {
  return specs.map(s => `
          <div class="concept__spec-row">
            <span class="concept__spec-key">${esc(s.key)}</span>
            <span class="concept__spec-val">${esc(s.value)}</span>
          </div>`).join('');
}
function buildAmenities(items) {
  return items.map((item, i) => `
            <div class="amenities__item">
              <span class="amenities__num">${String(i+1).padStart(2,'0')}</span>
              <span class="amenities__name">${esc(item)}</span>
            </div>`).join('');
}
function buildCatalogueTags(tags) {
  return tags.map(t => `<span class="catalogue__tag">${esc(t)}</span>`).join('\n          ');
}
function buildLayouts(layouts) {
  return layouts.map(l => `
        <div class="layout-item">
          <button class="layout-item__header" onclick="toggleLayout(this)">
            <span>${esc(l.name)} — from ${esc(l.price_from)}</span>
            <span class="toggle">+</span>
          </button>
          <div class="layout-item__body">
            <div class="layout-item__plan">
              <div style="color:rgba(255,255,255,.4);font-family:var(--font-ui);font-size:14px;text-align:center">Floor plan<br>available upon request</div>
            </div>
            <div class="layout-item__specs">
              <div>${l.specs.map(s=>`<div class="layout-item__spec-row"><span class="layout-item__spec-key">${esc(s.key)}</span><span class="layout-item__spec-val">${esc(s.value)}</span></div>`).join('')}</div>
              <button class="btn btn--gold layout-item__cta" onclick="openModal('layouts')">Request Floor Plan</button>
            </div>
          </div>
        </div>`).join('\n');
}
function buildRoiRows(rows) {
  return rows.map(r => `
            <tr>
              <td>${esc(r.type)}</td><td>${esc(r.size)}</td><td>${esc(r.price)}</td>
              <td><span class="roi__badge">${esc(r.roi)}</span></td><td>${esc(r.annual_income)}</td>
            </tr>`).join('');
}
function buildGallerySlides(images) {
  return images.map((img,i) => `
          <div class="gallery__slide"><img src="${esc(img)}" alt="Gallery ${i+1}" loading="lazy" /></div>`).join('');
}
function buildDistances(distances) {
  return distances.map(d => `
            <div class="location__dist-row">
              <span class="location__place">${esc(d.place)}</span>
              <span class="location__time">${esc(d.time)}</span>
            </div>`).join('');
}
function buildDevFacts(facts) {
  return facts.map(f => `
            <div class="developer__stat-row">
              <span class="developer__stat-key">${esc(f.key)}</span>
              <span class="developer__stat-val">${esc(f.value)}</span>
            </div>`).join('');
}

function generateHTML(data) {
  const d = data;
  const webhook = esc(d.crm_webhook || '');

  const sellBannerSection = d.sell_banner && d.sell_banner.show ? `
  <section class="sell-banner">
    <div class="sell-banner__bg" style="background-image:url('${esc(d.sell_banner.image)}')"></div>
    <div class="sell-banner__content">
      <div></div>
      <div class="sell-banner__form-box reveal">
        <div class="sell-banner__form-title">${sanitizeHtml(d.sell_banner.title)}</div>
        <div class="sell-banner__form-subtitle">${esc(d.sell_banner.subtitle)}</div>
        <form onsubmit="submitForm(event,'sell')">
          <div class="form-group"><input type="text" name="name" class="form-input form-input--light" placeholder="Your name" required /></div>
          <div class="form-group"><input type="email" name="email" class="form-input form-input--light" placeholder="Email" /></div>
          <div class="form-group"><input type="tel" name="phone" class="form-input form-input--light" placeholder="Phone number" required /></div>
          <input type="hidden" name="formname" value="Sell Banner" />
          <button type="submit" class="btn btn--gold" style="width:100%;margin-top:12px">Get a Valuation</button>
          <p class="form-privacy form-privacy--light">I confirm I have read and accept the <a href="#">Privacy Policy</a></p>
        </form>
      </div>
    </div>
  </section>` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(d.meta_title)}</title>
  <meta name="description" content="${esc(d.meta_description)}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    :root{--cream:#F2EDE6;--cream-light:#FAF8F5;--teal:#2F5050;--teal-dark:#253F3F;--gold:#BFA177;--gold-hover:#A8895F;--text-dark:#2C2C2C;--text-mid:#4A4A4A;--text-muted:#888;--white:#FFF;--border:rgba(0,0,0,.12);--font-heading:'Open Sans',sans-serif;--font-body:'Open Sans',sans-serif;--font-ui:'Poppins',sans-serif;--px:clamp(24px,6vw,120px)}
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
    .nav{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:0 var(--px);height:64px;background:rgba(242,237,230,.96);backdrop-filter:blur(8px);border-bottom:1px solid rgba(0,0,0,.06);transition:background .3s}
    .nav.transparent{background:transparent;border-bottom-color:transparent}
    .nav__logo{font-family:var(--font-heading);font-size:20px;font-weight:300;letter-spacing:.1em;text-transform:uppercase;color:var(--white)}
    .nav.solid .nav__logo{color:var(--text-dark)}
    .nav__links{display:flex;gap:28px;align-items:center}
    .nav__links a{font-family:var(--font-ui);font-size:11px;font-weight:500;letter-spacing:.1em;text-transform:uppercase;color:var(--white);opacity:.85;transition:opacity .2s}
    .nav.solid .nav__links a{color:var(--text-dark)}
    .nav__links a:hover{opacity:1}
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
    .concept__grid{display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:start;padding:0 var(--px)}
    .concept__text h2{margin-bottom:24px;font-size:clamp(36px,5vw,56px);line-height:1.1}
    .concept__text p{font-size:16px;line-height:1.85;color:var(--text-mid);margin-bottom:16px}
    .concept__text p strong{color:var(--text-dark);font-weight:600}
    .concept__ctas{display:flex;gap:16px;margin-top:40px;flex-wrap:wrap}
    .concept__ctas .btn{padding:18px 40px;font-size:16px}
    .concept__specs{padding-top:0}
    .concept__spec-row{display:flex;justify-content:space-between;align-items:baseline;padding:24px 0;border-bottom:1px solid var(--border)}
    .concept__spec-key{color:var(--text-muted);font-size:18px;font-weight:300}
    .concept__spec-val{color:var(--text-dark);font-weight:400;text-align:right;font-size:clamp(22px,2.5vw,32px)}
    .sell-banner{position:relative;overflow:hidden}
    .sell-banner__bg{position:absolute;inset:0;background-size:cover;background-position:center;filter:brightness(.4)}
    .sell-banner__content{position:relative;z-index:2;padding:100px var(--px);display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center}
    .sell-banner__form-box{background:rgba(255,255,255,.96);border-radius:16px;padding:40px}
    .sell-banner__form-title{font-family:var(--font-heading);font-size:clamp(18px,2.5vw,26px);font-weight:600;text-align:center;color:var(--text-dark);text-transform:uppercase;letter-spacing:.02em;margin-bottom:8px;line-height:1.3}
    .sell-banner__form-subtitle{font-size:13px;color:var(--text-muted);text-align:center;margin-bottom:28px;line-height:1.6}
    .amenities__grid{display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center}
    .amenities__image{border-radius:12px;overflow:hidden;aspect-ratio:4/3}
    .amenities__list{display:flex;flex-direction:column}
    .amenities__item{display:flex;align-items:center;padding:22px 0;border-bottom:1px solid var(--border);font-size:16px}
    .amenities__item:first-child{border-top:1px solid var(--border)}
    .amenities__num{color:var(--text-muted);font-size:13px;min-width:32px}
    .amenities__name{flex:1;color:var(--text-dark);padding-left:16px}
    .catalogue{background:var(--teal);border-radius:20px;margin:0 var(--px);padding:60px clamp(32px,5vw,80px);display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center}
    .catalogue__left h3{font-family:var(--font-ui);font-size:clamp(28px,3.5vw,46px);font-weight:600;color:var(--white);margin-bottom:28px}
    .catalogue__tags{display:flex;flex-wrap:wrap}
    .catalogue__tag{font-family:var(--font-ui);font-size:13px;color:rgba(255,255,255,.75);padding:0 20px 0 0;border-right:1px solid rgba(255,255,255,.3);margin-right:20px;margin-bottom:12px;white-space:nowrap}
    .catalogue__tag:last-child{border-right:none}
    .catalogue__image{border-radius:12px;overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,.3);aspect-ratio:4/3}
    .layouts__accordion{display:flex;flex-direction:column}
    .layout-item__header{width:100%;display:flex;justify-content:space-between;align-items:center;padding:20px 24px;background:var(--teal);cursor:pointer;border-radius:12px;margin-bottom:2px;font-family:var(--font-ui);font-size:15px;font-weight:500;color:var(--white);letter-spacing:.05em;text-transform:uppercase;border:none}
    .layout-item__header .toggle{width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,.9);color:var(--teal);display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:300;flex-shrink:0;transition:transform .3s}
    .layout-item.open .layout-item__header .toggle{transform:rotate(45deg)}
    .layout-item__body{display:none;grid-template-columns:1fr 1fr;background:var(--teal);border-radius:12px;overflow:hidden;margin-bottom:8px}
    .layout-item.open .layout-item__body{display:grid}
    .layout-item__plan{background:rgba(255,255,255,.07);display:flex;align-items:center;justify-content:center;padding:24px;min-height:320px}
    .layout-item__specs{padding:40px;display:flex;flex-direction:column;justify-content:space-between}
    .layout-item__spec-row{display:flex;justify-content:space-between;align-items:center;padding:16px 0;border-bottom:1px solid rgba(255,255,255,.15);font-size:14px}
    .layout-item__spec-row:first-child{border-top:1px solid rgba(255,255,255,.15)}
    .layout-item__spec-key{color:rgba(255,255,255,.6)}
    .layout-item__spec-val{color:var(--white);font-weight:500}
    .layout-item__cta{margin-top:32px;width:100%}
    .roi__table-wrap{background:var(--teal);border-radius:16px;overflow:hidden}
    .roi__table{width:100%;border-collapse:collapse}
    .roi__table th{font-family:var(--font-ui);font-size:12px;font-weight:500;text-transform:uppercase;letter-spacing:.08em;color:rgba(255,255,255,.6);padding:20px 24px;text-align:left;border-bottom:1px solid rgba(255,255,255,.12)}
    .roi__table td{padding:24px;font-size:15px;color:var(--white);border-bottom:1px solid rgba(255,255,255,.08)}
    .roi__table tr:last-child td{border-bottom:none}
    .roi__badge{display:inline-flex;align-items:center;justify-content:center;background:var(--gold);color:var(--white);font-family:var(--font-ui);font-size:18px;font-weight:600;padding:8px 20px;border-radius:8px}
    .roi__cta-row td{text-align:center;padding:32px}
    .gallery__header{display:flex;justify-content:space-between;align-items:center;margin-bottom:28px}
    .gallery__nav{display:flex;gap:12px}
    .gallery__nav button{width:40px;height:40px;border-radius:50%;border:1.5px solid var(--border);background:transparent;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;transition:.2s}
    .gallery__nav button:hover{border-color:var(--teal);background:var(--teal);color:#fff}
    .gallery__track-wrap{overflow:hidden}
    .gallery__track{display:flex;gap:16px;transition:transform .45s cubic-bezier(.4,0,.2,1)}
    .gallery__slide{flex:0 0 calc(50% - 8px);border-radius:12px;overflow:hidden;aspect-ratio:16/10}
    .gallery__slide img{width:100%;height:100%;object-fit:cover}
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
    .form-privacy{font-size:11px;color:rgba(255,255,255,.45);text-align:center;margin-top:12px;line-height:1.6}
    .form-privacy--light{color:var(--text-muted)}
    .form-privacy a{text-decoration:underline}
    .form-success{display:none;text-align:center;padding:20px;color:var(--white);font-size:16px}
    .footer{background:var(--teal-dark);padding:32px var(--px);display:flex;justify-content:space-between;align-items:center;font-family:var(--font-ui);font-size:12px;color:rgba(255,255,255,.4)}
    .footer a{color:rgba(255,255,255,.5)}
    .modal-overlay{display:none;position:fixed;inset:0;z-index:200;background:rgba(0,0,0,.55);backdrop-filter:blur(4px);align-items:center;justify-content:center}
    .modal-overlay.open{display:flex}
    .modal-box{background:var(--teal);border-radius:20px;padding:48px 40px;width:100%;max-width:440px;position:relative}
    .modal-box h3{font-family:var(--font-ui);font-size:28px;font-weight:600;color:var(--white);text-align:center;margin-bottom:24px}
    .modal-close{position:absolute;top:16px;right:20px;background:none;border:none;cursor:pointer;font-size:22px;color:rgba(255,255,255,.6)}
    @media(max-width:900px){
      .nav__links{display:none}.nav__burger{display:flex}
      .hero__content{grid-template-columns:1fr;padding-bottom:160px}
      .hero__stats-inner{grid-template-columns:repeat(2,1fr)}
      .hero__stat:nth-child(2){border-right:none}
      .concept__grid,.amenities__grid,.catalogue,.developer__grid,.final-cta__grid,.location__grid{grid-template-columns:1fr;gap:40px}
      .gallery__slide{flex:0 0 85%}
      .layout-item__body{grid-template-columns:1fr}
      .sell-banner__content{grid-template-columns:1fr}
      .roi__table{font-size:13px}
      .roi__table th,.roi__table td{padding:16px 12px}
    }
  </style>
</head>
<body>
  <nav class="nav transparent" id="mainNav">
    <a href="#" class="nav__logo">${esc(d.project_name)}</a>
    <ul class="nav__links" id="navLinks">
      <li><a href="#concept">Concept</a></li>
      <li><a href="#amenities">Amenities</a></li>
      <li><a href="#layouts">Layouts</a></li>
      <li><a href="#roi">Investment</a></li>
      <li><a href="#gallery">Gallery</a></li>
      <li><a href="#location">Location</a></li>
    </ul>
    <button class="nav__call-btn" onclick="openModal('nav')">Request a Call</button>
    <div class="nav__burger" id="burger"><span></span><span></span><span></span></div>
  </nav>

  <section class="hero">
    <div class="hero__bg" id="heroBg" style="background-image:url('${esc(d.hero.image)}')"></div>
    <div class="hero__overlay"></div>
    <div class="hero__content">
      <h1 class="hero__title">${esc(d.hero.title)}</h1>
      <p class="hero__desc">${esc(d.hero.description)}</p>
    </div>
    <div class="hero__stats">
      <div class="hero__stats-inner">${buildHeroStats(d.hero.stats)}</div>
    </div>
  </section>

  <section class="section concept" id="concept">
    <div class="concept__grid">
      <div class="concept__text reveal">
        <h2 class="section-title">${esc(d.concept.title)}</h2>
        ${d.concept.paragraphs.map(p=>`<p>${sanitizeHtml(p)}</p>`).join('\n        ')}
        <div class="concept__ctas">
          <a href="#layouts" class="btn btn--gold">Explore Layouts</a>
          <a href="#roi" class="btn btn--teal-outline">Investment Details</a>
        </div>
      </div>
      <div class="concept__specs reveal" style="transition-delay:.15s">${buildConceptSpecs(d.concept.specs)}</div>
    </div>
  </section>

  ${sellBannerSection}

  <section class="section section--cream" id="amenities">
    <div class="container">
      <div class="amenities__grid">
        <div class="amenities__image reveal">
          <img src="${esc(d.amenities.image)}" alt="${esc(d.amenities.title)}" loading="lazy" />
        </div>
        <div class="reveal" style="transition-delay:.15s">
          <h2 class="section-title">${esc(d.amenities.title)}</h2>
          <div class="amenities__list">${buildAmenities(d.amenities.items)}</div>
        </div>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="catalogue reveal">
      <div class="catalogue__left">
        <h3>Download the Full Project Catalogue</h3>
        <div class="catalogue__tags">${buildCatalogueTags(d.catalogue.tags)}</div>
        <form onsubmit="submitForm(event,'catalogue')" style="margin-top:32px">
          <div class="form-group"><input type="text" name="name" class="form-input" placeholder="Your name" required /></div>
          <div class="form-group"><input type="email" name="email" class="form-input" placeholder="Email" /></div>
          <div class="form-group"><input type="tel" name="phone" class="form-input" placeholder="Phone number" required /></div>
          <input type="hidden" name="formname" value="Catalogue" />
          <button type="submit" class="btn btn--gold" style="width:100%;margin-top:12px">Get the Catalogue</button>
          <p class="form-privacy">I confirm I have read and accept the <a href="#">Privacy Policy</a></p>
          <div class="form-success">Thank you! We'll be in touch shortly.</div>
        </form>
      </div>
      <div class="catalogue__image">
        <img src="${esc(d.catalogue.image)}" alt="${esc(d.project_name)} catalogue" loading="lazy" />
      </div>
    </div>
  </section>

  <section class="section section--cream" id="layouts">
    <div class="container">
      <h2 class="section-title reveal">Available Layouts</h2>
      <div class="layouts__accordion reveal" style="transition-delay:.1s">
${buildLayouts(d.layouts)}
      </div>
    </div>
  </section>

  <section class="section" id="roi">
    <div class="container">
      <h2 class="section-title reveal">${esc(d.roi.title)}</h2>
      <div class="roi__table-wrap reveal" style="transition-delay:.1s">
        <table class="roi__table">
          <thead><tr><th>Unit Type</th><th>Size</th><th>Price From</th><th>Guaranteed ROI</th><th>Est. Annual Income</th></tr></thead>
          <tbody>${buildRoiRows(d.roi.rows)}
            <tr class="roi__cta-row"><td colspan="5"><button class="btn btn--gold" onclick="openModal('roi')">Get a Personalized Investment Plan</button></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>

  <section class="section section--cream" id="gallery">
    <div class="container">
      <div class="gallery__header">
        <h2 class="section-title reveal" style="margin-bottom:0">Gallery</h2>
        <div class="gallery__nav">
          <button id="galPrev" aria-label="Previous">&#8592;</button>
          <button id="galNext" aria-label="Next">&#8594;</button>
        </div>
      </div>
      <div class="gallery__track-wrap reveal" style="transition-delay:.1s">
        <div class="gallery__track" id="galTrack">${buildGallerySlides(d.gallery.images)}</div>
      </div>
    </div>
  </section>

  <section class="section" id="location">
    <div class="container">
      <h2 class="section-title reveal">${esc(d.location.title)}</h2>
      <div class="location__grid">
        <div class="reveal">
          <p class="location__desc">${esc(d.location.description)}</p>
          <div class="location__distances">${buildDistances(d.location.distances)}</div>
        </div>
        <div class="location__map reveal" style="transition-delay:.15s">
          <iframe src="${esc(d.location.map_embed)}" allowfullscreen loading="lazy"></iframe>
        </div>
      </div>
    </div>
  </section>

  <section class="section section--cream">
    <div class="container">
      <h2 class="section-title reveal">About the Developer</h2>
      <div class="developer__grid">
        <div class="developer__image reveal">
          <img src="${esc(d.developer.image)}" alt="${esc(d.developer.name)}" loading="lazy" />
        </div>
        <div class="reveal" style="transition-delay:.15s">
          <div class="developer__logo">${esc(d.developer.name)}</div>
          <p class="developer__desc">${esc(d.developer.description)}</p>
          <div class="developer__stats">${buildDevFacts(d.developer.facts)}</div>
        </div>
      </div>
    </div>
  </section>

  <section class="section final-cta">
    <div class="container">
      <div class="final-cta__grid">
        <div class="reveal">
          <h2>Still Have Questions About ${esc(d.project_name)}?</h2>
          <p>Our experts will answer all questions about pricing, layouts, investment returns, and the purchase process.</p>
          <div class="final-cta__contact">
            <div>${esc(d.contact.address)}</div>
            <div><a href="mailto:${esc(d.contact.email)}">${esc(d.contact.email)}</a></div>
            <div><a href="https://${esc(d.contact.website)}" target="_blank">${esc(d.contact.website)}</a></div>
          </div>
        </div>
        <div class="final-cta__form-box reveal" style="transition-delay:.15s">
          <div class="final-cta__form-title">Request a Callback</div>
          <form id="mainForm" onsubmit="submitForm(event,'main')">
            <div class="form-group"><input type="text" name="name" class="form-input" placeholder="Your name" required /></div>
            <div class="form-group"><input type="tel" name="phone" class="form-input" placeholder="Phone number" required /></div>
            <input type="hidden" name="formname" value="Main Callback" />
            <button type="submit" class="btn btn--gold" style="width:100%;margin-top:12px">Send a Request</button>
            <p class="form-privacy">I confirm I have read and accept the <a href="#">Privacy Policy</a></p>
            <div class="form-success">Thank you! We'll be in touch shortly.</div>
          </form>
        </div>
      </div>
    </div>
  </section>

  <footer class="footer">
    <span>&copy; ${new Date().getFullYear()} ${esc(d.project_name)}. All rights reserved.</span>
    <div style="display:flex;gap:24px"><a href="#">Privacy Policy</a><a href="#">Terms of Use</a></div>
  </footer>

  <div class="modal-overlay" id="modal" onclick="closeModalOutside(event)">
    <div class="modal-box">
      <button class="modal-close" onclick="closeModal()">&times;</button>
      <h3>Request a Callback</h3>
      <form id="modalForm" onsubmit="submitForm(event,'modal')">
        <div class="form-group"><input type="text" name="name" class="form-input" placeholder="Your name" required /></div>
        <div class="form-group"><input type="tel" name="phone" class="form-input" placeholder="Phone number" required /></div>
        <input type="hidden" name="formname" value="Modal" />
        <button type="submit" class="btn btn--gold" style="width:100%;margin-top:12px">Send a Request</button>
        <p class="form-privacy">I confirm I have read and accept the <a href="#">Privacy Policy</a></p>
        <div class="form-success">Thank you! We'll be in touch shortly.</div>
      </form>
    </div>
  </div>

  <script>
    var WEBHOOK = '${webhook}';
    var PROJECT = '${esc(d.project_name)}';

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

    // Layouts accordion
    function toggleLayout(btn){ var i = btn.closest('.layout-item'); var o = i.classList.contains('open'); document.querySelectorAll('.layout-item').forEach(function(x){ x.classList.remove('open'); }); if(!o) i.classList.add('open'); }

    // Gallery
    var galIndex = 0;
    var galTrack = document.getElementById('galTrack');
    function getSlideW(){ var s = galTrack.querySelector('.gallery__slide'); return s ? s.offsetWidth + 16 : 0; }
    document.getElementById('galNext').addEventListener('click', function(){
      var n = galTrack.querySelectorAll('.gallery__slide').length;
      if(galIndex < n-2) galIndex++;
      galTrack.style.transform = 'translateX(-' + (galIndex * getSlideW()) + 'px)';
    });
    document.getElementById('galPrev').addEventListener('click', function(){
      if(galIndex > 0) galIndex--;
      galTrack.style.transform = 'translateX(-' + (galIndex * getSlideW()) + 'px)';
    });

    // Modal
    function openModal(src){ document.getElementById('modal').classList.add('open'); document.getElementById('modal').dataset.src = src||''; }
    function closeModal(){ document.getElementById('modal').classList.remove('open'); }
    function closeModalOutside(e){ if(e.target === e.currentTarget) closeModal(); }

    // Form submit → CRM webhook
    function submitForm(e, formId) {
      e.preventDefault();
      var form = e.target;
      var data = new FormData(form);
      data.append('project', PROJECT);
      data.append('formid', formId);
      var body = new URLSearchParams(data).toString();

      if(!WEBHOOK) { showSuccess(form); return; }

      fetch(WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body,
        mode: 'no-cors'
      }).catch(function(){});

      showSuccess(form);
    }

    function showSuccess(form) {
      form.querySelectorAll('input,button').forEach(function(el){ el.style.display='none'; });
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

module.exports = { generateHTML };
if (require.main === module) main();
