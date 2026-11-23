# Zadanie v3: zapis źródła wejścia przy każdym zgłoszeniu

Wykonaj **po** wdrożeniu v2. Cel: przy każdym zgłoszeniu z formularza 4 pytań zapisywać, skąd przyszedł użytkownik – z reklamy Meta, z Google, z asystenta AI (ChatGPT, Perplexity, Gemini, Copilot), z innej strony czy bezpośrednio. Dziś arkusz CRM (zakładka „Zgłoszenia”) nie ma kolumn UTM, referrer ani fbclid, więc nie da się oddzielić leadów z reklam od leadów organicznych i z AI.

## Zasady

1. Nie zmieniaj działania formularza, zgód, dialogu „Prywatność i pomiar”, zdarzeń Meta (Pixel / Conversions API) ani wyglądu strony.
2. **Bez nowego zapisu na urządzeniu użytkownika bez zgody.** Źródło przechwytuj w pamięci aplikacji (zmienna JS przy pierwszym załadowaniu strony w sesji) i dołączaj do wysyłanego zgłoszenia. `sessionStorage`/`localStorage`/cookie wolno użyć tylko wtedy, gdy użytkownik zaakceptował pomiar analityczny. Bez zgody – tylko pamięć, nawet jeśli przy przeładowaniu strony źródło się zgubi (wtedy `direct_or_unknown`).
3. Zapisuj tylko **domenę** strony odsyłającej (np. `chatgpt.com`, `www.google.com`), nie pełny adres. Nie zapisuj wartości `fbclid` w CRM – wystarczy informacja tak/nie (wartość obsługuje istniejąca integracja Meta, jeśli jej potrzebuje).
4. Sprawdź, czy polityka prywatności obejmuje zapis źródła wejścia przy zgłoszeniu. Jeśli nie – nie zmieniaj jej, tylko zgłoś to w raporcie.

## Co przechwycić przy pierwszym wejściu w sesji

| Pole | Źródło | Przykład |
|---|---|---|
| `landing_path` | `location.pathname` | `/formularz`, `/kiedy-oplaca-sie-refinansowanie` |
| `first_seen_at` | czas wejścia (ISO, strefa Europe/Warsaw) | `2026-11-24T10:15:00+01:00` |
| `referrer_domain` | `new URL(document.referrer).hostname` (puste, jeśli brak lub ta sama domena) | `chatgpt.com` |
| `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content` | parametry URL | `meta`, `paid_social`, … |
| `has_fbclid` | czy w URL jest `fbclid` | `true` / `false` |
| `source_class` | wyliczane wg reguł poniżej | `ai:chatgpt.com` |

Zasada przypisania: **pierwsze wejście w sesji** (first touch w ramach sesji). Wewnętrzne przejścia po mozemniej.pl nie nadpisują źródła.

## Reguły `source_class` (w tej kolejności, pierwsza pasująca wygrywa)

1. `utm_source` = `meta` → `meta_paid`
2. `utm_source` lub `referrer_domain` należy do asystentów AI → `ai:<domena>`
   Lista: `chatgpt.com`, `chat.openai.com`, `perplexity.ai`, `www.perplexity.ai`, `gemini.google.com`, `copilot.microsoft.com`, `claude.ai`, `chat.mistral.ai`, `chat.deepseek.com`, `you.com`. (ChatGPT dopisuje do linków `utm_source=chatgpt.com` – to też ma trafić tutaj.)
3. Inny niepusty `utm_source` → `utm:<utm_source>/<utm_medium>`
4. `referrer_domain` to wyszukiwarka (`google.*`, `bing.com`, `duckduckgo.com`, `search.yahoo.com`, `ecosia.org`, `search.brave.com`) → `organic:<nazwa>` (np. `organic:google`)
5. `referrer_domain` to sieć społecznościowa bez UTM (`facebook.com`, `l.facebook.com`, `m.facebook.com`, `instagram.com`, `l.instagram.com`, `linkedin.com`, `lnkd.in`, `youtube.com`, `t.co`, `x.com`) → `social:<nazwa>`
6. Inny `referrer_domain` → `referral:<domena>`
7. Brak wszystkiego → `direct_or_unknown`

Listę AI i wyszukiwarek trzymaj w jednym pliku konfiguracyjnym (łatwo dopisać nową domenę).

## Gdzie zapisać

1. **Baza / zapis zgłoszenia** – nowe pola przy rekordzie zgłoszenia (ID zgłoszenia ↔ źródło).
2. **Arkusz CRM, zakładka „Zgłoszenia”** – dodaj na końcu kolumny: `source_class`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, `referrer_domain`, `landing_path`, `first_seen_at`, `has_fbclid`. Nie przestawiaj istniejących kolumn.
3. **Powiadomienie dla operatora/partnera (Slack itp.)** – dopisz jedną linię „Źródło: <source_class>”.

## Drobna poprawka SEO przy okazji

Strona `/formularz` (cel reklam Meta) ma `index, follow` i canonical `https://mozemniej.pl` – zostaw to. Po v2 canonical strony głównej to `https://mozemniej.pl/` (ze slashem); ustaw **identyczny** canonical na `/formularz`. `/formularz` nie dodawaj do `sitemap.xml`.

## Testy (wklej wyniki do raportu)

Dla każdego przypadku wejdź na podany adres w nowej karcie incognito, wyślij **testowe** zgłoszenie (oznacz je w treści jako TEST, a potem usuń z CRM/oznacz jako testowe) i podaj wartości zapisanych pól:

1. `https://mozemniej.pl/formularz?utm_source=meta&utm_medium=paid_social&utm_campaign=TEST&fbclid=TEST123` → `meta_paid`, `has_fbclid=true`
2. `https://mozemniej.pl/?utm_source=chatgpt.com` → `ai:chatgpt.com`
3. Wejście z wyszukiwarki Google (kliknięcie wyniku) → `organic:google` – jeśli niewykonalne, zasymuluj referrer w teście jednostkowym
4. `https://mozemniej.pl/kiedy-oplaca-sie-refinansowanie` wpisany ręcznie, potem przejście do formularza → `direct_or_unknown`, `landing_path=/kiedy-oplaca-sie-refinansowanie`
5. Test jednostkowy funkcji `source_class` dla wszystkich 7 reguł.

Potwierdź też, że bez zgody na pomiar nic nowego nie trafia do `localStorage`, `sessionStorage` ani cookies (DevTools → Application).

## Raport

Wersja i commit, zmienione pliki, nazwy nowych pól w bazie i kolumn w CRM, wyniki testów 1–5, informacja o polityce prywatności, odstępstwa. Punkt powrotu: wersja po v2.
