// Čistá pomocná logika pro CreatorVideoCarousel.tsx — vytažená mimo
// "use client" komponentu, ať jde snadno unit-testovat bez DOM/timerů
// (viz test/creator-video-carousel.test.ts).
export function nextSlideIndex(current: number, length: number): number {
  if (length <= 0) return 0;
  return (current + 1) % length;
}

export function prevSlideIndex(current: number, length: number): number {
  if (length <= 0) return 0;
  return (current - 1 + length) % length;
}
