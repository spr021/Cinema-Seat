# AGENTS.md

Cinema ticketing platform: Turborepo monorepo (yarn 1 workspaces, Node >= 18) with an Express/MongoDB REST API, a Next.js admin dashboard, and an Expo customer app. All code is TypeScript.

## Structure

- `apps/expressjs-server` — REST API: Express 4 + Mongoose (MongoDB), JWT auth. Runs on port 4000. **CommonJS** (`"type": "commonjs"`).
- `apps/nextjs-adminweb` — Admin panel: Next.js 14 App Router (`app/`), Tailwind, `@tanstack/react-query`, axios/fetch, react-native-web, FullCalendar. Dashboard pages under `app/dashboard/` (movies, shows, users).
- `apps/reactnative-userapp` — Customer app: Expo SDK 53 + expo-router (`app/`, tabs in `app/(tabs)/`), NativeWind + gluestack-ui components in `components/ui/`.
- `packages/typescript-config` — shared tsconfigs (`base.json`, `nextjs.json`, `react-native.json`), referenced as `@this/typescript-config`.

Note: `README.md` is the untouched create-turbo starter and mentions a `@this/uikit` package that no longer exists — trust the code, not the README.

## Commands

Run from the repo root unless noted. Package manager is **yarn 1** (`packageManager: yarn@1.22.19`) — don't use npm/pnpm.

- `yarn dev` — all three apps via turbo (persistent)
- `yarn build` — turbo build (server: `tsc` → `dist/`; web: `next build`)
- `yarn format` — Prettier at root
- Typecheck web: `yarn check-types` in `apps/nextjs-adminweb` (or `yarn turbo check-types`)
- Typecheck server: no script — use `npx tsc --noEmit` in `apps/expressjs-server`
- Lint: only `yarn lint` in `apps/nextjs-adminweb` (`next lint`)
- Tests: `yarn test` (vitest) in `apps/expressjs-server` and `apps/reactnative-userapp`. Server tests boot an in-memory MongoDB (`mongodb-memory-server`) and hit the real Express app (`app.ts`) over HTTP; no admin-web tests (UI only)
- Expo app: `yarn ios` / `yarn android` / `yarn web` in `apps/reactnative-userapp`

## Environment variables

Each app has a local gitignored `.env`. Key names:

- Server: `PORT`, `MONGO_DB_URL`, `JWT_SECRET_KEY`, `JWT_SECRET_EXPIER` (typo is the real name — keep it)
- Admin web: `NEXT_PUBLIC_API_BASE_URL`
- Expo app: `EXPO_PUBLIC_API_BASE_URL`

`NEXT_PUBLIC_*` / `EXPO_PUBLIC_*` vars are build-time inlined; restart the dev server after changing them.

## API layer rules (expressjs-server)

`index.ts` boots Mongoose and listens; `app.ts` builds the Express app (importable by tests without a DB). Strict layering: `routes/*.router.ts` → `controllers/*.controller.ts` → `models/*.model.ts` (Mongoose schemas). To add an endpoint: create controller + router, then mount it in `app.ts` (currently mounts `/movie`, `/show`, `/seat`, `/hall`, `/reservation`, `/ticket`, `/auth`).

- Wrap async handlers with the helper in `middlewares/async.ts`; the global error handler in `middlewares/error.ts` must be the last middleware (it maps Mongoose ValidationError/CastError/duplicate-key to 4xx).
- Auth: `middlewares/auth.middleware.ts` exports `authenticateToken` (Bearer JWT) and `authorizeRoles(roles)`. The JWT payload is `{ id, email, roles }`; `types/express.d.ts` augments `Request` with it. Users may only edit/delete their own account unless admin.
- `register`/`login`/`getSession` respond with `{ user: toPublicUser(user), token }` — never include the password hash.
- User profile/auth endpoints live under the `auth` router (not a `user` router), including `/auth/profile`, `/auth/forgot-password`, `/auth/reset-password/:token`, `/auth/toggle-movie-like`.
- Reservation endpoints require a token; a reservation belongs to the token's user. Seat reservation (`/seat/reserve-multiple` and `createReservation`) is all-or-nothing with conflict rollback.

## Frontend ↔ API contract

- Admin web reads `process.env.NEXT_PUBLIC_API_BASE_URL` per page/hook (no shared axios client); data hooks in `app/hooks/` use react-query; auth pages in `app/auth/`.
- Expo app: all API calls go through `services/*.service.ts` (or `services/*.ts`) using `process.env.EXPO_PUBLIC_API_BASE_URL`. Global auth state in `context/AuthContext.tsx`; feature hooks in `hooks/`.
- Adding/changing a backend endpoint usually means touching three places: server route/controller, admin web (hook/page), and the matching Expo `services/` file.

## Coding conventions

Also codified in `.clinerules/general.txt` — keep AGENTS.md and it consistent if conventions change.

- Functional, declarative TypeScript; no classes; prefer interfaces over `type` for object shapes; avoid enums (use literal types/maps).
- Named exports for components/functions; `function` keyword for pure functions; lowercase-dash directory names.
- Tailwind for styling in both web and native; mobile-first, keep web/native styling consistent.
- Platform-specific React Native code uses `.native.tsx` suffix.
- Early returns / guard clauses for error handling.
- Commit messages: short imperative sentences, no conventional-commit prefixes (e.g. "Fix missing field on sign up").
