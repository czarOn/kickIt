# Specyfikacja Techniczna i Architektura SaaS dla Szkół Taekwondo
*System Automatycznej Analizy Wideo, Efektów Multi-Cam i Zarządzania Klubem Sztuk Walki*

---

## 1. Wizja Produktu i Grupa Docelowa

Platforma SaaS łączy zaawansowaną analizę wideo (z uwzględnieniem synchronizacji wielokamerowej / Bullet Time / slow-motion) z systemem operacyjnym dla szkół Taekwondo i sztuk walki na całym świecie.

### Główne filtry korzyści:
* **Dla Trenerów i Szkoły:** Automatyzacja prowadzenia zapisów, analiza biometryczna/techniczna kopnięć, przygotowanie materiałów promocyjnych (social media z efektami Matrix), rejestracja egzaminów na pasy.
* **Dla Uczniów / Rodziców:** Dostęp do "Cyfrowego Dojang", gdzie widzą swoje postępy, powtórki z treningów z różnych kątów i interaktywne karty osiągnięć.

---

## 2. Zakres Funkcjonalności MVP (Minimum Viable Product)

Aby szybko zweryfikować rynek przy minimalnym nakładzie początkowym, MVP powinno skupić się na trzech filarach:

```
+-----------------------------------------------------------------------+
|                              MVP SAAS                                 |
+------------------------------------+----------------------------------+
|      Filar 1: Video & Multi-Cam     |   Filar 2: Moduł Trenerski/SaaS  |
+------------------------------------+----------------------------------+
| • Synchro z 3-4 urządzeń (iOS/App) | • Baza uczniów i profil osiągnięć|
| • Odtwarzacz Multi-Angle z freeze  | • Wideo-analiza techniki (rys)   |
| • Eksport ujęć 60/120fps z logo    | • Subskrypcje i płatności Stripe |
+------------------------------------+----------------------------------+
```

### 2.1 Moduł Multi-Cam & Video (Wersja MVP)
1. **Dedykowana aplikacja iOS (Mobile Edge):**
   * Podłączenie 3-4 urządzeń (np. 1-2 iPhone + 2 iPady) przez sieć lokalną (Wi-Fi Local Discovery / Bonjour).
   * Zsynchronizowany start/stop nagrywania za pomocą sygnału NTP / lokalnego brokera.
   * Automatyczne generowanie miniaturek i wysyłanie nagrań w tle do chmury (z opcją kompresji H.265 / HEVC).
2. **Odtwarzacz Multi-Angle w Przeglądarce:**
   * Możliwość przełączania widoków z kamer w czasie rzeczywistym podczas odtwarzania ujęcia (synchroniczny playback).
   * Narzędzie "Freeze & Draw": wstrzymanie wideo, rysowanie kątów uderzenia (kąt biodra, kolana, stopy).

### 2.2 Moduł Zarządzania Klubem (SaaS Core)
1. **Panel Szkoły (Multi-Tenant Dashboard):**
   * Zarządzanie sekcjami, grupami wiekowymi i pasami (Gup / Dan).
   * Ewidencja obecności oraz kalendarz treningów.
2. **Portfel Ucznia (Mobile / Web App):**
   * Osobista biblioteka wideo uderzeń, egzaminów i walk sparingowych.
   * Raporty z postępów i komentarze od trenera.

---

## 3. Architektura Systemu i Technologia

Platforma wykorzystuje mikrousługi i architekturę zorientowaną na zdarzenia (Event-Driven Architecture), co ułatwia skalowanie na całe środowisko międzynarodowe.

