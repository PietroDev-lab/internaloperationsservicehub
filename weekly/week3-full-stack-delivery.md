# Week 3: Full-Stack Delivery & Test Run Verification

To absolutely guarantee the strict requirements of the Service Hub, the full-stack slice has been backed by a 4-tier testing suite.

Below is the verified output from executing the testing infrastructure.

## 1. Unit Tests (`test:unit`)
The backend strictly protects access routes by enforcing Employee ID boundaries against the JWT context.

**Execution:**
```text
> tsx src/backend/requests/requests.service.spec.ts

--- STARTING UNIT TESTS ---
✅ Allowed: employee A requests GET /requests/:id for their own request
✅ Denied: employee B requests GET /requests/:id for employee A request -> 403 Forbidden
✅ Allowed: HR requests GET /requests/:id for employee A request
✅ ALL UNIT TESTS PASSED.
```

## 2. Integration Tests (`test:integration`)
To prevent test-data pollution in the `dev.db` database, I modified the integration tests to utilize an isolated database instance (`test.db`). The tests correctly execute DB writes and assert that the `RequestHistory` table honors the append-only schema constraints.

**Execution:**
```text
> tsx run-integration-tests.ts

--- STARTING INTEGRATION TEST ---
Setting up isolated test database (test.db)...
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": SQLite database "test.db" at "file:./test.db"
SQLite database test.db created at file:./test.db
🚀  Your database is now in sync with your Prisma schema. Done in 16ms
1. Creating request in real DB...
✅ Created Request ID: fcb631f6-c405-402f-adb2-b6c1cd47fafc
2. Reading it back from real DB...
✅ Request read successfully, matches input.
3. Validating RequestHistory appended correctly...
✅ RequestHistory validated (1 record: NULL -> Received).
✅ ALL INTEGRATION TESTS PASSED.
```

## 3. Regression Tests (`test:regression`)
I ran the original v0.2 assertions against the new live NestJS API. The tests correctly authenticate via JWT payloads and accurately validate that the `@IsIn()` DTO decorators are actively filtering malicious updates (like "FOO").

*(Note: The server port was correctly isolated to `3031` during this run to prevent blocking against the live dev server).*

**Execution:**
```text
> tsx run-http-tests.ts

Bootstrapping full NestJS HTTP Server for End-to-End Testing...
Server listening on http://127.0.0.1:3031/api/requests

Login Response: {
  access_token: '<VALID_JWT_TOKEN>',
  employee_id: 'EMP-HARDCODED',
  role: 'EMPLOYEE',
  display_name: 'EMP-HARDCODED'
}

======================================================
   Internal Operations Service Hub - Full HTTP Tests
======================================================

--- PHASE 1: ORIGINAL VALID PATHS ---
[POST /requests] Create Request
  Expected HTTP: 201 Created
  Actual HTTP:   201 Created
[GET /requests] Retrieve all requests
  Expected HTTP: 200 OK
  Actual HTTP:   200 OK

--- PHASE 2: NEW INVALID EDGE CASES (DEFECT CHECK) ---
[PATCH /requests/:id/status] (Received -> Resolved directly)
  Expected HTTP: 400 Bad Request
  Actual HTTP:   400 Bad Request
  Response Body: {"message":"Cannot transition a fresh Received request directly to Resolved without intermediate states","error":"Bad Request","statusCode":400}

[PATCH /requests/:id/status] (Status: "FOO")
  Expected HTTP: 400 Bad Request
  Actual HTTP:   400 Bad Request
  Response Body: {"message":"Invalid status value","error":"Bad Request","statusCode":400}

--- PHASE 3: CONTINUING MAIN PATH ---
[PATCH /requests/:id/status] (Received -> In Progress)
  Expected HTTP: 200 OK
  Actual HTTP:   200 OK
[PATCH /requests/:id/status] (In Progress -> Resolved)
  Expected HTTP: 200 OK
  Actual HTTP:   200 OK

--- PHASE 4: FINAL EDGE CASE ---
[PATCH /requests/:id/status] (Resolved -> Received backwards)
  Expected HTTP: 400 Bad Request
  Actual HTTP:   400 Bad Request

--- PHASE 5: HISTORY INVARIANT CHECK ---
[GET /requests/:id/history] Retrieve History
  Expected HTTP: 200 OK
  Actual HTTP:   200 OK
  Actual:
  Found 3 history logs.
    Log 1: [NULL] -> [Received] (Changed By: SYSTEM)
    Log 2: [Received] -> [In Progress] (Changed By: HR-1)
    Log 3: [In Progress] -> [Resolved] (Changed By: HR-1)

✅ RESULT: ALL HTTP TESTS PASSED. Constraints actively rejected invalid payloads.
```

## 4. End-to-End UI Tests (`test:e2e`)
I identified a strict mode violation bug in `tests/e2e.spec.ts` when multiple instances of the same employee ID were creating requests, causing the DOM `.request-item` locator to detect duplicate items. I modified the suite to use unique employee IDs per run (`EMP-E2E-${Date.now()}`), resulting in a perfect execution over the UI.

**Execution:**
```text
> playwright test

Running 1 test using 1 worker
  ✓  1 [chromium] › tests/e2e.spec.ts:4:3 › Property 7: Meaningful E2E Test (Full Flow) › Employee creates request, HR resolves it, Employee sees update (1.0s)

  1 passed (6.3s)
```
