using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HibaVonal_03.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MaintainerSpecialisations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MaintainerSpecialisations", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Premises",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Floor = table.Column<int>(type: "int", nullable: false),
                    Type = table.Column<int>(type: "int", nullable: false),
                    NameOrNumber = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Premises", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Appliances",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PremiseId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Appliances", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Appliances_Premises_PremiseId",
                        column: x => x.PremiseId,
                        principalTable: "Premises",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Password = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Role = table.Column<int>(type: "int", nullable: false),
                    DormRoomId = table.Column<int>(type: "int", nullable: true),
                    IsAvailable = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Users_Premises_DormRoomId",
                        column: x => x.DormRoomId,
                        principalTable: "Premises",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Faults",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Documentation = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CollegiateId = table.Column<int>(type: "int", nullable: false),
                    PremiseId = table.Column<int>(type: "int", nullable: false),
                    ApplianceId = table.Column<int>(type: "int", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    SpecializationId = table.Column<int>(type: "int", nullable: false),
                    AssignedMaintenanceId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Faults", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Faults_Appliances_ApplianceId",
                        column: x => x.ApplianceId,
                        principalTable: "Appliances",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Faults_MaintainerSpecialisations_SpecializationId",
                        column: x => x.SpecializationId,
                        principalTable: "MaintainerSpecialisations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Faults_Premises_PremiseId",
                        column: x => x.PremiseId,
                        principalTable: "Premises",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Faults_Users_AssignedMaintenanceId",
                        column: x => x.AssignedMaintenanceId,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Faults_Users_CollegiateId",
                        column: x => x.CollegiateId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "MaintainerSpecialisationAssignments",
                columns: table => new
                {
                    MaintainersId = table.Column<int>(type: "int", nullable: false),
                    MaintenanceSpecialisationId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MaintainerSpecialisationAssignments", x => new { x.MaintainersId, x.MaintenanceSpecialisationId });
                    table.ForeignKey(
                        name: "FK_MaintainerSpecialisationAssignments_MaintainerSpecialisations_MaintenanceSpecialisationId",
                        column: x => x.MaintenanceSpecialisationId,
                        principalTable: "MaintainerSpecialisations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MaintainerSpecialisationAssignments_Users_MaintainersId",
                        column: x => x.MaintainersId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Feedbacks",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FaultId = table.Column<int>(type: "int", nullable: false),
                    Date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Text = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CollegiateId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Feedbacks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Feedbacks_Faults_FaultId",
                        column: x => x.FaultId,
                        principalTable: "Faults",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Feedbacks_Users_CollegiateId",
                        column: x => x.CollegiateId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ToolOrders",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FaultId = table.Column<int>(type: "int", nullable: false),
                    ToolName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    Date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsDelivered = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ToolOrders", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ToolOrders_Faults_FaultId",
                        column: x => x.FaultId,
                        principalTable: "Faults",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Appliances_PremiseId",
                table: "Appliances",
                column: "PremiseId");

            migrationBuilder.CreateIndex(
                name: "IX_Faults_ApplianceId",
                table: "Faults",
                column: "ApplianceId");

            migrationBuilder.CreateIndex(
                name: "IX_Faults_AssignedMaintenanceId",
                table: "Faults",
                column: "AssignedMaintenanceId");

            migrationBuilder.CreateIndex(
                name: "IX_Faults_CollegiateId",
                table: "Faults",
                column: "CollegiateId");

            migrationBuilder.CreateIndex(
                name: "IX_Faults_PremiseId",
                table: "Faults",
                column: "PremiseId");

            migrationBuilder.CreateIndex(
                name: "IX_Faults_SpecializationId",
                table: "Faults",
                column: "SpecializationId");

            migrationBuilder.CreateIndex(
                name: "IX_Feedbacks_CollegiateId",
                table: "Feedbacks",
                column: "CollegiateId");

            migrationBuilder.CreateIndex(
                name: "IX_Feedbacks_FaultId",
                table: "Feedbacks",
                column: "FaultId");

            migrationBuilder.CreateIndex(
                name: "IX_MaintainerSpecialisationAssignments_MaintenanceSpecialisationId",
                table: "MaintainerSpecialisationAssignments",
                column: "MaintenanceSpecialisationId");

            migrationBuilder.CreateIndex(
                name: "IX_ToolOrders_FaultId",
                table: "ToolOrders",
                column: "FaultId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_DormRoomId",
                table: "Users",
                column: "DormRoomId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Feedbacks");

            migrationBuilder.DropTable(
                name: "MaintainerSpecialisationAssignments");

            migrationBuilder.DropTable(
                name: "ToolOrders");

            migrationBuilder.DropTable(
                name: "Faults");

            migrationBuilder.DropTable(
                name: "Appliances");

            migrationBuilder.DropTable(
                name: "MaintainerSpecialisations");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Premises");
        }
    }
}
