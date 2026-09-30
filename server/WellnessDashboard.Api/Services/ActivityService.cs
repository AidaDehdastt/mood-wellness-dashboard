using Microsoft.EntityFrameworkCore;

public class ActivityService
{
    private readonly ApplicationDbContext _context;
    public ActivityService(ApplicationDbContext context) => _context = context;

    public async Task<List<Activity>> GetAllAsync() =>
        await _context.Activities.OrderBy(a => a.Name).ToListAsync();

    public async Task<Activity> CreateAsync(CreateActivityDto dto)
    {
        var activity = new Activity { Name = dto.Name, Category = dto.Category };
        _context.Activities.Add(activity);
        await _context.SaveChangesAsync();
        return activity;
    }

    public async Task<(bool success, string? error)> DeleteAsync(int id)
    {
        var activity = await _context.Activities.FindAsync(id);
        if (activity is null) return (false, "not_found");

        var isInUse = await _context.ActivityLogs.AnyAsync(al => al.ActivityId == id);
        if (isInUse) return (false, "in_use");

        _context.Activities.Remove(activity);
        await _context.SaveChangesAsync();
        return (true, null);
    }
}