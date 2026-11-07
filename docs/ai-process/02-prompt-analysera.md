# AI-tillfälle 2 – Analysera och felsöka den förbättrade koden

**Verktyg:** Claude Code (Claude Opus 5.5)
**Kod som analyserades:** `InsightsService.cs`, `InsightsController.cs`, `InsightsCard.jsx` efter granskningen
(commit `1d331df` och `61e36bc`).

## Prompt

> Här är min InsightsService och InsightsController efter att jag har granskat och rättat det
> första AI-förslaget. Analysera koden kritiskt: finns det fortfarande buggar, särskilt med datum
> och tidszoner, säkerhetsproblem, prestandaproblem eller saker som inte går att översätta till SQL
> av EF Core? Föreslå konkreta förbättringar och motivera dem. Ändra inget än, lista bara.

## AI:ns svar (sammanfattning) och min bedömning

| # | AI:ns förslag eller fynd | Min bedömning | Beslut |
|---|---|---|---|
| 1 | **Tidszon:** `LogEntry.jsx` skickar `new Date().toISOString()`, alltså en UTC-tidsstämpel. En logg som skapas 00:30 svensk tid sparas som föregående dag, och servern räknar "idag" med `DateTime.UtcNow`. | Stämmer, jag kontrollerade i `LogEntry.jsx:88`. Det påverkar bara loggar mellan 00:00 och 01:00/02:00. Streaken tål det redan eftersom den räknas från igår om dagens logg saknas. En riktig lösning är att skicka lokalt datum (`yyyy-MM-dd`) från klienten, men det ändrar befintlig funktionalitet. | Dokumenteras som känd begränsning och vidareutveckling |
| 2 | **Prestanda:** båda frågorna filtrerar på `UserId` + `Date`, men det finns inget sammansatt index. När antalet loggar växer blir det fler läsningar. | Rimligt. Det följer också VG-kravet från förra uppgiften om index på en kolumn som används vid filtrering och sortering. | **Genomfört:** index `(UserId, Date)` + migration |
| 3 | **Tester saknas:** logiken för streak, veckor och tomma grupper har flera kantfall som är lätta att få fel igen. `today` skickas redan in som parameter, så servicen går att testa. | Håller med. Det var just kantfallen som var fel i v1. | **Genomfört:** xUnit-projekt med EF Core InMemory |
| 4 | **Cacha insikterna** med `IMemoryCache` för att slippa räkna om vid varje anrop. | **Avvisat.** Datamängden per användare är liten, så vinsten blir obetydlig. Cachen måste nyckelas per användare, annars riskerar man att visa en användares data för en annan, och den måste rensas vid varje ny eller ändrad logg. Det blir mer komplexitet och en ny säkerhetsrisk för nästan ingen nytta. | Avvisat |
| 5 | **Pearson-korrelation** mellan sömn och humör i stället för två snitt. | **Avvisat för nu.** Med få datapunkter blir koefficienten instabil och svår för en vanlig användare att tolka. Två snitt plus antal dagar är tydligare och ärligare. | Avvisat, möjlig vidareutveckling |
| 6 | **Flera loggar samma dag** räknas dubbelt i snitten, eftersom API:t tillåter flera loggar per datum. | Stämmer. Ett unikt index `(UserId, Date)` skulle lösa det, men migrationen kan misslyckas om produktionsdatabasen redan har dubbletter. Det behöver städas först. | Dokumenteras som vidareutveckling |
| 7 | `Take(366)` i streaken gör att den aldrig blir längre än 366 dagar. | Medvetet val för att begränsa frågan. Det påverkar i praktiken ingen. | Behålls, kommentar finns |

## Vad jag lärde mig av tillfälle 2
AI:n hittade ett verkligt problem (tidszon) som jag hade missat eftersom det ligger i en annan fil.
Men två av förslagen (cache och korrelation) hade gjort lösningen mer komplex utan verklig nytta,
och cachen hade dessutom kunnat bli en säkerhetsrisk. Därför behövde jag bedöma varje förslag för sig.
