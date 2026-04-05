using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HibaVonal_03.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreatev2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Name",
                table: "Premises");

            migrationBuilder.DropColumn(
                name: "RoomNumber",
                table: "Premises");

            migrationBuilder.AddColumn<string>(
                name: "NameOrNumber",
                table: "Premises",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "NameOrNumber",
                table: "Premises");

            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "Premises",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "RoomNumber",
                table: "Premises",
                type: "int",
                nullable: true);
        }
    }
}
