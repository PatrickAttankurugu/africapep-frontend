# AfricaPEP Frontend

[![Live Demo](https://img.shields.io/badge/demo-pep.patrickaiafrica.com-blue.svg)](https://pep.patrickaiafrica.com)
[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC.svg)](https://tailwindcss.com/)

The web frontend for [AfricaPEP](https://github.com/PatrickAttankurugu/AfricaPEP) — an open-source African Politically Exposed Persons database for KYC/AML compliance.

**Live demo:** [pep.patrickaiafrica.com](https://pep.patrickaiafrica.com) | **Backend API:** [api-pep.patrickaiafrica.com](https://api-pep.patrickaiafrica.com/docs) | **Backend repo:** [AfricaPEP](https://github.com/PatrickAttankurugu/AfricaPEP)

## Features

- **Name Screening** — Fuzzy-match a name against 32,000+ African PEP profiles with match score breakdown
- **Batch Screening** — Screen up to 50 names in a single request
- **PEP Search** — Full-text search with filters (country, FATF tier, active status)
- **Country Coverage** — Browse all 54 African countries with per-country PEP counts
- **Statistics Dashboard** — Live stats on database coverage, tier distribution, and system health

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home — single name screening |
| `/batch` | Batch screening (up to 50 names) |
| `/search` | Full-text PEP search with filters |
| `/countries` | Country coverage map |
| `/stats` | Database statistics and system health |
| `/pep/[id]` | Individual PEP profile (coming soon) |

## Quick Start

```bash
# 1. Clone
git clone https://github.com/PatrickAttankurugu/africapep-frontend.git
cd africapep-frontend

# 2. Install dependencies
npm install

# 3. Configure API URL
cp .env.local.example .env.local
# Edit .env.local with your backend URL

# 4. Run development server
npm run dev
# Open http://localhost:3000
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://api-pep.patrickaiafrica.com` | Backend API base URL |
| `NEXT_PUBLIC_API_KEY` | _(empty)_ | API key (required when backend has `API_KEY_ENABLED=true`) |

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4
- **Deployment:** Vercel

## Project Structure

```
app/
├── page.tsx          # Home — name screening
├── batch/page.tsx    # Batch screening
├── search/page.tsx   # PEP search with filters
├── countries/page.tsx # Country coverage
├── stats/page.tsx    # Statistics dashboard
├── pep/[id]/         # PEP profile detail (coming soon)
└── layout.tsx        # Root layout with nav
components/           # Shared UI components
lib/
└── api.ts            # Centralized API client (all backend calls)
```

## Related

- **Backend API:** [github.com/PatrickAttankurugu/AfricaPEP](https://github.com/PatrickAttankurugu/AfricaPEP)
- **API Docs:** [api-pep.patrickaiafrica.com/docs](https://api-pep.patrickaiafrica.com/docs)

## Author

**Patrick Attankurugu** — [LinkedIn](https://www.linkedin.com/in/patrick-ai-africa/) | [X/Twitter](https://x.com/patrickaiafrica) | [Email](mailto:patricka.azuma@gmail.com)

## License

MIT
