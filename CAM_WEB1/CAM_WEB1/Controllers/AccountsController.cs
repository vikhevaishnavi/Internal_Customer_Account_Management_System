using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Data.SqlClient;
using System.Security.Claims;
using CAM_WEB1.Models;
using CAM_WEB1.Data;

namespace CAM_WEB1.Controllers
{
	[ApiController]
	[Route("api/v1/[controller]")]
	public class AccountsController : ControllerBase
	{
		private readonly ApplicationDbContext _context;

		public AccountsController(ApplicationDbContext context)
		{
			_context = context;
		}

		// 1. CREATE ACCOUNT 
		[HttpPost("create")]
		[Authorize(Roles = "Officer")]
		public async Task<IActionResult> CreateAccount(Account account)
		{
			// Execute SP through EF Core method
			var result = await _context.ExecuteAccountSpAsync(
				"Create",
				null,
				account.Branch,
				account.CustomerName,
				account.CustomerID,
				account.AccountType,
				account.Balance,
				"Active"
			);

			Audit("CREATE_ACCOUNT", null, $"CustID: {account.CustomerID}");
			return Ok(new { message = "Account successfully created", data = result.FirstOrDefault() });
		}

		// 2. UPDATE ACCOUNT 
		[HttpPut("update/{id}")]
		[Authorize(Roles = "Officer")]
		public async Task<IActionResult> UpdateAccount(int id, Account account)
		{
			var result = await _context.ExecuteAccountSpAsync(
				"Update",
				id,
				account.Branch,
				account.CustomerName,
				null,
				account.AccountType,
				null,
				account.Status
			);

			if (!result.Any()) return NotFound("Account not found");

			Audit("UPDATE_ACCOUNT", $"AccID: {id}", $"NewStatus: {account.Status}");
			return Ok(new { message = "Account details updated successfully", data = result.FirstOrDefault() });
		}

		// 3. CLOSE ACCOUNT
		[HttpPut("close/{id}")]
		[Authorize(Roles = "Officer")]
		public async Task<IActionResult> CloseAccount(int id)
		{
			await _context.ExecuteAccountSpAsync("Close", id);

			Audit("CLOSE_ACCOUNT", "Active", $"AccID: {id} Closed");
			return Ok(new { message = "Account status updated to Closed" });
		}

		// 4. GET ACCOUNT DETAIL
		[HttpGet("details/{id}")]
		[Authorize(Roles = "Officer,Manager,Admin")]
		public async Task<IActionResult> GetAccountDetail(int id)
		{
			var result = await _context.ExecuteAccountSpAsync("GetById", id);

			if (!result.Any()) return NotFound();
			return Ok(result.FirstOrDefault());
		}

		// 5. LIST ALL ACCOUNTS
		[HttpGet("all")]
		[Authorize(Roles = "Officer,Manager,Admin")]
		public async Task<IActionResult> ListAllAccounts()
		{
			var result = await _context.ExecuteAccountSpAsync("GetAll");
			return Ok(result);
		}

		// HELPERS
		private int GetUserID()
		{
			var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
			return claim != null ? int.Parse(claim) : 0;
		}

		private void Audit(string action, string? oldVal, string? newVal)
		{
			// Executing your centralized audit procedure via EF Core
			_context.Database.ExecuteSqlRaw(
				"EXEC usp_user_audit @UserId, @Action, @OldValue, @NewValue",
				new SqlParameter("@UserId", GetUserID()),
				new SqlParameter("@Action", action),
				new SqlParameter("@OldValue", (object?)oldVal ?? DBNull.Value),
				new SqlParameter("@NewValue", (object?)newVal ?? DBNull.Value)
			);
		}
	}
}