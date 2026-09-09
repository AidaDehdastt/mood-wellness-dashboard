using System.ComponentModel.DataAnnotations;

public class CreateDailyLogDto
{
    [Required]
    public DateTime Date { get; set; }

    [Range(1, 10)]
    public int MoodScore { get; set; }

    [Range(1, 10)]
    public int StressLevel { get; set; }

    [Range(0, 24)]
    public double SleepHours { get; set; }

    [MaxLength(500)]
    public string? Notes { get; set; }

    public List<ActivityLogDto> Activities { get; set; } = new();
}

public class ActivityLogDto
{
    [Required]
    public int ActivityId { get; set; }

    [Range(1, 1440)]
    public int DurationMinutes { get; set; }
}