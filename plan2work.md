# Plan projektu: TKD Training — od pierwszej lekcji do sparingu online

## 1. Cel produktu

Stworzyć przystępne narzędzie edukacyjne, które pomaga młodym zawodnikom ćwiczyć nawyki przydatne na sali: obserwację przeciwnika, reakcję na sygnał, wyczucie dystansu, proste kombinacje, powrót do gardy i pracę nóg. Aplikacja ma zachęcać do treningu z trenerem i partnerem, a nie zastępować prawdziwy sparing.

Główne doświadczenie to widok pierwszoosobowy 3D. Użytkownik ćwiczy najpierw kontrolerem, a później — w osobnym trybie — przed kamerą. To dwa różne sposoby sterowania i zbierania informacji o ruchu; nie należy udawać, że pad mierzy technikę zawodnika.

## 2. Rekomendacja technologiczna

### Aplikacja

- **TypeScript + Vite** — szybki start, typowane moduły i łatwe uruchamianie aplikacji lokalnie oraz publikowanie jej w sieci.
- **Babylon.js** — silnik 3D w przeglądarce z kamerą pierwszoosobową, animacjami, oświetleniem i obsługą WebGL/WebGPU. Lepiej pasuje do pełnego 3D niż Phaser, który jest przede wszystkim silnikiem 2D.
- **HTML/CSS** dla menu, lekcji, ustawień i podsumowań; scena 3D pozostaje osobnym modułem.
- **Gamepad API** do wejścia z kontrolera podłączonego do komputera. Przyciski i gałki DualSense powinny być podstawowym wariantem sterowania na start. Obsługa zależy od systemu, przeglądarki i połączenia; przed rozpoczęciem właściwej lekcji aplikacja powinna pokazać ekran testu kontrolera.

### Kamera i analiza ruchu — późniejszy etap

- Najpierw przetestować dostęp do kamery i działanie modelu pozy na docelowym iPhonie. W przeglądarce można użyć MediaPipe Pose Landmarker lub podobnego rozwiązania działającego lokalnie na urządzeniu.
- Analizować tylko zadania, które da się wiarygodnie ocenić z jednego ujęcia, np. wykrycie pozycji, kolejności ruchów lub liczby powtórzeń. Nie deklarować pomiaru siły, kontaktu z workiem ani dokładnego dystansu na podstawie samego obrazu.
- Surowy obraz powinien być przetwarzany lokalnie i domyślnie nie opuszczać urządzenia. Jeśli w przyszłości będzie potrzebna aplikacja natywna, można ocenić Swift/ARKit dla iPhone'a; nie jest to wymóg pierwszego prototypu.

### Backend i przyszły tryb online

- Na początku gra powinna działać bez konta i backendu; progres można zapisywać lokalnie.
- Gdy pojawi się potrzeba kont i synchronizacji, dodać **Supabase (PostgreSQL, Auth)** do profili, lekcji i postępów. Dane konta i dane treningowe trzymać oddzielnie od obrazu z kamery.
- Do sparingu online dodać osobny serwer czasu rzeczywistego, np. **Colyseus na Node.js/TypeScript**. Serwer zarządza pokojami, pozycją awatarów i stanem rundy. Klienci wysyłają ograniczone, walidowane dane wejściowe lub uproszczone punkty pozy, nie pełne nagrania z kamery.
- Aplikację webową można publikować jako statyczną stronę (np. Cloudflare Pages); serwer pokoi wdrażać osobno. Wybrać hosting serwera obsługujący długie połączenia WebSocket.
- Nie implementować multiplayera w pierwszej wersji. Najpierw zbudować grę tak, by sterowanie, symulacja, lekcje i zapis postępów były od siebie oddzielone — ułatwi to późniejsze dodanie serwera.

## 3. Zakres MVP

Pierwszy działający prototyp powinien zawierać:

1. Jedną scenę treningową 3D i widok pierwszoosobowy.
2. Ekran kalibracji sterowania i obsługę klawiatury oraz Gamepad API.
3. Ruch do przodu/tyłu i na boki, gardę oraz jedną lub dwie wybrane techniki.
4. Jednego przewidywalnego partnera treningowego, który daje czytelny sygnał i wykonuje prostą, powtarzalną akcję.
5. Jedną krótką lekcję: rozpoznaj sygnał, oceń moment wejścia, wykonaj ustaloną kombinację i wróć do gardy.
6. Podsumowanie rundy z kilkoma zrozumiałymi wskaźnikami: reakcja na sygnał, ukończenie kombinacji, powrót do pozycji i liczba prób.
7. Jasne przypomnienie o bezpiecznej przestrzeni oraz o tym, że aplikacja nie zastępuje instrukcji trenera ani treningu z partnerem.

