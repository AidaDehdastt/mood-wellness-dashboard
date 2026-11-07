using Microsoft.EntityFrameworkCore;

public class InsightsService
{
    private readonly ApplicationDbContext _context;
    public InsightsService(ApplicationDbContext context) => _context = context;

    public async Task<object> GetInsightsAsync(string userId)
    {
        var logs = await _context.DailyLogs
            .Include(d => d.ActivityLogs).ThenInclude(al => al.Activity)
            .Where(d => d.UserId == userId)
            .ToListAsync();

        // Snitt per vecka
        var weekly = logs
            .GroupBy(l => l.Date.DayOfYear / 7)
            .Select(g => new
            {
                Week = g.Key,
                AvgMood = g.Average(l => l.MoodScore),
                AvgSleep = g.Average(l => l.SleepHours),
                AvgStress = g.Average(l => l.StressLevel)
            })
            .OrderBy(w => w.Week)
            .ToList();

        // Sömn vs humör
        var lowSleep = logs.Where(l => l.SleepHours < 7).ToList();
        var goodSleep = logs.Where(l => l.SleepHours >= 7).ToList();
        var avgMoodLowSleep = lowSleep.Average(l => l.MoodScore);
        var avgMoodGoodSleep = goodSleep.Average(l => l.MoodScore);

        // Aktiviteter med högst humör
        var topActivities = logs
            .SelectMany(l => l.ActivityLogs.Select(al => new { al.Activity!.Name, l.MoodScore }))
            .GroupBy(x => x.Name)
            .Select(g => new { Activity = g.Key, AvgMood = g.Average(x => x.MoodScore) })
            .OrderByDescending(x => x.AvgMood)
            .Take(3)
            .ToList();

        // Streak
        var streak = 0;
        var day = DateTime.Today;
        while (logs.Any(l => l.Date.Date == day))
        {
            streak++;
            day = day.AddDays(-1);
        }

        return new
        {
            weekly,
            avgMoodLowSleep,
            avgMoodGoodSleep,
            topActivities,
            streak
        };
    }
}
