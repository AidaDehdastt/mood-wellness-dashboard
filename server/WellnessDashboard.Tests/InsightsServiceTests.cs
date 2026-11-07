using Microsoft.EntityFrameworkCore;

public class InsightsServiceTests
{
    private static readonly DateTime Today = new(2026, 11, 7);
    private const string UserA = "user-a";
    private const string UserB = "user-b";

    private static ApplicationDbContext CreateContext() =>
        new(new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options);

    private static DailyLog Log(string userId, DateTime date, int mood, double sleep, params Activity[] activities) => new()
    {
        UserId = userId,
        Date = date,
        MoodScore = mood,
        StressLevel = 5,
        SleepHours = sleep,
        ActivityLogs = activities.Select(a => new ActivityLog { Activity = a, DurationMinutes = 30 }).ToList()
    };

    [Fact]
    public async Task NewUserWithoutLogs_ReturnsEmptyInsightsInsteadOfThrowing()
    {
        using var context = CreateContext();
        var result = await new InsightsService(context).GetInsightsAsync(UserA, 8, Today);

        Assert.Equal(0, result.TotalLogs);
        Assert.Empty(result.Weekly);
        Assert.Null(result.SleepMood.AvgMoodLowSleep);
        Assert.Null(result.SleepMood.AvgMoodGoodSleep);
        Assert.Equal(0, result.CurrentStreakDays);
    }

    [Fact]
    public async Task OnlyGoodSleep_LowSleepGroupIsNull()
    {
        using var context = CreateContext();
        context.DailyLogs.Add(Log(UserA, Today, 8, 8));
        await context.SaveChangesAsync();

        var result = await new InsightsService(context).GetInsightsAsync(UserA, 8, Today);

        Assert.Null(result.SleepMood.AvgMoodLowSleep);
        Assert.Equal(8, result.SleepMood.AvgMoodGoodSleep);
    }

    [Fact]
    public async Task OtherUsersLogs_AreNeverIncluded()
    {
        using var context = CreateContext();
        context.DailyLogs.AddRange(Log(UserA, Today, 2, 4), Log(UserB, Today, 10, 9));
        await context.SaveChangesAsync();

        var result = await new InsightsService(context).GetInsightsAsync(UserA, 8, Today);

        Assert.Equal(1, result.TotalLogs);
        Assert.Equal(2, result.SleepMood.AvgMoodLowSleep);
        Assert.Null(result.SleepMood.AvgMoodGoodSleep);
    }

    [Fact]
    public async Task Weeks_AreIsoWeeksAndDoNotMixYears()
    {
        using var context = CreateContext();
        // 2025-12-29 (måndag) och 2026-01-01 ligger i samma ISO-vecka 2026-W01.
        // 2025-01-01 har samma DayOfYear/7 som 2026-01-01, vilket v1 felaktigt slog ihop.
        context.DailyLogs.AddRange(
            Log(UserA, new DateTime(2025, 1, 1), 2, 6),
            Log(UserA, new DateTime(2025, 12, 29), 6, 7),
            Log(UserA, new DateTime(2026, 1, 1), 8, 8));
        await context.SaveChangesAsync();

        var result = await new InsightsService(context).GetInsightsAsync(UserA, 52, new DateTime(2026, 1, 4));

        var week = Assert.Single(result.Weekly);
        Assert.Equal((2026, 1), (week.Year, week.Week));
        Assert.Equal(new DateTime(2025, 12, 29), week.WeekStart);
        Assert.Equal(7, week.AvgMood);
        Assert.Equal(2, week.LogCount);
    }

    [Fact]
    public async Task Streak_CountsFromYesterdayWhenTodayIsNotLoggedYet()
    {
        using var context = CreateContext();
        context.DailyLogs.AddRange(
            Log(UserA, Today.AddDays(-1), 7, 7),
            Log(UserA, Today.AddDays(-2).AddHours(21), 7, 7), // tid på dagen ska inte spela roll
            Log(UserA, Today.AddDays(-2), 6, 6),              // dubblett samma dag räknas en gång
            Log(UserA, Today.AddDays(-4), 7, 7));             // lucka -> bryter streaken
        await context.SaveChangesAsync();

        var result = await new InsightsService(context).GetInsightsAsync(UserA, 8, Today);

        Assert.Equal(2, result.CurrentStreakDays);
    }

    [Fact]
    public async Task TopActivities_RequireAtLeastTwoSamples()
    {
        using var context = CreateContext();
        var walk = new Activity { Name = "Promenad", Category = "Motion" };
        var yoga = new Activity { Name = "Yoga", Category = "Motion" };
        context.DailyLogs.AddRange(
            Log(UserA, Today, 10, 8, yoga),          // bara en gång -> ska inte visas
            Log(UserA, Today.AddDays(-1), 7, 8, walk),
            Log(UserA, Today.AddDays(-2), 8, 8, walk));
        await context.SaveChangesAsync();

        var result = await new InsightsService(context).GetInsightsAsync(UserA, 8, Today);

        var top = Assert.Single(result.TopActivities);
        Assert.Equal("Promenad", top.Name);
        Assert.Equal(7.5, top.AvgMood);
        Assert.Equal(2, top.TimesLogged);
    }

    [Fact]
    public async Task LogsOutsidePeriod_AreExcluded()
    {
        using var context = CreateContext();
        context.DailyLogs.AddRange(
            Log(UserA, Today.AddDays(-6), 5, 7),   // inom 1 vecka
            Log(UserA, Today.AddDays(-7), 9, 7),   // utanför 1 vecka
            Log(UserA, Today.AddDays(1), 9, 7));   // framtida datum
        await context.SaveChangesAsync();

        var result = await new InsightsService(context).GetInsightsAsync(UserA, 1, Today);

        Assert.Equal(1, result.TotalLogs);
        Assert.Equal(5, result.SleepMood.AvgMoodGoodSleep);
    }
}
