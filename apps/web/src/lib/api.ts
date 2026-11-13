export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public errores?: Record<string, string[]>,
  ) {
    super(message);
  }
}

/** Llama a la API (a través del rewrite /api/*) y lanza ApiError con el mensaje del backend. */
export async function api<T>(ruta: string, init?: RequestInit & { json?: unknown }): Promise<T> {
  const { json, ...resto } = init ?? {};
  const res = await fetch(`/api${ruta}`, {
    ...resto,
    method: resto.method ?? (json ? "POST" : "GET"),
    headers: json ? { "content-type": "application/json", ...resto.headers } : resto.headers,
    body: json ? JSON.stringify(json) : resto.body,
  });

  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(res.status, data.message ?? "Error inesperado", data.errores);
  }
  return data as T;
}
