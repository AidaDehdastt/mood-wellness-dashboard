using Microsoft.AspNetCore.Identity;

public class ApplicationUser : IdentityUser
{
    public ICollection<DailyLog> DailyLogs { get; set; } = new List<DailyLog>();
}