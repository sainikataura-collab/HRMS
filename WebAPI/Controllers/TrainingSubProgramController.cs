using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers.TrainingTransaction
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class TrainingSubProgramController : ControllerBase
    {




        private readonly ITrainingSubProgramRepository trainingSubProgramRepository;
        public TrainingSubProgramController(ITrainingSubProgramRepository _trainingSubProgramRepository)

        {
            trainingSubProgramRepository = _trainingSubProgramRepository;
        }



        [HttpPost("Insert")]
        [Authorize] // Secured endpoint

        public async Task<IActionResult> InsertMstAsync([FromBody] TrainingSubProgramMst programMst)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {

                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId

                programMst.UserId = decryptedUserId;

                bool isInserted = await trainingSubProgramRepository.Insertsubprogram(programMst);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "sub-program inserted successfully." : "Failed to insert program.";
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
        public async Task<IActionResult> GetAll(int pageIndex = 0, int pageSize = 10)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {

                var (totalCount, result) = await trainingSubProgramRepository.GetAllsubprogram(pageIndex, pageSize);
                if (result.Count() == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }



                modelResponse.IsSuccess = true;
                modelResponse.Message = "sub-Program  List retrieved successfully.";
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
        public async Task<IActionResult> UpdateAsync([FromBody] TrainingSubProgramMst programMst)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {

                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId

                programMst.UserId = decryptedUserId;


                bool isUpdated = await trainingSubProgramRepository.UpdateSubprogram(programMst);

                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated ? "sub-Program updated successfully." : "Failed to update sub-program";
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

        [HttpGet("{programId}")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetbyId([FromRoute] long? programId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {


                TrainingSubProgramMst result = await trainingSubProgramRepository.GetByIdSubprogram(programId);


                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid DesigId";
                    return Ok(modelResponse);
                }


                modelResponse.IsSuccess = true;
                modelResponse.Message = "sub-Program detail retrieved successfully.";
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





        [HttpDelete("{subprogramId}")]
        [Authorize]
        public async Task<IActionResult> DeleteMstAsync([FromRoute] long? subprogramId)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId


                bool isDeleted = await trainingSubProgramRepository.DeleteAsync(subprogramId, decryptedUserId);

                modelResponse.IsSuccess = isDeleted;
                modelResponse.Message = isDeleted ? "sub-Program detail delete successfully." : "Failed to delete sub- Program detail.";
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