**Poza MVP:** VR, motion capture, rozpoznawanie siły i kontaktu, ranking publiczny, otwarty czat, konta dzieci, adaptacyjne AI i sparing online.

## 4. Etapy realizacji

### Etap 0 — sprawdzenie założeń

- Potwierdzono przeglądarkę Google Chrome.
- Wstępny test wykrył `DualSense Edge Wireless Controller` z mapowaniem `standard`, 4 osiami i 18 przyciskami; użytkownik potwierdził, że przyciski i gałki działają.
- Test wykonano w aktualnym połączeniu. Osobne porównanie USB/Bluetooth pozostaje opcjonalne przed szerszym testowaniem.
- Z trenerem wybrać pierwszą bezpieczną kombinację i kryteria jej poprawnego wykonania.
- Rozpisać krótkie ćwiczenie dystansu jako serię sygnałów i decyzji, bez obiecywania dokładnego pomiaru odległości.

**Status:** test kontrolera w Chrome zaliczony. Do potwierdzenia z trenerem pozostaje wybór kombinacji i kryteriów technicznych.

### Etap 1 — pionowy prototyp 3D

- Uruchomić projekt TypeScript/Vite z Babylon.js.
- Zbudować prostą salę, kamerę pierwszoosobową, partnera i czytelne wskaźniki dystansu/pozycji.
- Dodać sterowanie klawiaturą i padem, pauzę, ponowne rozpoczęcie oraz regulację czułości.
- Przygotować tymczasowe animacje i efekty; na tym etapie nie inwestować w motion capture.

**Gotowe, gdy:** nowa osoba potrafi uruchomić scenę, poruszać się, wykonać akcję i zrozumieć informację zwrotną bez pomocy autora.

**Aktualny prototyp do testów:** [game.html](./game.html). Jedna scena 3D, klawiatura i Gamepad API, wybór jednej z pięciu kombinacji, sygnał partnera oraz sekwencja wejście → trzy kopnięcia → powrót. Domyślna kamera śledzi zawodnika zza ramienia; L3 przełącza na widok pierwszoosobowy. W widoku zza ramienia gracz ma widoczny niebieski dobok i 86% widoczności, a partner czerwony dobok; ochraniacze również rozróżniają zawodników. Klatka piersiowa, barki, ręce i głowa obracają się razem względem bioder, podkreślając ustawienie bokiem. DualSense: lewy drążek — ruch, prawy — obrót, ✕ — szybkie kopnięcie nogą wykroczną, □ — wolniejsze i mocniejsze kopnięcie nogą zakroczną, ○ — garda, L3 — widok; w menu krzyżak wybiera kombinację, Options rozpoczyna rundę. Na klawiaturze J/Enter wykonuje kopnięcie nogą wykroczną, L — zakrożną, K — garda. Kombinacja wymaga użycia właściwej nogi opisanej przy danym kopnięciu. Partner wykonuje czytelny atak w fazie gotowości; czerwony sygnał zapowiada kopnięcie, a przytrzymanie ○/K podczas trafienia blokuje je. Obaj zawodnicy delikatnie podskakują i kołyszą tułowiem przód–tył w gotowości; partner robi też krótkie kroki boczne i zmienia odległość. Przed każdym kopnięciem bieżący dystans jest sprawdzany od nowa; próba poza zakresem nie przesuwa sekwencji i wyświetla wskazówkę, by podejść albo się odsunąć. Pasek dystansu pokazuje pozycję znacznika względem zakresu właściwego dla aktualnego kopnięcia. Awatar pozostaje uproszczony, a animacje nie oceniają techniki. Dystans jest umowną miarą sceny, nie rzeczywistym pomiarem. Tryb ćwiczy kolejność, rytm, obronę reakcyjną i dystans; nie symuluje poprawnie każdej techniki obrotowej.

