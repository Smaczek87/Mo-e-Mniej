// ===== 1) app/layout.tsx – metadane globalne (ZASTĄP obecne robots noindex) =====
import type { Metadata } from "next";
export const metadata: Metadata = {
  metadataBase: new URL("https://mozemniej.pl"),
  title: {
    default: "Refinansowanie kredytu hipotecznego – sprawdź, czy warto zmienić bank | Może Mniej",
    template: "%s | Może Mniej",
  },
  description:
    "Spłacasz kredyt hipoteczny? Sprawdź bezpłatnie, czy refinansowanie obniży Twoje koszty. 4 pytania, bez dokumentów i BIK, potem rozmowa z ekspertem wpisanym do rejestru KNF.",
  // KLUCZOWE: usunąć 'noindex, nofollow'. Obecnie w HTML są DWA tagi robots – oba muszą zniknąć.
  robots: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large", "max-video-preview": -1 },
  alternates: { canonical: "/", types: { "text/markdown": "https://mozemniej.pl/index.md" } },
  openGraph: { siteName: "Może Mniej", locale: "pl_PL", type: "website", images: ["/og.png"] },
  // Po weryfikacji w narzędziach:
  // verification: { google: "…", other: { "msvalidate.01": "…" } },
};
// Uwaga: <meta name="referrer" content="no-referrer"> można zostawić, ale rozważ "strict-origin-when-cross-origin",
// żeby źródła cytujące (np. portale) widziały ruch z mozemniej.pl – nie wpływa na indeksację.

// ===== 2) app/page.tsx (strona główna) – JSON-LD + treść =====
import { JsonLd } from "@/components/JsonLd";
import { pageBySlug } from "@/content/pages.generated";
import { faqPage, graph, organization, service, webPage, website } from "@/seo/schema";

export function HomeJsonLd() {
  const home = pageBySlug("/")!;
  return (
    <JsonLd
      data={graph(
        organization(),
        website(),
        service(),
        webPage({ slug: "/", title: home.title, description: home.description, updated: home.updated }),
        faqPage("/", home.faq as { q: string; a: string }[]) // FAQ musi być widoczne na stronie 1:1
      )}
    />
  );
}
// W <main> strony głównej:
//  - wstaw <HomeJsonLd />
//  - pod H1 zamień lead na akapit "answer-first" z content/index.md (pierwszy pogrubiony akapit),
//  - dodaj sekcję "Kto do Ciebie zadzwoni?" z wpisem KNF (po zgodzie partnera),
//  - rozszerz FAQ o 3 nowe pytania (opłacalność, koszt, czas) – treść w content/index.md,
//  - dodaj blok "Poradnik refinansowania" z linkami do 5 stron poradnika,
//  - w stopce dodaj link "O nas" (/o-nas),
//  - przycisk "Przejdź do 4 pytań" powinien mieć też kotwicę href="#formularz" (dziś to <button> bez href,
//    linki z poradnika /#formularz muszą trafiać do formularza),
//  - nadaj obrazkom postaci sensowny alt lub zostaw alt="" (dekoracyjne – OK), logo: alt="Może Mniej".
