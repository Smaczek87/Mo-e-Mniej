# Zadanie: wdrożenie pakietu SEO/GEO na mozemniej.pl

Jesteś agentem odpowiedzialnym za stronę mozemniej.pl. Wdrażasz komplet zmian SEO/GEO przygotowany przez specjalistę GEO projektu. Pracuj samodzielnie od początku do końca, a na koniec oddaj raport w formacie z sekcji „Raport”.

## Kontekst

- mozemniej.pl to strona generująca leady na refinansowanie kredytu hipotecznego (stack: vinext – Vite + App Router w stylu Next.js; prawdopodobnie hosting Cloudflare).
- **Dziś strona jest zablokowana dla wyszukiwarek i asystentów AI:** w HTML są dwa tagi robots z `noindex` (jeden w surowym `<head>`: `noindex`, drugi z metadanych: `noindex, nofollow`). `/robots.txt`, `/sitemap.xml`, `/llms.txt` zwracają 404. Brak JSON-LD.
- Cel: odblokować indeksację, dodać pliki discovery, dane strukturalne, 6 nowych podstron i poprawki strony głównej – bez zmiany wyglądu marki, logiki formularza i zgód.

## Pakiet

Wszystkie pliki są w publicznym repozytorium GitHub, w folderze `geo/`:

```bash
git clone https://github.com/Smaczek87/Mo-e-Mniej.git /tmp/mozemniej-geo
ls /tmp/mozemniej-geo/geo
```

Przeczytaj `geo/README.md` w całości przed rozpoczęciem – to specyfikacja techniczna. Ten prompt mówi, co zrobić i w jakiej kolejności; README – jak.

## Zasady (obowiązkowe)

1. Zrób kopię zapasową / osobny branch przed zmianami. Każdy krok musi dać się cofnąć.
2. **Nie zmieniaj:** logiki formularza 4 pytań, treści i działania zgód (telefon, RODO), dialogu „Prywatność i pomiar”, istniejących stron prawnych (/regulamin, /polityka-prywatnosci, /polityka-cookies), numerów telefonów, kolorystyki i fontów.
3. Treści stron bierz **dosłownie** z `geo/content/*.md`. Nie przepisuj, nie skracaj, nie dodawaj obietnic ani liczb. Jeśli coś się nie mieści w layoucie – zgłoś w raporcie, nie redaguj.
4. Nowe podstrony mają wyglądać jak reszta serwisu (ten sam header, stopka, ciemny motyw, typografia). Tabele muszą być czytelne na telefonie (przewijanie poziome).
5. JSON-LD, treść i linki muszą być w HTML renderowanym na serwerze (widoczne w `curl`, nie tylko po załadowaniu JS).
6. Nie publikuj żadnych sekretów, kluczy ani zmiennych środowiskowych.

## Kroki

### Krok 1 – rozpoznanie (bez zmian)
Ustal i zanotuj do raportu: gdzie jest kod strony, jak wygląda struktura katalogów (`app/`, `src/`, `public/`), skąd pochodzą oba tagi `noindex`, jak przebiega build i deploy, gdzie jest hostowana strona i czy masz dostęp do panelu Cloudflare.

### Krok 2 – odblokowanie indeksacji
- Usuń **oba** źródła `noindex`/`nofollow` (wyszukaj w repo: `noindex`, `nofollow`, `robots`).
- Wstaw globalne metadane z `geo/snippets/layout-and-home.tsx` (sekcja 1): nowy title, description, robots index/follow, canonical, alternate `text/markdown`, OpenGraph.
- Jeśli istnieją `app/robots.ts` lub `app/sitemap.ts` – usuń je (zastępują je pliki statyczne).

### Krok 3 – warstwa treści i pliki discovery
- Skopiuj z `geo/` do projektu: `content/`, `scripts/build-content.mjs`, `src/seo/site.ts`, `src/seo/schema.ts`, `src/components/JsonLd.tsx`, `app/[slug]/page.tsx`, `public/robots.txt`, `public/data/model-oplacalnosci-refinansowania.csv`. Dopasuj alias importów `@/` do konfiguracji projektu.
- `npm i -D gray-matter marked` i dodaj do `package.json`: `"prebuild": "node scripts/build-content.mjs"`. Uruchom skrypt raz ręcznie – wygeneruje `src/content/pages.generated.ts`, `public/*.md`, `public/sitemap.md`, `public/sitemap.xml`, `public/llms.txt`.
- Jeśli trasa `app/[slug]/page.tsx` koliduje z istniejącymi trasami albo vinext obsługuje ją inaczej – zrób 6 osobnych tras korzystających z tych samych danych (`pageBySlug`). Wynik ma być ten sam: 6 podstron pod adresami ze slugów.
- Ustaw zmienną środowiskową produkcji `NEXT_PUBLIC_SHOW_EXPERT=1`.

