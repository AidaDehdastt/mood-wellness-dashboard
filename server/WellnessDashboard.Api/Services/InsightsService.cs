using System.Globalization;
using Microsoft.EntityFrameworkCore;

public class InsightsService
{
    public const int MinWeeks = 1;
    public const int MaxWeeks = 52;
    private const double SleepThresholdHours = 7;
    // En aktivitet måste vara loggad minst så här många gånger för att räknas,
    // annars kan en enda bra dag göra en aktivitet till "bäst".
    private const int MinActivitySamples = 2;
    private const int TopActivityCount = 3;

    private readonly ApplicationDbContext _context;
    public InsightsService(ApplicationDbContext context) => _context = context;

    public async Task<InsightsDto> GetInsightsAsync(string userId, int weeks, DateTime today)
    {
        var from = today.Date.AddDays(-7 * weeks + 1);

        // Hämta bara användarens loggar inom perioden och bara de fält som behövs.
        var logs = await _context.DailyLogs
            .AsNoTracking()
            .Where(d => d.UserId == userId && d.Date >= from && d.Date < today.Date.AddDays(1))
            .Select(d => new LogRow(
                d.Date.Date,
                d.MoodScore,
                d.StressLevel,
                d.SleepHours,
                d.ActivityLogs.Select(al => new ActivityRow(al.ActivityId, al.Activity!.Name)).ToList()))
            .ToListAsync();

        return new InsightsDto(
            weeks,
            logs.Count,
            GetWeeklyAverages(logs),
            CompareSleepAndMood(logs),
            GetTopActivities(logs),
            await GetCurrentStreakAsync(userId, today.Date));
    }

    private static List<WeeklyAverageDto> GetWeeklyAverages(List<LogRow> logs) =>
        logs
            .GroupBy(l => (Year: ISOWeek.GetYear(l.Date), Week: ISOWeek.GetWeekOfYear(l.Date)))
            .OrderBy(g => g.Key.Year).ThenBy(g => g.Key.Week)
            .Select(g => new WeeklyAverageDto(
                g.Key.Year,
                g.Key.Week,
                ISOWeek.ToDateTime(g.Key.Year, g.Key.Week, DayOfWeek.Monday),
                Round(g.Average(l => l.MoodScore)),
                Round(g.Average(l => l.SleepHours)),
                Round(g.Average(l => l.StressLevel)),
                g.Count()))
            .ToList();

    private static SleepMoodComparisonDto CompareSleepAndMood(List<LogRow> logs)
    {
        var low = logs.Where(l => l.SleepHours < SleepThresholdHours).ToList();
        var good = logs.Where(l => l.SleepHours >= SleepThresholdHours).ToList();

        return new SleepMoodComparisonDto(
            SleepThresholdHours,
            low.Count > 0 ? Round(low.Average(l => l.MoodScore)) : null,
            low.Count,
            good.Count > 0 ? Round(good.Average(l => l.MoodScore)) : null,
            good.Count);
    }

    private static List<ActivityMoodDto> GetTopActivities(List<LogRow> logs) =>
        logs
            .SelectMany(l => l.Activities.Select(a => new { a.Id, a.Name, l.MoodScore }))
            .GroupBy(x => new { x.Id, x.Name })
            .Where(g => g.Count() >= MinActivitySamples)
            .Select(g => new ActivityMoodDto(g.Key.Id, g.Key.Name, Round(g.Average(x => x.MoodScore)), g.Count()))
            .OrderByDescending(a => a.AvgMood).ThenByDescending(a => a.TimesLogged)
            .Take(TopActivityCount)
            .ToList();

    // Streaken räknas oberoende av vald period, så att den inte bryts av att perioden är kort.
    // Om användaren inte har loggat idag än räknas streaken från igår.
    private async Task<int> GetCurrentStreakAsync(string userId, DateTime today)
    {
        var dates = await _context.DailyLogs
            .AsNoTracking()
            .Where(d => d.UserId == userId && d.Date < today.AddDays(1))
            .Select(d => d.Date.Date)
            .Distinct()
            .OrderByDescending(d => d)
            .Take(366)
            .ToListAsync();

        if (dates.Count == 0) return 0;

        var expected = dates[0] == today ? today : today.AddDays(-1);
        var streak = 0;
        foreach (var date in dates)
        {
            if (date != expected) break;
            streak++;
            expected = expected.AddDays(-1);
        }
        return streak;
    }

    private static double Round(double value) => Math.Round(value, 1);

    private record ActivityRow(int Id, string Name);
    private record LogRow(DateTime Date, int MoodScore, int StressLevel, double SleepHours, List<ActivityRow> Activities);
}
