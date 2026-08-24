import Image from "next/image";
import FishSilhouette from "./FishSilhouette";

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
      className={`flex items-center justify-center bg-gradient-to-br from-[#0e4f66] via-[#146b78] to-[#1c8a95] shadow-[inset_0_0_30px_rgba(0,0,0,0.35)] ${className}`}
    >
      <FishSilhouette className="h-1/2 w-1/2 text-amber-300/70" />
    </div>
  );
}
