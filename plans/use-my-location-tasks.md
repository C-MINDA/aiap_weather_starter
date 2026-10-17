# Tasks: Use My Location Auto-Detect

> Derived from: [plans/use-my-location.md](./use-my-location.md)

## Task sequencing

1. Complete Phase 1 first to establish user entry behavior and error UX.
2. Implement Phase 2 contract and resolution behavior behind the create endpoint.
3. Implement Phase 3 idempotency and canonicalization semantics.
4. Add Phase 4 telemetry and finalize error semantics.
5. Finish with Phase 5 verification and regression hardening.

---

## Phase 1 tasks: Geolocation Entry Path

- [ ] Add a geolocation quick action to the existing add-location interaction.
- [ ] Trigger browser geolocation immediately on action click with bounded timeout and cache-age options.
- [ ] Add a geolocation-specific pending state that disables conflicting add controls while active.
- [ ] Keep manual coordinate submission fully available as fallback when geolocation is not used or fails.
- [ ] Implement explicit frontend message mapping for denied, unavailable, timeout, and unsupported/insecure geolocation outcomes.
- [ ] Verify behavior on localhost/local development origins.

## Phase 2 tasks: Backend Area Resolution Contract

- [ ] Extend create-location request contract with optional nearest-area resolution intent.
- [ ] Add backend path that resolves nearest forecast area from two-hour forecast metadata when resolution intent is enabled.
- [ ] Canonicalize resolved coordinates before persistence for geolocation mode.
- [ ] Enforce Singapore bounds for geolocation-submitted coordinates.
- [ ] Return explicit non-success response when nearest-area resolution cannot complete.
- [ ] Ensure success path still provides expected location weather snapshot response shape.

## Phase 3 tasks: Area Canonicalization And Idempotent Create

- [ ] Implement area-level dedupe policy for geolocation-driven create operations.
- [ ] Ensure dedupe checks include locations created previously through manual coordinates.
- [ ] Return existing location as a successful idempotent outcome when duplicate area is detected.
- [ ] Align frontend create/select behavior so both created and deduped responses focus the resulting location.
- [ ] Validate no schema migration/backfill is required for rollout.

## Phase 4 tasks: Observability And Failure Semantics

- [ ] Add geolocation flow interaction events for click, success, failure, and duplicate-selected outcomes.
- [ ] Ensure backend and frontend failures produce stable, actionable semantics.
- [ ] Distinguish newly created vs duplicate-selected success outcomes in telemetry metadata.
- [ ] Confirm failure semantics are consistent across geolocation, validation, and provider-resolution paths.

## Phase 5 tasks: End-to-End Verification And Regression Safety

- [ ] Add API integration coverage for geolocation create success (new create), duplicate-area success (existing return), out-of-bounds rejection, and resolution failure rejection.
- [ ] Add frontend behavior tests for geolocation success, in-flight control locking, and error-message mapping.
- [ ] Re-run baseline location create/list/refresh behavior checks to confirm no regressions.
- [ ] Run full automated test suite and capture pass/fail evidence.

---

## Definition of done

- [ ] Geolocation add is one-click from the existing add flow and works on localhost/local dev origin.
- [ ] Nearest forecast-area resolution is backend-authoritative and required in geolocation mode.
- [ ] Area-level dedupe is idempotent and user-visible as a successful select behavior.
- [ ] Telemetry and failure semantics are explicit and consistent.
- [ ] API and frontend behavior tests validate happy paths and key failure paths.
- [ ] Existing manual add workflow remains intact.
