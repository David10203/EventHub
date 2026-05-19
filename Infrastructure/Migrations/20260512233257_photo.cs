using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class photo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ImageContentType",
                table: "Events");

            migrationBuilder.RenameColumn(
                name: "ImageData",
                table: "Events",
                newName: "Image");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Image",
                table: "Events",
                newName: "ImageData");

            migrationBuilder.AddColumn<string>(
                name: "ImageContentType",
                table: "Events",
                type: "nvarchar(max)",
                nullable: true);
        }
    }
}
