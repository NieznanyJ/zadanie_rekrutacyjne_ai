# Konwencje testów e2e (Playwright)

## Page Object Model

- Każda strona/większy komponent ma klasę w tests/e2e/pages/ (np. LoginPage.ts).
- Lokatory definiuj w page objectach jako readonly pola w konstruktorze – nie w testach.
- Metody page objectu opisują akcje użytkownika (login(user, pass), openSettings()),
  nie pojedyncze kliknięcia.
- Asercje zostają w testach, nie w page objectach – test ma czytelnie pokazywać, co sprawdza.
- Page objecty wstrzykuj przez fixtures Playwrighta (tests/e2e/fixtures.ts),
  zamiast tworzyć je ręcznie w każdym teście.
- Nie twórz page objectu na zapas – tylko dla stron faktycznie używanych w testach.

## Lokatory, w tej kolejności

1. getByRole (z name), np. getByRole('button', { name: 'Zapisz' })
2. getByLabel – pola formularzy
3. getByText – treść bez roli
4. getByTestId – tylko gdy nic powyżej nie działa; opisz dlaczego w komentarzu

Zakazane: selektory CSS/XPath, nth() bez uzasadnienia, waitForTimeout.

## Asercje

Tylko web-first: await expect(locator).toBeVisible() / toHaveText() / toHaveURL().

## Flakyness

- Przy niestabilnym teście nie zwiększaj timeoutów – ani globalnych (playwright.config.ts),
  ani pojedynczych (test.setTimeout, { timeout } w asercjach i akcjach).
  Dłuższy timeout ukrywa przyczynę i spowalnia całą suitę.
- Nie zwiększaj retries i nie dodawaj test.skip / test.fixme, żeby „uciszyć” flaky test.
- Szukaj przyczyny, najczęściej to:
  - asercja przed zakończeniem akcji (brak await, brak czekania na stan strony),
  - lokator pasujący do kilku elementów lub do elementu, który się przerenderowuje,
  - zależność między testami (wspólne dane, kolejność, sesja),
  - czekanie na stały czas zamiast na stan (waitForTimeout).
- Czekaj na stan, nie na czas: web-first asercje, waitForURL, waitForResponse
  dla konkretnego requestu.
- Diagnozuj przez trace: `npx playwright test <plik> --repeat-each=3 --trace=on`,
  potem `npx playwright show-trace`.
- Jeśli przyczyna leży po stronie aplikacji (np. wolne API live) i nie da się jej
  rozwiązać w teście – nie obchodź jej, tylko opisz problem i zgłoś mi go.

## Proces

- Zanim napiszesz test, otwórz stronę przez Playwright MCP i dobierz lokatory ze snapshotu dostępności.
- Jeśli element nie ma sensownej roli ani nazwy, zgłoś to jako problem z dostępnością, zamiast obchodzić go testId.
- Nie osłabiaj ani nie usuwaj asercji, żeby test przeszedł.
