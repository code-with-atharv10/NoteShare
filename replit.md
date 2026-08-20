# Workspace

## Student Notes Sharing Website

A complete static HTML/CSS/JavaScript website for student notes sharing, located in `student-notes/`.

### Pages
- `student-notes/index.html` — Home/Landing page with hero, features, subjects, CTA
- `student-notes/login.html` — Login page with demo account support
- `student-notes/signup.html` — Registration with password strength meter
- `student-notes/dashboard.html` — User dashboard with stats, recent notes, activity feed
- `student-notes/upload.html` — Upload notes with drag & drop, tags, form
- `student-notes/view.html` — Browse all notes with search, filter, sort, and modal viewer
- `student-notes/profile.html` — User profile with my notes, liked notes, settings tabs

### Files
- `student-notes/css/style.css` — Global stylesheet with CSS variables, dark theme, all components
- `student-notes/js/script.js` — All JS: auth, localStorage, routing, CRUD, toasts, animations

### Features
- Dark glassmorphism design with animated background orbs
- localStorage-based auth (no backend needed)
- Demo account: `aarav@example.com` / `password123`
- Like, view, filter, search, upload, and download notes
- Fully responsive with mobile sidebar

---



## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
