// Trasa dla stron poradnika i "O nas" generowanych z content/*.md.
// Jeśli w projekcie istnieją już trasy /regulamin, /polityka-prywatnosci itp., mają one pierwszeństwo.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { pages, pageBySlug } from "@/content/pages.generated";
import { JsonLd } from "@/components/JsonLd";
import { SITE_URL } from "@/seo/site";
import { breadcrumb, expert, graph, organization, refinanceDataset, webPage, website } from "@/seo/schema";

export const dynamicParams = false;

export function generateStaticParams() {
  return pages.filter((p) => p.slug !== "/").map((p) => ({ slug: p.slug.slice(1) }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = pageBySlug("/" + slug);
  if (!p) return {};
  const url = SITE_URL + p.slug;
  return {
    title: p.title,
    description: p.description,
    alternates: { canonical: url, types: { "text/markdown": `${url}.md` } },
    robots: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large" },
    openGraph: { type: "article", url, title: p.title, description: p.description, locale: "pl_PL", siteName: "Może Mniej", images: [`${SITE_URL}/og.png`] },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = pageBySlug("/" + slug);
  if (!p) notFound();

  const showExpert = process.env.NEXT_PUBLIC_SHOW_EXPERT === "1";
  const nodes: object[] = [
    organization(),
    website(),
    webPage({ slug: p.slug, title: p.title, description: p.description, updated: p.updated, reviewed: p.reviewed && showExpert }),
    breadcrumb([
      { name: "Może Mniej", slug: "/" },
      ...(p.slug === "/o-nas" ? [] : [{ name: "Poradnik", slug: "/refinansowanie-kredytu-hipotecznego" }]),
      { name: p.title.split(" – ")[0], slug: p.slug },
    ]),
  ];
  // Person tylko po zgodzie partnera: ustaw NEXT_PUBLIC_SHOW_EXPERT=1
  if (showExpert) nodes.push(expert());
  if (p.slug === "/kiedy-oplaca-sie-refinansowanie") nodes.push(refinanceDataset());

  return (
    <main className="site-dark article-page">
      <JsonLd data={graph(...nodes)} />
      <article className="prose" dangerouslySetInnerHTML={{ __html: p.html }} />
      <p className="article-meta">
        Aktualizacja: <time dateTime={p.updated}>{p.updated}</time>
        {p.reviewedBy ? <> · Przegląd merytoryczny: {p.reviewedBy}</> : null}
      </p>
    </main>
  );
}
