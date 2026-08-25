import Image from "next/image";
import Link from "next/link";

// Zdroj: nahráno v redakčním systému (media-collections, složka
// "howtofish.cz") jako hotová horizontální menu verze hlavní herní
// identity — rybka na splávku, ostrov, palma, CZ cedulka s vlajkou.
// Originál 2172×724 px zmenšen na 900×300 (public/images/howtofish-header-logo.webp)
// a converted na WebP — pro header stačí zlomek původní velikosti.
export default function HeaderLogo({ basePath = "" }: { basePath?: string }) {
  return (
    <Link
      href={basePath || "/"}
      aria-label="How to Fish CZ — domů"
      className="flex shrink-0 items-center rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
    >
      <Image
        src="/images/howtofish-header-logo.webp"
        alt="How to Fish CZ"
        width={900}
        height={300}
        priority
        className="h-8 w-auto sm:h-9"
      />
    </Link>
  );
}
