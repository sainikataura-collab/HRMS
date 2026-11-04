using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class SubDepartmentController : ControllerBase
    {


        private readonly  ISubDepartmentRepository subDepartmentRepository;

        public SubDepartmentController(ISubDepartmentRepository _SubDepartmentRepository)
        {
            subDepartmentRepository= _SubDepartmentRepository;
        }


        [HttpPost("Insert")]
        [Authorize] // Secured endpoint

        public async Task<IActionResult> InsertSubDepartmentAsync([FromBody] SubDepartmentMst department)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!;

                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();

                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString();


                department.fk_companyId = decryptedCompanyId;
                department.Fk_LocID = decryptedLocationId;
                department.Fk_UserID = decryptedUserId.ToString();

                bool isInserted = await subDepartmentRepository.InsertSubDepartmentAsync(department);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "Sub Department inserted successfully." : "Failed to insert sub department.";
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



        [HttpGet("GetAll")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetAllDepartments(int pageIndex = 0, int pageSize = 10)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();

                var (totalCount, result) = await subDepartmentRepository.GetAll(pageIndex, pageSize, decryptedCompanyId);
                if (result.Count() == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }



                modelResponse.IsSuccess = true;
                modelResponse.Message = "Sub Department List retrieved successfully.";
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



        [HttpPut("Update")]
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult> UpdateDepartmentAsync([FromBody] SubDepartmentMst subDepartmentMst)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString(); // Retrieve and ensure it's a string

                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId




                subDepartmentMst.Fk_UserID = decryptedUserId;
                subDepartmentMst.Fk_LocID = decryptedLocationId;
                
                bool isUpdated = await subDepartmentRepository.UpdateSubDepartmentAsync(subDepartmentMst);

                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated ? " Sub Department updated successfully." : "Failed to update Sub department.";
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

        [HttpGet("{pk_subdeptid}")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetDepartmentByIdAsync([FromRoute] string pk_subdeptid)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {


                SubDepartmentMst result = await subDepartmentRepository.GetSubDepartmentByIdAsync(pk_subdeptid);



                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid Id";
                    return Ok(modelResponse);
                }


                modelResponse.IsSuccess = true;
                modelResponse.Message = "Sub Department detail retrieved successfully.";
                modelResponse.Data = result;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                return Ok(modelResponse);
            }
        }





        [HttpDelete("{pk_subdeptid}")]
        [Authorize]
        public async Task<IActionResult> DeleteDepMstAsync([FromRoute] string pk_subdeptid)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                bool isDeleted = await subDepartmentRepository.DeleteSubDepartmentMstAsync(pk_subdeptid);

                modelResponse.IsSuccess = isDeleted;
                modelResponse.Message = isDeleted ? "Sub Department detail delete successfully." : "Failed to delete Department detail.";
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





    }
}
