export default function FishSilhouette({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 32"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <polygon points="0,16 14,4 14,28" />
      <polygon points="14,4 40,10 40,22 14,28" />
      <circle cx="34" cy="13" r="2" fill="#0a2438" />
    </svg>
  );
}