**Status prac:** prototyp uruchamia się w Chrome; sprawdzono wybór kombinacji, ruch partnera, zmianę dystansu, blokowanie kopnięcia poza zakresem i zaliczenie ruchu po ponownym wejściu w zakres — bez błędów JavaScript. Podczas testu odległość partnera zmieniała się w czasie, a kopnięcie przy 6,2 m nie przesunęło kombinacji; po podejściu do 3,2 m pierwszy ruch został zaliczony. Dodano wizualny pasek zakresu, który aktualizuje się razem z odległością partnera; do sprawdzenia pozostaje jego czytelność na ekranie użytkownika. Sprawdzono też renderowanie WebGL po dodaniu lekkich elementów sceny; wcześniejszy pomiar wyniósł około 60 kl./s dla 90 klatek, co nie zastępuje testu na komputerze użytkownika. Użytkownik potwierdził wcześniejsze działanie DualSense i wykonał kopnięcia; ruch partnera i kontrolę dystansu między kopnięciami warto potwierdzić padem. Zawartość pochodzi z [combos.md](./combos.md); sekwencje są zaawansowane, więc przed użyciem jako lekcji technicznej trener powinien zatwierdzić dobór ćwiczeń. Plik [one step sparring.md](./one%20step%20sparring.md) jest źródłem do przyszłego trybu atak–obrona–kontrolowana kontra. Prototyp jest pojedynczym plikiem HTML ładującym Babylon.js z CDN, dzięki czemu można go uruchomić bez instalacji Node.js. Do regularnego rozwoju należy przenieść go do TypeScript/Vite i przypiąć zależność Babylon.js lokalnie; bieżący plik wymaga połączenia z internetem.

**Personalizacja wzrostem:** w menu ustawienie wzrostu (120–210 cm) zapisuje się lokalnie, skaluje awatar i wysokość kamery, a wyliczony zakres kopnięcia zmienia się maksymalnie o ±10% względem wartości bazowej. Gra oznacza punkt odniesienia jako pochodzący z feedbacku albo będący szacunkiem do sprawdzenia. Wartości są umowne i nie stanowią rzeczywistego pomiaru ani oceny techniki. Obecny feedback nie podaje wzrostu zawodnika, więc nie jest skalibrowanym zestawem danych. Przed dokładniejszym dostrajaniem zbierać powtarzalne, anonimowe próby: wzrost ustawiony w grze, technikę, dystans gry i wynik. Nagrania z kamery nie są obecnie zbierane; ewentualne nagrywanie dla dzieci wymaga osobnego projektu prywatności, wyraźnej zgody opiekuna i zasad retencji.

**Sterowanie nogami i obrona:** domyślnie kamera śledzi zawodnika zza ramienia; L3 przełącza na pierwszą osobę. DualSense: ✕ kopie nogą wykroczną (krótsza animacja), □ nogą zakroczną (dłuższa animacja), a ○ trzymane przy uderzeniu partnera blokuje atak. Na klawiaturze odpowiedniki to J/Enter, L i K. Kombinacja wymaga nogi opisanej przy danym kopnięciu. Różnica szybkości i mocy jest tylko umownym sygnałem gry, nie pomiarem rzeczywistej siły.

**Dźwięk:** przycisk w menu i HUD włącza lub wyłącza generowany w przeglądarce rytm treningowy oraz efekty kopnięć, syntetyczny okrzyk „kiai” i dźwięk obrony. Dźwięk nie wymaga plików zewnętrznych ani muzyki chronionej prawem autorskim; domyślnie pozostaje wyłączony do czasu aktywacji przez użytkownika.

**Przesuw i zmiana postawy:** L1 (klawiatura: Spacja) wykonuje krótki przesuw w kierunku drążka; kopnięcie w ciągu ok. 0,7 s po przesuwie ma większy zasięg. Każde kopnięcie lekko przesuwa zawodnika do przodu (zakroczne mocniej), więc chybione kopnięcie może przybliżyć do partnera przed drugim. Po kopnięciu nogą zakroczną noga ląduje z przodu: obie nogi zamieniają się miejscami, tułów wykonuje zamach na drugą stronę, a wskaźnik „postawa” i cień zawodnika zmieniają się na „odsłonięta”. W tym stanie partner trafia mimo gardy, dopóki gracz nie wróci R1 (klawiatura: E). Kombinacje 6–10 mają 1–2 kopnięcia z przesuwami i zmianą postawy; w kombinacji 2 drugie kopnięcie jest już nogą wykroczną. To uproszczony model gry, nie ocena techniki.

