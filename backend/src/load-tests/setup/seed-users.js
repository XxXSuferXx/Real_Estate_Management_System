// seed-users.js
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 10,
  iterations: 100, // creates 100 users total
};

export default function () {
  const url = 'http://localhost:3000/api/v1/auth/register';

  const payload = JSON.stringify({
    email: `loginuser_${__VU}_${__ITER}@example.com`,
    username: `loginuser_${__VU}_${__ITER}`,
    password: '*$#Si8f5g',
    role: 'buyer',
  });

  const params = { headers: { 'Content-Type': 'application/json' } };

  const res = http.post(url, payload, params);
  check(res, { 'registered ok': (r) => r.status === 201 });
}