```
+--------------------------------------------------------------------------+
|                            ARCHITEKTURA SYSTEMU                          |
+--------------------------------------------------------------------------+

  [ Urządzenia iOS / Kamery ]
             |
             | Local Network / WebSocket
             v
   +--------------------+      Direct Upload      +----------------------+
   |  iOS Master Node   | ----------------------> | Object Storage (S3)  |
   | (Lokalna Reżyserka)|                         +----------------------+
   +--------------------+                                    |
             |                                               | Trigger
             | REST API / GraphQL                            v
   +--------------------------------------------------------------------+
   |                   API Gateway (Kong / AWS API Gate)                |
   +--------------------------------------------------------------------+
                                     |
       +-----------------------------+-----------------------------+
       |                             |                             |
       v                             v                             v
+------------------+        +------------------+        +------------------+
| Auth & Tenant    |        | Video Processing |        | Analytics & AI   |
| Service (Node.js)|        | Service (FFmpeg) |        | Service (Python) |
+------------------+        +------------------+        +------------------+
       |                             |                             |
       +-----------------------------+-----------------------------+
                                     |
                                     v
                  +-----------------------------------+
                  | Primary Database (PostgreSQL/Prisma)|
                  +-----------------------------------+
```

### 3.1 Tech Stack (Rekomendowane Technologie)

| Warstwa | Technologia / Narzędzie | Uzasadnienie |
| :--- | :--- | :--- |
| **Mobile Capture (Edge)** | Swift / iOS SDK (AVFoundation) | Pełna kontrola nad aparatem, wyzwalaczami i kodekami HEVC/ProRes. |
| **Frontend Web/App** | Next.js (React) + Tailwind CSS | Szybkie renderowanie (SSR/ISR), świetne SEO pod landing page i płynna obsługa wideo. |
| **Backend API** | Node.js (TypeScript) / NestJS | Skalowana architektura multi-tenant z silnym typowaniem. |
| **Przetwarzanie Wideo** | FFmpeg worker (AWS ECS / Lambda) | Konwersja formatów, generowanie HLS/DASH dla płynnego streamingu oraz renderowanie nakładek graficznych. |
| **Baza Danych** | PostgreSQL (Supabase / AWS RDS) | Relacyjna baza idealna do struktur szkoła -> grupa -> student -> wideo. |
| **Przechowywanie Plików** | Cloudflare R2 / AWS S3 + Cloudflare CDN | Brak opłat za transfer danych (Egress fees) przy wywołaniach strumieniowych wideo. |
| **Płatności i Subskrypcje**| Stripe Billing | Standard branżowy dla subskrypcji SaaS i rozliczeń wielowalutowych. |

---

## 4. Strategia Wdrożenia i Rozwoju (Roadmap)

### Faza 1: Walidacja i Prototyp (Miesiące 1–3)
* Stworzenie aplikacji mobilnej do wyzwalania 3 urządzeń jednocześnie (iOS).
* Zbudowanie prostego skryptu na serwerze łączącego ścieżki w wideo z opcją przełączania kamer.
* Testy w 2-3 lokalnych klubach Taekwondo.

### Faza 2: Budowa Wersji MVP (Miesiące 4–6)
* Wdrożenie architektury Multi-Tenant (panel dla szkoły i podkonta trenera/ucznia).
* Połączenie modułu wideo z bazy danych PostgreSQL i płatnościami Stripe.
* Rozpoczęcie beta testów międzynarodowych.

### Faza 3: Analiza AI i Profesjonalny Bullet Time (Miesiące 7–12)
* Integration ze sztuczną inteligencją: **MediaPipe / YOLO** do automatycznej detekcji postawy, wysokości kopnięcia i szybkości uderzenia.
* Automatyczna interpolacja klatek (AI Frame Interpolation) pozwalająca uzyskać płynny efekt Bullet Time nawet z 4-6 kamer.

---

## 5. Model Biznesowy (Monetyzacja)

1. **Freemium / Trial:** 14 dni darmowego testu dla szkoły z pełną obsługą 3 kamer.
2. **Tier Basic (Mały Dojang - do 50 uczniów):** ~$49/miesiąc – Zarządzanie szkołą + podstawowe nagrywanie z 2-3 kamer.
3. **Tier Pro (Średnia Szkoła - do 200 uczniów):** ~$149/miesiąc – Obsługa do 6 kamer, automatyczna wideo-analiza techniki, eksport brandingowy dla social media.
4. **Tier Enterprise / Federation:** Wycena indywidualna – Dedykowane rozwiązania dla związków sportowych, oficjalnych egzaminatorów i turniejów międzynarodowych.