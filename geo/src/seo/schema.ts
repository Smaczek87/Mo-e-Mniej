// Generatory JSON-LD (schema.org). Każdy blok opisuje wyłącznie to, co jest widoczne na stronie.
import { EXPERT, OPENING_HOURS, ORG, SITE_URL } from "./site";

const ORG_ID = `${SITE_URL}/#organization`;
const SITE_ID = `${SITE_URL}/#website`;
const EXPERT_ID = `${SITE_URL}/o-nas#ekspert`;

export function organization() {
  return {
    "@type": "Organization",
    "@id": ORG_ID,
    name: ORG.name,
    alternateName: ORG.alternateName,
    legalName: ORG.legalName,
    slogan: ORG.slogan,
    description: ORG.description,
    url: SITE_URL,
    logo: ORG.logo,
    image: ORG.image,
    taxID: ORG.taxID,
    address: { "@type": "PostalAddress", ...ORG.address },
    telephone: ORG.telephones[0],
    contactPoint: ORG.telephones.map((t) => ({
      "@type": "ContactPoint",
      telephone: t,
      contactType: "customer service",
      areaServed: "PL",
      availableLanguage: "pl",
      hoursAvailable: OPENING_HOURS.map((h) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: h.days,
        opens: h.opens,
        closes: h.closes,
      })),
    })),
    knowsAbout: [
      "refinansowanie kredytu hipotecznego",
      "przeniesienie kredytu hipotecznego do innego banku",
      "marża kredytu hipotecznego",
      "WIBOR",
      "POLSTR",
      "wcześniejsza spłata kredytu hipotecznego",
    ],
    ...(ORG.sameAs.length ? { sameAs: ORG.sameAs } : {}),
  };
}

export function website() {
  return {
    "@type": "WebSite",
    "@id": SITE_ID,
    url: SITE_URL,
    name: ORG.name,
    inLanguage: "pl-PL",
    publisher: { "@id": ORG_ID },
  };
}

// Publikować dopiero po zgodzie partnera.
export function expert() {
  return {
    "@type": "Person",
    "@id": EXPERT_ID,
    name: EXPERT.name,
    jobTitle: EXPERT.jobTitle,
    description: `${EXPERT.jobTitle}, ${EXPERT.experience}.`,
    address: { "@type": "PostalAddress", addressLocality: EXPERT.addressLocality, addressCountry: "PL" },
    identifier: [
      { "@type": "PropertyValue", propertyID: "Rejestr pośredników kredytowych KNF (RHA)", value: EXPERT.knfAgentId },
      { "@type": "PropertyValue", propertyID: "Rejestr pośredników kredytowych KNF (RPK)", value: EXPERT.knfConsumerCreditId },
      { "@type": "PropertyValue", propertyID: "NIP", value: EXPERT.taxID },
    ],
    affiliation: {
      "@type": "Organization",
      name: EXPERT.principal.name,
      identifier: { "@type": "PropertyValue", propertyID: "Rejestr pośredników kredytowych KNF (RPH)", value: EXPERT.principal.knfId },
    },
    knowsAbout: ["kredyt hipoteczny", "refinansowanie kredytu hipotecznego"],
    sameAs: EXPERT.sameAs,
  };
}

export function service() {
  return {
    "@type": "Service",
    "@id": `${SITE_URL}/#service`,
    name: "Bezpłatne sprawdzenie opłacalności refinansowania kredytu hipotecznego",
    serviceType: "Refinansowanie kredytu hipotecznego – wstępna analiza i kontakt z ekspertem kredytowym",
    provider: { "@id": ORG_ID },
    areaServed: { "@type": "Country", name: "Polska" },
    audience: { "@type": "Audience", audienceType: "Osoby spłacające kredyt hipoteczny" },
    offers: { "@type": "Offer", price: "0", priceCurrency: "PLN", description: "Formularz i rozmowa z ekspertem są bezpłatne" },
  };
}

export type PageMeta = {
  slug: string; // "/" lub "/refinansowanie-kredytu-hipotecznego"
  title: string;
  description: string;
  updated: string; // YYYY-MM-DD
  published?: string;
  reviewed?: boolean;
  faq?: { q: string; a: string }[];
  breadcrumb?: { name: string; slug: string }[];
};

export function webPage(p: PageMeta) {
  const url = SITE_URL + (p.slug === "/" ? "" : p.slug);
  return {
    "@type": p.slug === "/" ? "WebPage" : "Article",
    "@id": `${url}#page`,
    url,
    ...(p.slug === "/" ? { name: p.title } : { headline: p.title }),
    description: p.description,
    inLanguage: "pl-PL",
    isPartOf: { "@id": SITE_ID },
    dateModified: p.updated,
    ...(p.published ? { datePublished: p.published } : { datePublished: p.updated }),
    ...(p.slug === "/" ? { about: { "@id": `${SITE_URL}/#service` } } : { author: { "@id": ORG_ID }, publisher: { "@id": ORG_ID } }),
    ...(p.reviewed ? { reviewedBy: { "@id": EXPERT_ID } } : {}),
    image: ORG.image,
  };
}

export function faqPage(slug: string, faq: { q: string; a: string }[]) {
  return {
    "@type": "FAQPage",
    "@id": `${SITE_URL}${slug === "/" ? "" : slug}#faq`,
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function breadcrumb(items: { name: string; slug: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: SITE_URL + (it.slug === "/" ? "" : it.slug),
    })),
  };
}

export function refinanceDataset() {
  return {
    "@type": "Dataset",
    "@id": `${SITE_URL}/kiedy-oplaca-sie-refinansowanie#dataset`,
    name: "Model opłacalności refinansowania kredytu hipotecznego – Może Mniej",
    description:
      "160 scenariuszy refinansowania kredytu hipotecznego (4 salda × 4 okresy × 5 par marż × 2 warianty kosztów): rata przed i po, oszczędność miesięczna i całkowita, próg opłacalności w miesiącach. WIBOR 3M = 3,85%.",
    url: `${SITE_URL}/kiedy-oplaca-sie-refinansowanie`,
    creator: { "@id": ORG_ID },
    license: "https://creativecommons.org/licenses/by/4.0/",
    isAccessibleForFree: true,
    inLanguage: "pl-PL",
    dateModified: "2026-11-21",
    temporalCoverage: "2026-11",
    spatialCoverage: "Polska",
    variableMeasured: ["saldo", "okres do końca spłaty", "marża", "rata", "oszczędność", "próg opłacalności"],
    distribution: {
      "@type": "DataDownload",
      encodingFormat: "text/csv",
      contentUrl: `${SITE_URL}/data/model-oplacalnosci-refinansowania.csv`,
    },
  };
}

export function graph(...nodes: object[]) {
  return { "@context": "https://schema.org", "@graph": nodes };
}
