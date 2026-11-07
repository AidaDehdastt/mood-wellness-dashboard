# AI-tillfälle 1 – Generera kod

**Verktyg:** Claude Code (modell Claude Opus 5.5), körs i Claude-appen med tillgång till repot.
**Datum:** 2026-11-07

## Prompt

> Jag har en ASP.NET Core 8 Web API med EF Core (entiteterna DailyLog, Activity och ActivityLog)
> och en React-frontend med MUI och Recharts. Jag vill lägga till en insiktsfunktion som hjälper
> användaren att hitta samband i sin data. Skapa:
> 1. En service som räknar ut snitt för humör, sömn och stress per vecka, jämför humöret efter
>    nätter med mindre än 7 timmars sömn mot 7 timmar eller mer, visar vilka aktiviteter som hänger
>    ihop med högst humör, och räknar hur många dagar i rad användaren har loggat.
> 2. En controller med endpointen GET /api/insights.
> 3. Ett React-kort på Dashboard som visar insikterna.

## AI:ns svar (sammanfattning)

AI:n skapade följande filer (se commit "AI-förslag v1"):
- `Services/InsightsService.cs`
- `Controllers/InsightsController.cs`
- `client/src/api/insights.js`
- `client/src/components/InsightsCard.jsx` + rendering i `Dashboard.jsx`
- registrering av servicen i `Program.cs`

Koden committades **oförändrad** så att den ursprungliga versionen finns kvar i git-historiken
innan granskningen.
