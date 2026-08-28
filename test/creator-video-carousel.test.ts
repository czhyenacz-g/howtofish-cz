import { test } from "node:test";
import assert from "node:assert/strict";
import { creatorVideos } from "../data/creator-videos.ts";
import { nextSlideIndex, prevSlideIndex } from "../app/components/creator-video-carousel-logic.ts";

test("creatorVideos: první slide je Agraelus", () => {
  assert.equal(creatorVideos[0]?.creator, "Agraelus");
});

test("creatorVideos: každý slide má creator/platform/title/subtitle/url/ctaLabel", () => {
  for (const slide of creatorVideos) {
    assert.ok(slide.creator, `${JSON.stringify(slide)} chybí creator`);
    assert.ok(slide.title, `${slide.creator} chybí title`);
    assert.ok(slide.subtitle, `${slide.creator} chybí subtitle`);
    assert.ok(slide.url, `${slide.creator} chybí url`);
    assert.ok(slide.ctaLabel, `${slide.creator} chybí ctaLabel`);
    assert.ok(slide.platform === "youtube" || slide.platform === "kick", `${slide.creator} má neplatnou platform`);
  }
});

test("creatorVideos: youtube slidy mají youtubeId, kick slidy míří na kick.com", () => {
  for (const slide of creatorVideos) {
    if (slide.platform === "youtube") {
      assert.ok(slide.youtubeId, `${slide.creator} (youtube) chybí youtubeId`);
      assert.ok(slide.url.includes(slide.youtubeId!), `${slide.creator}: url a youtubeId si neodpovídají`);
    } else {
      assert.ok(slide.url.startsWith("https://kick.com/"), `${slide.creator} (kick) nemá kick.com url`);
    }
  }
});

test("creatorVideos: žádný duplicitní tvůrce (dots musí mít unikátní klíč)", () => {
  const names = creatorVideos.map((slide) => slide.creator);
  assert.equal(new Set(names).size, names.length);
});

test("nextSlideIndex: postupuje o jednu vpřed", () => {
  assert.equal(nextSlideIndex(0, 5), 1);
  assert.equal(nextSlideIndex(3, 5), 4);
});

test("nextSlideIndex: z posledního slidu pokračuje prvním (wrap)", () => {
  assert.equal(nextSlideIndex(4, 5), 0);
});

test("prevSlideIndex: postupuje o jednu zpět", () => {
  assert.equal(prevSlideIndex(4, 5), 3);
  assert.equal(prevSlideIndex(1, 5), 0);
});

test("prevSlideIndex: z prvního slidu se vrátí na poslední (wrap)", () => {
  assert.equal(prevSlideIndex(0, 5), 4);
});

test("nextSlideIndex + prevSlideIndex: první -> previous -> poslední", () => {
  const length = creatorVideos.length;
  const afterPrev = prevSlideIndex(0, length);
  assert.equal(afterPrev, length - 1);
});

test("nextSlideIndex: poslední -> next -> první", () => {
  const length = creatorVideos.length;
  const afterNext = nextSlideIndex(length - 1, length);
  assert.equal(afterNext, 0);
});
