// Žádný tvůrce v datech zatím nemá skutečný avatar obrázek (viz zadání
// "nevymýšlej data") — místo fake fotky/ikony cizí osoby zobrazujeme
// stylizovaný iniciálový placeholder, barevně odvozený deterministicky
// ze jména (stejné jméno => stejná barva při každém vykreslení).
const GRADIENTS = [
  "from-[#1c8a95] to-[#0e4f66]",
  "from-[#e8583f] to-[#b8402c]",
  "from-[#e8cfa0] to-[#c9a466]",
  "from-[#6a8caf] to-[#2c4a63]",
  "from-[#7fae6f] to-[#3f6b34]",
];

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export default function CreatorAvatar({ name, size = "md" }: { name: string; size?: "md" | "lg" }) {
  const gradient = GRADIENTS[hashString(name) % GRADIENTS.length];
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  const sizeClass = size === "lg" ? "h-20 w-20 text-3xl sm:h-24 sm:w-24 sm:text-4xl" : "h-14 w-14 text-xl";

  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-serif font-bold text-white/90 shadow-inner ${gradient} ${sizeClass}`}
    >
      {initial}
    </span>
  );
}
