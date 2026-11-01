# Cinema Seat 🎬

A full-stack cinema booking platform: customers browse movies, pick seats on a
**live seat map**, pay with **Stripe**, and get QR tickets; staff manage the
catalog, screenings, and check-ins from an admin panel.

> Built as a portfolio project to demonstrate end-to-end full-stack skills:
> REST API design, authentication & authorization, concurrency control,
> payments, webhooks, real-time communication, email, CI/CD, and containers.

![CI](https://github.com/spr021/Cinema-Seat/actions/workflows/ci.yml/badge.svg)

## Apps

| App | Stack | What it does |
|---|---|---|
| `apps/expressjs-server` | Express + TypeScript + Mongoose | REST API, JWT auth with roles, Stripe Checkout + webhooks, Socket.io seat updates, transactional email |
| `apps/nextjs-adminweb` | Next.js 14 (App Router) + Tailwind + FullCalendar + Recharts | Admin panel: movies, shows, users, analytics, QR check-in scanner |
| `apps/reactnative-userapp` | Expo (React Native) + expo-router + NativeWind | Customer app: browse, wishlist, seat selection with hold countdown, Stripe checkout, QR tickets |
| `packages/typescript-config` | — | Shared tsconfig base for the monorepo |

## Feature highlights

- **Booking flow with seat holds** — selecting seats places a 10-minute hold
  (atomic, all-or-nothing, race-safe via conditional updates). A countdown
  runs while you pay; expired holds are swept and the seats re-open for
  everyone automatically.
- **Real-time seat map** — every hold, reservation, and expiry is broadcast
  over Socket.io per show, so everyone sees the same seat availability live.
- **Stripe payments (test mode)** — Checkout session per reservation; the
  signed webhook (`checkout.session.completed`) marks it paid and issues the
  ticket. The checkout return URL doubles as a dev-friendly verification
  path so the flow works locally without `stripe listen`. Without Stripe
  keys the app falls back to a mock payment flow.
- **Idempotent ticketing** — a reservation can only ever produce one ticket,
  no matter how many times a payment event replays.
- **Admin panel** — CRUD for movies/shows/users, revenue & top-movies charts,
  per-show occupancy, and a **QR check-in scanner** (camera via
  `BarcodeDetector`, with manual-code fallback) that burns each ticket once.
- **Emails** — password reset and ticket receipts via Nodemailer; uses a real
  SMTP server when configured, otherwise an auto-created Ethereal test
  account (preview URLs are logged).
- **CI** — typecheck, tests (in-memory MongoDB integration tests), and a
  production build run on every push.

## Getting started

```bash
yarn install
cp apps/expressjs-server/.env.example apps/expressjs-server/.env
cp apps/nextjs-adminweb/.env.example apps/nextjs-adminweb/.env
cp apps/reactnative-userapp/.env.example apps/reactnative-userapp/.env
# edit apps/expressjs-server/.env and point MONGO_DB_URL at your database

yarn dev          # runs all three apps via turbo
```

- API server: http://localhost:4000
- Admin panel: http://localhost:3000 (log in with a user whose `roles`
  contains `admin`)
- Customer app: Expo dev tools at http://localhost:8081 (press `i` for the
  iOS simulator; on a physical phone use your LAN IP in `.env`)

### Run the API + admin panel with Docker

```bash
docker compose up --build
# mongo on 27017, API on 4000, admin on 3000
```

## Testing

```bash
cd apps/expressjs-server && yarn test   # integration tests over HTTP with an in-memory MongoDB
cd apps/reactnative-userapp && yarn test
```

The server tests cover auth (hashing, access control, privilege escalation
prevention), the booking flow (seat races, holds, cross-show protection,
payment idempotency), and Stripe webhook signature verification.

## Project layout

```
apps/
  expressjs-server/    # routes → controllers → models (Mongoose)
  nextjs-adminweb/     # app router pages, hooks, components
  reactnative-userapp/ # expo-router screens, services, hooks, context
packages/
  typescript-config/   # shared tsconfigs
```
