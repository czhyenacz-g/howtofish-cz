import "server-only";
import { ucaJsonRequest } from "./client.ts";

// Klient pro Content API AiGateway (viz docs/AI_GATEWAY.md v
// universal-content-api) — obecná AI execution vrstva, HowToFish je
// jen jeden z klientů. Tenhle modul zná jen HTTP kontrakt (create/get),
// žádnou rozhodovací logiku — ta je v evaluate-moderation-result.ts.

const CREATE_TIMEOUT_MS = 15_000;
const POLL_TIMEOUT_MS = 8_000;

export type AiRequestStatus = "queued" | "submitted" | "processing" | "completed" | "failed";

export type ModerationDecision = "approve" | "reject" | "review";

export type ModerationResult = {
  decision: ModerationDecision;
  confidence: number;
  reason: string;
} & Record<string, unknown>;

export type AiRequest = {
  id: number;
  operation: string;
  operation_version: number;
  status: AiRequestStatus;
  requested_at: string;
  completed_at: string | null;
  duration_ms: number | null;
  result: ModerationResult | null;
};

function aiRequestsPath(suffix = ""): string {
  return `/api/ai/requests${suffix}`;
}

/** Vytvoří AiGateway request pro moderaci uploadovaného úlovku. */
export async function createCatchModerationRequest(mediaId: number, fishSlug: string): Promise<AiRequest> {
  const response = await ucaJsonRequest<{ data: AiRequest }>(aiRequestsPath(), {
    method: "POST",
    body: {
      operation: "howtofish.moderate_upload",
      operation_version: 1,
      input: { media_ids: [mediaId], context: { fish_slug: fishSlug } },
    },
    timeoutMs: CREATE_TIMEOUT_MS,
  });
  return response.data;
}

export async function getAiRequest(id: number): Promise<AiRequest> {
  const response = await ucaJsonRequest<{ data: AiRequest }>(aiRequestsPath(`/${id}`), {
    method: "GET",
    timeoutMs: POLL_TIMEOUT_MS,
  });
  return response.data;
}
