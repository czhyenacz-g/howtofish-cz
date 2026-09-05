import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { getCreatorImageChain, GENERIC_FALLBACK_IMAGE } from "../lib/creators/creator-image.ts";
import { getCreatorProfile } from "../data/creators.ts";

function creator(slug: string) {
  const c = getCreatorProfile(slug);
  if (!c) throw new Error(`fixture creator "${slug}" nenalezen v data/creators.ts`);
  return c;
}

describe("getCreatorImageChain — pořadí priorit (video -> avatar -> fallback -> initial)", () => {
  test("HouseBox: nejnovější AUTHORED + howToFishConfirmed video z how-to-fish-videos.ts (ne starší creator-videos.ts youtubeId)", () => {
    const chain = getCreatorImageChain(creator("housebox"));
    assert.equal(chain[0].type, "video");
    assert.equal(chain[0].type === "video" && chain[0].src, "https://i.ytimg.com/vi/OIwQMgWXPEo/maxresdefault.jpg");
    assert.equal(chain[0].type === "video" && chain[0].alt, "HouseBox hraje How to Fish");
  });

  test("Agraelus: bez authored+confirmed videa v how-to-fish-videos.ts spadá na creator-videos.ts youtubeId (hqdefault)", () => {
    const chain = getCreatorImageChain(creator("agraelus"));
    assert.equal(chain[0].type, "video");
    assert.equal(chain[0].type === "video" && chain[0].src, "https://i.ytimg.com/vi/AXKRnUOtGHg/hqdefault.jpg");
  });

  test("Herdyn: creator-videos.ts youtubeId (žádný authored+confirmed záznam v how-to-fish-videos.ts)", () => {
    const chain = getCreatorImageChain(creator("herdyn"));
    assert.equal(chain[0].type, "video");
    assert.equal(chain[0].type === "video" && chain[0].src, "https://i.ytimg.com/vi/r8shrFmL6QY/hqdefault.jpg");
  });

  test("FlyGun: žádné video (jen Kick), první kandidát je avatar (Kick logo z creator-videos.ts)", () => {
    const chain = getCreatorImageChain(creator("flygun"));
    assert.equal(chain[0].type, "avatar");
    assert.equal(chain[0].type === "avatar" && chain[0].src, "https://content-api.darbujan.com/media/43");
    assert.match(chain[0].type === "avatar" ? chain[0].alt : "", /Profilový obrázek streamera FlyGun/);
  });

  test("astatoro: ani video ani avatar (Kick bez loga) -> první kandidát je generický fallback", () => {
    const chain = getCreatorImageChain(creator("astatoro"));
    assert.equal(chain[0].type, "fallback");
    assert.equal(chain[0].type === "fallback" && chain[0].src, GENERIC_FALLBACK_IMAGE);
  });

  test("HaiseT (cautiousProfile, žádná videa vůbec) -> generický fallback", () => {
    const chain = getCreatorImageChain(creator("haiset"));
    assert.equal(chain[0].type, "fallback");
  });

  test("řetězec vždy končí 'initial' bez src — garantovaný konec, žádná nekonečná fallback smyčka", () => {
    for (const slug of ["housebox", "agraelus", "herdyn", "flygun", "astatoro", "haiset"]) {
      const chain = getCreatorImageChain(creator(slug));
      const last = chain[chain.length - 1];
      assert.equal(last.type, "initial");
      assert.ok(!("src" in last));
    }
  });

  test("video alt text tvrdí jen to, co je ověřené — nikdy pro nepotvrzené (howToFishConfirmed: false) video", () => {
    // FlyGun má v how-to-fish-videos.ts authored video s howToFishConfirmed: false
    // ("flygun-rybareni-zabavny") — to se NESMÍ použít jako video-tier kandidát.
    const chain = getCreatorImageChain(creator("flygun"));
    assert.notEqual(chain[0].type, "video");
  });
});
