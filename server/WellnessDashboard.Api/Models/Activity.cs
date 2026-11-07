public class Activity
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;

    // null = standardaktivitet som alla ser. Annars ägs aktiviteten av en användare.
    public string? UserId { get; set; }
    public ApplicationUser? User { get; set; }

    public ICollection<ActivityLog> ActivityLogs { get; set; } = new List<ActivityLog>();
}