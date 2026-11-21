# Może Mniej – pakiet wdrożeniowy SEO/GEO

Pakiet dla dewelopera mozemniej.pl (stack: vinext – Vite + App Router w stylu Next.js). Gotowy do skopiowania do repozytorium. Kolejność kroków ma znaczenie.

## 0. BLOKER – zdjąć noindex (dzień 0)

Na produkcji strona ma **dwa** tagi robots: `<meta name="robots" content="noindex">` w surowym HTML oraz `noindex, nofollow` dodawany przez metadane. Dopóki są, Google, Bing (a przez Binga ChatGPT Search i Copilot), Perplexity i Gemini nie pokażą strony.

- Usuń oba źródła `noindex` (szukaj w repo: `noindex`, `robots:`).
- Wstaw metadane z `snippets/layout-and-home.tsx` (sekcja 1).
- **Cloudflare:** jeśli serwis stoi na Cloudflare (vinext domyślnie celuje w Workers), w panelu domeny sprawdź *Security → Bots → AI Crawl Control / Block AI bots* oraz *Managed robots.txt*. Ustaw „Allow” dla crawlerów wyszukiwarek AI (OAI-SearchBot, ChatGPT-User, PerplexityBot, Claude-SearchBot itd.). Zarządzany robots.txt Cloudflare może nadpisać nasz plik.

## 1. Pliki statyczne → `public/`

| Plik | Cel |
|---|---|
| `public/robots.txt` | Zezwala wyszukiwarkom i asystentom AI, wskazuje sitemap. **Usuń `app/robots.ts`, jeśli istnieje.** |
| `public/sitemap.xml` | Generowany przez skrypt. **Usuń `app/sitemap.ts`, jeśli istnieje.** |
| `public/llms.txt` | Przewodnik dla LLM (zwalidowany: PASS). |
| `public/sitemap.md` | Mapa treści w Markdown. |
| `public/*.md` | Wersje Markdown każdej strony (`/index.md`, `/o-nas.md`, …). |
| `public/data/model-oplacalnosci-refinansowania.csv` | Oryginalny zbiór danych (160 scenariuszy) – zasób do cytowania. |

## 2. Treści i trasa

1. Skopiuj `content/` (źródło prawdy treści, Markdown z frontmatter) i `scripts/build-content.mjs`.
2. `npm i -D gray-matter marked`, w `package.json`: `"prebuild": "node scripts/build-content.mjs"`.
3. Skrypt generuje `src/content/pages.generated.ts`, mirrory `.md`, `sitemap.md`, `sitemap.xml`, `llms.txt`. Edytujesz tylko `content/*.md` – reszta odświeża się przy buildzie (HTML i Markdown zawsze z tej samej rewizji).
4. Skopiuj `src/seo/site.ts`, `src/seo/schema.ts`, `src/components/JsonLd.tsx`, `app/[slug]/page.tsx`. Alias `@/` → `src/` (dostosuj, jeśli projekt używa innego).
5. Strona główna: wdroż zmiany z `snippets/layout-and-home.tsx` (sekcja 2) i treści z `content/index.md` (akapit answer-first, „Kto do Ciebie zadzwoni?”, 3 nowe FAQ, blok poradnika, link „O nas”, kotwica `#formularz`).
6. Style: klasy `.article-page`, `.prose`, `.article-meta` – dopasuj do obecnego designu (tabele muszą być czytelne na mobile: `overflow-x:auto`).

## 3. Nagłówki HTTP

- `*.md` → `Content-Type: text/markdown; charset=utf-8`
- `llms.txt`, `robots.txt` → `text/plain; charset=utf-8`; `*.csv` → `text/csv; charset=utf-8`
- Opcjonalnie dla stron HTML: `Link: <https://mozemniej.pl/<slug>.md>; rel="alternate"; type="text/markdown"` (metadane już dodają `<link rel="alternate" type="text/markdown">`).
- Strony nieistniejące muszą zwracać 404 (dziś tak jest – zachować).

## 4. Dane eksperta – zgoda jest, z warunkiem

Partner zgodził się na publikację danych (nazwisko, wpisy KNF, NOTUS Finanse S.A.) **pod warunkiem, że nie są widoczne od razu na stronie głównej**:

- Strona główna: sekcja „Kto do Ciebie zadzwoni?” pokazuje tylko opis ogólny; nazwisko i numery wpisów są w zwiniętym bloku `<details>` („Pokaż dane eksperta i wpis w rejestrze KNF”). Treść bloku ma być w HTML renderowanym na serwerze (zwinięta wizualnie, ale obecna w źródle strony).
- Podstrony (/o-nas, poradnik): dane mogą być widoczne – to „wejście w podstronę”.
- Ustaw zmienną środowiskową `NEXT_PUBLIC_SHOW_EXPERT=1` (włącza Person + reviewedBy w JSON-LD podstron). Na stronie głównej nie dodajemy JSON-LD Person.

## 5. Testy akceptacyjne po wdrożeniu

```bash
curl -s https://mozemniej.pl/ | grep -i 'name="robots"'          # oczekiwane: index, follow (brak noindex)
curl -sI https://mozemniej.pl/robots.txt | head -1               # 200
curl -s https://mozemniej.pl/robots.txt | grep Sitemap
curl -sI https://mozemniej.pl/sitemap.xml | head -1              # 200
curl -sI https://mozemniej.pl/llms.txt | grep -i content-type    # text/plain
curl -sI https://mozemniej.pl/refinansowanie-kredytu-hipotecznego.md | grep -i content-type  # text/markdown
curl -s https://mozemniej.pl/refinansowanie-kredytu-hipotecznego | grep -c 'application/ld+json'  # >=1
curl -sA "OAI-SearchBot/1.0" -o /dev/null -w "%{http_code}\n" https://mozemniej.pl/   # 200 (nie 403)
curl -sA "PerplexityBot/1.0" -o /dev/null -w "%{http_code}\n" https://mozemniej.pl/   # 200
```

Następnie: Rich Results Test i validator.schema.org dla `/`, `/kiedy-oplaca-sie-refinansowanie`, `/o-nas`.

## 6. Po wdrożeniu (marketing)

- Google Search Console + Bing Webmaster Tools: weryfikacja, zgłoszenie `sitemap.xml`, inspekcja URL dla 7 stron.
- IndexNow (Bing/Copilot, Yandex): wygeneruj klucz w Bing Webmaster Tools, umieść plik klucza w `public/`, pinguj przy każdej zmianie treści.
- Plan działań off-site i monitoringu: patrz dokument strategii GEO.

## Struktura pakietu

```
content/                  źródło treści (7 stron)
scripts/build-content.mjs generator warstwy treści i plików discovery
src/seo/site.ts           fakty o encji (jedno źródło prawdy)
src/seo/schema.ts         JSON-LD: Organization, WebSite, Service, Person, Article, FAQPage, BreadcrumbList, Dataset
src/components/JsonLd.tsx
app/[slug]/page.tsx       trasa stron poradnika
snippets/                 zmiany w layout i stronie głównej
public/                   robots.txt, sitemap.xml, sitemap.md, llms.txt, *.md, data/*.csv
```
