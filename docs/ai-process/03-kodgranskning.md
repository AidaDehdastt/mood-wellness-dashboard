# Kodgranskning av AI-förslag v1 (commit 96c54c5)

Granskningen gjordes genom att läsa koden rad för rad och genom att köra v1 mot en lokal
SQL Server med riktiga anrop (curl) innan något ändrades.

| Område | Resultat för v1 | Åtgärd (commit) |
|---|---|---|
| Fungerar med resten av appen | **Nej.** En ny användare utan loggar fick **500** (`InvalidOperationException: Sequence contains no elements`), eftersom `Average()` anropades på en tom lista. Samma sak när användaren bara hade nätter över eller under 7 h. Frontend kraschade sedan på `.toFixed()`. | Nullbara värden + antal i `SleepMoodComparisonDto`, tomt läge i kortet (`1d331df`, `61e36bc`) |
| Arkitektur och ansvarsfördelning | Delvis. Logiken låg i en service (bra), men servicen returnerade `object` med anonyma typer. Det gav inget tydligt API-kontrakt och Swagger visade inget schema. Projektet har DTO-mapp och VG-kravet säger att DTO:er ska användas. | `InsightsDto` m.fl. i `DTOs/`, `ActionResult<InsightsDto>` + `ProducesResponseType` (`1d331df`) |
| Onödig eller duplicerad logik | Controllern kopierade claim-logiken från `DailyLogsController`. Streaken använde `logs.Any(...)` i en while-loop (O(n²)). Aktiviteter grupperades på namn i stället för id, så två aktiviteter med samma namn slogs ihop. | `User.GetUserId()`-extension som används i båda controllers, streak på unika datum, gruppering på id (`1d331df`) |
| Säker hantering av input och användardata | Filtret `d.UserId == userId` fanns och `[Authorize]` fanns ✔. Men **all** användarens data hämtades till minnet med `Include`, utan någon begränsning. | Projektion till bara behövda fält, period som standard 8 veckor, `weeks` valideras (1–52) → 400 annars (`1d331df`) |
| Secrets och känslig information | Inga secrets i koden ✔. Ingen ändring behövdes. | – |
| Fel och oväntade situationer | Backend: 500 vid tom data. Frontend: ingen `catch`, inget laddningsläge, kraschar på `null`. | Felmeddelande, laddning, tomt läge (`61e36bc`) |
| Korrekthet (extra) | `DayOfYear / 7` som veckonyckel blandade år (1 jan 2025 och 1 jan 2026 fick samma nyckel) och veckorna började inte på måndag. Streaken blev 0 om man inte hade loggat *idag* än. En aktivitet med en enda loggning kunde hamna som "bäst". | ISO-veckor med `ISOWeek`, streak räknas från igår, minst 2 loggningar per aktivitet (`1d331df`) |

## Verifiering
- `curl` mot lokal SQL Server före och efter: ny användare 500 → 200, utan token 401, `weeks=0/100` → 400.
- 7 enhetstester i `server/WellnessDashboard.Tests` (`ba3c56b`), bl.a. att andra användares loggar aldrig räknas med.
- Kontroll i webbläsaren att kortet visar rätt värden för testdata (`insikter-dashboard.jpg`).
