# Git

- Pracuj na osobnym branchu (feature/<opis>), nigdy bezpośrednio na main
  (wyjątek: początkowy setup projektu, już zacommitowany na main).
- Nie wykonuj git push – robi to człowiek po przeglądzie zmian.
- Commity według Conventional Commits: `<typ>: <opis w trybie rozkazującym>`
  - feat – nowa funkcjonalność
  - fix – poprawka błędu
  - test – dodanie lub zmiana testów
  - refactor – zmiana kodu bez zmiany zachowania
  - chore – konfiguracja, zależności, porządki
  - docs – dokumentacja
  - ci – pipeline CI
- Jeden commit = jedna logiczna zmiana.
- Przykład: `test: add e2e tests for login flow`
