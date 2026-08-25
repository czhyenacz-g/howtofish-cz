import Link from "next/link";

// CTA karta na konci gridu /ryby — vede na formulář návrhu (ten sám
// řeší přihlášený/nepřihlášený stav), nikdy skutečný tvor.
export default function AddFishSuggestionCard() {
  return (
    <Link
      href="/ryby/navrhnout"
      className="flex min-h-[280px] flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-amber-400/50 bg-amber-400/5 p-6 text-center transition duration-150 hover:-translate-y-0.5 hover:border-amber-400 hover:bg-amber-400/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <span aria-hidden="true" className="font-serif text-4xl text-amber-300">
        ? +
      </span>
      <h2 className="mt-3 font-serif text-lg text-white">Chybí tu ryba?</h2>
      <p className="mt-1 text-sm text-cyan-100/70">
        Narazil jsi na rybu nebo tvora, kterého v encyklopedii ještě nemáme? Navrhni ho.
      </p>
      <span className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-md bg-amber-400 px-4 py-2 font-serif text-sm text-gray-900">
        Navrhnout nový úlovek
      </span>
    </Link>
  );
}
