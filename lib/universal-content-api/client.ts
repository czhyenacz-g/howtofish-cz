import "server-only";

// Server-only klient pro Universal Content API. Token se čte líné (ne
// na top-level modulu), aby chybějící env proměnná nikdy nerozbila
// build — jen běhový request selže kontrolovaně (viz UcaError).
const PROJECT_SLUG = "howtofish";
const DEFAULT_COLLECTION = "catches";

export class UcaError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "UcaError";
    this.status = status;
  }
}

function getConfig(): { baseUrl: string; token: string } {
  const baseUrl = process.env.UNIVERSAL_CONTENT_API_URL;
  const token = process.env.UNIVERSAL_CONTENT_API_TOKEN;

  if (!baseUrl || !token) {
    throw new UcaError("Universal Content API není nakonfigurované (chybí env proměnné).");
  }

  return { baseUrl: baseUrl.replace(/\/$/, ""), token };
}

async function withTimeout<T>(timeoutMs: number, run: (signal: AbortSignal) => Promise<T>): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await run(controller.signal);
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new UcaError("Universal Content API neodpovídá včas.");
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

async function parseErrorBody(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: { message?: string } };
    return body?.error?.message ?? `HTTP ${response.status}`;
  } catch {
    return `HTTP ${response.status}`;
  }
}

/** JSON request (create record, read) — no-store, volitelný Next cache revalidate pro čtení. */
export async function ucaJsonRequest<T>(
  path: string,
  init: { method: "GET" | "POST"; body?: unknown; timeoutMs: number; revalidateSeconds?: number }
): Promise<T> {
  const { baseUrl, token } = getConfig();

  return withTimeout(init.timeoutMs, async (signal) => {
    const response = await fetch(`${baseUrl}${path}`, {
      method: init.method,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        ...(init.body !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
      signal,
      ...(init.revalidateSeconds !== undefined
        ? { next: { revalidate: init.revalidateSeconds } }
        : { cache: "no-store" as const }),
    });

    if (!response.ok) {
      throw new UcaError(await parseErrorBody(response), response.status);
    }

    return (await response.json()) as T;
  });
}

/** Multipart upload (media) — vlastní Content-Type nastavuje fetch (boundary), nikdy ruční hlavička. */
export async function ucaUploadRequest<T>(
  path: string,
  formData: FormData,
  timeoutMs: number
): Promise<T> {
  const { baseUrl, token } = getConfig();

  return withTimeout(timeoutMs, async (signal) => {
    const response = await fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      body: formData,
      signal,
      cache: "no-store",
    });

    if (!response.ok) {
      throw new UcaError(await parseErrorBody(response), response.status);
    }

    return (await response.json()) as T;
  });
}

export function recordsPath(suffix = "", collection: string = DEFAULT_COLLECTION): string {
  return `/api/v1/projects/${PROJECT_SLUG}/collections/${collection}/records${suffix}`;
}

export function mediaPath(): string {
  return `/api/v1/projects/${PROJECT_SLUG}/media`;
}
