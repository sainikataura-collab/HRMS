using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class DueClaranceUserController : ControllerBase
    {

        private readonly IDueClaranceUserRepository dueclaranceserepository;
        public DueClaranceUserController(IDueClaranceUserRepository _dueclaranceserepository)

        {
            dueclaranceserepository = _dueclaranceserepository;


        }

        [HttpPost]
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult> CreateAsync([FromBody] ClearanceDepartmentUserModel model)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var DecryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                var DecryptedLocationId = HttpContext.Items["DecryptedLocationId"]?.ToString();
                var fk_companyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();
                model.ClearanceDepartmentUser.fk_insUserID = DecryptedUserId;
                model.ClearanceDepartmentUser.fk_companyId = fk_companyId;





                bool isInserted = await dueclaranceserepository.CreateAsync(model, DecryptedUserId, DecryptedLocationId);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "Details inserted successfully." : "Failed to insert  details.";
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
        [Authorize]
        public async Task<IActionResult> GetAll(

            int pageIndex = 0, int pageSize = 10)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var fk_companyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId

                var (totalCount, result) = await dueclaranceserepository.GetAll(pageIndex, pageSize, fk_companyId);
                if (result.Count() == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }


                modelResponse.IsSuccess = true;
                modelResponse.Message = "Clarance user master list retrieved successfully.";
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


        //[HttpGet]
        //[Authorize]  // Secured endpoint
        //public async Task<IActionResult> GetAllDepartments(int pageIndex = 0, int pageSize = 10)
        //{
        //    ModelResponse modelResponse = new ModelResponse();

        //try
        //{
        //    var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId

        //    var (totalCount, result) = await departmentRepository.GetAll(pageIndex, pageSize, decryptedCompanyId);
        //    if (result.Count() == 0)
        //    {
        //        modelResponse.IsSuccess = false;
        //        modelResponse.Message = "No Record found.";
        //        modelResponse.StatusCode = 400;
        //        return Ok(modelResponse);
        //    }



        [HttpGet("{pk_deptUserId}")]
        [Authorize]

        public async Task<IActionResult> GetBehavioralByIdAsync([FromRoute] long pk_deptUserId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {

                ClearanceDepartmentUserModel_previous result = await dueclaranceserepository.GetByIdAsync(pk_deptUserId);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid deptUserId";
                    return Ok(modelResponse);
                }


                modelResponse.IsSuccess = true;
                modelResponse.Message = "Clarance User detail retrieved successfully.";
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

        //Delete code
        [HttpDelete("{pk_deptUserId}")]
        [Authorize]
        public async Task<IActionResult> DeleteAsync([FromRoute] long pk_deptUserId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                bool isDeleted = await dueclaranceserepository.DeleteAsync(pk_deptUserId);

                modelResponse.IsSuccess = isDeleted;
                modelResponse.Message = isDeleted ? "Functional detail delete successfully." : "Failed to delete Functional detail.";
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






        [HttpPut]
        [Authorize]
        public async Task<IActionResult> UpdateTravelMstAsync(long pk_deptUserId, [FromBody] ClearanceDepartmentUserModel model)
        {
            ModelResponse modelResponse = new ModelResponse();


            try
            {
                var DecryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                var DecryptedLocationId = HttpContext.Items["DecryptedLocationId"]?.ToString();
                model.ClearanceDepartmentUser.fk_updUserID = DecryptedUserId;
                var fk_companyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();
                model.ClearanceDepartmentUser.fk_companyId = fk_companyId;
                pk_deptUserId = (long)model.ClearanceDepartmentUser?.pk_deptUserId;


                bool isUpdated = await dueclaranceserepository.UpdateTravelMstAsync(model, pk_deptUserId, DecryptedUserId, DecryptedLocationId);
                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated ? "detail updated successfully." : " update  failed.";
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
