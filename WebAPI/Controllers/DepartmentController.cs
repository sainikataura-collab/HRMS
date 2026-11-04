using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Mvc;
using System.Net;
using UAParser;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Authorization;
using static System.Net.WebRequestMethods;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Options;
//using Newtonsoft.Json.Linq;
using Microsoft.Extensions.Configuration;
using System.Net.Http.Headers;
using System.ComponentModel.Design;
//using Newtonsoft.Json;


namespace HRMSWebAPI.Controllers
{


    [Route("api/v1/[controller]")]
    [ApiController]
    public class DepartmentController : ControllerBase

    {
        private readonly IDepartmentMasterRepository departmentRepository;

        public DepartmentController(IDepartmentMasterRepository _departmentRepository)

        {
            departmentRepository = _departmentRepository;
        }



        [HttpPost]
        [Authorize] // Secured endpoint
            
        public async Task<IActionResult> InsertDepartmentAsync([FromBody] DepartmentMst department)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!; // Retrieve the user ID
                var encryptedUserId = HttpContext.Items["EncryptedUserId"]?.ToString(); // Retrieve encryptedUserId-string

                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
                var encryptedCompanyId = HttpContext.Items["EncryptedCompanyId"]?.ToString(); // Retrieve encryptedCompanyId-string

                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId
                var encryptedLocationId = HttpContext.Items["EncryptedLocationId"]?.ToString(); // Retrieve encryptedLocationId-string



               

                department.fk_companyId = decryptedCompanyId;
                department.Fk_LocID = decryptedLocationId;
                //department.fk_depHodid = decryptedfk_depHodid;
                department.Fk_UserID = decryptedUserId.ToString();

                bool isInserted = await departmentRepository.InsertDepartmentAsync(department);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "Department inserted successfully." : "Failed to insert department.";
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



        [HttpGet]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetAllDepartments(int pageIndex = 0, int pageSize = 10, string searchTerm = "")
        {
            ModelResponse modelResponse = new ModelResponse();
            
            try
            {
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
                var encryptedCompanyId = HttpContext.Items["EncryptedCompanyId"]?.ToString(); // Retrieve encryptedCompanyId-string

                var (totalCount,result) = await departmentRepository.GetAll(pageIndex, pageSize, decryptedCompanyId, searchTerm);
                if (result.Count() == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

               

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Department List retrieved successfully.";
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



        [HttpPut]
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult> UpdateDepartmentAsync([FromBody] DepartmentMst departmentMst)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString(); // Retrieve and ensure it's a string
                var encryptedUserId = HttpContext.Items["EncryptedUserId"]?.ToString(); // Retrieve encryptedUserId-string

                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId
                var encryptedLocationId = HttpContext.Items["EncryptedLocationId"]?.ToString(); // Retrieve encryptedLocationId-string

                //var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
                //var encryptedCompanyId = HttpContext.Items["EncryptedCompanyId"]?.ToString(); // Retrieve encryptedCompanyId-string




                // Decrypt DepartmentId 
                //var (isDeptIdValid, decryptedDeptId, deptIdMessage) = IdHelper.ValidateAndDecryptId(departmentMst.Pk_DeptId, "DepartmentId");

                //if (!isDeptIdValid || string.IsNullOrEmpty(decryptedDeptId))
                //{
                //    modelResponse.IsSuccess = false;
                //    modelResponse.Message = deptIdMessage;
                //    modelResponse.StatusCode = 400;
                //    return BadRequest(modelResponse);
                //}

                // Decrypt CompanyId 
                //var (isValid, decryptedfk_depHodid, message) = IdHelper.ValidateAndDecryptId(departmentMst.fk_depHodid, "fk_levelid");

                //if (!isValid || decryptedfk_depHodid == null)
                //{
                //    modelResponse.IsSuccess = false;
                //    modelResponse.Message = message;
                //    modelResponse.StatusCode = 400;
                //    return Ok(modelResponse);
                //}


                // Assign decrypted values
              
                //departmentMst.fk_companyId = decryptedCompanyId;
                departmentMst.Fk_LocID = decryptedLocationId;
              
                departmentMst.Fk_UserID = decryptedUserId.ToString();

                bool isUpdated = await departmentRepository.UpdateDepartmentAsync(departmentMst);

                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated ? "Department updated successfully." : "Failed to update department.";
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

        [HttpGet("{departmentId}")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetDepartmentByIdAsync([FromRoute] string departmentId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
               

                DepartmentMst result = await departmentRepository.GetDepartmentByIdAsync(departmentId);



                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid DesigId";
                    return Ok(modelResponse);
                }


                modelResponse.IsSuccess = true;
                modelResponse.Message = "Department detail retrieved successfully.";
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





        [HttpDelete("{departmentId}")]
        [Authorize]
        public async Task<IActionResult> DeleteDepMstAsync([FromRoute] string departmentId)
        {
            ModelResponse modelResponse = new ModelResponse();



            try
            {
                bool isDeleted = await departmentRepository.DeleteDepartmentMstAsync(departmentId);

                modelResponse.IsSuccess = isDeleted;
                modelResponse.Message = isDeleted ? "Department detail delete successfully." : "Failed to delete Department detail.";
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
