const DEFAULT_BACKEND_URL = 'http://localhost:3001';
const DEFAULT_TIMEOUT_MS = Number(process.env.BACKEND_TIMEOUT_MS || 10000);

const backendBaseUrl = (process.env.TODO_APP_BACKEND_URL || DEFAULT_BACKEND_URL).replace(/\/$/, '');

async function requestJson(path, init) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(`${backendBaseUrl}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        'content-type': 'application/json',
        ...(init.headers || {}),
      },
    });

    let payload = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    if (!response.ok) {
      const message =
        payload && typeof payload === 'object' && 'error' in payload
          ? String(payload.error?.message || `Backend request failed with ${response.status}`)
          : `Backend request failed with ${response.status}`;

      throw new Error(message);
    }

    return payload;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Backend request timed out after ${DEFAULT_TIMEOUT_MS}ms.`);
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function executeSql(sql, params = []) {
  const payload = await requestJson('/api/admin/sql', {
    method: 'POST',
    body: JSON.stringify({ sql, params }),
  });

  if (!payload.ok) {
    throw new Error(payload.error?.message || 'SQL execution failed.');
  }

  return payload.result;
}

async function getSchema() {
  const payload = await requestJson('/api/admin/schema', {
    method: 'GET',
  });

  if (!payload.ok) {
    throw new Error(payload.error?.message || 'Schema query failed.');
  }

  return payload.schema;
}

export {
  executeSql,
  getSchema,
};
