# Analiza luki: obecny prototyp vs koncepcja platformy SaaS

Źródła koncepcji: [taekwondo_saas_platform_architecture_strategy.md](./taekwondo_saas_platform_architecture_strategy.md) i [taekwondo_saas_architecture_english.md](./taekwondo_saas_architecture_english.md).
Stan na: 2026-11-01. Szacunki są orientacyjne.

## Podsumowanie

Koncepcja to platforma SaaS dla szkół: wideo multi-cam plus zarządzanie klubem. Obecny prototyp to narzędzie treningowe dla zawodnika, działające w przeglądarce, bez kont, chmury i panelu trenera. Pokrywamy wąski fragment koncepcji (analiza kopnięć z kamery), a resztę trzeba dopiero zbudować.

## Co już mamy

| Wymaganie z koncepcji | Stan |
|---|---|
| Analiza kopnięć (kąty kolana i biodra, wysokość stopy, prędkość) | Częściowo. [pose.html](./pose.html): MediaPipe w przeglądarce, z kamery lub z pliku. W koncepcji MediaPipe jest dopiero w fazie 3 (miesiące 7–12). |
| Eksport danych z analizy | JSON i CSV, lokalnie. |
| Profile uczniów | Namiastka: lokalne profile graczy (wzrost, układ przycisków) w [game.html](./game.html), bez kont. |
| Postępy | Namiastka: lokalny dziennik rund. |
| Wzorzec techniki | Pierwszy szablon front kicka z nagrań. |
| Strona i hosting | GitHub Pages, landing page [index.html](./index.html). |
| Plan nagrań i lekcja dla rodziców | [recording_plan.md](./recording_plan.md) (nasz dodatek, nie ma tego w koncepcji SaaS). |

## Czego nie mamy

| Wymaganie | Stan |
|---|---|
| Synchronizacja 3–4 kamer (NTP, aplikacja iOS) | Brak. Tylko ręczna synchronizacja (klaśnięcie). |
| Odtwarzacz multi-angle z freeze i rysowaniem kątów | Brak. |
| Poomsae obok wzorca mistrza | Brak. |
| Konta, multi-tenant, szkoły, grupy, pasy (gup/dan), obecność | Brak. |
| Portfel ucznia i wideo w chmurze (R2/S3, HLS) | Brak, świadomie: nagrania zostają lokalnie. |
| Backend (NestJS, PostgreSQL) i przetwarzanie wideo (FFmpeg) | Brak. Statyczne pliki HTML. |
| Płatności Stripe, cennik | Brak. |
| Aplikacja iOS (Swift) | Brak. |
| Bullet Time i materiały promocyjne | Brak. |
| Prywatność dzieci (zgody rodziców, RODO) | Brak. Koncepcja tego nie opisuje, a przy wideo i danych dzieci jest to wymóg. |

## Rozbieżności do rozstrzygnięcia

1. **Gra nie występuje w dokumentach SaaS.** Wizją tam jest analiza wideo i zarządzanie szkołą. Decyzja: gra jest modułem dla uczniów (trening w domu), a nie osobnym produktem (patrz sekcja 9 w [plan2work.md](./plan2work.md)).
2. **Przeglądarka (PWA) vs natywna aplikacja iOS.** Przeglądarka jest tańsza i szybsza. Natywna aplikacja ma sens przy precyzyjnej synchronizacji kamer i 120/240 fps. Decyzja po pierwszych nagraniach 3 kamerami.
3. **Harmonogram.** Koncepcja zakłada fazę walidacji na egzaminie na czarny pas; chcemy wdrożyć możliwie szybko. Prototyp jest w praktyce fazą 1 w wersji jednokamerowej.

## Proponowana kolejność

1. **Bez backendu:** po nagraniach 3 kamerami zbudować odtwarzacz multi-angle w przeglądarce (pliki lokalne, przełączanie kątów, freeze, pomiar kąta). To filar 1 MVP.
2. **Wspólny model danych** (uczeń, kopnięcie, wynik) zapisywany w przeglądarce i eksportowany do JSON; później ten sam model trafi do bazy.
3. **Po walidacji w 2–3 klubach:** backend, konta i multi-tenant. Punkt startowy: Supabase (auth, PostgreSQL i storage), a nie pełne NestJS i mikrousługi.
4. **Zgody rodziców i prywatność** zaplanować przed pierwszym wgraniem czegokolwiek do chmury.