### Krok 4 – strona główna
Wdroż zmiany z `geo/content/index.md` i sekcji 2 w `geo/snippets/layout-and-home.tsx`:
- dodaj `<HomeJsonLd />` (Organization, WebSite, Service, WebPage, FAQPage),
- pod H1 akapit „answer-first” (pierwszy pogrubiony akapit z `index.md`),
- w sekcji „Przenieść hipotekę czy zostać w banku?” – tekst z `index.md` (z linkiem do tabeli opłacalności),
- sekcja „Kto do Ciebie zadzwoni?”: widoczny jest tylko opis ogólny; **nazwisko eksperta i numery wpisów KNF wyłącznie w zwiniętym bloku `<details>`** z podpisem „Pokaż dane eksperta i wpis w rejestrze KNF” (domyślnie zwinięty, treść obecna w HTML z serwera). To warunek partnera – nie pokazuj tych danych na stronie głównej w inny sposób,
- FAQ: dodaj na początku 3 nowe pytania (opłacalność, koszt, czas trwania) z `index.md`; 8 dotychczasowych pytań zostaje bez zmian,
- blok „Poradnik refinansowania” z linkami do 5 stron poradnika,
- link „O nas” (`/o-nas`) w stopce,
- przycisk „Przejdź do 4 pytań” musi działać także jako kotwica `/#formularz` (linki z podstron prowadzą do formularza): dodaj `id="formularz"` przy formularzu/sekcji startowej i obsłuż wejście z hashem (otwarcie/przewinięcie do formularza),
- logo: `alt="Może Mniej"`.

### Krok 5 – nagłówki HTTP
- `*.md` → `Content-Type: text/markdown; charset=utf-8`
- `/llms.txt`, `/robots.txt` → `text/plain; charset=utf-8`; `*.csv` → `text/csv; charset=utf-8`
- Na Cloudflare użyj właściwego mechanizmu (np. plik `_headers` albo konfiguracja Workera). Nieistniejące adresy mają nadal zwracać 404.

### Krok 6 – Cloudflare (jeśli masz dostęp)
- *Security → Bots / AI Crawl Control*: crawlery wyszukiwarek i asystentów AI (OAI-SearchBot, ChatGPT-User, GPTBot, PerplexityBot, Perplexity-User, ClaudeBot, Claude-SearchBot, Claude-User, Google-Extended, Applebot, Bingbot) ustaw na **Allow**.
- Wyłącz „Managed robots.txt”, jeśli nadpisuje nasz `robots.txt`.
- Brak dostępu → zapisz w raporcie jako zadanie dla właściciela.

### Krok 7 – deploy i testy
Wdroż na produkcję i uruchom poniższe testy. Wklej do raportu pełny wynik:

```bash
curl -s https://mozemniej.pl/ | grep -io '<meta name="robots"[^>]*>'
curl -s -o /dev/null -w "robots %{http_code}\n" https://mozemniej.pl/robots.txt
curl -s -o /dev/null -w "sitemap %{http_code}\n" https://mozemniej.pl/sitemap.xml
curl -sI https://mozemniej.pl/llms.txt | grep -i -E "^HTTP|content-type"
curl -sI https://mozemniej.pl/refinansowanie-kredytu-hipotecznego.md | grep -i -E "^HTTP|content-type"
for s in refinansowanie-kredytu-hipotecznego kiedy-oplaca-sie-refinansowanie koszty-refinansowania-kredytu-hipotecznego refinansowanie-krok-po-kroku polstr-wibor-a-refinansowanie o-nas; do echo -n "$s "; curl -s -o /tmp/p.html -w "%{http_code} " https://mozemniej.pl/$s; grep -c 'application/ld+json' /tmp/p.html; done
curl -s https://mozemniej.pl/ | grep -c 'application/ld+json'
curl -s https://mozemniej.pl/ | grep -c '<details'
curl -s -o /dev/null -w "404test %{http_code}\n" https://mozemniej.pl/nie-istnieje-123
for ua in "OAI-SearchBot/1.0" "PerplexityBot/1.0" "ClaudeBot/1.0" "Googlebot/2.1"; do curl -s -A "$ua" -o /dev/null -w "$ua %{http_code}\n" https://mozemniej.pl/; done
```

Oczekiwane: robots `index, follow` (zero wystąpień `noindex`), wszystkie pliki i podstrony 200, każda podstrona ≥1 blok JSON-LD, strona główna ≥1 JSON-LD i ≥1 `<details>`, 404test = 404, wszystkie boty = 200.

Sprawdź też ręcznie: [Rich Results Test](https://search.google.com/test/rich-results) dla `/`, `/kiedy-oplaca-sie-refinansowanie`, `/o-nas` (zero błędów), widok mobilny podstron z tabelami, działanie formularza od początku do końca (bez wysyłania prawdziwego zgłoszenia, jeśli to możliwe), działanie linku `/#formularz` z podstrony.

## Raport

Oddaj raport w tym formacie:

1. **Rozpoznanie:** stack, struktura, hosting, źródła noindex, dostęp do Cloudflare (tak/nie).
2. **Zmiany:** lista zmienionych i dodanych plików.
3. **Odstępstwa od pakietu:** co i dlaczego zrobiłeś inaczej (np. osobne trasy zamiast `[slug]`).
4. **Wyniki testów:** pełny wynik komend z kroku 7 + wynik Rich Results Test.
5. **Niewykonane / do właściciela:** czego nie mogłeś zrobić i czego potrzebujesz.
6. **Commit/wersja wdrożona:** identyfikator deployu lub hash commita.
