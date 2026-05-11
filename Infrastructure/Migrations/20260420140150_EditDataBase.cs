using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class EditDataBase : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Events_EventOrganizers_EventOrganizerId",
                table: "Events");

            migrationBuilder.DropForeignKey(
                name: "FK_Tickets_Participiants_Participiantid",
                table: "Tickets");

            migrationBuilder.DropTable(
                name: "EventOrganizers");

            migrationBuilder.DropTable(
                name: "Participiants");

            migrationBuilder.DropIndex(
                name: "IX_Tickets_Participiantid",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "Participiantid",
                table: "Tickets");

            migrationBuilder.RenameColumn(
                name: "EventOrganizerId",
                table: "Events",
                newName: "UserId");

            migrationBuilder.RenameIndex(
                name: "IX_Events_EventOrganizerId",
                table: "Events",
                newName: "IX_Events_UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Events_Users_UserId",
                table: "Events",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Events_Users_UserId",
                table: "Events");

            migrationBuilder.RenameColumn(
                name: "UserId",
                table: "Events",
                newName: "EventOrganizerId");

            migrationBuilder.RenameIndex(
                name: "IX_Events_UserId",
                table: "Events",
                newName: "IX_Events_EventOrganizerId");

            migrationBuilder.AddColumn<int>(
                name: "Participiantid",
                table: "Tickets",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "EventOrganizers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EventOrganizers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EventOrganizers_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Participiants",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    userId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Participiants", x => x.id);
                    table.ForeignKey(
                        name: "FK_Participiants_Users_userId",
                        column: x => x.userId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Tickets_Participiantid",
                table: "Tickets",
                column: "Participiantid");

            migrationBuilder.CreateIndex(
                name: "IX_EventOrganizers_UserId",
                table: "EventOrganizers",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Participiants_userId",
                table: "Participiants",
                column: "userId");

            migrationBuilder.AddForeignKey(
                name: "FK_Events_EventOrganizers_EventOrganizerId",
                table: "Events",
                column: "EventOrganizerId",
                principalTable: "EventOrganizers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Tickets_Participiants_Participiantid",
                table: "Tickets",
                column: "Participiantid",
                principalTable: "Participiants",
                principalColumn: "id");
        }
    }
}
