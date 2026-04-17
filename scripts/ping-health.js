#!/usr/bin/env node
/*
 Simple health ping loop for keeping Render free services awake.
 Usage: node scripts/ping-health.js <url>
 Example: node scripts/ping-health.js https://your-app.onrender.com/health

 Pings the provided URL at a random interval between 600s and 840s.
*/

const { URL } = require('url');
const http = require('http');
const https = require('https');

const target = process.argv[2] || process.env.HEALTH_URL;
if (!target) {
  console.error('Usage: node scripts/ping-health.js <url>');
  process.exit(1);
}

const MIN_MS = 600 * 1000; // 10 minutes
const MAX_MS = 840 * 1000; // 14 minutes

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function pingOnce(urlStr) {
  return new Promise((resolve) => {
    let u;
    try {
      u = new URL(urlStr);
    } catch (err) {
      return resolve({ ok: false, error: 'invalid_url' });
    }
    const lib = u.protocol === 'https:' ? https : http;
    const opts = {
      hostname: u.hostname,
      path: u.pathname + u.search,
      port: u.port || (u.protocol === 'https:' ? 443 : 80),
      method: 'GET',
      timeout: 30000,
      headers: { 'User-Agent': 'ping-health-script/1.0' },
    };

    const req = lib.request(opts, (res) => {
      const status = res.statusCode;
      // drain the body
      res.on('data', () => {});
      res.on('end', () => resolve({ ok: true, statusCode: status }));
      res.resume();
    });

    req.on('error', (err) => resolve({ ok: false, error: err.message }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ ok: false, error: 'timeout' });
    });
    req.end();
  });
}

async function run() {
  console.log(new Date().toISOString(), 'Starting ping loop for', target);
  while (true) {
    const r = await pingOnce(target);
    if (r.ok) {
      console.log(new Date().toISOString(), 'PING OK', r.statusCode);
    } else {
      console.error(new Date().toISOString(), 'PING ERROR', r.error);
    }
    const interval = Math.floor(Math.random() * (MAX_MS - MIN_MS + 1)) + MIN_MS;
    console.log(new Date().toISOString(), `Next ping in ${Math.round(interval / 1000)}s`);
    await wait(interval);
  }
}

run().catch((err) => {
  console.error('Fatal error', err);
  process.exit(1);
});
