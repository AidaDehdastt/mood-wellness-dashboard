using Microsoft.EntityFrameworkCore;

public class ActivityService
{
    private readonly ApplicationDbContext _context;
    public ActivityService(ApplicationDbContext context) => _context = context;

    public async Task<List<Activity>> GetAllAsync(string userId) =>
        await _context.Activities
            .Where(a => a.UserId == userId || a.UserId == null)
            .OrderBy(a => a.Name)
            .ToListAsync();

    public async Task<Activity> CreateAsync(string userId, CreateActivityDto dto)
    {
        var activity = new Activity { Name = dto.Name, Category = dto.Category, UserId = userId };
        _context.Activities.Add(activity);
        await _context.SaveChangesAsync();
        return activity;
    }

    public async Task<(bool success, string? error)> DeleteAsync(string userId, int id)
    {
        var activity = await _context.Activities.FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);
        if (activity is null) return (false, "not_found");

        var isInUse = await _context.ActivityLogs.AnyAsync(al => al.ActivityId == id);
        if (isInUse) return (false, "in_use");

        _context.Activities.Remove(activity);
        await _context.SaveChangesAsync();
        return (true, null);
    }
}