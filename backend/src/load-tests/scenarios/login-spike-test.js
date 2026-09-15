// login-spike-test.js
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  scenarios: {
    instant_login_burst: {
      executor: 'per-vu-iterations',
      vus: 100,
      iterations: 1,
      maxDuration: '1m',
    },
  },
};

export default function () {
  const url = 'http://localhost:3000/api/v1/auth/login';

  const vuId = (__VU - 1) % 100;
  const payload = JSON.stringify({
    email: `loginuser_${(vuId % 10) + 1}_${Math.floor(vuId / 10)}@example.com`,
    password: '*$#Si8f5g',
  });

  const params = { headers: { 'Content-Type': 'application/json' } };

  const res = http.post(url, payload, params);

  check(res, { 'status is 200': (r) => r.status === 200 });
}