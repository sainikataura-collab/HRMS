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
    public class CandidateMasterController : ControllerBase
    {
         private readonly ICandidateRepository candidateRepository;
          

            public CandidateMasterController(ICandidateRepository _candidateRepository)

            {
                candidateRepository = _candidateRepository;
             }

        [HttpPost]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> InsertCandidateAsync([FromBody] CandidateMst candidateMst)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
               var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString();
                
                // You can use these values in the model if required later
                // (not used directly here since procedure needs only @xmlDoc and @fk_companyId)

                if (string.IsNullOrEmpty(decryptedCompanyId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid company ID.";
                    modelResponse.StatusCode = 400;
                    return BadRequest(modelResponse);
                }

                bool isInserted = await candidateRepository.InsertCandidateAsync(candidateMst, decryptedCompanyId);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "Candidate inserted successfully." : "Failed to insert candidate.";
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

        [HttpPut]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> UpdateCandidateAsync([FromBody] CandidateMst candidateMst)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
              
               
                // Call the repository method to update the candidate details
                bool isUpdated = await candidateRepository.UpdateCandidateAsync(candidateMst.pk_formatid, candidateMst);

                // Set the response message based on whether the update was successful or not
                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated ? "Candidate updated successfully." : "Failed to update candidate.";
                modelResponse.StatusCode = isUpdated ? 200 : 400;

                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                // Handle any errors and set appropriate response
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


                var (totalCount, result) = await candidateRepository.GetAll(pageIndex, pageSize, decryptedCompanyId);
                if (result.Count() == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
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

        [HttpGet("{pk_formatid}")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetByIdAsync([FromRoute] long pk_formatid)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {


                CandidateMst result = await candidateRepository.GetByIdAsync(pk_formatid);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid Id";
                    return Ok(modelResponse);
                }
                else
                {
                    result.pk_formatid = pk_formatid;
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "detail retrieved successfully.";
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


        [HttpDelete("{pk_formatid}")]
        [Authorize]
        public async Task<IActionResult> DeleteAsync([FromRoute] long pk_formatid)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                bool isDeleted = await candidateRepository.DeleteAsync(pk_formatid);

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
