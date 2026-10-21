# Logowanie w testach

- Domyślnie każdy test loguje się sam na konto SHARED (fixture `page`, opcja `loginAs: 'shared'`).
  Testy logowania wyłączają to przez `test.use({ loginAs: null })` i startują z pustym stanem.
  Testy na własnym koncie kandydata: `test.use({ loginAs: 'own' })` – fixture wybiera konto
  po PESEL w dialogu „Wybierz konto” (mail OWN jest powiązany z dwoma kontami).
- Dialog „Wybierz konto” potrafi pokazać się razem z komunikatem o blokadzie (prawdopodobnie
  dotyczy drugiego konta na tym samym mailu) – fixture wtedy i tak wybiera konto po PESEL.
- Nie używamy storageState per worker: aplikacja renderuje „Menu główne” jeszcze w trakcie
  ładowania sesji, a zapisany/odtworzony stan zawieszał stronę na spinnerze.
- Sygnał gotowości po zalogowaniu: aktywny przycisk „Umów się” (`toBeEnabled()`),
  nie samo „Menu główne”.
- Gdy logowanie się nie powiedzie, fixture zapisuje znacznik
  `playwright/.auth/<shared|own>-login-failed` i kolejne testy w tym uruchomieniu nie próbują
  ponownie (ochrona przed blokadą konta). globalSetup czyści znaczniki na starcie.
- Znany problem aplikacji: sporadycznie `GET /api/v2/patients/{id}` kończy się bez odpowiedzi
  i panel pacjenta wisi na spinnerze – test pada na `toBeEnabled()`. Nie obchodzimy tego
  (reload, dłuższe timeouty) – to błąd do raportu.