**Pozycja walki:** nogi obu zawodników są rozstawione w osi przód–tył, z wyraźną nogą wykroczną i zakroczną, zamiast stać równolegle. Animacja kopnięcia partnera wybiera nogę zakroczną i prowadzi ją w stronę gracza; proporcje pozostają uproszczone i wymagają oceny wizualnej w grze.

**Następny krok:** przetestować kamerę zza ramienia, czytelność pozycji walki i kopnięcia partnera, wybór nogi w kombinacjach oraz czas reakcji na sygnał obrony; dla każdej próby zapisać wzrost ustawiony w grze, kopnięcie, dystans gry i wynik. Następnie z trenerem ustalić, czy pierwsze pięć kombinacji nadaje się do ćwiczenia w tej kolejności oraz jakie bezpieczniejsze warianty i kryteria mają obowiązywać. Nie dobierać technik ani kryteriów jakości wyłącznie na podstawie umownych pomiarów gry.

### Etap 2 — pierwsza lekcja i testy na sali

- Zrealizować ćwiczenie: sygnał partnera → decyzja o wejściu → kombinacja → powrót do gardy/zejście z linii.
- Rejestrować zdarzenia gry, nie nagranie użytkownika: czas reakcji, wykonane wejścia, pominięte kroki i powtórzenia.
- Dodać proste poziomy trudności zmieniające tempo lub czytelność sygnału, nie „inteligencję” przeciwnika.
- Przetestować lekcję z rodziną i kilkoma osobami z klubu. Zebrać informację, czy ćwiczenie jest zrozumiałe, motywujące i przenosi się na zadanie na sali.

**Gotowe, gdy:** testerzy potrafią opisać, czego ćwiczenie uczy, a trener zatwierdza wskazówki i kryteria.

### Etap 3 — ścieżka treningowa i progres

- Dodać kilka krótkich lekcji zbudowanych według tego samego schematu.
- Zapisywać lokalnie ukończone lekcje i wyniki; umożliwić usunięcie danych i rozpoczęcie od nowa.
- Zamiast samego wyniku dodawać zadanie do wykonania na prawdziwym treningu, np. poprosić trenera o rundę zadaniową.
- Dodać dostępne napisy, sterowanie bez konieczności szybkiego wciskania wielu przycisków i ustawienia ograniczające bodźce.

**Gotowe, gdy:** progres jest zrozumiały, działa po ponownym uruchomieniu i nie zachęca do ryzykownego ćwiczenia bez nadzoru.

### Etap 4 — eksperyment z kamerą iPhone'a

- Zrobić osobny tryb demonstracyjny z instrukcją ustawienia telefonu, kadru i bezpiecznej przestrzeni.
- Sprawdzić wykrywanie sylwetki i stawów na kilku urządzeniach oraz przy różnym oświetleniu i ubraniu.
- Zaczynać od łatwo sprawdzalnych zadań, np. powrót do pozycji albo policzenie rozpoznanych powtórzeń.
- Pokazywać pewność rozpoznania. Jeśli kamera nie widzi zawodnika albo model jest niepewny, poprosić o poprawienie kadru zamiast podawać błędną ocenę.
- Nie udostępniać obrazu ani punktów pozy innym osobom bez świadomej zgody. Dla użytkowników niepełnoletnich zaplanować zgodę opiekuna i konsultację wymagań prawnych przed uruchomieniem publicznym.

**Gotowe, gdy:** system wiarygodnie rozpoznaje wybrane zadania w określonych warunkach, a ograniczenia są widoczne dla użytkownika.

### Etap 5 — ćwiczenia na worku

- Dodać tryb serii kopnięć z celem, przerwami i możliwością przerwania.
- Z kamerą liczyć tylko ruchy, które model potrafi rozpoznać; wynik traktować jako przybliżony.
- Informacje techniczne opracować i zatwierdzić z trenerem. Nie wyciągać wniosków o sile kopnięcia ani bezpieczeństwie z samej pozy.
- Wymagać stabilnego ustawienia telefonu poza zasięgiem kopnięć, wolnej przestrzeni i odpowiedniego worka/sprzętu.

### Etap 6 — sparing online z awatarami

