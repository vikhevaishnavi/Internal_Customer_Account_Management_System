using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System.Data;

namespace CAM_WEB1.Controllers
{
    [ApiController]
    [Route("api/admin")]
    public class AdminController : ControllerBase
    {
        private readonly string _conn;
        private readonly ILogger<AdminController> _logger;

        public AdminController(IConfiguration configuration, ILogger<AdminController> logger)
        {
            _conn = configuration.GetConnectionString("DefaultConnection") ?? throw new InvalidOperationException("Connection string not found");
            _logger = logger;
        }

        [HttpGet("dashboard/metrics")]
        public IActionResult GetDashboardMetrics()
        {
            try
            {
                var metrics = new
                {
                    totalAccounts = GetTotalAccounts(),
                    activeAccounts = GetActiveAccounts(),
                    totalBalance = GetTotalBalance(),
                    totalTransactions = GetTotalTransactions(),
                    monthlyTransactions = GetMonthlyTransactions(),
                    pendingApprovals = GetPendingApprovals(),
                    totalUsers = GetTotalUsers(),
                    activeUsers = GetActiveUsers()
                };

                return Ok(metrics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching dashboard metrics");
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        private int GetTotalAccounts()
        {
            using var con = new SqlConnection(_conn);
            using var cmd = new SqlCommand("SELECT COUNT(*) FROM t_Account", con);
            con.Open();
            return (int)cmd.ExecuteScalar();
        }

        private int GetActiveAccounts()
        {
            using var con = new SqlConnection(_conn);
            using var cmd = new SqlCommand("SELECT COUNT(*) FROM t_Account WHERE Status = 'Active'", con);
            con.Open();
            return (int)cmd.ExecuteScalar();
        }

        private decimal GetTotalBalance()
        {
            using var con = new SqlConnection(_conn);
            using var cmd = new SqlCommand("SELECT ISNULL(SUM(Balance), 0) FROM t_Account WHERE Status = 'Active'", con);
            con.Open();
            return (decimal)cmd.ExecuteScalar();
        }

        private int GetTotalTransactions()
        {
            using var con = new SqlConnection(_conn);
            using var cmd = new SqlCommand("SELECT COUNT(*) FROM t_Transactions", con);
            con.Open();
            return (int)cmd.ExecuteScalar();
        }

        private int GetMonthlyTransactions()
        {
            using var con = new SqlConnection(_conn);
            using var cmd = new SqlCommand("SELECT COUNT(*) FROM t_Transactions WHERE Date >= DATEADD(MONTH, DATEDIFF(MONTH, 0, GETUTCDATE()), 0)", con);
            con.Open();
            return (int)cmd.ExecuteScalar();
        }

        private int GetPendingApprovals()
        {
            using var con = new SqlConnection(_conn);
            using var cmd = new SqlCommand("SELECT COUNT(*) FROM t_Approval WHERE Decision = 'Pending'", con);
            con.Open();
            return (int)cmd.ExecuteScalar();
        }

        private int GetTotalUsers()
        {
            using var con = new SqlConnection(_conn);
            using var cmd = new SqlCommand("SELECT COUNT(*) FROM t_User", con);
            con.Open();
            return (int)cmd.ExecuteScalar();
        }

        private int GetActiveUsers()
        {
            using var con = new SqlConnection(_conn);
            using var cmd = new SqlCommand("SELECT COUNT(*) FROM t_User WHERE Status = 'Active'", con);
            con.Open();
            return (int)cmd.ExecuteScalar();
        }
    }
}
