using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Data;

namespace HRMSWebAPI.Controllers.TrainingTransaction
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class TrainingPlanningController : ControllerBase
    {




        private readonly ITrainingPlanningRepository TrainingPlanningRepository;

        public TrainingPlanningController(ITrainingPlanningRepository _TrainingPlanningRepository)

        {
            TrainingPlanningRepository = _TrainingPlanningRepository;
        }

        [HttpGet]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetAll_TrainingPlanning(int pageIndex = 0, int pageSize = 10)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {

                var (totalCount, result) = await TrainingPlanningRepository.GetAll(pageIndex, pageSize);
                if (result.Count() == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }



                modelResponse.IsSuccess = true;
                modelResponse.Message = " Training  Planning List retrieved successfully.";
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





        [HttpGet("GetById/{planningId}")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetById([FromRoute] long planningId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var result = await TrainingPlanningRepository.GetTrainingPlanningByIdAsync(planningId);

                if (result.Item1 == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid Training Planning ID";
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Training Planning detail retrieved successfully.";
                modelResponse.Data = new
                {
                    Training = result.Item1,
                    AudienceTypeDetails = result.Item2
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



        [HttpPost("insert")]
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult> InsertAsync([FromBody] TrainingPlanningInsertRequest planningData)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                if (planningData == null || planningData.Training == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid request payload.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                bool isInserted = await TrainingPlanningRepository.InsertTrainingPlanningAsync(
                    planningData.Training,
                    planningData.AudienceDetails
                );

                modelResponse.IsSuccess = true;
                modelResponse.Message = isInserted
                    ? "Training planning inserted successfully."
                    : "Failed to insert training planning.";
                modelResponse.StatusCode = isInserted ? 200 : 400;

                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;

                return Ok(modelResponse); // keeping your style
            }
        }



        [HttpPut("update")]
        [Authorize] // Secured endpoint
        public async Task<IActionResult> UpdateAsync([FromBody] TrainingPlanningInsertRequest planningData)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                if (planningData == null || planningData.Training == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid request payload.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                bool isUpdated = await TrainingPlanningRepository.UpdateTrainingPlanningAsync(
                    planningData.Training,
                    planningData.AudienceDetails
                );

                modelResponse.IsSuccess = true;
                modelResponse.Message = isUpdated ? "Training planning updated successfully." : "Failed to update training planning.";
                modelResponse.StatusCode = isUpdated ? 200 : 400;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;
                return Ok(modelResponse); // keeping your style
            }
        }


        [HttpDelete("Delete/{planningid}")]
        [Authorize]
        public async Task<IActionResult> Delete([FromRoute] long planningid)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                bool isDeleted = await TrainingPlanningRepository.DeleteAsync(planningid);

                modelResponse.IsSuccess = isDeleted;
                modelResponse.Message = isDeleted ? "planning  detail delete successfully." : "Failed to delete planning detail.";
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



        [HttpGet("ViewAllPlannedEmployee")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetAttendanceview([FromQuery] int programid, [FromQuery] int subprogramid)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                // var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();

                var result = await TrainingPlanningRepository.GetTrainingPlanEmpView(programid, subprogramid);

                if (result.Item1 == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid IDs";
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Attendance Data  retrieved successfully.";
                modelResponse.Data = new
                {
                    Programs = result.Item1,
                    Employees = result.Item2
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



        [HttpGet("TrainingAttendanceforAdmin")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetAttendance([FromQuery] string pk_empid, [FromQuery] int programid, [FromQuery] int subprogramid)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                // var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();

                var result = await TrainingPlanningRepository.GetTrainingAttendance(pk_empid, programid, subprogramid);

                if (result.Item1 == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid IDs";
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Attendance Data  retrieved successfully.";
                modelResponse.Data = new
                {
                    Programs = result.Item1,
                    EmpAttandance = result.Item2
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






        [HttpGet("CompletedPrograms")]
        [Authorize]
        public async Task<IActionResult> GetCompletedProgramsDropdown()
        {
            var modelResponse = new ModelResponse();

            try
            {
                // ✅ Get logged-in employee ID from decrypted token (middleware populates this)
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();

                if (string.IsNullOrWhiteSpace(decryptedUserId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "User ID not found in token.";
                    modelResponse.StatusCode = 401;
                    return Ok(modelResponse);
                }

                // ✅ Call repository method
                var result = await TrainingPlanningRepository.GetCompletedProgramsDropdownList(decryptedUserId);

                modelResponse.IsSuccess = result.IsSuccessfull;
                modelResponse.Message = result.Message;
                modelResponse.Data = result.Data;
                modelResponse.StatusCode = result.IsSuccessfull ? 200 : 404;

                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = $"Internal Server Error: {ex.Message}";
                modelResponse.StatusCode = 500;
                return Ok(modelResponse);
            }
        }

    }
}
