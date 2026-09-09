# Week 2 Agentic Workflow

This document tracks the workflow and thought process for implementing the first backend slice of the Internal Operations Service Hub. It is structured around the core agentic workflow pillars: Understand, Direct, and Prove.

## 1. UNDERSTAND (Context, Sources, and Bounds)
Before writing code, the agent needed to be grounded in the Week 1 documentation to ensure the implementation matched the planned design.

*   **Explicit Tie-Backs to Week 1:** 
    *   From `data-model.md`: Enforced the **append-only history invariant**. Every time a ticket's status changes, a log must be written, and old logs cannot be altered.
    *   From `architecture.md`: Enforced the **ownership rule**. The `employee_id` is set once upon creation and never reassigned. 
    *   From `product-spec.md`: `product-spec.md` lists 8 status values but leaves the transition graph undefined — this was flagged as an open question in `data-model.md`. For this bounded slice, I resolved it by enforcing strict forward-only transitions (Received → In Progress → Resolved, no skipping, no backward moves), as the simplest interpretation to prove the invariant works.
*   **Explicit Non-Goals (Bounded Context):** To keep the slice focused, I explicitly constrained the scope:
    *   No authentication or login system.
    *   No UI or frontend generation.
    *   Single hardcoded `employee_id` ("EMP-HARDCODED").
    *   In-memory array storage only (no real database yet).

## 2. DIRECT (Approve · Redirect · Stop)
The agent did not just blindly generate code; there was a critical moment of negotiation and redirection.

*   **The Stop & Inspect:** When instructed to begin, the agent inspected the existing repository and found an existing Vite/React + Express architecture with zero NestJS installed. Rather than blindly overwriting or jamming NestJS in, the agent explicitly *stopped* to flag the discrepancy and ask for permission before installing a new framework.
*   **The Approve & Constrain:** I approved the installation of NestJS (since it was required for the milestone), but I provided strict constraints to bound the agent's behavior: 
    *   Do not touch the existing frontend code.
    *   Do not remove the existing Express setup.
    *   Hardcode the employee ID to isolate the backend logic.

## 3. PROVE (Defects, Corrections, and Verification)
The most important part of the workflow was verifying the agent's output and catching its mistakes.

*   **Defect 1: The "Happy Path" Testing Gap (Caught by Me)**
    *   *What happened:* The agent provided a test script (`run-http-test.ts`) that initially only tested the "happy path" (successful creation and valid status updates). It silently skipped the 3 failure cases/edge cases that were outlined in its own approved plan.
    *   *The Correction:* I caught this omission and redirected the agent, rejecting the incomplete test. I forced it to write a comprehensive test suite that actually proved the constraints were working by testing the illegal moves.
    *   *The Result:* The agent rewrote the test to hit all 7 cases, proving that the API correctly returns `400 Bad Request` when trying to skip states (e.g., `Received` -> `Resolved`), send invalid strings (`"FOO"`), or move backward.
*   **Defect 2: Local Environment DI Failure**
    *   *What happened:* When running the full test script locally with `npx tsx`, every endpoint threw a `500 Internal Server Error` due to a Dependency Injection failure (the `RequestsService` was undefined in the controller).
    *   *The Correction:* Diagnosed that the lightweight `tsx` compiler was stripping TypeScript decorator metadata. Directed the agent to explicitly add the `@Inject(RequestsService)` decorator to the controller constructor, resolving the local execution bug immediately.
*   **Final Evidence:** 
    *   The updated `run-http-test.ts` script now boots the server, runs through all valid and invalid state transitions, verifies the append-only history log array length, and outputs `✅ RESULT: ALL HTTP TESTS PASSED. Constraints actively rejected invalid payloads.` with full HTTP logs.
