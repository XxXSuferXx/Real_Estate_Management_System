// login-load-test.js
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  scenarios: {
    login_ramp: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 20 },  // ramp up
        { duration: '20s', target: 20 },  // hold steady
        { duration: '10s', target: 0 },   // ramp down
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500'], // fail the test if p95 exceeds 500ms
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const url = 'http://localhost:3000/api/v1/auth/login';

  // reuse one of the 100 seeded accounts, cycling by VU
  const vuId = (__VU - 1) % 100;
  const payload = JSON.stringify({
    email: `loginuser_${(vuId % 10) + 1}_${Math.floor(vuId / 10)}@example.com`,
    password: '*$#Si8f5g',
  });

  const params = { headers: { 'Content-Type': 'application/json' } };

  const res = http.post(url, payload, params);

  check(res, {
    'status is 200': (r) => r.status === 200,
    'has accessToken': (r) => JSON.parse(r.body).data?.accessToken !== undefined,
  });
}