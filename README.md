# AI Sales & Operations OS

> **OpsMonsters** — AI-powered sales and operations platform for SMEs

[![Live Demo](https://img.shields.io/badge/Live_Demo-GitHub_Pages-6366f1?style=for-the-badge)](https://vipin-om2026.github.io/ai-sales-os/)

![AI Sales OS](https://img.shields.io/badge/Stack-React_+_NestJS_+_PostgreSQL-0f172a?style=flat-square&logo=react)
![License](https://img.shields.io/badge/License-MIT-10b981?style=flat-square)

## What It Does

Automates sales and operations workflows for SMEs across:
- Real Estate · Clinics · Agencies · Financial Advisory · Education

## Features

| Module | Description |
|---|---|
| 🎯 **Lead Management** | AI-scored leads, source tracking, stage pipeline |
| 📊 **CRM Pipeline** | Kanban board with deal values and AI scoring |
| 💬 **WhatsApp Automation** | Template-based follow-ups with open/reply tracking |
| ⚡ **Workflow Engine** | Event-driven automation (lead created → qualify → message) |
| 🤖 **AI Assistant** | Live Claude-powered sales query and lead scoring |
| 📈 **Analytics** | Revenue trends, conversion rates, pipeline metrics |

## Tech Stack

**Frontend:** React · Vite · Tailwind-equivalent inline styles · Recharts  
**Backend:** NestJS · TypeScript · Prisma · PostgreSQL · Redis · BullMQ  
**AI:** OpenAI / Anthropic (swappable via `AI_PROVIDER` env)  
**Infrastructure:** Docker · Docker Compose · Nginx  

## Quick Start

### Frontend (GitHub Pages)
```
Live at: https://vipin-om2026.github.io/ai-sales-os/
```

### Backend Local Dev
```bash
git clone https://github.com/VIPIN-OM2026/ai-sales-os
cd ai-sales-os/backend

cp .env.example .env          # Add your DB + AI keys
docker compose up -d           # Start PostgreSQL + Redis
npm install
npm run prisma:migrate         # Run DB migrations
npm run start:dev              # http://localhost:3001

# Swagger docs: http://localhost:3001/api/docs
```

## Architecture

```
src/
  modules/
    authentication/     JWT + refresh token rotation + RBAC
    leads/              Repository pattern, AI scoring, event emission
    workflows/          Event-driven, trigger-based automation engine
    analytics/          Dashboard metrics, pipeline summaries
    ai-assistant/       OpenAI/Anthropic provider abstraction
    whatsapp/           Meta Cloud API integration
    billing/            Invoice management + reminders
  common/
    guards/             JwtAuthGuard, RolesGuard
    interceptors/       Global response wrapper
    exceptions/         Standardized error handling
    utilities/          Pagination, hashing
```

## API Endpoints

```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh

GET    /api/v1/leads
POST   /api/v1/leads
PATCH  /api/v1/leads/:id
DELETE /api/v1/leads/:id

GET    /api/v1/workflows
POST   /api/v1/workflows
PATCH  /api/v1/workflows/:id/toggle

GET    /api/v1/analytics/dashboard
GET    /api/v1/analytics/pipeline

POST   /api/v1/ai/query
```

---

Built by **OpsMonsters** · [vipin.p@opsmonsters.com](mailto:vipin.p@opsmonsters.com)
