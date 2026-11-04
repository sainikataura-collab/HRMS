using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using static HRMSWebAPI.Repository.IApprovalSectionDocRepository;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class ApprovalSectionDocController : ControllerBase
    {
        private readonly IApprovalSectionDocRepository approvalSectionDocRepository;

        public ApprovalSectionDocController(IApprovalSectionDocRepository _approvalSectionDocRepository)
        {
            this.approvalSectionDocRepository = _approvalSectionDocRepository;
        }



        [HttpPost]
        [Authorize]
        public async Task<IActionResult> InsertEmployeeSectionDocApprovalAsync([FromBody] List<ApprovalSectionDocMst> approvalSectionDocList)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                // Get user info from context
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();

                if (approvalSectionDocList == null || approvalSectionDocList.Count == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Approval document list cannot be empty";
                    modelResponse.StatusCode = 400;
                    return BadRequest(modelResponse);
                }

                if (string.IsNullOrEmpty(decryptedUserId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "User ID is missing";
                    modelResponse.StatusCode = 400;
                    return BadRequest(modelResponse);
                }

                // Inject user ID into the model list
                foreach (var item in approvalSectionDocList)
                {
                    item.fk_insUserId = decryptedUserId;
                }

                // Call repository method
                bool isInserted = await approvalSectionDocRepository.InsertApprovalSectionDocAsync(approvalSectionDocList);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "Section document approval inserted successfully." : "Failed to insert section document approval";
                modelResponse.StatusCode = isInserted ? 200 : 400;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;
                return Ok(modelResponse);
            }
        }



        [HttpPost("GetAll")]
        [Authorize]
        public async Task<IActionResult> GetEmployeeSearchForSectionDocAsync([FromBody] EmployeeSectionDocFilterRequest request)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString();
                var decryptedFinancialYearId = HttpContext.Items["DecryptedFinancialYearId"]!.ToString();

                var list = await approvalSectionDocRepository.GetEmployeeSearchForSectionDoc(
                    request.ecode,
                    request.location,
                    request.department,
                    request.ename,
                    request.leftstatus,
                    decryptedCompanyId,
                    request.fk_empid,
                    decryptedFinancialYearId
                );

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Section document list retrieved successfully.";
                modelResponse.Data = list;               
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = "An error occurred. " + ex.Message;
                modelResponse.StatusCode = 500;
                return Ok(modelResponse);
            }
        }



    }
}
