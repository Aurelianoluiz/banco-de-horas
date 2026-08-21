const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:3000';
const total = Number(process.env.LOAD_REQUESTS || 60);
const concurrency = Number(process.env.LOAD_CONCURRENCY || 10);

if (!Number.isInteger(total) || total < 1 || total > 500) throw new Error('LOAD_REQUESTS deve estar entre 1 e 500');
if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > 50) throw new Error('LOAD_CONCURRENCY deve estar entre 1 e 50');

const timings = [];
let failures = 0;
let cursor = 0;

const worker = async () => {
  while (true) {
    const index = cursor++;
    if (index >= total) return;
    const started = performance.now();
    try {
      const response = await fetch(`${baseUrl}/health`, { cache: 'no-store' });
      const body = await response.text();
      timings.push(performance.now() - started);
      if (!response.ok || !body.includes('"status":"ok"')) failures += 1;
    } catch {
      timings.push(performance.now() - started);
      failures += 1;
    }
  }
};

await Promise.all(Array.from({ length: concurrency }, () => worker()));
const sorted = [...timings].sort((a, b) => a - b);
const percentile = (p) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))];
const p95 = percentile(0.95);
const max = sorted.at(-1) || 0;

console.log(JSON.stringify({ total, concurrency, failures, p95_ms: Number(p95.toFixed(2)), max_ms: Number(max.toFixed(2)) }));
if (failures > 0) process.exit(1);
if (p95 > Number(process.env.LOAD_P95_MAX_MS || 1000)) process.exit(1);
