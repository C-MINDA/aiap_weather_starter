# Frontend structure and state

- `frontend/src/main.tsx` starts the React app; `App.tsx` mounts `StoreProvider` and `Layout`.
- `frontend/src/api.ts` contains HTTP calls. Keep API paths relative (for example, `/api/locations`) so they work through the combined dev server and production deployment.
- `frontend/src/state/store.tsx` owns location loading, selection, creation, refresh, deletion, and shared errors.
- `frontend/src/types.ts` defines API-facing types shared across frontend code.
- `frontend/src/components/` contains the location form, sidebar, cards, map, and forecast components.
- `frontend/src/index.css` contains global styles; Tailwind configuration is in `frontend/tailwind.config.js`.

If an API response changes, keep the frontend types and API/store consumers aligned with the backend contract.
