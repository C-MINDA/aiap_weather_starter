## Problem Statement

Users currently have to type latitude and longitude manually to add a location. This is slow, error-prone, and unfriendly on mobile. The expected workflow is to use browser geolocation, map the detected point to the nearest Singapore forecast area, and add that location automatically. The feature must work in local development without requiring HTTPS setup changes.

## Solution

Add a one-click Use my location action in the existing add-location flow. On click, the browser requests geolocation and sends coordinates to the existing location-creation API with an explicit nearest-area-resolution flag. The backend resolves the nearest forecast area from two-hour forecast area metadata, canonicalizes to the area coordinates, performs area-level dedupe, and returns either a newly created or existing location. The frontend selects the returned location and keeps manual coordinate entry available as fallback.

## User Stories

1. As a weather dashboard user, I want a Use my location action, so that I can add my current location without typing coordinates.
2. As a mobile user, I want one-tap location add, so that I can complete setup quickly.
3. As a first-time user, I want clear permission prompts and guidance, so that I understand why location access is requested.
4. As a privacy-conscious user, I want a manual coordinate fallback, so that I can use the app without granting geolocation access.
5. As a local developer, I want geolocation to work on localhost origins, so that I can test without HTTPS certificates.
6. As a user with intermittent GPS accuracy, I want nearest forecast-area matching, so that I still get the correct regional weather snapshot.
7. As a user near area boundaries, I want deterministic area selection, so that repeated adds produce consistent results.
8. As a returning user, I want duplicate detection, so that Use my location does not create repeated cards for the same area.
9. As a user with existing manually added points, I want area-level dedupe to still work, so that old and new entries do not fragment the same forecast area.
10. As a user, I want the existing location to be selected when a duplicate is detected, so that I am taken directly to the relevant card.
11. As a user, I want loading feedback while location detection is in progress, so that I know the app is working.
12. As a user, I want action buttons disabled while detection/add is running, so that accidental double submission is prevented.
13. As a user, I want a clear message when permission is denied, so that I know how to recover.
14. As a user, I want a clear message when position is unavailable, so that I can retry or switch to manual entry.
15. As a user, I want a clear timeout message, so that long waits end with actionable feedback.
16. As a user, I want a clear unsupported-browser or insecure-context message, so that failure reasons are understandable.
17. As a user outside Singapore, I want a specific out-of-bounds message, so that I know why auto-add did not proceed.
18. As a user, I want area-resolution failures to stop creation, so that the app does not silently save the wrong coordinate type.
19. As a product owner, I want telemetry for click/success/failure/duplicate-selected events, so that feature quality can be monitored.
20. As a backend maintainer, I want area-resolution logic centralized server-side, so that forecast-area rules are not duplicated in clients.
21. As a frontend maintainer, I want to reuse the existing add flow and API client path, so that behavior stays consistent with current architecture.
22. As a QA engineer, I want deterministic integration tests for creation and dedupe outcomes, so that regressions are caught early.
23. As a QA engineer, I want deterministic UI tests for geolocation success and error cases, so that user-facing behavior is validated.
24. As a platform maintainer, I want no required schema migration for this feature, so that rollout remains low-risk.
25. As a user, I want existing manual add behavior unchanged, so that established workflows remain available.
26. As a user, I want location auto-add to return current weather snapshot behavior consistent with normal creation, so that dashboard expectations remain intact.

## Implementation Decisions

- The feature is implemented as an extension of the existing add-location flow, not a separate screen or global action.
- The frontend uses browser geolocation directly on Use my location click with bounded options tuned for responsiveness: high accuracy off, explicit timeout, and short cache age.
- The location-creation API contract is extended with an optional resolveNearestArea boolean in the request body.
- Manual coordinate submissions keep current behavior by omitting the resolveNearestArea flag.
- The backend location-create route remains the single write entry point for new locations.
- When resolveNearestArea is true, backend resolves nearest Singapore forecast area using two-hour forecast area metadata.
- Canonical coordinates used for persistence are the resolved forecast area label coordinates, not the raw browser GPS coordinates.
- If nearest-area resolution fails, creation is aborted with a clear provider-related failure response.
- If detected coordinates are outside Singapore bounds, backend rejects the request with an explicit out-of-Singapore validation response.
- Area metadata retrieval is cached in-memory with a short TTL to reduce repeated upstream fetches while preserving freshness.
- Area-level dedupe is authoritative for Use my location flow and applies against all saved locations, including legacy manual coordinate entries.
- Dedupe behavior is idempotent: return existing location instead of failing with duplicate error for expected same-area reuse.
- Response semantics are explicit: 201 for newly created location, 200 for existing location returned due to dedupe.
- Frontend store create flow treats both 200 and 201 as successful create/select outcomes.
- UI interaction model disables action controls while auto-detect is in flight to prevent concurrent submissions.
- Error copy is user-specific by failure class: denied, unavailable, timeout, unsupported/insecure context, out-of-Singapore, and resolution/provider failure.
- Existing interaction logging vocabulary is extended with use-location-specific events for click, success, failure, and duplicate-selected outcomes.
- No schema changes are required for this feature.
- Existing persisted rows are not backfilled or migrated; canonicalization applies only when new Use my location actions are executed.
- Weather snapshot refresh behavior remains aligned with current create-location semantics.

## Testing Decisions

- Good tests assert external behavior and contract outcomes, not implementation internals.
- Primary seam for backend is the locations API integration seam, using injected weather client behavior and request/response verification.
- Existing API tests for location creation and refresh serve as prior art for new route contract scenarios.
- New backend test scenarios cover:
1. resolveNearestArea true creates canonical area location and returns 201.
2. resolveNearestArea true returns existing location with 200 when area duplicate is detected.
3. Area-level dedupe catches duplicates against previously saved manual points in same area.
4. Out-of-Singapore geolocation coordinates return validation error.
5. Nearest-area resolution/provider failure returns clear non-success response and does not persist.
- Primary seam for frontend is add-location behavior through store and form interactions rather than visual implementation details.
- New frontend scenarios cover:
1. Use my location success path requests geolocation, calls create with resolveNearestArea, and selects resulting location.
2. In-flight control disablement prevents repeat submissions.
3. Permission denied, unavailable, timeout, unsupported/insecure-context, and backend failure states map to specific user-visible messages.
4. Duplicate-selected success path is surfaced as normal success behavior.
- Prior art for frontend API/store behavior comes from current store-driven create flow and centralized API client request handling patterns.

## Out of Scope

- Replacing manual latitude/longitude inputs with an area picker.
- Backfilling or migrating historical rows to canonical area coordinates.
- Introducing map-based pin selection or map-driven add flow.
- Adding new persistent tables or schema fields solely for geolocation metadata.
- Changing weather snapshot composition beyond current create/refresh behavior.
- Full geolocation analytics dashboarding or experimentation framework.

## Further Notes

- The feature aligns directly with the project feature-task definition for geolocation plus auto-detect.
- Localhost support is treated as a functional requirement and should be validated on the default local development origin.
- If future work introduces a Singapore area picker, this server-side nearest-area logic remains reusable and should continue to be the authoritative mapping layer.
