using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers.TrainingTransaction
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class TrainingProgramController : ControllerBase
    {


        private readonly ITrainingProgramMasterRepository trainingProgramMasterRepository;
        public TrainingProgramController(ITrainingProgramMasterRepository _trainingProgramMasterRepository)

        {
            trainingProgramMasterRepository = _trainingProgramMasterRepository;
        }



        [HttpPost("Insert")]
        [Authorize] // Secured endpoint

        public async Task<IActionResult> InsertProgramMstAsync([FromBody] TrainingProgramMst programMst)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {

                bool isInserted = await trainingProgramMasterRepository.Insert(programMst);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "program inserted successfully." : "Failed to insert program.";
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
        public async Task<IActionResult> GetAllProgram(int pageIndex = 0, int pageSize = 10)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {

                var (totalCount, result) = await trainingProgramMasterRepository.GetAll(pageIndex, pageSize);
                if (result.Count() == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }



                modelResponse.IsSuccess = true;
                modelResponse.Message = "Program  List retrieved successfully.";
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
        public async Task<IActionResult> UpdateDepartmentAsync([FromBody] TrainingProgramMst programMst)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                
               

                bool isUpdated = await trainingProgramMasterRepository.Update(programMst);

                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated ? "Program updated successfully." : "Failed to update Program.";
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
        public async Task<IActionResult> GetbyIdAsync([FromRoute] long? programId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {


                TrainingProgramMst result = await trainingProgramMasterRepository.GetByIdAsync(programId);



                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid DesigId";
                    return Ok(modelResponse);
                }


                modelResponse.IsSuccess = true;
                modelResponse.Message = "Program detail retrieved successfully.";
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





        [HttpDelete("{programId}")]
        [Authorize]
        public async Task<IActionResult> DeleteMstAsync([FromRoute] long programId)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                bool isDeleted = await trainingProgramMasterRepository.DeleteAsync(programId);

                modelResponse.IsSuccess = isDeleted;
                modelResponse.Message = isDeleted ? "Program detail delete successfully." : "Failed to delete Program detail.";
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
