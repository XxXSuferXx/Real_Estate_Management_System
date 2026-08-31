// bcrypt-bench.ts
process.env.UV_THREADPOOL_SIZE = '64';
import bcrypt from 'bcrypt';

async function run() {
  const start = performance.now();

  const promises = Array.from({ length: 100 }, (_, i) =>
    bcrypt.hash(`password${i}`, 10)
  );

  await Promise.all(promises);

  console.log(`100 concurrent bcrypt hashes: ${(performance.now() - start).toFixed(0)}ms`);
}

run();