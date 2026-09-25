import { siteConfig } from "@/config/site.config";
import { MENU, RED_LIGHT } from "@/data/services";
import type { Faq } from "@/data/faqs";

/**
 * Structured data, generated from the same data files the pages render —
 * so what search engines and answer engines read can never disagree with
 * what a visitor sees.
 */
export function businessSchema() {
  const { address, phone, url, social, hours } = siteConfig;
  const sameAs = Object.values(social).filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    "@id": `${url}/#business`,
    name: siteConfig.name,
    alternateName: "Lash L'Atelier (lah-tell-yay)",
    description: siteConfig.description,
    slogan: siteConfig.tagline,
    url,
    telephone: phone.e164,
    image: `${url}/brand/seal.webp`,
    logo: `${url}/brand/seal.webp`,
    priceRange: "$$",
    paymentAccepted: "Pay at time of service",
    address: {
      "@type": "PostalAddress",
      streetAddress: address.street,
      addressLocality: address.city,
      addressRegion: address.region,
      postalCode: address.postalCode,
      addressCountry: address.country,
    },
    areaServed: [
      { "@type": "City", name: "Hickory, Pennsylvania" },
      { "@type": "AdministrativeArea", name: "Washington County, Pennsylvania" },
    ],
    ...(sameAs.length ? { sameAs } : {}),
    ...(hours ? { openingHours: hours.map((h) => `${h.days} ${h.time}`) } : {}),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "La Carte — Service Menu",
      itemListElement: [
        ...MENU.map((category) => ({
          "@type": "OfferCatalog",
          name: category.title,
          itemListElement: category.services.map((service) => ({
            "@type": "Offer",
            itemOffered: { "@type": "Service", name: service.name.replace(/[“”]/g, "") },
            ...(service.price !== null ? { price: service.price, priceCurrency: "USD" } : {}),
          })),
        })),
        {
          "@type": "OfferCatalog",
          name: RED_LIGHT.title,
          itemListElement: [{ "@type": "Offer", itemOffered: { "@type": "Service", name: RED_LIGHT.title } }],
        },
      ],
    },
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteConfig.url}/#website`,
    name: siteConfig.name,
    url: siteConfig.url,
    publisher: { "@id": `${siteConfig.url}/#business` },
  };
}

export function faqSchema(faqs: Faq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function breadcrumbSchema(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Home", path: "/" }, ...trail].map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${siteConfig.url}${item.path}`,
    })),
  };
}
