using System.Security.Claims;

public static class ClaimsPrincipalExtensions
{
    // [Authorize] garanterar att claimet finns; saknas det ändå är token felaktig.
    public static string GetUserId(this ClaimsPrincipal user) =>
        user.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? throw new UnauthorizedAccessException("Token saknar användar-id.");
}
