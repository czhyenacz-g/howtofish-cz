import Link from "next/link";
import { COMMUNITY_CONTRIBUTIONS_ENABLED } from "../../config/features";

export default function AddCommunityRecordButton({ href, label }: { href: string; label: string }) {
  // Komunitní příspěvky jsou pozastavené (viz app/config/features.ts).
  if (!COMMUNITY_CONTRIBUTIONS_ENABLED) return null;

  return (
    <Link
      href={href}
      className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-md bg-amber-400 px-5 py-2.5 font-serif text-sm text-gray-900 transition hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
    >
      <span aria-hidden="true">+</span> {label}
    </Link>
  );
}
