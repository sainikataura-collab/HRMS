using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class InterviewEvaluationController : ControllerBase
    {
        private readonly IInterviewEvaluationRepository interviewEvaluationRepository;

        public InterviewEvaluationController(IInterviewEvaluationRepository _interviewEvaluationRepository)
        {
            interviewEvaluationRepository = _interviewEvaluationRepository;
        }

        [HttpPost]
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult> Insert([FromBody] ScoringSheetXmlModel dataset)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString();
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]?.ToString();

                bool isInserted = await interviewEvaluationRepository.Insert(dataset, decryptedUserId, decryptedLocationId);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "Inserted successfully." : "Failed to insert.";
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
        public async Task<IActionResult> Update([FromBody] ScoringSheetXmlModel dataset)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]?.ToString();

                bool isUpdated = await interviewEvaluationRepository.Update(dataset,dataset.ScoringSheets.fk_recId, decryptedUserId, decryptedLocationId);

                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated ? "Updated successfully." : "Failed to update.";
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


        [HttpGet("{fk_recId}")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetById([FromRoute] string fk_recId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {

                ScoringSheetEditModel result = await interviewEvaluationRepository.GetById(fk_recId);
                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid Id";
                    return Ok(modelResponse);
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

        [HttpDelete("{fk_recId}")]
        [Authorize]
        public async Task<IActionResult> DeleteAsync([FromRoute] string fk_recId)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                bool isDeleted = await interviewEvaluationRepository.DeleteAsync(fk_recId);

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


        [HttpGet("GetALL/{Fk_RecId}")]
        [Authorize]
        public async Task<IActionResult> GetAll([FromRoute] string Fk_RecId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var result = await interviewEvaluationRepository.GetAll(Fk_RecId);

                // Check if result is null or has no items
                if (result == null || !result.Any())
                {
                    modelResponse.IsSuccess = true;
                    modelResponse.Message = "failed to  retrieved  detail";
                    modelResponse.Data = null;
                    modelResponse.StatusCode = 200;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Detailed retrieved  successfully";
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




        [HttpGet("Getdropdown/{fk_jobId}")]
        [Authorize]
        public async Task<IActionResult> GetSubsectionDropdownListAsync([FromRoute] string fk_jobId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var (selectedCandidates, interviewers) = await interviewEvaluationRepository.GetDropdown(fk_jobId);

                if (selectedCandidates == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record Found Or Invalid Id";
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = " Data retrieved successfully.";
                modelResponse.Data = new
                {
                    SelectedCandidates = selectedCandidates,
                    Interviewers = interviewers,
                };
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

        [HttpGet("GetInterviewRounds/{jobId}")]
        [Authorize]
        public async Task<IActionResult> GetInterviewRounds(string jobId)
        {

            var modelResponse = new ModelResponse();
            try
            {
             
                InterviewRoundDto obj = await interviewEvaluationRepository.GetInterviewRoundsAsync(jobId);

                if (obj.InterviewRoundList == null || obj.InterviewRoundList.Count == 0)
                {

                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "failed to fetched list";
                    modelResponse.StatusCode = 500;
                    return Ok(modelResponse);
                }
                var finalRound = new List<NameValue>();
                foreach (var item in obj.InterviewRoundList)
                {
                    NameValue a = new NameValue { Name=item.ToString(),Value = item.ToString()};
                    finalRound.Add(a);
                }
                modelResponse.IsSuccess = true;
                modelResponse.Message = "Successfully fetched list";
                modelResponse.Data = new { finalRound, obj.Job_opening_date,obj.Job_closing_date};
                ;
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
