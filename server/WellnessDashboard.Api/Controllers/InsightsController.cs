using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class InsightsController : ControllerBase
{
    private readonly InsightsService _service;
    public InsightsController(InsightsService service) => _service = service;

    // GET /api/insights?weeks=8
    [HttpGet]
    [ProducesResponseType(typeof(InsightsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<InsightsDto>> Get([FromQuery] int weeks = 8)
    {
        if (weeks < InsightsService.MinWeeks || weeks > InsightsService.MaxWeeks)
            return BadRequest($"weeks måste vara mellan {InsightsService.MinWeeks} och {InsightsService.MaxWeeks}.");

        return Ok(await _service.GetInsightsAsync(User.GetUserId(), weeks, DateTime.UtcNow));
    }
}