- Najpierw uruchomić pokoje prywatne dla dwóch osób i prosty wybór ćwiczenia; dopiero później rozważyć dobieranie graczy.
- Wymieniać stan gry oraz, po włączeniu trybu kamery, uproszczone punkty pozy i znaczniki czasu. Ograniczyć częstotliwość i zakres danych do potrzeb animacji.
- Wyświetlać wskaźnik opóźnienia i przewidywalnie obsługiwać rozłączenie. Nie oceniać punktacji lub techniki jako wiarygodnej, jeśli jakość połączenia albo śledzenia jest niewystarczająca.
- Dla młodych użytkowników stosować prywatne pokoje, brak otwartego czatu i publicznych profili oraz mechanizmy zgłaszania/opuszczania sesji.
- Uzgodnić zasady przechowywania danych, retencji, zgód opiekunów i moderacji przed udostępnieniem funkcji społecznościowych.

**Gotowe, gdy:** dwie osoby mogą ukończyć tę samą krótką rundę, widzą zsynchronizowane awatary i mogą bezpiecznie zakończyć sesję.

## 5. Proponowana struktura projektu

```text
src/
  app/          # start aplikacji i nawigacja
  game/
    scene/      # scena, kamera, modele i animacje Babylon.js
    controls/   # klawiatura i Gamepad API
    training/   # przebieg rund i ćwiczenia
    feedback/   # obliczanie wyników z wydarzeń gry
  lessons/      # definicje lekcji, celów i wskazówek
  camera/       # późniejszy moduł kamery i analizy pozy
  progress/     # zapis lokalny i późniejsza synchronizacja
  online/       # późniejszy klient pokoi czasu rzeczywistego
  ui/           # menu, ustawienia, lekcje i podsumowania
```

Warto od początku utrzymywać osobne interfejsy dla źródła sterowania (klawiatura, pad, kamera), przebiegu ćwiczenia i zapisu progresu. Dzięki temu dodanie kamery lub serwera nie wymusi przebudowy całej gry.

## 6. Zasady bezpieczeństwa i prywatności

- To narzędzie edukacyjne, a nie certyfikowany trener, system medyczny ani zamiennik zajęć.
- Ćwiczenia ruchowe i wskazówki zatwierdza trener; poziom trudności nie powinien zachęcać do kopania z maksymalną siłą.
- Kamera wymaga miejsca wolnego od przeszkód i bezpiecznego ustawienia urządzenia.
- Domyślnie przetwarzać obraz lokalnie; nie zapisywać ani nie przesyłać nagrań, jeśli funkcja nie wymaga tego wprost.
- Ograniczyć dane kont, nie tworzyć publicznych profili dzieci i nie włączać otwartego czatu.
- Przed publicznym wdrożeniem ustalić zgodę opiekunów, okres przechowywania i usuwanie danych oraz wymagania ochrony danych dla rynku docelowego.

## 7. Najważniejsze ryzyka do sprawdzenia wcześnie

1. **Pad nie mierzy ruchu zawodnika.** Służy do sterowania prototypem; kamera jest osobnym etapem.
2. **Jedna kamera ma ograniczenia.** Zasłonięte kończyny, kąt ujęcia i oświetlenie mogą pogorszyć ocenę.
3. **Dystans w 3D to nie dystans na sali.** Gra może ćwiczyć decyzje i rytm, ale ekran, pole widzenia i perspektywa nie odtworzą w pełni realnego kontaktu.
4. **Multiplayer zwiększa zakres i ryzyko.** Synchronizacja, opóźnienia i bezpieczeństwo społeczności uzasadniają odłożenie tej funkcji do osobnego etapu.
5. **Technologia nie zastąpi jakości ćwiczeń.** Najpierw sprawdzić z trenerem, czy jedna lekcja faktycznie buduje pożądany nawyk.

## 8. Pierwsze konkretne zadania

1. Wybrać komputer, przeglądarkę i sposób podłączenia DualSense do testów.
2. Z trenerem rozpisać jedną lekcję: sygnał, decyzja, kombinacja, powrót do pozycji i kryteria oceny.
3. Utworzyć minimalny projekt TypeScript/Vite + Babylon.js.
4. Dodać test Gamepad API oraz sterowanie klawiaturą jako niezawodny wariant zapasowy.
5. Zbudować jedną scenę i przeprowadzić test z kilkoma osobami z klubu.
6. Dopiero po pozytywnym teście zdecydować, czy następnym krokiem jest więcej lekcji, czy prototyp śledzenia pozy na iPhonie.
