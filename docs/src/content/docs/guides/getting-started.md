---
title: Getting started
description: Install, run, test, and build Weather Starter.
---

Run all commands from the repository root.

```sh
npm install
npm run dev
```

`npm run dev` starts the combined development server through [Portless](https://www.npmjs.com/package/portless), which provides a stable `.localhost` URL. Express serves `/api/*` and Vite middleware serves the React app.

## Commands

| Command               | Purpose                                                     |
| --------------------- | ----------------------------------------------------------- |
| `npm run dev`         | Start the combined development server.                      |
| `npm run docs`        | Start this documentation site (Astro Starlight).            |
| `npm run build`       | Build the frontend and compile the backend TypeScript.      |
| `npm run start`       | Run the compiled production server (build first).           |
| `npm test`            | Run the Vitest suite once.                                  |
| `npm run test:watch`  | Run Vitest in watch mode.                                   |
| `npm run lint`        | Lint frontend, backend, and scripts.                        |
| `npm run format`      | Format the repository with Prettier.                        |
| `npm run doctor`      | Check `/health` and `/api/locations` on a running server.   |
| `npm run db:generate` | Generate a Drizzle migration after schema changes.          |
| `npm run db:migrate`  | Apply pending migrations.                                   |
| `npm run reset`       | Delete the local SQLite database and WAL files (data loss). |

## Testing

Vitest runs `backend/src/**/*.test.ts` in the Node environment. The API tests in `backend/src/routes/locations.test.ts` cover health checks, frontend logs, and location create, validation, retrieval, delete, and refresh behavior. The locations router accepts an injected weather client, so tests never call the live provider.
