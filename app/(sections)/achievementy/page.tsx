import type { Metadata } from "next";
import SectionPlaceholder from "../../components/SectionPlaceholder";

export const metadata: Metadata = {
  title: "Achievementy",
  description: "Seznam achievementů v How to Fish a jak je splnit.",
};

export default function AchievementyPage() {
  return (
    <SectionPlaceholder title="Achievementy">
      <p>
        Tady bude seznam achievementů v How to Fish a návody, jak je
        splnit — od jednoduchých po ty nejtěžší.
      </p>
      <p>Seznam achievementů zatím sestavujeme.</p>
    </SectionPlaceholder>
  );
}
