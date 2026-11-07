public record InsightsDto(
    int PeriodWeeks,
    int TotalLogs,
    List<WeeklyAverageDto> Weekly,
    SleepMoodComparisonDto SleepMood,
    List<ActivityMoodDto> TopActivities,
    int CurrentStreakDays);

public record WeeklyAverageDto(
    int Year,
    int Week,
    DateTime WeekStart,
    double AvgMood,
    double AvgSleep,
    double AvgStress,
    int LogCount);

// Null betyder "för lite data" – frontend visar då ett meddelande i stället för ett tal.
public record SleepMoodComparisonDto(
    double SleepThresholdHours,
    double? AvgMoodLowSleep,
    int LowSleepCount,
    double? AvgMoodGoodSleep,
    int GoodSleepCount);

public record ActivityMoodDto(
    int ActivityId,
    string Name,
    double AvgMood,
    int TimesLogged);
