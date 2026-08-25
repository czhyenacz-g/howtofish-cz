export default function SteamIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.95 2 2.83 5.84 2.28 10.77l5.4 2.24a2.86 2.86 0 0 1 1.63-.5c.15 0 .3.01.44.03l2.4-3.5v-.05a3.6 3.6 0 1 1 3.6 3.6h-.08l-3.44 2.46c0 .12.02.25.02.38a2.87 2.87 0 1 1-5.63-.77l-3.86-1.6A10 10 0 1 0 12 2z" />
      <circle cx="8.5" cy="16.5" r="1.7" />
      <path d="M17.5 6.9a2.4 2.4 0 1 0 0 4.8 2.4 2.4 0 0 0 0-4.8zm0 3.9a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
    </svg>
  );
}
