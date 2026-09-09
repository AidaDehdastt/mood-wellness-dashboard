public class ActivityLog
{
    public int Id { get; set; }
    public int DurationMinutes { get; set; }

    public int DailyLogId { get; set; }
    public DailyLog? DailyLog { get; set; }

    public int ActivityId { get; set; }
    public Activity? Activity { get; set; }
}