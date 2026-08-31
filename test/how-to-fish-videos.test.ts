import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  getIndexableVideos,
  getVideoBySlug,
  getVideosAuthoredBy,
  getVideosFeaturingButNotAuthoredBy,
  getVideosForCreator,
  howToFishVideos,
} from "../data/how-to-fish-videos.ts";

const EXPECTED_VIDEO_IDS = ["ZPxf_8mB1Cc", "2qVTwWK67e4", "W5T_2NSfkZU", "fsoJWHp7CuU"];
const EXCLUDED_VIDEO_ID = "pexyrbH8KCM"; // Feed and Grow: Fish — jiná hra, viz report

describe("howToFishVideos", () => {
  test("obsahuje přesně 4 videa, žádné navíc", () => {
    assert.equal(howToFishVideos.length, 4);
  });

  test("FlyGun je autorem přesně 2 videí (ZPxf_8mB1Cc, W5T_2NSfkZU)", () => {
    const authored = getVideosAuthoredBy("flygun");
    assert.equal(authored.length, 2);
    assert.deepEqual(
      authored.map((v) => v.videoId).sort(),
      ["W5T_2NSfkZU", "ZPxf_8mB1Cc"]
    );
  });

  test("všechny video ID odpovídají zadaným URL", () => {
    const ids = howToFishVideos.map((v) => v.videoId).sort();
    assert.deepEqual(ids, [...EXPECTED_VIDEO_IDS].sort());
    for (const video of howToFishVideos) {
      assert.equal(video.url, `https://www.youtube.com/watch?v=${video.videoId}`);
    }
  });

  test("Feed and Grow: Fish video (pexyrbH8KCM) není zařazené — jiná hra", () => {
    assert.ok(!howToFishVideos.some((v) => v.videoId === EXCLUDED_VIDEO_ID));
  });

  test("2qVTwWK67e4 má autora Prezz (ne FlyGun) i přes to, že FlyGun je featured", () => {
    const video = howToFishVideos.find((v) => v.videoId === "2qVTwWK67e4");
    assert.equal(video?.author.name, "Prezz");
    assert.equal(video?.author.creatorSlug, undefined);
    assert.ok(video?.featuredCreatorSlugs.includes("flygun"));
  });

  test("fsoJWHp7CuU má autora Herdyn Archive (ne herdyn creatorSlug)", () => {
    const video = howToFishVideos.find((v) => v.videoId === "fsoJWHp7CuU");
    assert.equal(video?.author.name, "Herdyn Archive");
    assert.equal(video?.author.creatorSlug, undefined);
    assert.ok(video?.featuredCreatorSlugs.includes("herdyn"));
  });

  test("getVideosFeaturingButNotAuthoredBy(flygun) vrátí kompilaci od Prezz a archiv od Herdyn Archive", () => {
    const featured = getVideosFeaturingButNotAuthoredBy("flygun");
    assert.equal(featured.length, 2);
    assert.deepEqual(
      featured.map((v) => v.videoId).sort(),
      ["2qVTwWK67e4", "fsoJWHp7CuU"]
    );
  });

  test("getVideosForCreator(haiset) najde videa, kde je HaiseT jen featured (žádné vlastní video)", () => {
    assert.equal(getVideosAuthoredBy("haiset").length, 0);
    const featured = getVideosForCreator("haiset");
    assert.ok(featured.length > 0);
  });

  test("žádné video nemá vyplněné herní entity (fish/boss/location/item/guide) — nepodložené daty", () => {
    for (const video of howToFishVideos) {
      assert.equal(video.fishSlugs.length, 0);
      assert.equal(video.bossSlugs.length, 0);
      assert.equal(video.locationSlugs.length, 0);
      assert.equal(video.itemSlugs.length, 0);
      assert.equal(video.guideSlugs.length, 0);
    }
  });

  test("howToFishConfirmed je true jen pro videa, kde title/description hru explicitně jmenuje", () => {
    const confirmed = howToFishVideos.filter((v) => v.howToFishConfirmed).map((v) => v.videoId).sort();
    assert.deepEqual(confirmed, ["2qVTwWK67e4", "fsoJWHp7CuU"]);
  });

  test("všechna videa jsou aktuálně indexable", () => {
    assert.equal(getIndexableVideos().length, 4);
  });

  test("getVideoBySlug najde existující video a vrátí undefined pro neexistující slug", () => {
    const video = howToFishVideos[0];
    assert.equal(getVideoBySlug(video.slug)?.videoId, video.videoId);
    assert.equal(getVideoBySlug("neexistujici-slug"), undefined);
  });

  test("slugy jsou unikátní", () => {
    const slugs = howToFishVideos.map((v) => v.slug);
    assert.equal(new Set(slugs).size, slugs.length);
  });

  test("summary je vždy náš vlastní text, ne kopie YouTube popisu (neobsahuje syrové odkazy z popisu)", () => {
    for (const video of howToFishVideos) {
      assert.ok(video.summary.length > 50, `${video.slug}: summary je moc krátké`);
      assert.doesNotMatch(video.summary, /kick\.com|twitch\.tv|instagram\.com|youtu\.be/i);
    }
  });
});
