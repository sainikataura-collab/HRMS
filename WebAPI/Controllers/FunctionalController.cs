using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers
{

    [Route("api/v1/[controller]")]
    [ApiController]
    public class FunctionalController : ControllerBase
    {
        private readonly IFunctionalRepository functionalRepository;


        public FunctionalController(IFunctionalRepository _functionalRepository)

        {
            functionalRepository = _functionalRepository;
        }

        [HttpPost]
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult> InsertFunctionalMstAsync([FromBody] FunctionalMst FunctionalMst)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {

                
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
                var encryptedCompanyId = HttpContext.Items["EncryptedCompanyId"]?.ToString(); // Retrieve encryptedCompanyId-string

               
                bool isInserted = await functionalRepository.InsertFunctionalMstAsync(FunctionalMst, decryptedCompanyId);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "Functional details inserted successfully." : "Failed to insert Functional details.";
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

        public async Task<IActionResult> GetAll(int pageIndex = 0, int pageSize = 10)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {


                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
                var encryptedCompanyId = HttpContext.Items["EncryptedCompanyId"]?.ToString(); // Retrieve encryptedCompanyId-string


                var (totalCount, result) = await functionalRepository.GetAll(pageIndex, pageSize, decryptedCompanyId);
                if (result.Count() == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }


                modelResponse.IsSuccess = true;
                modelResponse.Message = "functional List retrieved successfully.";
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


        [HttpGet("{functionalId}")]
        [Authorize]

        public async Task<IActionResult> GetFunctionalByIdAsync([FromRoute] long functionalId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {

                FunctionalMst result = await functionalRepository.GetFunctionalByIdAsync(functionalId);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid FunctionalId";
                    return Ok(modelResponse);
                }


                modelResponse.IsSuccess = true;
                modelResponse.Message = "Functional detail retrieved successfully.";
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



        [HttpPut]
        [Authorize]  // Secured endpoint
                     // 

        public async Task<IActionResult> UpdateFunctionalMstAsync([FromBody] FunctionalMst FunctionalMst)
        {
            ModelResponse modelResponse = new ModelResponse();


            try
            {
                bool isUpdated = await functionalRepository.UpdateFunctionalMstAsync(FunctionalMst);
                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated ? "Functional detail updated successfully." : "Failed to update Functional detail.";
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


        [HttpDelete("{functionalId}")]
        [Authorize]


        public async Task<IActionResult> DeleteFunctionalMstAsync([FromRoute] long functionalId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                bool isDeleted = await functionalRepository.DeleteFunctionalMstAsync(functionalId);

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



    }
}
