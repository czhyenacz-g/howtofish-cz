import Image from "next/image";

export default function FishImage({
  image,
  alt,
  className = "",
}: {
  image?: string;
  alt: string;
  className?: string;
}) {
  if (image) {
    return (
      <Image
        src={image}
        alt={alt}
        fill
        className={`object-cover ${className}`}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={alt}
      className={`flex items-center justify-center bg-gradient-to-br from-[#0e4f66] via-[#146b78] to-[#1c8a95] ${className}`}
    >
      <svg
        viewBox="0 0 48 32"
        className="h-1/2 w-1/2 text-amber-300/80"
        fill="currentColor"
        aria-hidden="true"
      >
        <polygon points="0,16 14,4 14,28" />
        <polygon points="14,4 40,10 40,22 14,28" />
        <circle cx="34" cy="13" r="2" fill="#0a2438" />
      </svg>
    </div>
  );
}
