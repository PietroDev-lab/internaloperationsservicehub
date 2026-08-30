-- --- -- -- --- -- -- --- -- -- --- -- -- --- -- -- --- -- -- --- -- -- --- -- -- ---
# Internal Operations Service Hub - Architecture Draft
-- --- -- -- --- -- -- --- -- -- --- -- -- --- -- -- --- -- -- --- -- -- --- -- -- ---

# 1. Purpose + Scope

*Requirements Driving the Design:*

- The system must centralize and organize operational requests so a single HR Representative can sort, prioritize, and reply efficiently.
- Employees need predefined request types, status tracking, and notifications.
- The system must enforce strict isolation: employees only see their own requests, while HR sees all.
- If a submission fails, the employee must be explicitly informed (no false confirmations).

*Actors:*
- *Employee:* Submits predefined or "Other" requests and tracks their progress.
- *HR Representative:* A single administrator who receives, prioritizes, updates statuses, and responds to all requests.

*System Boundary:*
- *Inside:* Web Interface (Employee/HR Portals), Request Processing Engine, Notification Dispatcher.
- *Outside (dependencies):* Existing Company Database, Corporate Identity / Auth Provider.

--- --- --- --- --- --- --- --- --- --- --- --- --- ---

# 2. Structure + Flow

*Major parts:*
- *Web Interface (A):* Browser UI — employee submission form, HR dashboard.
- *Request Processing Engine (B):* Enforces business logic, validates inputs, maintains audit history.
- *Notification Dispatcher (C):* Alerts employees on status change or HR reply, asynchronously so HR's workflow is never blocked.

*Inside vs outside:*
- Inside: A, B, C.
- Outside: Existing Database (mandated by "must use the company's existing database / server infrastructure"); Corporate Auth Provider / IdP (issues login tokens — a hard dependency, since nothing in the system authenticates without it).

*Trust / authorization:*
- The Engine trusts no claim it did not itself validate against an IdP-issued token — not even one asserted by the Web Interface.
- Employee token → Engine forces `WHERE employee_id = X` on all queries.
- HR token → Engine checks the HR claim, bypasses the employee filter.

*Data flow — traced to one requirement:*
*Requirement:* "If a request cannot be submitted because of a system error, the employee shall be informed... and shall not be shown a false confirmation."
- *Actor:* Employee only — this is not an HR-facing requirement.
- *Components:* Web Interface, Engine, Database.
- *Flow:* Employee submits → Web Interface POSTs to Engine → Engine validates and writes to Database synchronously → write fails/times out → Engine returns 500/400 → Web Interface shows "Submission unsuccessful" to the employee.
- *Why synchronous:* the sync boundary is what guarantees the UI never assumes success before the write is confirmed.

--- --- --- --- --- --- --- --- --- --- --- --- --- ---

# 3. Trust + Resilience

*Trust boundaries:*
- Web Interface ↔ Engine: Engine re-validates every payload, never trusts the client.
- Data layer: horizontal access control — employees can't guess other employees' request IDs.
- Engine ↔ Auth Provider: every token re-checked per request, no cached trust decisions.

*Failure scenarios:*

| Web Interface (A) | Employees can't load the portal | Load-balanced hosting |
| Request Engine (B) | Business logic halts | UI shows "System offline," no false confirmations |
| Notification Dispatcher (C) | Alerts don't send | Data is safe; employee sees updates on next manual check |
| Existing Database (ext.) | No reads/writes | Engine surfaces a "Maintenance" error |
| Auth Provider (ext.) | No one can log in or refresh a token — blocks *everyone*, including HR | UI shows "Unable to sign in"; already-issued tokens keep working read-only until they expire |

*Connection failures:*
- Web (A) → Engine (B): timeout shown to user, submission halts.
- Engine (B) → Database (ext.): Engine aborts, returns a hard failure to A — this is what satisfies "no false confirmation."
- Engine (B) → Notifier (C): Engine writes the core status update, then queues the notification in its **own** retry store — not the Dispatcher's — so a Dispatcher crash can't lose a queued alert.
- Engine (B) → Auth Provider (ext.): Engine rejects with an auth error; it never falls back to an unauthenticated path.

*Scalability:* 50 concurrent employees, 100 requests/hour — a mixed read/write load a single Engine instance handles easily. The real ceiling is the Database's and the Auth Provider's own availability, not this system's code.

--- --- --- --- --- --- --- --- --- --- --- --- --- ---

# 4. Decisions

| Decision | Caused by |

| Two system actors (Employee, HR), not the full spec list | "Only one HR administrator is available" (constraint) |

| Monolith, no microservices | "will not include multiple HR departments... 50 concurrent employees" — per-domain services are overhead at this scale |

| Adapter over existing DB, no new schema | "must use the company's existing database / server infrastructure" |

| Manual state machine, no automated triage | "will not automatically approve or reject... HR remains responsible" |

| Append-only history log | "shall maintain a history of requests and their status changes" |

| Sync REST between Web Interface and Engine (not async messaging) | Guarantees an instant reject on DB failure — required for "no false confirmation" |

| Engine owns the notification retry queue, not the Dispatcher | HR's workflow and request data must survive a notification-provider outage without loss |