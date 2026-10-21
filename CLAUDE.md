# Projekt

Testy e2e (Playwright + TypeScript) dla aplikacji webowej dostępnej live.
Adres aplikacji: BASE_URL w playwright.config.ts.
Dane logowania: zmienne środowiskowe z pliku .env (niecommitowany, wzór w .env.example),
wczytywane w playwright.config.ts przez process.loadEnvFile():

- SHARED_USER / SHARED_PASSWORD – konto współdzielone; większość testów, w tym rezerwacje.
- OWN_USER / OWN_PASSWORD – własne konto kandydata; jedyne konto do wariantu
  „poprawny login / błędne hasło”.
- NR_PESEL – PESEL konta OWN; do wyboru konta w dialogu „wybierz konto” (gdy mail
  ma kilka kont). Na stronie wyświetlany jako `*********XY` (2 ostatnie cyfry) –
  test wylicza maskę z process.env.

Nigdy nie wypisuj ich wartości w kodzie, logach ani odpowiedziach.

## Ograniczenia środowiska (z treści zadania – bezwzględne)

- Środowisko jest współdzielone z innymi kandydatami, którzy pracują równolegle.
- Używaj wyłącznie danych testowych. Nigdy nie wpisuj prawdziwych danych osobowych.
- Nie realizuj płatności. Ścieżka umawiania kończy się w momencie przekierowania
  do zewnętrznego operatora płatności (np. PayU) – tam test się zatrzymuje.
- Nie testuj i nie zgłaszaj błędów zewnętrznych serwisów.
- 5 błędnych prób hasła blokuje konto na 5 minut DLA WSZYSTKICH kandydatów.
  - Testy błędnego logowania wykonuj tylko na nieistniejącym użytkowniku
    albo na własnym koncie kandydata – nigdy na koncie współdzielonym.
  - Nie uruchamiaj testów błędnego logowania wielokrotnie (--repeat-each, retries, pętle).
  - Żadne z kont (SHARED, OWN) nie może zostać zablokowane.
  - Każdy test z błędnym hasłem na istniejącym koncie oznacz `tag: '@lockout-risk'`.
    Przy diagnozie flaky (--repeat-each) zawsze dodawaj `--grep-invert @lockout-risk`.
  - Retries w playwright.config.ts są wyłączone (0) – nie włączaj ich.
- Każda zarezerwowana konsultacja musi zostać anulowana – sprzątanie w teardown
  (fixture lub afterEach), tak żeby wykonało się także, gdy test padnie.
- Odporność na równoległą pracę innych:
  - nie zakładaj pustego ani stałego stanu (liczba rezerwacji, wolne terminy),
  - nie wybieraj „pierwszego wolnego terminu” na sztywno – terminy mogą znikać,
  - asercje odnoś do danych utworzonych przez dany test, nie do całej listy.

## Komendy

- Instalacja: `npm ci`
- Wszystkie testy: `npm test` (= `npx playwright test`)
- Plik z testami: `npx playwright test tests/e2e/j_nieznany_test.spec.ts`
- Raport: `npm run report`
- Lint: `npm run lint` (ESLint + eslint-plugin-playwright), `npm run lint:fix`
- Formatowanie: `npm run format` / `npm run format:check` (Prettier)
- Typy: `npm run typecheck`
- CI (.github/workflows/lint.yml): lint, format:check i typecheck na każdym pull_request.
- CI (.github/workflows/e2e.yml): testy e2e codziennie o 5:00 czasu polskiego (schedule,
  cron w UTC) oraz ręcznie (workflow_dispatch), jeden przebieg naraz; dane logowania z GitHub Secrets (SHARED_USER, SHARED_PASSWORD, OWN_USER,
  OWN_PASSWORD, NR_PESEL). Na CI trace jest wyłączony (zapisuje wartości z fill(), a raport
  jest pobieralnym artefaktem) – w raporcie są tylko screenshoty z błędów.

## Struktura

- tests/e2e/j_nieznany_test.spec.ts – wszystkie testy, pogrupowane w `test.describe`
  (login, prescription consultation, …)
- tests/e2e/pages/ – page objecty (LoginPage, HomePage, PrescriptionConsultationPage,
  RemoteConsultationPage, CookieBanner)
- tests/e2e/fixtures.ts – fixtures wstrzykujące page objecty i logowanie
- tests/e2e/env.ts – `accounts` (SHARED / OWN) czytane z process.env, czytelny błąd przy braku zmiennej
- tests/e2e/global-setup.ts, auth-paths.ts – czyszczenie playwright/.auth i znaczniki
  nieudanego logowania (per konto)

## Tagi

- `@smoke` – czy aplikacja w ogóle działa (strona logowania, panel pacjenta po zalogowaniu).
  Osobny projekt `smoke` w playwright.config.ts; na CI projekt `chromium` od niego zależy
  (padnie smoke → reszta pominięta). Smoke nie może zawierać testów `@lockout-risk`.
- `@lockout-risk` – błędne hasło na istniejącym koncie (patrz wyżej).
- `@known-bug` – test łapiący znany błąd aplikacji; ma prawo być czerwony do czasu poprawki.

## Testy

Przy pisaniu testów e2e stosuj @.claude/conventions/tests.md
Logowanie w testach (konta, fixture `loginAs`, sygnał gotowości): @.claude/conventions/test-login.md
Zanim zgłosisz, że praca jest skończona, uruchom skill verify-e2e
(.claude/skills/verify-e2e/SKILL.md) i pokaż jego raport.
Jeśli testy padną, napraw przyczynę, nie osłabiając asercji.

## Git

Branche, commity (Conventional Commits), push: @.claude/conventions/git.md

## Bezpieczeństwo

Sekrety, MCP, artefakty – obowiązkowo: @.claude/conventions/security.md

## Zasady ogólne

- Nie dodawaj nowych zależności bez pytania.
- Gdy coś w zadaniu jest niejasne, zapytaj, zamiast zgadywać.
- Język:
  - Rozmowa, plany, raporty, podsumowania – po polsku.
  - Kod po angielsku: nazwy zmiennych, funkcji, klas, plików, komentarze,
    tytuły testów (test('logs in with valid credentials')) i commity.
  - Teksty z interfejsu aplikacji zostają w oryginale (po polsku), np.
    getByRole('button', { name: 'Zaloguj' }) – nie tłumacz ich.
