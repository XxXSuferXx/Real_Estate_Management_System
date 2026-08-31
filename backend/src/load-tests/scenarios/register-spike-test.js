import http from 'k6/http';
import { check } from 'k6';

export const options = {
  scenarios: {
    instant_post_burst: {
      executor: 'per-vu-iterations',
      vus: 100,
      iterations: 1,
      maxDuration: '1m',
    },
  },
  //noConnectionReuse: true,
};

export default function () {
  const url = 'http://localhost:3000/api/v1/auth/register';

  const payload = JSON.stringify({
    email: `buyer_${__VU}_${Date.now()}@example.com`,
    username: `buyer_${__VU}`,
    password: '*$#Si8f5g',
    role: 'buyer',
  });

  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  const res = http.post(url, payload, params);

  const success = check(res, {
    'status is 200 or 201': (r) => r.status === 200 || r.status === 201,
  });

  // Log non-200 responses to diagnose server pool or CPU crashes
  if (!success) {
    console.error(`VU ${__VU} failed with status ${res.status}: ${res.body}`);
  }
}