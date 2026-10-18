---
title: System architecture
description: Components, runtime topology, and data flow.
---

Backend and frontend run as a **single Node process** in development. In production, Express serves the built frontend from `frontend/dist`.

## Components

```mermaid
flowchart TB
    subgraph Browser
        UI[React components]
        Store[StoreProvider<br/>state/store.tsx]
        Client[api.ts<br/>fetch /api]
        UI --> Store --> Client
    end

    subgraph Node["Node process: backend/src/server.ts"]
        Express[Express app]
        Log[pino-http + pino logger]
        Router[locations router<br/>routes/locations.ts]
        Weather[SingaporeWeatherClient<br/>weather.ts]
        DBLayer[db.ts<br/>Drizzle ORM]
        Static["Vite middleware (dev)<br/>or frontend/dist (prod)"]
        Express --> Log
        Express --> Router
        Express --> Static
        Router --> Weather
        Router --> DBLayer
    end

    SQLite[(SQLite<br/>backend/weather.db)]
    Upstream[data.gov.sg APIs]

    Client -->|HTTP /api/*| Express
    DBLayer --> SQLite
    Weather --> Upstream
```

## Development vs production

```mermaid
flowchart LR
    subgraph Dev["npm run dev"]
        P[Portless<br/>.localhost URL] --> T[tsx watch<br/>server.ts]
        T --> V[Vite middleware mode]
    end
    subgraph Prod["npm run build + npm run start"]
        N[node server.ts] --> D[express.static<br/>frontend/dist]
    end
```

## Creating a location

Weather is fetched only on **create** and **manual refresh**. Page loads read the saved snapshot.

```mermaid
sequenceDiagram
    actor User
    participant FE as React store
    participant API as Express router
    participant DB as SQLite
    participant WX as data.gov.sg

    User->>FE: Submit latitude / longitude
    FE->>API: POST /api/locations
    API->>API: Validate Singapore bounds
    API->>DB: createLocation()
    alt duplicate coordinates
        API-->>FE: 409 Conflict
    else created
        API->>WX: getCurrentWeather()
        alt provider succeeds
            API->>DB: updateWeather(snapshot)
            API-->>FE: 201 location + snapshot
        else provider error
            API-->>FE: 201 location without snapshot
        end
    end
    FE->>API: GET /api/locations
    API->>DB: listLocations()
    API-->>FE: locations
```

## Refreshing a location

```mermaid
sequenceDiagram
    participant FE as React store
    participant API as Express router
    participant WX as data.gov.sg
    participant DB as SQLite

    FE->>API: POST /api/locations/:id/refresh
    API->>DB: getLocation(id)
    alt not found
        API-->>FE: 404
    else found
        API->>WX: getCurrentWeather(lat, lon)
        alt provider error
            API-->>FE: 502 detail
        else ok
            API->>DB: updateWeather(id, snapshot)
            API-->>FE: 200 updated location
        end
    end
```

## Weather provider

`SingaporeWeatherClient` in `backend/src/weather.ts` builds one snapshot from several data.gov.sg endpoints:

- Nearest-station readings: air temperature, relative humidity, rainfall, wind speed, wind direction.
- UV index, PSI, and PM2.5.
- Two-hour and 24-hour forecasts, plus the 4-day forecast.

If the forecast payload fails, the client falls back to an empty forecast. If `WEATHER_API_KEY` is set it is sent as the `x-api-key` header. Failures surface as `WeatherProviderError`.

## Key files

| Path                              | Role                                                                    |
| --------------------------------- | ----------------------------------------------------------------------- |
| `backend/src/server.ts`           | App factory, `/health`, `/api/logs`, static/Vite serving, error handler |
| `backend/src/routes/locations.ts` | Location REST endpoints                                                 |
| `backend/src/weather.ts`          | Upstream client and response mapping                                    |
| `backend/src/db.ts`, `schema.ts`  | SQLite access and Drizzle schema                                        |
| `backend/src/logger.ts`           | pino logger                                                             |
| `frontend/src/`                   | React app                                                               |
| `scripts/`                        | dev, start, doctor, reset helpers                                       |
