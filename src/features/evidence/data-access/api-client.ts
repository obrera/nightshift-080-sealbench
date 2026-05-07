export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
    ...init,
  })
  const payload = (await response.json()) as T

  if (!response.ok) {
    const message = getErrorMessage(payload)
    throw new Error(message)
  }

  return payload
}

function getErrorMessage(payload: unknown) {
  if (payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string') {
    return payload.error
  }
  if (payload && typeof payload === 'object' && 'blocker' in payload && typeof payload.blocker === 'string') {
    return payload.blocker
  }
  return 'Request failed'
}
