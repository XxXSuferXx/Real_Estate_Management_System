import http from 'k6/http';
import { check } from 'k6';
import exec from 'k6/execution';

export const options = {
  scenarios: {
    fixed_rate_burst: {
      executor: 'constant-arrival-rate',
      rate: 50,
      timeUnit: '1s',
      duration: '4s',
      preAllocatedVUs: 200, // Pre-allocate all 200 VUs at t=0
      maxVUs: 250,          // Safety buffer
    },
  },
};

export default function () {
  const url = 'http://localhost:3000/api/v1/auth/register';

  // Combine VU id, test-wide iteration count, and random string to eliminate collisions
  const uniqueId = `${__VU}_${exec.scenario.iterationInTest}_${Math.random().toString(36).substring(7)}`;

  const payload = JSON.stringify({
    email: `buyer_${uniqueId}@example.com`,
    username: `user_${uniqueId}`,
    password: '*$#Si8f5g',
    role: 'buyer',
  });

  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  const res = http.post(url, payload, params);

  const success = check(res, {
    'status is 201': (r) => r.status === 201,
  });

  if (!success) {
    console.error(`VU ${__VU} [Iter ${exec.scenario.iterationInTest}] failed (${res.status}): ${res.body}`);
  }
}