# Architecture and data flow

The backend and frontend run as one Node process in development. Express handles `/api/*`, while Vite middleware serves the React app. Portless provides a stable local `.localhost` URL. In production, Express serves the built frontend from `frontend/dist`.

The browser makes relative `/api` requests. The locations router reads and writes local SQLite data through Drizzle. Location creation and manual refresh call the Singapore data.gov.sg client, then persist the returned weather snapshot. Page loads read the saved snapshot rather than calling the weather provider.

## Main entry points

- `backend/src/server.ts`: Express app, health/log endpoints, API mounting, and frontend serving.
- `backend/src/routes/locations.ts`: location REST endpoints.
- `backend/src/weather.ts`: upstream weather API client and response mapping.
- `backend/src/db.ts` and `backend/src/schema.ts`: SQLite access and Drizzle schema.
- `frontend/src/main.tsx`, `App.tsx`: React app entry and provider setup.
- `frontend/src/api.ts`, `state/store.tsx`: frontend API client and shared state.
- `frontend/src/components/`: dashboard and weather UI.
- `scripts/`: development, production start, health check, and database reset helpers.
