export type NavLink = { href: string; label: string; french?: string };

export const NAV_LINKS: NavLink[] = [
  { href: "/services", label: "The Menu", french: "La Carte" },
  { href: "/#atelier", label: "The Atelier", french: "L’Atelier" },
  { href: "/#about", label: "About", french: "L’Équipe" },
  { href: "/#lashes", label: "Lash Styles", french: "Les Cils" },
  { href: "/visit", label: "Visit", french: "Nous Trouver" },
];

export const LEGAL_LINKS: NavLink[] = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/accessibility", label: "Accessibility" },
];
