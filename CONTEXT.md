# Landing Generator — Project Context

## Overview
Node.js landing page generator for Tranio Thailand real estate.
No npm dependencies. Deployed on Railway (auto-deploy from GitHub main).

## Architecture
- `server.js` — HTTP server (port 3333), API endpoints, auth
- `generate.js` — HTML generation engine (programmatic + file-based templates)
- `editor.html` — Single-page editor UI (sidebar, form, preview)
- `deploy.js` — GitHub + Vercel deployment
- `favicon.svg` — Editor favicon

## Templates (6 total)
| ID | Name | Type | Design |
|----|------|------|--------|
| `default` | Tranio Classic | Programmatic | Teal & cream |
| `anchan-indigo` | Anchan Indigo | File-based | Indigo & gold, FAQ section |
| `angsana-oceanview` | Angsana Oceanview | File-based | Navy & gold, branded residences |
| `annara` | Annara | File-based | Sage green & sand |
| `arise-vibe` | Arise Vibe | File-based | Dark green & gold |
| `asi-village` | Asi Village | File-based | Forest green & gold |

### File-based templates
Located in `templates/{id}/`:
- `template.html` — HTML with `{{placeholders}}`
- `style.css` — Full CSS from original design
- `main.js` — Full JS from original design
- `config.json` — Metadata (id, name, description, preview_colors, fonts, sections)

### Template engine (in generate.js)
- `{{var}}` — multi-lang text with `data-lang` spans
- `{{=var}}` — attribute-safe value (no HTML)
- `{{{raw}}}` — raw HTML injection
- `{{#array}}...{{/array}}` — loop over array items

## Demo Examples
6 pre-filled demo projects in `demos/` directory:
- `anchan-indigo-demo.json` — Anchan Hills (5 villa types)
- `angsana-oceanview-demo.json` — Angsana Branded Residences
- `annara-demo.json` — Annara luxury villas
- `arise-vibe-demo.json` — Arise Vibe condos
- `asi-village-demo.json` — Asi Village eco-villas
- `default-demo.json` — Skyline Residence (Tranio Classic)

## API Endpoints
All `/api/*` require `x-admin-password` header.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Editor page |
| GET | `/preview/:slug` | Generate & serve HTML for demo/project (no auth) |
| GET | `/api/templates` | List all templates |
| GET | `/api/demos` | List demo examples (from `demos/`) |
| GET | `/api/projects` | List saved projects (from `data/`) |
| GET | `/api/project/:slug` | Load project JSON (checks `data/` then `demos/`) |
| POST | `/api/preview` | Generate HTML from posted JSON |
| POST | `/api/save` | Save project JSON + generate dist HTML |
| POST | `/api/deploy` | Deploy to GitHub + Vercel |
| POST | `/api/ai-fill` | Claude AI web search to fill project data |
| POST | `/api/upload` | Upload image (base64) |
| POST | `/api/fetch-image` | Download image from URL |
| POST | `/api/suggest-domains` | Generate domain name suggestions |

## Data Format
Project JSON structure (all text fields are `{en: "...", ru: "..."}` for multi-lang):
- `project_slug`, `project_name`, `template`, `languages`, `currency`
- `meta_title`, `meta_description`, `canonical_url`, `crm_webhook`
- `hero` — image, title, description, stats[]
- `concept` — title, paragraphs[], specs[] (key/value)
- `amenities` — title, image, items[]
- `layouts[]` — name, price_from, image, specs[] (key/value)
- `roi` — title, subtitle, columns[], rows[], disclaimer
- `gallery` — images[]
- `location` — title, description, distances[] (place/time), map_embed
- `developer` — image, name, description, facts[] (key/value)
- `contact` — phone, whatsapp, email, website
- `catalogue` — image, tags[]
- `sell_banner` — show, image, title, subtitle
- `faq` — title, items[] (question/answer)

## Key Files
- `.env` — GITHUB_TOKEN, VERCEL_TOKEN, GITHUB_USERNAME, ADMIN_PASSWORD, ANTHROPIC_API_KEY
- `.gitignore` — ignores `data/*` (except `*-demo.json`), `.env`, `node_modules/`, `dist/`
- `package.json` — `npm start` runs `node server.js`

## Editor Features
- Sidebar: Projects list + Examples section (demos)
- Template picker with visual color swatches
- Multi-language editing (EN/RU switcher)
- AI Fill (Claude Haiku + web search)
- Image upload/fetch from URL
- Domain name suggestions
- Preview (demo: navigates to `/preview/:slug`, user: iframe srcdoc)
- Save + Deploy to Vercel

## Deployment
- GitHub: `bogatenkov-cpu/landing-generator`
- Railway: auto-deploys from `main` branch
- Admin password: set in Railway env vars (ADMIN_PASSWORD)
