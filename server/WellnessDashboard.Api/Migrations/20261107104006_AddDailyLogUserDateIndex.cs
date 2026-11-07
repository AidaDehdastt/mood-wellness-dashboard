using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WellnessDashboard.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddDailyLogUserDateIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_DailyLogs_UserId",
                table: "DailyLogs");

            migrationBuilder.CreateIndex(
                name: "IX_DailyLogs_UserId_Date",
                table: "DailyLogs",
                columns: new[] { "UserId", "Date" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_DailyLogs_UserId_Date",
                table: "DailyLogs");

            migrationBuilder.CreateIndex(
                name: "IX_DailyLogs_UserId",
                table: "DailyLogs",
                column: "UserId");
        }
    }
}
