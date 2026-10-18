---
title: API reference
description: REST endpoints exposed by the Express backend.
---

| Method | Path                                 | Behavior                                                  |
| ------ | ------------------------------------ | --------------------------------------------------------- |
| GET    | `/health`                            | Returns `{ "status": "healthy" }`.                        |
| GET    | `/api/locations`                     | List saved locations: `{ "locations": [...] }`.           |
| POST   | `/api/locations`                     | Create a location and attempt an initial weather refresh. |
| GET    | `/api/locations/:locationId`         | Return one location.                                      |
| DELETE | `/api/locations/:locationId`         | Delete a location (`204`).                                |
| POST   | `/api/locations/:locationId/refresh` | Fetch and store a fresh snapshot.                         |
| POST   | `/api/logs`                          | Accept a frontend interaction log event (`204`).          |

## Create a location

Request body:

```json
{ "latitude": 1.3521, "longitude": 103.8198 }
```

Coordinates must fall within Singapore: latitude 1.1–1.5, longitude 103.6–104.1.

| Status | Meaning                                                             |
| ------ | ------------------------------------------------------------------- |
| 201    | Created. The body includes the snapshot unless the provider failed. |
| 409    | A location with these coordinates already exists.                   |
| 422    | Missing/non-numeric coordinates, or coordinates outside Singapore.  |

## Refresh a location

| Status | Meaning                 |
| ------ | ----------------------- |
| 200    | Updated location.       |
| 404    | Location not found.     |
| 502    | Weather provider error. |

## Frontend logs

`POST /api/logs` expects `{ "event": "snake_case_name", "metadata": {}, "page": "..." }`. `event` must match `^[a-z][a-z0-9_.:-]{1,63}$`, otherwise the response is `422`. Accepted events are written to the server log with `source: "frontend"`.

## Errors

Errors use the shape `{ "detail": "message" }`. Unexpected failures return `500` with `Internal server error`.

When changing an endpoint or response shape, update the route tests and the frontend `api.ts`, `types.ts`, and store.
