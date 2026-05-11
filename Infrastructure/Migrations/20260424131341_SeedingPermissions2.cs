using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SeedingPermissions2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "PermissionUser",
                columns: new[] { "UsersId", "permissionsId" },
                values: new object[,]
                {
                    { 3, 1 },
                    { 3, 2 },
                    { 3, 3 }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "PermissionUser",
                keyColumns: new[] { "UsersId", "permissionsId" },
                keyValues: new object[] { 3, 1 });

            migrationBuilder.DeleteData(
                table: "PermissionUser",
                keyColumns: new[] { "UsersId", "permissionsId" },
                keyValues: new object[] { 3, 2 });

            migrationBuilder.DeleteData(
                table: "PermissionUser",
                keyColumns: new[] { "UsersId", "permissionsId" },
                keyValues: new object[] { 3, 3 });
        }
    }
}
