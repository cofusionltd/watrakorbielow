import assert from 'node:assert/strict';
import { once } from 'node:events';
import express from 'express';
import { createServer } from 'node:http';
import test from 'node:test';
import { createReadinessHandler } from './readiness.ts';

async function requestReadiness(checkDatabase: () => Promise<unknown>) {
  const app = express();
  app.get('/api/ready', createReadinessHandler(checkDatabase));
  const server = createServer(app);
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');

  try {
    const address = server.address();
    assert.ok(address && typeof address !== 'string');
    return await fetch(`http://127.0.0.1:${address.port}/api/ready`);
  } finally {
    server.close();
    await once(server, 'close');
  }
}

test('readiness returns 200 when the database check succeeds', async () => {
  const response = await requestReadiness(async () => undefined);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    status: 'ready',
    databaseConnected: true,
  });
});

test('readiness returns 503 when the database check fails', async () => {
  const response = await requestReadiness(async () => {
    throw new Error('database unavailable');
  });
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), {
    status: 'not_ready',
    databaseConnected: false,
  });
});
