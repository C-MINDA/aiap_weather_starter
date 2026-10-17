# Plan: Use My Location Auto-Detect

> Source PRD: [artifacts/use-my-location-spec.md](../artifacts/use-my-location-spec.md)

## Architectural decisions

Durable decisions that apply across all phases:

- **Routes**: Keep `POST /api/locations` as the single create entry point. Extend request payload with an optional boolean `resolveNearestArea` for geolocation-driven creation. Preserve existing list, get, delete, and refresh route patterns.
- **Schema**: Keep the existing `locations` table shape unchanged. Persist canonical latitude/longitude chosen by nearest forecast-area resolution when geolocation mode is used. No migration or backfill is required for existing rows.
- **Key models**: Continue using `Location` (id, latitude, longitude, created_at, weather snapshot) and `WeatherSnapshot` models. Introduce create-request semantics that distinguish manual coordinate creation from geolocation area-resolution creation.
- **Validation rules**: Enforce Singapore coordinate bounds for geolocation-submitted coordinates. When area resolution is requested, creation must fail if nearest-area mapping cannot be completed.
- **Idempotency policy**: Geolocation mode uses area-level dedupe and returns an existing location if the resolved area already exists, including legacy manually added points in that area.
- **Authentication/authorization**: No auth changes. Existing open local workflow remains unchanged.
- **Third-party boundaries**: Weather provider interaction remains in the backend weather integration boundary. Forecast-area metadata for nearest-area resolution is sourced from the two-hour forecast API and can be cached in-memory with a short TTL.
- **Local development support**: Feature must function on localhost/local development origins without mandatory HTTPS setup changes.

---

## Phase 1: Geolocation Entry Path

**User stories**: 1, 2, 3, 4, 5, 11, 12, 13, 14, 15, 16, 25

### What to build

Deliver a complete user path where users can choose Use my location from the existing add-location flow, the browser geolocation request runs immediately, and manual coordinate entry remains available as fallback. The UI surfaces in-flight state and targeted geolocation errors while preventing duplicate submissions during an active request.

### Acceptance criteria

- [ ] Use my location appears in the existing add-location flow and can be triggered without leaving that flow.
- [ ] Geolocation request starts on click with bounded options suitable for responsive UX.
- [ ] During an active geolocation-driven add attempt, conflicting add actions are disabled.
- [ ] Manual coordinate add remains available and unchanged when geolocation is not used.
- [ ] Geolocation error classes (denied, unavailable, timeout, unsupported/insecure context) produce distinct user-facing messages.
- [ ] Behavior is verifiable on localhost/local development origins.

---

## Phase 2: Backend Area Resolution Contract

**User stories**: 6, 7, 17, 18, 20, 26

### What to build

Deliver an end-to-end backend contract where create requests can opt into nearest forecast-area resolution. The backend resolves nearest Singapore forecast area from provider metadata, canonicalizes coordinates to the resolved area location, and blocks creation when required resolution or bounds validation cannot be satisfied.

### Acceptance criteria

- [ ] Create payload supports optional nearest-area resolution intent without breaking existing manual payload behavior.
- [ ] Nearest-area mapping uses two-hour forecast area metadata and produces deterministic area selection.
- [ ] Out-of-Singapore geolocation coordinates are rejected with explicit validation semantics.
- [ ] When nearest-area resolution is requested and cannot be completed, creation fails with a clear failure response.
- [ ] Successful geolocation create continues to return the expected weather snapshot behavior aligned with current create semantics.

---

## Phase 3: Area Canonicalization And Idempotent Create

**User stories**: 8, 9, 10, 21, 24, 25

### What to build

Deliver idempotent geolocation-driven creation where resolved forecast areas are treated as logical uniqueness boundaries. The backend returns an existing location when a resolved area is already represented, and the frontend treats both created and deduped outcomes as successful select-and-focus flows.

### Acceptance criteria

- [ ] Geolocation mode persists canonical resolved-area coordinates rather than raw browser coordinates.
- [ ] Duplicate detection is area-level and applies to both newly created and legacy manually added points in the same area.
- [ ] Existing location return is treated as a success outcome and selected in the client experience.
- [ ] Existing manual add workflow remains backward compatible.
- [ ] No schema migration/backfill is required for this phase.

---

## Phase 4: Observability And Failure Semantics

**User stories**: 13, 14, 15, 16, 17, 18, 19

### What to build

Deliver operational clarity by adding dedicated interaction telemetry for geolocation flow outcomes and ensuring all backend/frontend failure modes are explicit, actionable, and consistent with the app’s existing logging and error-handling posture.

### Acceptance criteria

- [ ] Interaction events capture click, success, failure, and duplicate-selected outcomes for geolocation add flow.
- [ ] Failure modes across geolocation and backend resolution paths map to explicit user messages.
- [ ] Duplicate-selected outcome is observable and distinguishable from newly created outcome.
- [ ] Error semantics remain stable for monitoring and troubleshooting.

---

## Phase 5: End-to-End Verification And Regression Safety

**User stories**: 22, 23, 25, 26

### What to build

Deliver confidence through high-seam tests that validate external behavior of geolocation creation, area resolution, dedupe, and failure handling while protecting existing location creation and refresh workflows from regression.

### Acceptance criteria

- [ ] API-level integration tests cover geolocation create success, area-level dedupe success, out-of-bounds rejection, and resolution failure rejection.
- [ ] Frontend behavior tests cover geolocation success path, in-flight lock behavior, and error-message mapping for supported failure classes.
- [ ] Existing manual add and refresh behavior remains green under regression checks.
- [ ] Full suite can be run in local development with deterministic outcomes.
