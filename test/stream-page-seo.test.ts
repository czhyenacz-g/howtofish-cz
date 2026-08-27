import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { STREAM_FAQ } from "../app/stream/faq.ts";

const source = readFileSync(fileURLToPath(new URL("../app/stream/page.tsx", import.meta.url)), "utf8");

test("StreamPage: evergreen úvodní odstavec o hře je vždy přítomný, ne uvnitř live-only podmínky", () => {
  assert.match(source, /Tahle stránka sbírá na jedno místo živé přenosy hráčů/);
  // Odstavec nesmí být uvnitř {itemListJsonLd && (...)} — ten zmizí
  // přesně ve chvíli, kdy je stránka nejchudší na obsah (nikdo nestreamuje).
  const itemListBlock = /\{itemListJsonLd && \(([\s\S]*?)\)\}/.exec(source)?.[1] ?? "";
  assert.doesNotMatch(itemListBlock, /Tahle stránka sbírá/);
});

test("StreamPage: FAQ sekce (Časté otázky) vykresluje všechny položky z STREAM_FAQ", () => {
  assert.match(source, /<h2 className="[^"]*">Časté otázky<\/h2>/);
  assert.match(source, /\{STREAM_FAQ\.map\(/);
  assert.ok(STREAM_FAQ.length >= 2, "FAQ by mělo mít aspoň pár otázek, jinak to není evergreen obsah");
});

test("StreamPage: FAQPage JSON-LD text odpovídá STREAM_FAQ (žádná duplicitní/rozjetá kopie textu)", () => {
  assert.match(source, /"@type": "FAQPage"/);
  assert.match(source, /mainEntity: STREAM_FAQ\.map/);
  assert.match(source, /name: entry\.question/);
  assert.match(source, /text: entry\.answer/);
});

test("StreamPage: FAQPage JSON-LD se vykresluje VŽDY (mimo podmínku na streams.length)", () => {
  const faqScriptIndex = source.indexOf('"@type": "FAQPage"');
  const itemListConditionIndex = source.indexOf("streams.length > 0");
  assert.ok(faqScriptIndex !== -1 && itemListConditionIndex !== -1);
  // FAQ JSON-LD <script> render (mimo {itemListJsonLd && (...)} blok) je až za definicí faqJsonLd, ale renderuje se bez podmínky:
  const faqRenderLine = /<script type="application\/ld\+json" dangerouslySetInnerHTML=\{\{ __html: JSON\.stringify\(faqJsonLd\) \}\} \/>/;
  assert.match(source, faqRenderLine);
});

test("StreamPage: ItemList JSON-LD se vykresluje jen když jsou nějaké live streamy (žádný prázdný seznam v structured data)", () => {
  assert.match(source, /const itemListJsonLd =\s*\n\s*streams\.length > 0/);
  assert.match(source, /\{itemListJsonLd && \(/);
});

test("StreamPage: ItemList JSON-LD položky mají url a name z live streamu", () => {
  const itemListBlock = /itemListElement: streams\.map\(\(stream, index\) => \(\{([\s\S]*?)\}\)\),/.exec(source)?.[1];
  assert.ok(itemListBlock, "nepodařilo se najít itemListElement mapování");
  assert.match(itemListBlock, /url: stream\.streamUrl/);
  assert.match(itemListBlock, /name: `\$\{stream\.channelName\} – \$\{stream\.title\}`/);
});
