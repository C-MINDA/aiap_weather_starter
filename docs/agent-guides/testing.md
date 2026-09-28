# Testing

Vitest is configured in `vitest.config.ts` to run `backend/src/**/*.test.ts` in the Node environment. Current automated coverage focuses on the locations API in `backend/src/routes/locations.test.ts`.

Run the complete suite with `npm test` or use `npm run test:watch` while developing. Add or update API tests when route behavior or response contracts change. The router's injectable weather client supports deterministic tests without live upstream calls.
