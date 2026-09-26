import type { Metadata } from "next";
import Hero from "@/components/home/Hero";
import HouseRules from "@/components/home/HouseRules";
import Atelier from "@/components/home/Atelier";
import Team from "@/components/home/Team";
import LashStyles from "@/components/home/LashStyles";
import MenuPreview from "@/components/home/MenuPreview";
import RedLight from "@/components/home/RedLight";
import Welcome from "@/components/home/Welcome";
import Visit from "@/components/home/Visit";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/**
 * An evening walk to the atelier's door: the night street (hero), the house
 * rules, what the atelier is, who works there, the lash styles, the menu board, the red light,
 * a welcome ticket, and finally the address. See docs/CREATIVE_DIRECTION.md.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <HouseRules />
      <Atelier />
      <Team />
      <LashStyles />
      <MenuPreview />
      <RedLight />
      <Welcome />
      <Visit />
    </>
  );
}
