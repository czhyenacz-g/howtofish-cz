"use client";

import { useState } from "react";
import Image from "next/image";
import AchievementIcon from "../../components/icons/AchievementIcon";

// Steam ikony achievementů občas nejdou natáhnout (rozbitý/chybějící
// obrázek na jejich CDN) — next/image samo o sobě žádný fallback
// nenabízí, proto vlastní onError přepínající na šedý pohár místo
// prázdného/rozbitého políčka.
export default function AchievementIconImage({ src }: { src?: string }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <AchievementIcon className="h-7 w-7 text-gray-500" />;
  }

  return (
    <Image
      src={src}
      alt=""
      aria-hidden="true"
      width={56}
      height={56}
      className="h-full w-full object-cover"
      onError={() => setFailed(true)}
    />
  );
}
