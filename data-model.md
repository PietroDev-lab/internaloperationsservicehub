-- -- -- -- -- -- -- -- -- -- -- -- -- --
title : Data Model for Internal operations service Hub
--- --- --- --- --- --- --- --- --- --- -

# authentication model

- The system does not manage passwords or local authentication states .
- *Corporate Identity Provider (IdP):* All authentication is handled by the company's existing IdP .
- *Token Validation:* The Request Processing Engine validates the IdP token on every request .
- *Identity Resolution:*
  - *Employee:* If the token belongs to a standard user , the Engine extracts their unique employee_id and enforces a strict WHERE employee_id = X filter on all data access .
  - *HR Representative:* If the token contains a specific HR administrator claim , the Engine bypasses the employee ID filter , granting global read/write access to all requests .

# entities and attributes

- Note : Due to the architectural constraint "Adapter over existing DB, no new schema," these represent *logical* entities . Their physical storage is addressed in ADR-001 .

*Employee* (Derived / External)
- Read-only entity inferred from the existing database/IdP .
- employee_id (String/UUID, Primary Key)
- name (String)

*Request*
- The core entity submitted by an employee .
- request_id (String/UUID, Primary Key)
- employee_id (String, Foreign Key mapping to the external Employee)
- type (Enum : Predefined categories + "Other")
- description (Text : The content of the request)
- status (Enum : Received , In Progress , Pending , Delayed , Accepted , Rejected , Resolved , Closed)
- created_at (Timestamp)
- updated_at (Timestamp)

*Request_History_Log* (Audit Trail)
- Tracks all status changes and HR responses to satisfy the history requirement .
- log_id (String/UUID, Primary Key)
- request_id (String/UUID, Foreign Key mapping to Request)
- changed_by_id (String/UUID : Identifies if HR or the system made the change)
- old_status (Enum)
- new_status (Enum)
- hr_response_message (Text : Nullable, contains messages/updates from HR)
- timestamp (Timestamp)

*Notification_Queue*
- Owned by the Request Engine to ensure notifications aren't lost if the Dispatcher fails .
- notification_id (String/UUID, Primary Key)
- request_id (String/UUID)
- target_employee_id (String/UUID)
- status (Enum : Queued , Sent , Failed)
- payload (Text/JSON : The content of the alert)

# relationships and cardinality

- *Employee (1) to (N) Requests :* An employee can submit zero or many requests .
- *Request (1) to (N) Request_History_Logs :* A request will have at least one history log (its creation) and multiple logs over time as HR updates statuses or responds .
- *Request (1) to (N) Notification_Queues :* A request can trigger multiple notifications throughout its lifecycle .

# explicit rules

- *Ownership :* A request is permanently owned by the employee_id that submitted it . Ownership cannot be transferred .
- *History / Audit Trail :* The Request_History_Log is strictly append-only . Status changes and HR replies must generate a new history record . Existing records cannot be mutated or deleted , even by the HR administrator .
- *Lifecycle (Status Transitions) :*
  - Initial state must always be Received .
  - Only the HR Administrator can transition statuses .
  - Allowable statuses : Received , In Progress , Pending , Delayed , Accepted , Rejected , Resolved , Closed .
  - When a request is marked Resolved or Closed , it must remain accessible in the history views .
- *Access Control :*
  - *Employee :* The Engine never trusts the Web Interface . It enforces visibility by forcibly appending the IdP-derived employee_id to all fetch queries .
  - *HR :* The sole HR admin bypasses the employee filter to view , sort , search , and update any request .

# storage approach

- Because architecture.md dictates "Adapter over existing DB, no new schema" , we cannot create new relational tables for Requests or History_Logs .
- The logical entities above will be serialized into JSON and stored inside an existing generic extension or metadata table within the company's database .
- See ADR-001.md for the full justification .

# contradictions found

*Contradiction 1 : Actor Scope*
- *Conflict :* product-spec.md lists 9 different actors and 7 stakeholder groups . However , architecture.md and the spec constraints explicitly state "Only one HR administrator is available" and heavily focus the system boundaries strictly around an Employee and an HR Representative .
- *Resolution :* The data model strictly enforces a two-actor system (Employee and HR) . I discarded the other actors as out-of-scope noise , avoiding unnecessary role-based access control (RBAC) complexity that would violate the constraints .

*Contradiction 2 : Audit History vs. No New Schema*
- *Conflict :* product-spec.md requires maintaining a strict history of requests and status changes . architecture.md echoes this with an "Append-only history log" . However , architecture.md also mandates "Adapter over existing DB, no new schema" . You cannot naturally build a relational append-only audit trail without defining new tables .
- *Resolution :* I modeled the logical entities required to satisfy the functional requirements , but pushed the physical implementation decision to an Architecture Decision Record (ADR-001.md) . We will resolve this by storing the data in an existing generic table (such as JSON) rather than failing the constraint .

-- -- -- -- -- -- -- --
*A successful case :*
--- --- --- --- --- ---

- Employee "Jane" (ID : EMP-404) requests an official employment letter . HR Admin "Alice" (ID : HR-1) processes and resolves the request .

- *Step 1 :* Jane logs into the system , selects "Request an official document" , fills in all required information and submits the request . The Engine validates her Identity Provider token . A new Request is created with status "Received" and a new Request_History_Log is created for the initial state .

- *Step 2 :* HR Admin Alice logs in . Her token grants global access . She updates the status to let Jane know it's being handled . The Request is updated to "In Progress" , a new Request_History_Log is appended , and a new Notification_Queue is created to alert Jane .

- *Step 3 :* Alice finishes the document and formally closes out the request in the hub with a message to Jane . The Request is updated to "Resolved" , a final Request_History_Log is appended capturing the reply , and a final Notification_Queue is created .

- *Final State :* The Request sits at Resolved . The Request_History_Log has exactly 3 immutable records tracking the entire lifecycle , and Jane was notified twice without her web session ever hanging or failing due to a notification provider crash .
