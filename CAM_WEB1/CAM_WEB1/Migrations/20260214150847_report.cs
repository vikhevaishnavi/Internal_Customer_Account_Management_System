using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CAM_WEB1.Migrations
{
    /// <inheritdoc />
    public partial class report : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Metrics",
                table: "t_Report");

            migrationBuilder.DropColumn(
                name: "Scope",
                table: "t_Report");

            migrationBuilder.RenameColumn(
                name: "ReportId",
                table: "t_Report_Audit",
                newName: "ReportID");

            migrationBuilder.RenameColumn(
                name: "ReportId",
                table: "t_Report",
                newName: "ReportID");

            migrationBuilder.AlterColumn<int>(
                name: "ReportID",
                table: "t_Report_Audit",
                type: "int",
                nullable: false,
                oldClrType: typeof(long),
                oldType: "bigint");

            migrationBuilder.AlterColumn<DateTime>(
                name: "ActionDate",
                table: "t_Report_Audit",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "GETUTCDATE()",
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AddColumn<int>(
                name: "UserID",
                table: "t_Report_Audit",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AlterColumn<DateTime>(
                name: "GeneratedDate",
                table: "t_Report",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "GETUTCDATE()",
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AlterColumn<int>(
                name: "ReportID",
                table: "t_Report",
                type: "int",
                nullable: false,
                oldClrType: typeof(long),
                oldType: "bigint")
                .Annotation("SqlServer:Identity", "1, 1")
                .OldAnnotation("SqlServer:Identity", "1, 1");

            migrationBuilder.AddColumn<decimal>(
                name: "AccountGrowthRate",
                table: "t_Report",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "Branch",
                table: "t_Report",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "HighValueCount",
                table: "t_Report",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "TotalTransactions",
                table: "t_Report",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "t_user_audit",
                columns: table => new
                {
                    AuditId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: true),
                    Action = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    OldValue = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NewValue = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PerformedDate = table.Column<DateTime>(type: "datetime", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_t_user_audit", x => x.AuditId);
                });

            migrationBuilder.CreateIndex(
                name: "IX_t_Report_Audit_ReportID",
                table: "t_Report_Audit",
                column: "ReportID");

            migrationBuilder.AddForeignKey(
                name: "FK_t_Report_Audit_t_Report_ReportID",
                table: "t_Report_Audit",
                column: "ReportID",
                principalTable: "t_Report",
                principalColumn: "ReportID",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_t_Report_Audit_t_Report_ReportID",
                table: "t_Report_Audit");

            migrationBuilder.DropTable(
                name: "t_user_audit");

            migrationBuilder.DropIndex(
                name: "IX_t_Report_Audit_ReportID",
                table: "t_Report_Audit");

            migrationBuilder.DropColumn(
                name: "UserID",
                table: "t_Report_Audit");

            migrationBuilder.DropColumn(
                name: "AccountGrowthRate",
                table: "t_Report");

            migrationBuilder.DropColumn(
                name: "Branch",
                table: "t_Report");

            migrationBuilder.DropColumn(
                name: "HighValueCount",
                table: "t_Report");

            migrationBuilder.DropColumn(
                name: "TotalTransactions",
                table: "t_Report");

            migrationBuilder.RenameColumn(
                name: "ReportID",
                table: "t_Report_Audit",
                newName: "ReportId");

            migrationBuilder.RenameColumn(
                name: "ReportID",
                table: "t_Report",
                newName: "ReportId");

            migrationBuilder.AlterColumn<long>(
                name: "ReportId",
                table: "t_Report_Audit",
                type: "bigint",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<DateTime>(
                name: "ActionDate",
                table: "t_Report_Audit",
                type: "datetime2",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldDefaultValueSql: "GETUTCDATE()");

            migrationBuilder.AlterColumn<DateTime>(
                name: "GeneratedDate",
                table: "t_Report",
                type: "datetime2",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldDefaultValueSql: "GETUTCDATE()");

            migrationBuilder.AlterColumn<long>(
                name: "ReportId",
                table: "t_Report",
                type: "bigint",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int")
                .Annotation("SqlServer:Identity", "1, 1")
                .OldAnnotation("SqlServer:Identity", "1, 1");

            migrationBuilder.AddColumn<string>(
                name: "Metrics",
                table: "t_Report",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Scope",
                table: "t_Report",
                type: "nvarchar(512)",
                maxLength: 512,
                nullable: false,
                defaultValue: "");
        }
    }
}
