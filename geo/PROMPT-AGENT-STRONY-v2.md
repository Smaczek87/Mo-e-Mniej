# Zadanie v2: poprawki po wdrożeniu SEO/GEO (v49 → v50)

Kontynuacja wdrożenia z raportu z 22.11.2026 (v49, commit 10821e5). Specjalista GEO zweryfikował produkcję: wdrożenie działa. Poniżej cztery drobne poprawki z Twojego raportu i z weryfikacji. Zakres jest wąski – nie zmieniaj niczego poza wymienionym.

## Źródło zmian

```bash
cd /tmp/mozemniej-geo && git pull   # albo: git clone https://github.com/Smaczek87/Mo-e-Mniej.git /tmp/mozemniej-geo
git -C /tmp/mozemniej-geo log --oneline -3
git -C /tmp/mozemniej-geo diff 9b396e1 HEAD -- geo/
```

Diff od commita `9b396e1` pokazuje dokładnie, co się zmieniło w pakiecie. Przenieś te zmiany do odpowiedników w kodzie strony (pamiętaj o swoich adaptacjach z v49).

## Poprawki

1. **Daty w JSON-LD ze strefą czasową** (uwaga Google Rich Results Test). W `src/seo/schema.ts` dodano funkcję `isoDate()`; `dateModified` i `datePublished` w `webPage()` oraz `dateModified` w `refinanceDataset()` mają format `2026-11-21T08:00:00+01:00`. Przenieś tę zmianę wszędzie, gdzie generujesz te pola (strona główna i podstrony).

2. **sitemap.xml bez stron z noindex.** Trzy strony prawne (/regulamin, /polityka-prywatnosci, /polityka-cookies) mają na produkcji `noindex`, więc nie mogą być w mapie XML. W `scripts/build-content.mjs` usunięto je z `sitemap.xml` (zostają tylko w sekcji „Optional” w `llms.txt`). Po zmianie `sitemap.xml` ma mieć **7** adresów.

3. **Canonical strony głównej ze slashem.** Ustaw `https://mozemniej.pl/` (dziś `https://mozemniej.pl`), żeby był identyczny z adresem w `sitemap.xml` i `og:url`. Zmień też `og:url` na `https://mozemniej.pl/`, jeśli jest bez slasha.

4. **Plik klucza IndexNow.** Skopiuj `geo/public/eb08c7fade0d0a4ad31ac01165954e8a.txt` do `public/`. Ma być dostępny pod `https://mozemniej.pl/eb08c7fade0d0a4ad31ac01165954e8a.txt`, zwracać 200 i zawierać dokładnie `eb08c7fade0d0a4ad31ac01165954e8a`. Klucz jest jawny z założenia (protokół IndexNow).

5. Uruchom ponownie `node scripts/build-content.mjs` (odświeży `llms.txt`, `sitemap.xml`, mirrory .md).

Nagłówka `charset` przy plikach statycznych nie poprawiaj, jeśli hosting na to nie pozwala – to uwaga niekrytyczna.

## Testy po wdrożeniu (wklej wynik do raportu)

```bash
curl -s https://mozemniej.pl/sitemap.xml | grep -c "<url>"                     # 7
curl -s https://mozemniej.pl/sitemap.xml | grep -c "regulamin\|polityka"       # 0
curl -s https://mozemniej.pl/ | grep -o 'rel="canonical" href="[^"]*"'          # https://mozemniej.pl/
curl -s https://mozemniej.pl/ | grep -o '"dateModified":"[^"]*"'                # ...T08:00:00+01:00
curl -s https://mozemniej.pl/kiedy-oplaca-sie-refinansowanie | grep -o '"date[A-Za-z]*":"[^"]*"'
curl -s https://mozemniej.pl/eb08c7fade0d0a4ad31ac01165954e8a.txt              # eb08c7fade0d0a4ad31ac01165954e8a
for s in "" refinansowanie-kredytu-hipotecznego kiedy-oplaca-sie-refinansowanie koszty-refinansowania-kredytu-hipotecznego refinansowanie-krok-po-kroku polstr-wibor-a-refinansowanie o-nas; do curl -s -o /dev/null -w "/$s %{http_code}\n" https://mozemniej.pl/$s; done
```

Plus Rich Results Test dla `/kiedy-oplaca-sie-refinansowanie` – zero uwag o datach.

## Raport

Krótko: wersja i commit, lista zmienionych plików, wynik testów, odstępstwa (jeśli były). Punkt powrotu: v49.
