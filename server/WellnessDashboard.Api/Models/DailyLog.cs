public class DailyLog
{
    public int Id { get; set; }
    public DateTime Date { get; set; }
    public int MoodScore { get; set; }      
    public int StressLevel { get; set; }    
    public double SleepHours { get; set; }
    public string? Notes { get; set; }

    public string UserId { get; set; } = string.Empty;
    public ApplicationUser? User { get; set; }

    public ICollection<ActivityLog> ActivityLogs { get; set; } = new List<ActivityLog>();
}