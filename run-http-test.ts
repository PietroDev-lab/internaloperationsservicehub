import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';

async function runHttpTests() {
  console.log('Bootstrapping full NestJS HTTP Server for End-to-End Testing...');
  const app = await NestFactory.create(AppModule, ); // Disable default logger to clean output
  await app.listen(3030); // Use a distinct port
  
  const baseUrl = 'http://127.0.0.1:3030/requests';
  console.log(`Server listening on ${baseUrl}\n`);

  console.log('======================================================');
  console.log('   Internal Operations Service Hub - Full HTTP Tests');
  console.log('======================================================\n');

  // --- ORIGINAL VALID CASES ---
  console.log('--- PHASE 1: ORIGINAL VALID PATHS ---');
  
  // 1. Create a Request
  let res = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'Official Document', description: 'Need an employment verification letter.' })
  });
  let req1 = await res.json();
  console.log(`[POST /requests] Create Request`);
  console.log(`  Expected HTTP: 201 Created`);
  console.log(`  Actual HTTP:   ${res.status} ${res.statusText}`);
  console.log(`  Response Body: ${JSON.stringify(req1)}\n`);
  
  const currentRequestId = req1.request_id;

  // 2. Fetch all requests
  res = await fetch(baseUrl);
  let allReqs = await res.json();
  console.log(`[GET /requests] Retrieve all requests`);
  console.log(`  Expected HTTP: 200 OK`);
  console.log(`  Actual HTTP:   ${res.status} ${res.statusText}`);
  console.log(`  Response:      Array of length ${allReqs.length}\n`);

  // --- NEW INVALID EDGE CASES (Testing The Fixes) ---
  console.log('--- PHASE 2: NEW INVALID EDGE CASES (DEFECT CHECK) ---');

  // Test Case 2: PATCH a fresh RECEIVED request directly to RESOLVED (skipping IN_PROGRESS)
  res = await fetch(`${baseUrl}/${currentRequestId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'Resolved' })
  });
  let badRes1 = await res.json();
  console.log(`[PATCH /requests/:id/status] (Received -> Resolved directly)`);
  console.log(`  Expected HTTP: 400 Bad Request`);
  console.log(`  Actual HTTP:   ${res.status} ${res.statusText}`);
  console.log(`  Response Body: ${JSON.stringify(badRes1)}\n`);

  // Test Case 3: PATCH a request with status "FOO"
  res = await fetch(`${baseUrl}/${currentRequestId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'FOO' })
  });
  let badRes2 = await res.json();
  console.log(`[PATCH /requests/:id/status] (Status: "FOO")`);
  console.log(`  Expected HTTP: 400 Bad Request`);
  console.log(`  Actual HTTP:   ${res.status} ${res.statusText}`);
  console.log(`  Response Body: ${JSON.stringify(badRes2)}\n`);

  // --- CONTINUING ORIGINAL VALID PATHS ---
  console.log('--- PHASE 3: CONTINUING MAIN PATH ---');

  // 3. HR Updates Status to "In Progress"
  res = await fetch(`${baseUrl}/${currentRequestId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'In Progress' })
  });
  let reqUpdated = await res.json();
  console.log(`[PATCH /requests/:id/status] (Received -> In Progress)`);
  console.log(`  Expected HTTP: 200 OK`);
  console.log(`  Actual HTTP:   ${res.status} ${res.statusText}`);
  console.log(`  Response Body: ${JSON.stringify(reqUpdated)}\n`);

  // 4. HR Resolves Request with Message
  res = await fetch(`${baseUrl}/${currentRequestId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'Resolved', hrMessage: 'Here is your verification letter attached.' })
  });
  let reqResolved = await res.json();
  console.log(`[PATCH /requests/:id/status] (In Progress -> Resolved)`);
  console.log(`  Expected HTTP: 200 OK`);
  console.log(`  Actual HTTP:   ${res.status} ${res.statusText}`);
  console.log(`  Response Body: ${JSON.stringify(reqResolved)}\n`);

  // --- FINAL EDGE CASE ON COMPLETED TICKET ---
  console.log('--- PHASE 4: FINAL EDGE CASE ---');

  // Test Case 1: PATCH a RESOLVED request's status back to RECEIVED
  res = await fetch(`${baseUrl}/${currentRequestId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'Received' })
  });
  let badRes3 = await res.json();
  console.log(`[PATCH /requests/:id/status] (Resolved -> Received backwards)`);
  console.log(`  Expected HTTP: 400 Bad Request`);
  console.log(`  Actual HTTP:   ${res.status} ${res.statusText}`);
  console.log(`  Response Body: ${JSON.stringify(badRes3)}\n`);

  // --- INVARIANT CHECK ---
  console.log('--- PHASE 5: HISTORY INVARIANT CHECK ---');

  // 5. Verify History Invariant
  res = await fetch(`${baseUrl}/${currentRequestId}/history`);
  let history = await res.json();
  console.log(`[GET /requests/:id/history] Retrieve History`);
  console.log(`  Expected HTTP: 200 OK`);
  console.log(`  Actual HTTP:   ${res.status} ${res.statusText}`);
  console.log(`  Actual:   Found ${history.length} history logs.`);
  
  history.forEach((log: any, index: number) => {
    console.log(`    Log ${index + 1}: [${log.old_status || 'NULL'}] -> [${log.new_status}] (Changed By: ${log.changed_by_id})`);
  });

  const invariantHolds = 
    history.length === 3 &&
    history[0].new_status === 'Received' &&
    history[1].old_status === 'Received' && history[1].new_status === 'In Progress' &&
    history[2].old_status === 'In Progress' && history[2].new_status === 'Resolved' &&
    history[2].hr_response_message === 'Here is your verification letter attached.';

  if (invariantHolds) {
    console.log('\n✅ RESULT: ALL HTTP TESTS PASSED. Constraints actively rejected invalid payloads.');
  } else {
    console.log('\n❌ RESULT: TESTS FAILED. History invariant mismatch.');
  }

  await app.close();
}

runHttpTests().catch(err => {
  console.error('\n❌ Fatal Test Error:', err);
  throw err;
});
