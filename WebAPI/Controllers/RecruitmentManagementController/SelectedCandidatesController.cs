using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class SelectedCandidatesController : ControllerBase
    {
        private readonly ISelectedCandidatesRepository selectedCandidatesRepository;


        public SelectedCandidatesController(ISelectedCandidatesRepository _selectedCandidatesRepository)

        {
            selectedCandidatesRepository = _selectedCandidatesRepository;
        }

        [HttpPut]
        [Authorize] // Secured endpoint
        public async Task<IActionResult> UpdateFinalSelectionStatus([FromBody] SelectedCandidatesMstDataSet updateData)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                // Retrieve decrypted User ID and Location ID from HTTP context
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString();
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString();

                // Assign the User ID and Location ID to the first candidate
                updateData.Candidates[0].Fk_UserID = decryptedUserId;
                updateData.Candidates[0].Fk_LocID = decryptedLocationId;

                // Call repository method to update data
                bool isUpdated = await selectedCandidatesRepository.UpdateFinalSelectionStatus(updateData);

                // Build response
                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated
                    ? "Final selection status updated successfully."
                    : "Failed to update final selection status.";
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

        [HttpGet("{fk_jobid}")]
        [Authorize]
        public async Task<IActionResult> GetFinalSelectedCandidatesByJobId([FromRoute] string fk_jobid)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var (selectedCandidatesList, selectedCandidateMeta) = await selectedCandidatesRepository.GetFinalSelectedCandidatesByJobId(fk_jobid);

                if (selectedCandidatesList == null || selectedCandidatesList.Count == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No final selected candidate data found for the given Job ID.";
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Final selected candidate details retrieved successfully.";
                modelResponse.Data = new
                {
                    candidatedetail = selectedCandidatesList,
                    jobdetails = selectedCandidateMeta
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



    }
}
