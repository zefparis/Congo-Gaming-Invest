const API_BASE = '/api';

export interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  skipAuth?: boolean;
  authToken?: string | null;
  body?: unknown;
}

export async function apiRequest<TResponse = unknown>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<TResponse> {
  const { skipAuth, authToken, headers, body, ...rest } = options;

  const fetchHeaders = new Headers(headers ?? {});
  if (body && !fetchHeaders.has('Content-Type') && !(body instanceof FormData)) {
    fetchHeaders.set('Content-Type', 'application/json');
  }

  if (!skipAuth && authToken && !fetchHeaders.has('Authorization')) {
    fetchHeaders.set('Authorization', `Bearer ${authToken}`);
  }

  let bodyToSend: BodyInit | null | undefined;
  if (body instanceof FormData || typeof body === 'string' || body === undefined || body === null) {
    bodyToSend = body as BodyInit | null | undefined;
  } else {
    bodyToSend = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: fetchHeaders,
    body: bodyToSend,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new ApiError(response.status, text || response.statusText);
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  const contentType = response.headers.get('Content-Type') ?? '';
  if (contentType.includes('application/json')) {
    return (await response.json()) as TResponse;
  }

  return (await response.text()) as TResponse;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}
