using Microsoft.EntityFrameworkCore;

public class DailyLogService
{
    private readonly ApplicationDbContext _context;
    public DailyLogService(ApplicationDbContext context) => _context = context;

    public async Task<List<DailyLog>> GetForUserAsync(string userId) =>
        await _context.DailyLogs
            .Include(d => d.ActivityLogs).ThenInclude(al => al.Activity)
            .Where(d => d.UserId == userId)
            .OrderBy(d => d.Date)
            .ToListAsync();

    public async Task<DailyLog?> GetByIdAsync(string userId, int id) =>
        await _context.DailyLogs
            .Include(d => d.ActivityLogs).ThenInclude(al => al.Activity)
            .FirstOrDefaultAsync(d => d.Id == id && d.UserId == userId);

    public async Task<DailyLog> CreateAsync(string userId, CreateDailyLogDto dto)
    {
        var log = new DailyLog
        {
            UserId = userId,
            Date = dto.Date,
            MoodScore = dto.MoodScore,
            StressLevel = dto.StressLevel,
            SleepHours = dto.SleepHours,
            Notes = dto.Notes,
            ActivityLogs = dto.Activities.Select(a => new ActivityLog
            {
                ActivityId = a.ActivityId,
                DurationMinutes = a.DurationMinutes
            }).ToList()
        };

        _context.DailyLogs.Add(log);
        await _context.SaveChangesAsync();
        return log;
    }

    public async Task<bool> UpdateAsync(string userId, int id, CreateDailyLogDto dto)
    {
        var log = await _context.DailyLogs
            .Include(d => d.ActivityLogs)
            .FirstOrDefaultAsync(d => d.Id == id && d.UserId == userId);

        if (log is null) return false; 

        log.Date = dto.Date;
        log.MoodScore = dto.MoodScore;
        log.StressLevel = dto.StressLevel;
        log.SleepHours = dto.SleepHours;
        log.Notes = dto.Notes;

        _context.ActivityLogs.RemoveRange(log.ActivityLogs);
        log.ActivityLogs = dto.Activities.Select(a => new ActivityLog
        {
            ActivityId = a.ActivityId,
            DurationMinutes = a.DurationMinutes
        }).ToList();

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(string userId, int id)
    {
        var log = await _context.DailyLogs.FirstOrDefaultAsync(d => d.Id == id && d.UserId == userId);
        if (log is null) return false;

        _context.DailyLogs.Remove(log);
        await _context.SaveChangesAsync();
        return true;
    }
}