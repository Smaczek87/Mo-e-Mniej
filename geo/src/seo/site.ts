// Jedno źródło prawdy o encji "Może Mniej". Te same fakty muszą być identyczne
// na stronie, w JSON-LD, w llms.txt, w Google Business Profile, LinkedIn itd.
// Zmieniasz coś tutaj -> zmień też w profilach zewnętrznych.

export const SITE_URL = "https://mozemniej.pl";

export const ORG = {
  name: "Może Mniej",
  alternateName: ["MożeMniej", "mozemniej.pl"],
  slogan: "Nie obiecujemy. Sprawdzamy.",
  description:
    "Bezpłatny serwis, który pomaga sprawdzić, czy refinansowanie kredytu hipotecznego obniży koszty, i łączy z ekspertem kredytowym wpisanym do rejestru KNF.",
  legalName: "Sapphire media solutions Mateusz Szuta",
  taxID: "8411737367",
  address: {
    streetAddress: "ul. Sienkiewicza 6/30",
    postalCode: "84-300",
    addressLocality: "Lębork",
    addressCountry: "PL",
  },
  telephones: ["+48787464590", "+48600230878"],
  logo: `${SITE_URL}/apple-touch-icon.png`,
  image: `${SITE_URL}/og.png`,
  // UZUPEŁNIJ po założeniu profili (spójna nazwa, opis i NIP wszędzie):
  sameAs: [
    // "https://www.linkedin.com/company/mozemniej",
    // "https://www.facebook.com/mozemniej",
    // "https://www.youtube.com/@mozemniej",
    // "https://www.wikidata.org/wiki/Q…",
  ] as string[],
};

// WYMAGA ZGODY PARTNERA przed publikacją (nazwisko, wpisy KNF, nazwa NOTUS Finanse).
// Wpisy zweryfikowane w rejestrze KNF (rpkip.knf.gov.pl) 21.11.2026.
export const EXPERT = {
  name: "Mariusz Badowski",
  jobTitle: "Ekspert kredytowy – agent pośrednika kredytu hipotecznego",
  taxID: "5832596230",
  knfAgentId: "RHA0010209",
  knfConsumerCreditId: "RPK000490",
  principal: { name: "NOTUS Finanse S.A.", knfId: "RPH000030" },
  addressLocality: "Pruszcz Gdański",
  experience: "ponad 20 lat doświadczenia w kredytach hipotecznych",
  sameAs: [
    "https://rpkip.knf.gov.pl/",
    // "https://www.linkedin.com/in/…",
  ] as string[],
};

export const OPENING_HOURS = [
  { days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "08:00", closes: "20:00" },
  { days: ["Saturday", "Sunday"], opens: "10:00", closes: "18:00" },
];
