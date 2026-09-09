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
}