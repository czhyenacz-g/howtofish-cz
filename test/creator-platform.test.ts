import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { getCreatorPlatforms, getCreatorPrimaryLink } from "../lib/creators/platform.ts";

describe("getCreatorPlatforms — odvozeno z existujících polí, žádná nová vymyšlená platforma", () => {
  test("z videos.platform", () => {
    assert.deepEqual(getCreatorPlatforms({ videos: [{ title: "t", subtitle: "s", platform: "youtube", url: "https://youtube.com/x" }] }), ["youtube"]);
  });

  test("z externalLink (Kick profil)", () => {
    assert.deepEqual(getCreatorPlatforms({ videos: [], externalLink: { label: "Profil na Kicku", href: "https://kick.com/anymall" } }), ["kick"]);
  });

  test("z externalLink (Twitch profil)", () => {
    assert.deepEqual(getCreatorPlatforms({ videos: [], externalLink: { label: "Otevřít Twitch profil", href: "https://www.twitch.tv/pixelorezlive" } }), ["twitch"]);
  });

  test("kombinace videos + externalLink na různých platformách, stabilní pořadí (twitch, youtube, kick)", () => {
    const result = getCreatorPlatforms({
      videos: [{ title: "t", subtitle: "s", platform: "kick", url: "https://kick.com/x/videos" }],
      externalLink: { label: "X", href: "https://www.twitch.tv/x" },
    });
    assert.deepEqual(result, ["twitch", "kick"]);
  });

  test("duplicitní platforma napříč více videi se nezdvojí", () => {
    const result = getCreatorPlatforms({
      videos: [
        { title: "a", subtitle: "a", platform: "kick", url: "https://kick.com/x/videos" },
        { title: "b", subtitle: "b", platform: "kick", url: "https://kick.com/x/clips" },
      ],
    });
    assert.deepEqual(result, ["kick"]);
  });

  test("žádné video ani externalLink -> prázdné pole, nespadne", () => {
    assert.deepEqual(getCreatorPlatforms({ videos: [] }), []);
  });
});

describe("getCreatorPrimaryLink — skutečný odkaz, nikdy vymyšlený", () => {
  test("preferuje externalLink (skutečný profil) před videem", () => {
    const link = getCreatorPrimaryLink({
      videos: [{ title: "t", subtitle: "s", platform: "youtube", url: "https://youtube.com/watch?v=x" }],
      externalLink: { label: "Profil", href: "https://kick.com/x" },
    });
    assert.deepEqual(link, { href: "https://kick.com/x", isProfile: true });
  });

  test("bez externalLink použije první video (isProfile: false, je to konkrétní video, ne profil)", () => {
    const link = getCreatorPrimaryLink({ videos: [{ title: "t", subtitle: "s", platform: "youtube", url: "https://youtube.com/watch?v=x" }] });
    assert.deepEqual(link, { href: "https://youtube.com/watch?v=x", isProfile: false });
  });

  test("bez videa i externalLink vrací undefined, nevymýšlí odkaz", () => {
    assert.equal(getCreatorPrimaryLink({ videos: [] }), undefined);
  });
});
