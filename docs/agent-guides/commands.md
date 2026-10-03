# Development commands

Run commands from the repository root. Install dependencies with `npm install`.

| Command               | Purpose                                                                                                                                       |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`         | Start the combined development server through Portless.                                                                                       |
| `npm run build`       | Build the frontend and compile backend TypeScript.                                                                                            |
| `npm run format`      | Format frontend, backend, scripts, and documentation using the shared root Prettier config.                                                   |
| `npm test`            | Run the Vitest suite once.                                                                                                                    |
| `npm run test:watch`  | Run Vitest in watch mode.                                                                                                                     |
| `npm run start`       | Run the compiled production server; build first.                                                                                              |
| `npm run doctor`      | Check `/health` and `/api/locations` on the running server. Defaults to `http://127.0.0.1:3000`; set `WEATHER_STARTER_URL` to change the URL. |
| `npm run db:generate` | Generate a Drizzle migration after schema changes.                                                                                            |
| `npm run db:migrate`  | Apply pending migrations.                                                                                                                     |
| `npm run reset`       | Delete the local SQLite database and WAL files. This removes local data.                                                                      |

Run `npm run lint` to lint the React frontend, TypeScript backend, and project scripts/configuration. The root `eslint.config.js` applies recommended JavaScript, TypeScript, React, and React Hooks rules, with browser globals for frontend source and Node.js globals for server code and tooling. Unused parameters prefixed with `_` are allowed for required callback signatures. Generated output is ignored, and formatting remains in Prettier.
