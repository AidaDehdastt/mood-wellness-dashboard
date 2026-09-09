public class Activity
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;

    public ICollection<ActivityLog> ActivityLogs { get; set; } = new List<ActivityLog>();
}