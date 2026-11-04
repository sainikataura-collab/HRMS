using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class BranchController : ControllerBase
    {
        private readonly IBranchRepositorycs branchRepository;

        public BranchController(IBranchRepositorycs _branchRepository)
        {
            branchRepository = _branchRepository;
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAll(int pageIndex = 0, int pageSize = 10)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var userId = HttpContext.Items["DecryptedUserId"]?.ToString();
                var companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString();

                if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(companyId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Company ID or User ID is required.";
                    modelResponse.StatusCode = 400;
                    return BadRequest(modelResponse);
                }

                var (totalCount, result) = await branchRepository.GetAllAsync(pageIndex, pageSize, userId, companyId);

                if (result == null || !result.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No records found.";
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "List retrieved successfully.";
                modelResponse.Data = result;
                modelResponse.TotalCount = totalCount;
                modelResponse.StatusCode = 200;

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

        // ===================== INSERT =====================
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Insert([FromBody] List<BranchMst> branchList)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString();

                if (branchList == null || branchList.Count == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Branch list cannot be empty.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                if (string.IsNullOrEmpty(companyId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Company ID is missing.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                foreach (var item in branchList)
                {
                    item.fk_companyId = companyId;
                }

                bool isInserted = await branchRepository.InsertBranchAsync(branchList, companyId);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "Branch inserted successfully." : "Failed to insert branch.";
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

        // ===================== DELETE =====================
        [HttpDelete("{pk_branchId}")]
        [Authorize]
        public async Task<IActionResult> Delete(long pk_branchId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                if (pk_branchId <= 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid Branch Id.";
                    modelResponse.StatusCode = 400;
                    return BadRequest(modelResponse);
                }

                bool isDeleted = await branchRepository.DeleteBranchAsync(pk_branchId);

                modelResponse.IsSuccess = isDeleted;
                modelResponse.Message = isDeleted ? "Deleted successfully." : "Delete failed.";
                modelResponse.StatusCode = isDeleted ? 200 : 400;

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

        // ===================== GET BY ID =====================
        [HttpGet("{pk_branchId}")]
        [Authorize]
        public async Task<IActionResult> GetById(long pk_branchId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var result = await branchRepository.GetBranchByIdAsync(pk_branchId);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid Id.";
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Detail retrieved successfully.";
                modelResponse.Data = result;
                modelResponse.StatusCode = 200;

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

        // ===================== UPDATE =====================
        [HttpPut]
        [Authorize]
        public async Task<IActionResult> Update([FromBody] List<BranchMst> branchList)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                if (branchList == null || branchList.Count == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Branch list cannot be empty.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                bool isUpdated = await branchRepository.UpdateBranchAsync(branchList);

                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated
                    ? "Branch updated successfully."
                    : "Failed to update branch.";

                modelResponse.StatusCode = isUpdated ? 200 : 400;

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

    }
}
