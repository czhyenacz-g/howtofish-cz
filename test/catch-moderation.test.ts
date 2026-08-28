import { test } from "node:test";
import assert from "node:assert/strict";

process.env.UNIVERSAL_CONTENT_API_URL = "https://content-api.example.test";
process.env.UNIVERSAL_CONTENT_API_TOKEN = "uca_test_token_not_real";

const { runCatchModeration } = await import("../app/ryby/[slug]/moderate-catch-upload.ts");

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

function withMockedFetch<T>(impl: typeof fetch, run: () => Promise<T>): Promise<T> {
  const original = globalThis.fetch;
  // @ts-expect-error test mock
  globalThis.fetch = impl;
  return run().finally(() => {
    globalThis.fetch = original;
  });
}

const noopSleep = async () => {};

function aiRequest(status: string, result: unknown = null) {
  return {
    id: 1,
    operation: "howtofish.moderate_upload",
    operation_version: 1,
    status,
    requested_at: "2026-08-28T10:00:00+00:00",
    completed_at: status === "completed" || status === "failed" ? "2026-08-28T10:00:07+00:00" : null,
    duration_ms: status === "completed" ? 7000 : null,
    result,
  };
}

test("runCatchModeration: approve s vysokou confidence schválí record", async () => {
  const calls: { method: string; url: string }[] = [];

  await withMockedFetch(
    async (url, init) => {
      const method = (init?.method ?? "GET") as string;
      calls.push({ method, url: String(url) });

      if (method === "POST" && String(url).includes("/api/ai/requests")) {
        return jsonResponse(201, { data: aiRequest("completed", { decision: "approve", confidence: 0.97, reason: "ok" }) });
      }
      if (method === "PATCH") {
        return jsonResponse(200, { data: { id: 42, status: "approved", data: {}, media: [], created_at: "", updated_at: "" } });
      }
      throw new Error(`unexpected fetch: ${method} ${url}`);
    },
    () => runCatchModeration(42, 159, "spider-crab", noopSleep)
  );

  const patchCall = calls.find((c) => c.method === "PATCH");
  assert.ok(patchCall, "PATCH na status update se mělo zavolat");
  assert.match(patchCall!.url, /\/records\/42$/);
});

test("runCatchModeration: reject zamítne record", async () => {
  let patchBody: unknown = null;

  await withMockedFetch(
    async (url, init) => {
      const method = (init?.method ?? "GET") as string;
      if (method === "POST" && String(url).includes("/api/ai/requests")) {
        return jsonResponse(201, { data: aiRequest("completed", { decision: "reject", confidence: 0.95, reason: "nevhodné" }) });
      }
      if (method === "PATCH") {
        patchBody = JSON.parse(String(init?.body));
        return jsonResponse(200, { data: { id: 42, status: "rejected", data: {}, media: [], created_at: "", updated_at: "" } });
      }
      throw new Error(`unexpected fetch: ${method} ${url}`);
    },
    () => runCatchModeration(42, 159, "spider-crab", noopSleep)
  );

  assert.deepEqual(patchBody, { status: "rejected" });
});

test("runCatchModeration: review nechává record pending (žádný PATCH)", async () => {
  let patchCalled = false;

  await withMockedFetch(
    async (url, init) => {
      const method = (init?.method ?? "GET") as string;
      if (method === "POST" && String(url).includes("/api/ai/requests")) {
        return jsonResponse(201, { data: aiRequest("completed", { decision: "review", confidence: 0.4, reason: "nejasné" }) });
      }
      if (method === "PATCH") {
        patchCalled = true;
        return jsonResponse(200, { data: {} });
      }
      throw new Error(`unexpected fetch: ${method} ${url}`);
    },
    () => runCatchModeration(42, 159, "spider-crab", noopSleep)
  );

  assert.equal(patchCalled, false);
});

test("runCatchModeration: AiGateway failure nechává record pending (žádný PATCH)", async () => {
  let patchCalled = false;

  await withMockedFetch(
    async (url, init) => {
      const method = (init?.method ?? "GET") as string;
      if (method === "POST" && String(url).includes("/api/ai/requests")) {
        return jsonResponse(201, { data: aiRequest("failed", null) });
      }
      if (method === "PATCH") {
        patchCalled = true;
        return jsonResponse(200, { data: {} });
      }
      throw new Error(`unexpected fetch: ${method} ${url}`);
    },
    () => runCatchModeration(42, 159, "spider-crab", noopSleep)
  );

  assert.equal(patchCalled, false);
});

test("runCatchModeration: request zůstane nedokončený i po vyčerpání pollů -> žádný PATCH", async () => {
  let patchCalled = false;

  await withMockedFetch(
    async (url, init) => {
      const method = (init?.method ?? "GET") as string;
      // Pořád "processing", nikdy nedoběhne v rámci bounded pollu.
      if (method === "POST" && String(url).includes("/api/ai/requests")) {
        return jsonResponse(201, { data: aiRequest("processing") });
      }
      if (method === "GET") {
        return jsonResponse(200, { data: aiRequest("processing") });
      }
      if (method === "PATCH") {
        patchCalled = true;
        return jsonResponse(200, { data: {} });
      }
      throw new Error(`unexpected fetch: ${method} ${url}`);
    },
    () => runCatchModeration(42, 159, "spider-crab", noopSleep)
  );

  assert.equal(patchCalled, false);
});

test("runCatchModeration: síťová chyba při vytvoření requestu se bezpečně zaloguje a nic nespadne", async () => {
  await assert.doesNotReject(
    withMockedFetch(
      async () => {
        throw new Error("network down");
      },
      () => runCatchModeration(42, 159, "spider-crab", noopSleep)
    )
  );
});
