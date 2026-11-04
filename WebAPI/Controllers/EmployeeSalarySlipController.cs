using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class EmployeeSalarySlipController : ControllerBase
    {
        private readonly IExportReportRepository _exportReportRepository;
        private readonly IConfiguration _configuration;

        public EmployeeSalarySlipController(IExportReportRepository exportReportRepository, IConfiguration configuration)
        {
            _exportReportRepository = exportReportRepository;
            _configuration = configuration;
        }

        [HttpPost("GeneratePermanentToken")]
        [AllowAnonymous]
        public IActionResult GeneratePermanentToken([FromBody] GeneratePermanentTokenRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.UserId))
                {
                    return BadRequest(new ModelResponse
                    {
                        IsSuccess = false,
                        Message = "UserId is required.",
                        StatusCode = 400
                    });
                }

                if (string.IsNullOrWhiteSpace(request.CompanyId))
                {
                    return BadRequest(new ModelResponse
                    {
                        IsSuccess = false,
                        Message = "CompanyId is required.",
                        StatusCode = 400
                    });
                }

                string locId = string.IsNullOrWhiteSpace(request.LocationId) ? "1" : request.LocationId;
                string finId = string.IsNullOrWhiteSpace(request.FinancialYearId) ? "1" : request.FinancialYearId;

                // Encrypt claims using EncryptionStaticHelper as expected by TokenValidationMiddleware
                string encUserId = EncryptionStaticHelper.EncryptToUrlSafeBase64(request.UserId);
                string encCompanyId = EncryptionStaticHelper.EncryptToUrlSafeBase64(request.CompanyId);
                string encLocId = EncryptionStaticHelper.EncryptToUrlSafeBase64(locId);
                string encFinId = EncryptionStaticHelper.EncryptToUrlSafeBase64(finId);

                var claims = new[]
                {
                    new Claim(JwtRegisteredClaimNames.Sub, encUserId),
                    new Claim("Loc", encLocId),
                    new Claim("Com", encCompanyId),
                    new Claim("FY", encFinId),
                    new Claim("TokenType", "Permanent"),
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                    new Claim(JwtRegisteredClaimNames.Iat, DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64)
                };

                // Permanent lifetime (100 years)
                var expirationTime = DateTime.UtcNow.AddYears(100);

                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"] ?? "YourSecretKeyGoesHereHRMSWebAPI12345!"));
                var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

                var tokenDescriptor = new SecurityTokenDescriptor
                {
                    Subject = new ClaimsIdentity(claims),
                    Expires = expirationTime,
                    SigningCredentials = creds,
                    Issuer = _configuration["Jwt:Issuer"],
                    Audience = _configuration["Jwt:Audience"]
                };

                var tokenHandler = new JwtSecurityTokenHandler();
                var token = tokenHandler.CreateToken(tokenDescriptor);
                string tokenString = tokenHandler.WriteToken(token);

                return Ok(new ModelResponse
                {
                    IsSuccess = true,
                    Message = "Permanent token generated successfully.",
                    StatusCode = 200,
                    Data = new
                    {
                        Token = tokenString,
                        TokenType = "Bearer",
                        ExpiresIn = "Permanent",
                        UserId = request.UserId,
                        CompanyId = request.CompanyId
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ModelResponse
                {
                    IsSuccess = false,
                    Message = $"Error generating token: {ex.Message}",
                    StatusCode = 500
                });
            }
        }

        [HttpPost("DownloadSalarySlip")]
        [Authorize]
        public async Task<IActionResult> DownloadSalarySlip([FromBody] EmployeeSalarySlipDownloadRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.EmpCode))
                {
                    return BadRequest(new ModelResponse
                    {
                        IsSuccess = false,
                        Message = "empcode is required.",
                        StatusCode = 400
                    });
                }

                if (string.IsNullOrWhiteSpace(request.Month) || string.IsNullOrWhiteSpace(request.Year))
                {
                    return BadRequest(new ModelResponse
                    {
                        IsSuccess = false,
                        Message = "Month and Year are required.",
                        StatusCode = 400
                    });
                }

                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString();
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();

                if (string.IsNullOrWhiteSpace(decryptedCompanyId))
                {
                    return Unauthorized(new ModelResponse
                    {
                        IsSuccess = false,
                        Message = "Unauthorized: CompanyId missing from token.",
                        StatusCode = 401
                    });
                }

                // Resolve pk_empid from empCode
                string pk_empid = string.Empty;
                using (var conn = DataBaseFactory.ConnString())
                {
                    string sql = "SELECT TOP 1 pk_empid FROM SAL_Employee_Mst WHERE empcode = @empcode AND fk_companyId = @companyId";
                    pk_empid = await conn.QueryFirstOrDefaultAsync<string>(sql, new { empcode = request.EmpCode.Trim(), companyId = decryptedCompanyId }) ?? string.Empty;
                }

                if (string.IsNullOrWhiteSpace(pk_empid))
                {
                    return NotFound(new ModelResponse
                    {
                        IsSuccess = false,
                        Message = $"Employee with code '{request.EmpCode}' not found in the specified company.",
                        StatusCode = 404
                    });
                }

                // Reuse the same repository method used for the Employee Portal
                var (totalCount, employees, company, head, leavedetail) = await _exportReportRepository.DownloadMonthlySalarySlipforEmpTupleAsync(
                    pk_empid,
                    request.Month,
                    request.Year,
                    decryptedCompanyId
                );

                if (employees == null || !employees.Any())
                {
                    return NotFound(new ModelResponse
                    {
                        IsSuccess = false,
                        Message = $"No salary record found for employee '{request.EmpCode}' for month {request.Month}/{request.Year}.",
                        StatusCode = 404
                    });
                }

                var reportRequest = new ReportModelRequest
                {
                    fk_monthId = request.Month,
                    fk_yearId = request.Year,
                    EmpCode = request.EmpCode
                };

                // Instantiate ExportReportController to reuse the exact same portal PDF generator
                var exportController = new ExportReportController(_exportReportRepository, _configuration);
                byte[] pdfBytes = exportController.GenerateBulkSalarySlipPdf(employees, company, head, leavedetail, reportRequest, decryptedCompanyId);

                if (pdfBytes == null || pdfBytes.Length == 0)
                {
                    return StatusCode(500, new ModelResponse
                    {
                        IsSuccess = false,
                        Message = "Failed to generate salary slip PDF.",
                        StatusCode = 500
                    });
                }

                string fileName = $"SalarySlip_{request.EmpCode}_{request.Month}_{request.Year}.pdf";
                return File(pdfBytes, "application/pdf", fileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ModelResponse
                {
                    IsSuccess = false,
                    Message = $"An error occurred while generating salary slip: {ex.Message}",
                    StatusCode = 500
                });
            }
        }
    }
}
