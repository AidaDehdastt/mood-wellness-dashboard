using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class InsightsController : ControllerBase
{
    private readonly InsightsService _service;
    public InsightsController(InsightsService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        return Ok(await _service.GetInsightsAsync(userId));
    }
}
