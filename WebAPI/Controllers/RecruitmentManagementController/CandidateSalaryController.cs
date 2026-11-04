using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers.RecruitmentManagementController
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class CandidateSalaryController : ControllerBase
    {

         private readonly ICandidateSalaryRepository candidateSalaryRepository;

        public CandidateSalaryController(ICandidateSalaryRepository _candidateSalaryRepository)
        {
            candidateSalaryRepository= _candidateSalaryRepository;
        }


        [HttpGet]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetAll(int pageIndex = 0, int pageSize = 10)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {

                var (totalCount, result) = await candidateSalaryRepository.GetAll(pageIndex, pageSize);
                if (result.Count() == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }


                modelResponse.IsSuccess = true;
                modelResponse.Message = " List retrieved successfully.";
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


        [HttpDelete("{pk_recId}")]
        [Authorize]
        public async Task<IActionResult> Delete([FromRoute] string pk_recId)
        {
            ModelResponse modelResponse = new ModelResponse();



            try
            {
                bool isDeleted = await candidateSalaryRepository.Delete(pk_recId);

                modelResponse.IsSuccess = isDeleted;
                modelResponse.Message = isDeleted ? " detail delete successfully." : "Failed to delete  detail.";
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

        [HttpPost]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> Insert([FromBody] CandidateSalaryDataSet request)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                // Retrieve User and Location IDs from HttpContext
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]?.ToString();

                request.Candidate.fk_locid = decryptedLocationId;


                var Candidate = request.Candidate;
                var SalaryHeads = request.SalaryHeads ?? new List<SalaryHead>(); // Ensure it's not null

                request.Candidate = Candidate;
                request.SalaryHeads = SalaryHeads;

                // Call repository method to insert
                bool isInserted = await candidateSalaryRepository.Insert(
                   request,
                    decryptedUserId,
                    decryptedLocationId
                    
                );

                return Ok(new ModelResponse
                {
                    IsSuccess = isInserted,
                    Message = isInserted ? " inserted successfully." : "Failed to insert ",
                    StatusCode = isInserted ? 200 : 400
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ModelResponse
                {
                    IsSuccess = false,
                    Message = $"Error: {ex.Message}",
                    StatusCode = 500
                });
            }
        }



        [HttpPut]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> Update([FromBody] CandidateSalaryDataSet request)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                // Retrieve User and Location IDs from HttpContext
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]?.ToString();

                request.Candidate.fk_locid = decryptedLocationId;


                var Candidate = request.Candidate;
                var SalaryHeads = request.SalaryHeads ?? new List<SalaryHead>(); // Ensure it's not null

                request.Candidate = Candidate;
                request.SalaryHeads = SalaryHeads;

                // Call repository method to insert
                bool isInserted = await candidateSalaryRepository.Update(
                   request,
                    decryptedUserId,
                    decryptedLocationId

                );

                return Ok(new ModelResponse
                {
                    IsSuccess = isInserted,
                    Message = isInserted ? " Updated successfully." : "Failed to Updated ",
                    StatusCode = isInserted ? 200 : 400
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ModelResponse
                {
                    IsSuccess = false,
                    Message = $"Error: {ex.Message}",
                    StatusCode = 500
                });
            }
        }





        [HttpGet("CandidateSearch/{candidatename}")]
        [Authorize]
        public async Task<IActionResult> GetDropdownList([FromRoute] string candidatename)
        {
            ModelResponse modelResponse = new ModelResponse();

            if (string.IsNullOrWhiteSpace(candidatename))
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = "Id are required.";
                modelResponse.StatusCode = 400;
                return Ok(modelResponse);
            }
            try
            {
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString(); // CompanyId


                var result = await candidateSalaryRepository.GetCandidateNameSerch(candidatename, decryptedCompanyId);


                modelResponse.IsSuccess = result.IsSuccessfull;
                modelResponse.Message = result.Message;
                modelResponse.Data = result.Data;
                modelResponse.StatusCode = result.IsSuccessfull ? 200 : 400;

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


        [HttpGet("CandidateDetails")]
        [Authorize]
        public async Task<IActionResult> CandidateDetailsById([FromQuery] string? pk_recId)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                // Await the repository call
                var (candidate_Detail, salaryHead1, salaryHead2, value1, value2) = await candidateSalaryRepository.GetCandidateDetailsById(pk_recId);

                if (candidate_Detail == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid CandidateId";
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Screening App List retrieved successfully";
                modelResponse.Data = new
                {
                    candidate_Detail = candidate_Detail,
                    salaryHead1 = salaryHead1,
                    salaryHead2 = salaryHead2,
                   EarningAmount = value1,
                    DeductionAmount = value2,
                };
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




    }
}
