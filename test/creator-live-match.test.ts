import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { findLiveStreamForCreator } from "../lib/creators/live-match.ts";
import type { LiveStream } from "../lib/streams/types.ts";

function stream(overrides: Partial<LiveStream> = {}): LiveStream {
  return { id: "1", platform: "twitch", channelName: "Agraelus", channelUrl: "https://twitch.tv/agraelus", title: "How to Fish", streamUrl: "https://twitch.tv/agraelus", ...overrides };
}

describe("findLiveStreamForCreator — heuristika jméno-kanálu (providery nemají pevný seznam sledovaných kanálů)", () => {
  test("přesná shoda jména", () => {
    const streams = [stream({ channelName: "Agraelus" })];
    assert.equal(findLiveStreamForCreator("Agraelus", streams)?.channelName, "Agraelus");
  });

  test("case-insensitive shoda", () => {
    const streams = [stream({ channelName: "AGRAELUS" })];
    assert.ok(findLiveStreamForCreator("agraelus", streams));
  });

  test("diakritika se ignoruje", () => {
    const streams = [stream({ channelName: "Agraëlus" })];
    assert.ok(findLiveStreamForCreator("Agraelus", streams));
  });

  test("okrajové mezery se ignorují", () => {
    const streams = [stream({ channelName: " Agraelus " })];
    assert.ok(findLiveStreamForCreator("Agraelus", streams));
  });

  test("žádná shoda -> undefined, nespadne", () => {
    const streams = [stream({ channelName: "NěkdoJiný" })];
    assert.equal(findLiveStreamForCreator("Agraelus", streams), undefined);
  });

  test("prázdný seznam streamů -> undefined", () => {
    assert.equal(findLiveStreamForCreator("Agraelus", []), undefined);
  });

  test("částečná shoda (jiný streamer se jménem obsahujícím podřetězec) se NEPOČÍTÁ — jen celé jméno", () => {
    const streams = [stream({ channelName: "Agraelus2" })];
    assert.equal(findLiveStreamForCreator("Agraelus", streams), undefined);
  });
});
