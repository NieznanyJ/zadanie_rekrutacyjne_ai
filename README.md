# Testy e2e – platforma pacjenta Telemedi

Playwright + TypeScript. Wymagany Node.js 20.12+.

## Uruchomienie lokalne

```bash
git clone https://github.com/NieznanyJ/zadanie_rekrutacyjne_ai.git
cd zadanie_rekrutacyjne_ai
npm run setup          # zależności + przeglądarka Chromium
cp .env.example .env   # uzupełnij dane kont
npm test               # raport: npm run report
```

## Dane kont – jedno miejsce: plik `.env`

- `SHARED_USER`, `SHARED_PASSWORD` – konto wspólne (logowanie, recepta).
- `OWN_USER`, `OWN_PASSWORD`, `NR_PESEL` – własne konto (błędne hasło, wybór konta po PESEL, Wizyta zdalna).

Na CI te same nazwy są czytane z GitHub Secrets (`.github/workflows/e2e.yml`, codziennie o 5:00 i ręcznie).
Na CI najpierw lecą testy `@smoke` (czy aplikacja działa); gdy padną, reszta jest pomijana.

## Testy, które mają prawo failować

- `@known-bug` – łapią znane błędy aplikacji i są czerwone do czasu poprawki:
  literówki w zgodzie przy recepcie, BUG-01 (pusta lista specjalizacji na koncie OWN).
  Pominięcie: `npx playwright test --grep-invert @known-bug`.
- `@lockout-risk` – jedna błędna próba hasła na koncie OWN (5 prób blokuje konto na 5 minut).
  Nie uruchamiaj wielokrotnie; pominięcie: `--grep-invert @lockout-risk`.

Środowisko jest współdzielone: sporadyczne zawieszenie panelu pacjenta po zalogowaniu
to znany błąd aplikacji, nie testów.
