---
title: Configuration
description: Environment variables and runtime settings.
---

## Backend

| Variable          | Default                   | Purpose                                                                        |
| ----------------- | ------------------------- | ------------------------------------------------------------------------------ |
| `PORT`            | `3000`                    | Port the server listens on (bound to `127.0.0.1`).                             |
| `NODE_ENV`        | unset                     | `production` serves `frontend/dist`; `test` disables Vite and request logging. |
| `DATABASE_PATH`   | `backend/weather.db`      | SQLite file location.                                                          |
| `WEATHER_API_KEY` | unset                     | Optional data.gov.sg key, sent as `x-api-key`.                                 |
| `LOG_LEVEL`       | `info` (`silent` in test) | pino log level.                                                                |
| `LOG_FILE_PATH`   | under `backend/logs/`     | Log file location.                                                             |

Variables are loaded from `.env` via `dotenv`.

## Frontend

Copy `frontend/.env.local.example` to `frontend/.env.local`:

| Variable            | Purpose                                             |
| ------------------- | --------------------------------------------------- |
| `VITE_BACKEND_PORT` | Backend port.                                       |
| `VITE_API_TARGET`   | Full API target URL; overrides `VITE_BACKEND_PORT`. |

## Development server

`npm run dev` runs `portless` with `tsx watch backend/src/server.ts`. `PORTLESS_PORT` defaults to `1355` and `PORTLESS_HTTPS` to `0`.

## Health check

`npm run doctor` calls `/health` and `/api/locations`. It defaults to `http://127.0.0.1:3000`; set `WEATHER_STARTER_URL` to change it.
