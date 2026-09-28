# Backend, API, and database

## API routes

| Method | Path | Behavior |
| --- | --- | --- |
| GET | `/health` | Health check. |
| GET | `/api/locations` | List saved locations and weather snapshots. |
| POST | `/api/locations` | Validate Singapore coordinates, create a location, and attempt an initial refresh. |
| GET | `/api/locations/:locationId` | Return one location. |
| DELETE | `/api/locations/:locationId` | Delete one location. |
| POST | `/api/locations/:locationId/refresh` | Fetch and store a fresh weather snapshot. |
| POST | `/api/logs` | Accept frontend interaction log events. |

The locations router accepts an injected weather client, which lets tests avoid depending on the live provider. Provider errors are handled separately from unexpected server errors; provider calls and raw upstream response mapping belong in `backend/src/weather.ts`.

When changing an endpoint or response shape, update the corresponding tests and the frontend API/types/store consumers.

## Persistence

Drizzle defines the schema in `backend/src/schema.ts`; generated SQL migrations are in `backend/drizzle/`. The database defaults to `backend/weather.db`. Set `DATABASE_PATH` to use a different file.

When changing persistent fields, update the schema, generate the migration with `npm run db:generate`, and commit the generated migration. Apply migrations with `npm run db:migrate` when needed. Avoid committing local database state.
