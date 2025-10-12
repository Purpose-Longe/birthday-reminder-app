export async function fetchJson(input: RequestInfo, init?: RequestInit) {
  const res = await fetch(input, init);
  const contentType = res.headers.get('content-type') || '';

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`HTTP ${res.status} ${res.statusText}: ${body}`);
  }

  if (!contentType.includes('application/json')) {
    const body = await res.text();
    const start = body.trim().slice(0, 200);
    throw new Error(`Expected JSON but received content-type=${contentType}; body starts with: ${start}`);
  }

  return res.json();
}
