using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options) { }

    public DbSet<DailyLog> DailyLogs { get; set; }
    public DbSet<Activity> Activities { get; set; }
    public DbSet<ActivityLog> ActivityLogs { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<ActivityLog>()
            .HasOne(al => al.DailyLog)
            .WithMany(dl => dl.ActivityLogs)
            .HasForeignKey(al => al.DailyLogId);

        builder.Entity<ActivityLog>()
            .HasOne(al => al.Activity)
            .WithMany(a => a.ActivityLogs)
            .HasForeignKey(al => al.ActivityId);

        builder.Entity<DailyLog>()
            .HasOne(dl => dl.User)
            .WithMany(u => u.DailyLogs)
            .HasForeignKey(dl => dl.UserId);
    }
}