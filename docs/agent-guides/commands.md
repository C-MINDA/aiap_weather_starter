# Development commands

Run commands from the repository root. Install dependencies with `npm install`.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the combined development server through Portless. |
| `npm run build` | Build the frontend and compile backend TypeScript. |
| `npm test` | Run the Vitest suite once. |
| `npm run test:watch` | Run Vitest in watch mode. |
| `npm run start` | Run the compiled production server; build first. |
| `npm run doctor` | Check `/health` and `/api/locations` on the running server. Defaults to `http://127.0.0.1:3000`; set `WEATHER_STARTER_URL` to change the URL. |
| `npm run db:generate` | Generate a Drizzle migration after schema changes. |
| `npm run db:migrate` | Apply pending migrations. |
| `npm run reset` | Delete the local SQLite database and WAL files. This removes local data. |

The root package does not define a lint script, and the repository currently has no checked-in ESLint configuration. Do not use `npm run lint` unless project configuration changes.
