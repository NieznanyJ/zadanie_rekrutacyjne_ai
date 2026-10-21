---
name: verify-e2e
description: Weryfikacja zmian w testach e2e, page objectach lub konfiguracji Playwrighta. Użyj zawsze po zakończeniu zmian w tests/ albo playwright.config.ts, zanim zgłosisz, że praca jest skończona.
---

Wykonaj wszystkie kroki, nawet jeśli wynik wydaje się oczywisty.

1. Uruchom zmienione testy: `npx playwright test <zmienione pliki> --grep-invert @lockout-risk`.
   Potem całą suitę: `npx playwright test`. Zapisz wynik (liczba passed/failed/flaky).
   Testy z tagiem @lockout-risk (błędne hasło na istniejącym koncie) mają się wykonać
   tylko raz w ramach weryfikacji – nigdy z --repeat-each ani w pętli.

2. Przeczytaj diff: `git diff main...HEAD` oraz `git diff` (niezacommitowane).

3. Sprawdź, czy żaden test nie został osłabiony:
   - usunięte lub zakomentowane asercje,
   - asercje zamienione na słabsze (np. toHaveText → toBeVisible, dokładna wartość → toContain),
   - dodane test.skip, test.fixme, test.only,
   - zwiększone timeouty lub retries bez uzasadnienia,
   - usunięte całe testy lub scenariusze.

4. Sprawdź zgodność z @.claude/conventions/tests.md:
   - lokatory (getByRole na pierwszym miejscu, brak CSS/XPath, brak waitForTimeout),
   - lokatory w page objectach, asercje w testach.

5. Sprawdź bezpieczeństwo: brak haseł, tokenów i danych z .env w diffie.

6. Raport w formacie:
   **Wynik: PASS / FAIL**
   - Testy: X passed, Y failed, Z flaky
   - Osłabione testy: brak / lista z linią i opisem zmiany
   - Naruszenia konwencji: brak / lista
   - Bezpieczeństwo: OK / lista

   Każdy punkt FAIL poprzyj fragmentem diffu lub logu.

Nie poprawiaj niczego w ramach tej weryfikacji – tylko raportuj.
