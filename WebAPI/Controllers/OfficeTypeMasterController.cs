using Microsoft.AspNetCore.Http;
using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;



namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class OfficeTypeMasterController : ControllerBase
    {
        private readonly IOfficeTypeMasterRepository officeTypeMasterRepository;
        public OfficeTypeMasterController(IOfficeTypeMasterRepository _officeTypeMasterRepository)
        {
            officeTypeMasterRepository = _officeTypeMasterRepository;
        }


        // Insert Office Type Master

        [HttpPost]
        [Authorize]  // Secured endpoint     
        public async Task<IActionResult> InsertOfficeTypeMasterMstAsync([FromBody] OfficeTypeMasterMst OfficeTypeMasterMst)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {

                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
               

                OfficeTypeMasterMst.fk_companyId = decryptedCompanyId;


                bool isInserted = await officeTypeMasterRepository.InsertOfficeTypeMasterMstAsync(OfficeTypeMasterMst);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "Office Type  mater details inserted successfully." : "Failed to insert Office Type mater details.";
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




        // Get all Office Type Master
        [HttpGet]
        [Authorize]

        public async Task<IActionResult> GetAll(int pageIndex = 0, int pageSize = 10, string? fk_companyId = null)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {


                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
                //var encryptedCompanyId = HttpContext.Items["EncryptedCompanyId"]?.ToString(); // Retrieve encryptedCompanyId-string

                var (totalCount, result) = await officeTypeMasterRepository.GetAll(pageIndex, pageSize, decryptedCompanyId);
                if (result.Count() == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }


                modelResponse.IsSuccess = true;
                modelResponse.Message = "Office Type Master List retrieved successfully.";
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


        // update office type master

        [HttpPut]
        [Authorize]  // Secured endpoint     
        public async Task<IActionResult> UpdateOfficeTypeMasterMstAsync([FromBody] OfficeTypeMasterMst model)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                // Ensure the primary key exists in the model (update this property name as needed)
              

               
                bool isUpdated = await officeTypeMasterRepository.UpdateOfficeTypeMasterMstAsync(model);

                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated
                    ? "Office Type master details updated successfully."
                    : "Failed to update Office Type master details.";
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


        // Get by id office type master

        [HttpGet("{pk_offtypeid}")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetGradeByIdAsync([FromRoute] string pk_offtypeid)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {

                

                OfficeTypeMasterMst result = await officeTypeMasterRepository.GetOfficeTypeMasterByIdAsync(pk_offtypeid);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid pk_offtypeid";
                    return Ok(modelResponse);
                }
                else
                {
                    result.pk_offtypeid = pk_offtypeid;
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "grade detail retrieved successfully.";
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



        // Delete Office type master

        [HttpDelete("{pk_offtypeid}")]
        [Authorize]
        public async Task<IActionResult> DeleteOfficeTypeMasterAsync([FromRoute] int pk_offtypeid)
        {
            ModelResponse modelResponse = new ModelResponse();

         


            try
            {
                bool isDeleted = await officeTypeMasterRepository.DeleteOfficeTypeMasterAsync(pk_offtypeid);

                modelResponse.IsSuccess = isDeleted;
                modelResponse.Message = isDeleted ? "detail delete successfully." : "Failed to delete detail.";
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
