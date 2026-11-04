using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers.TrainingTransaction
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class TrainingCalendarController : ControllerBase
    {


        private readonly ITrainingCalendarRepository trainingCalendarRepository;
        private readonly FileService fileService;


        public TrainingCalendarController(ITrainingCalendarRepository _trainingCalendarRepository, FileService _FileService)
        {
            trainingCalendarRepository = _trainingCalendarRepository;
            fileService = _FileService;
        }


        // Insert
        [HttpPost("insert")]
        [Authorize]
        public async Task<IActionResult> InsertAsync([FromBody] TrainingCalendar trainingData)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                if (trainingData == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid request payload.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                bool isInserted = await trainingCalendarRepository.InsertTrainingCalendarAsync(trainingData);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted  ? "Training calendar inserted successfully."  : "Failed to insert training calendar.";
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



        [HttpGet("GetById/{planningId}")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetById([FromRoute] long planningId)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                TrainingPlanning result = await trainingCalendarRepository.GetByIdAsyncforCalendar(planningId);
                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid Id";
                    return Ok(modelResponse);
                }
                modelResponse.IsSuccess = true;
                modelResponse.Message = "data retrieved successfully.";
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

        [HttpGet("admin/calendarlist")]
        [Authorize]  // optional if only admin can access
        public IActionResult GetAdminCalendarList()
        {
            var modelResponse = new ModelResponse();

            try
            {
                // Repository call (no parameters needed)
                var result = trainingCalendarRepository.GetAdminCalendarList().ToList();

                if (result == null || !result.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No training calendar records found.";
                    modelResponse.Data = result;
                    modelResponse.StatusCode = 200;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Training calendar list retrieved successfully.";
                modelResponse.Data = result;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.Data = new List<getAdminCalendarList>();
                modelResponse.StatusCode = 500;
                return Ok(modelResponse);
            }
        }


        [HttpGet("GetforAttendancemark")]
        [Authorize]  // Secured endpoint
        public IActionResult GetForEmployee([FromQuery] string? fk_empid)
        {
            var modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();

                // Call synchronous repository method
                List<getAdminCalendarList> result = trainingCalendarRepository.GetAll(decryptedUserId).ToList();

                if (result == null || !result.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No registrations found.";
                    modelResponse.Data = result;
                    modelResponse.StatusCode = 200;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "View detail retrieved successfully.";
                modelResponse.Data = result;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.Data = new List<getAdminCalendarList>();
                modelResponse.StatusCode = 500;
                return Ok(modelResponse);
            }
        }





        // For Attendance



        [HttpPost("attendance/insert")]
        [Authorize]
        public async Task<IActionResult> InsertAttendanceAsync([FromBody] TrainingAttendanceDto attendance)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                //var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                //var decryptedAdminUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                //attendance.fk_empId = decryptedUserId;
                //attendance.adminId = decryptedAdminUserId;
               
                    var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                    attendance.fk_empId = decryptedUserId;
                

                if (attendance == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid request payload.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                // 🔹 Call repo which returns SP response (IsSuccess + Message)
                var dbResponse = await trainingCalendarRepository.InsertTrainingAttendanceAsync(attendance);

                modelResponse.IsSuccess = dbResponse.IsSuccess;
                modelResponse.Message = dbResponse.Message;
                modelResponse.StatusCode = dbResponse.IsSuccess ? 200 : 400;

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


        [HttpPost("attendanceByAdmin/insert")]
        [Authorize]
        public async Task<IActionResult> adminAttendanceAsync([FromBody] TrainingAttendanceDto attendance)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var decryptedAdminUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                attendance.adminId = decryptedAdminUserId;

                if (attendance == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid request payload.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                // 🔹 Call repo which returns SP response (IsSuccess + Message)
                var dbResponse = await trainingCalendarRepository.InsertTrainingAttendanceAsync(attendance);

                modelResponse.IsSuccess = dbResponse.IsSuccess;
                modelResponse.Message = dbResponse.Message;
                modelResponse.StatusCode = dbResponse.IsSuccess ? 200 : 400;

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


        [HttpGet("attendance/check-today")]
        [Authorize]
        public async Task<IActionResult> CheckTodayAttendanceAsync(int calendarId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                // Get logged-in employee ID
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();

                if (string.IsNullOrEmpty(decryptedUserId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Employee not found.";
                    modelResponse.StatusCode = 401;
                    return Ok(modelResponse);
                }
                // Call repository method
                string message = await trainingCalendarRepository.CheckTodayAttendanceAsync(calendarId, decryptedUserId);
                modelResponse.IsSuccess = true;
                modelResponse.Message = message ?? "No attendance record for today.";
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


        // for employee  attendance view

        [HttpGet("TrainingAttendanceView/{pk_planningId}")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetAttendanceview([FromRoute] int pk_planningId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();

                var result = await trainingCalendarRepository.GetTrainingAttendanceView(pk_planningId, decryptedUserId);

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
                    employeeinfo = result.Item1,
                    empAttendetails = result.Item2
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




        [HttpPost("UploadMaterial")]
        [Authorize]
       
        public async Task<IActionResult> InsertTrainingMaterialAsync([FromForm] TrainingMaterial materialData)
        {
            var response = new ModelResponse();

            try
            {

                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                materialData.uploadedBy = decryptedUserId;

                if (materialData == null)
                    return Ok(new ModelResponse { IsSuccess = false, Message = "Invalid request payload.", StatusCode = 400 });

                var file = materialData.file;

                if (materialData.materialType == "video" || materialData.materialType == "document")
                {
                    if (file == null)
                        return Ok(new ModelResponse { IsSuccess = false, Message = "File is required for video/document type.", StatusCode = 400 });

                    bool isValid = materialData.materialType == "video"
                        ? fileService.IsVideoFile(file)
                        : fileService.IsDocumentFile(file);
                    if (!isValid)

                        return Ok(new ModelResponse { IsSuccess = false, Message = $"Invalid {materialData.materialType} file type.", StatusCode = 400 });
                        var savedFileName = await fileService.SaveFileAsync(file);
                        materialData.materialPath = Path.Combine(savedFileName);
                        materialData.fileSize = $"{(file.Length / 1024.0):F2} KB";
                }

                if ((materialData.materialType == "youtube" || materialData.materialType == "link") &&
                    string.IsNullOrEmpty(materialData.materialUrl))
                {
                    return Ok(new ModelResponse { IsSuccess = false, Message = "URL is required for youtube/link type.", StatusCode = 400 });
                }

                bool isInserted = await trainingCalendarRepository.InsertMaterialAsync(materialData);
                response.IsSuccess = isInserted;
                response.Message = isInserted ? "Training material inserted successfully." : "Failed to insert training material.";
                response.StatusCode = isInserted ? 200 : 400;
                return Ok(response);
            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.Message = ex.Message;
                response.StatusCode = 500;
                return Ok(response);
            }
        }




        //GetAll Meterial

        [HttpGet("MaterialGetAll")]
        [Authorize]
        public async Task<IActionResult> GetAllTrainingMaterials(
        int pageIndex = 0,
        int pageSize = 10,
        int? fk_planningId = null,
        string? materialType = null,
        bool? isActive = null
)
        {
            var modelResponse = new ModelResponse();

            try
            {
                var (totalCount, result) = await trainingCalendarRepository.GetAll(
                    pageIndex,
                    pageSize,
                    fk_planningId,
                    materialType,
                    isActive
                );
                if (result == null || !result.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Training Materials retrieved successfully.";
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

        [HttpGet("MaterialGetbyId/{materialId}")]
        [Authorize]
        public async Task<IActionResult> GetTrainingMaterialById(int materialId)
        {
            var modelResponse = new ModelResponse();

            try
            {
                var material = await trainingCalendarRepository.GetById(materialId);
                if (material == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Training Material not found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }
                modelResponse.IsSuccess = true;
                modelResponse.Message = "Training Material retrieved successfully.";
                modelResponse.Data = material;
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


        [HttpPost("UpdateMaterial")]
        [Authorize]
        public async Task<IActionResult> UpdateMaterialAsync([FromForm] TrainingMaterial materialData)
        {
            var response = new ModelResponse();

            try
            {
                // ✅ Decrypt user ID from token
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                materialData.uploadedBy = decryptedUserId;

                // ✅ Basic validation
                if (materialData == null || materialData.pk_materialId == null)
                    return Ok(new ModelResponse { IsSuccess = false, Message = "Invalid request payload. Material ID is required for update.", StatusCode = 400 });

                var file = materialData.file;


                // ✅ Handle file-based types (video/document)
                if (materialData.materialType == "video" || materialData.materialType == "document")
                {
                    if (file != null)
                    {
                        bool isValid = materialData.materialType == "video"
                            ? fileService.IsVideoFile(file)
                            : fileService.IsDocumentFile(file);

                        if (!isValid)
                        return Ok(new ModelResponse { IsSuccess = false, Message = $"Invalid {materialData.materialType} file type.", StatusCode = 400 });
                        var savedFileName = await fileService.SaveFileInLocationAsync(file, "Uploads");
                        materialData.materialPath = Path.Combine("Uploads", savedFileName);
                        materialData.fileSize = $"{(file.Length / 1024.0):F2} KB";
                    }
                }

                // ✅ For link/youtube — require URL
                if ((materialData.materialType == "youtube" || materialData.materialType == "link") &&
                    string.IsNullOrEmpty(materialData.materialUrl))
                {
                    return Ok(new ModelResponse
                    {
                        IsSuccess = false,
                        Message = "URL is required for youtube/link type material.",
                        StatusCode = 400
                    });
                }

                // ✅ Call repository for update
                bool isUpdated = await trainingCalendarRepository.UpdateMaterialAsync(materialData);

                response.IsSuccess = isUpdated;
                response.Message = isUpdated
                    ? "Training material updated successfully."
                    : "Failed to update training material.";
                response.StatusCode = isUpdated ? 200 : 400;

                return Ok(response);
            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.Message = ex.Message;
                response.StatusCode = 500;
                return Ok(response);
            }
        }




        //[HttpPost("Material/insertMaterial")]
        //[Authorize]

        //public async Task<IActionResult> InsertTrainingMaterialAsync([FromForm] TrainingMaterial materialData, [FromForm] IFormFile? file)
        //{
        //    var modelResponse = new ModelResponse();
        //    try
        //    {
        //        if (materialData == null)
        //        {
        //            return Ok(new ModelResponse
        //            {
        //                IsSuccess = false,
        //                Message = "Invalid request payload.",
        //                StatusCode = 400
        //            });
        //        }

        //        // HANDLE FILE UPLOAD FOR VIDEO/DOCUMENT
        //        if (materialData.materialType == "video" || materialData.materialType == "document")
        //        {
        //            if (file == null)
        //            {
        //                return Ok(new ModelResponse
        //                {
        //                    IsSuccess = false,
        //                    Message = "File is required for video/document type.",
        //                    StatusCode = 400
        //                });
        //            }

        //            bool isValid = materialData.materialType == "video"
        //                ? fileService.IsVideoFile(file)
        //                : fileService.IsDocumentFile(file);

        //            if (!isValid)
        //            {
        //                return Ok(new ModelResponse
        //                {
        //                    IsSuccess = false,
        //                    Message = $"Invalid {materialData.materialType} file type.",
        //                    StatusCode = 400
        //                });
        //            }

        //            // Save file
        //            var savedFileName = await fileService.SaveFileInLocationAsync(file, "training-materials");
        //            materialData.materialPath = Path.Combine("training-materials", savedFileName);
        //            materialData.fileSize = $"{(file.Length / 1024.0):F2} KB";
        //        }

        //        // VALIDATE LINK/YOUTUBE
        //        if (materialData.materialType == "youtube" || materialData.materialType == "link")
        //        {
        //            if (string.IsNullOrEmpty(materialData.materialUrl))
        //            {
        //                return Ok(new ModelResponse
        //                {
        //                    IsSuccess = false,
        //                    Message = "URL is required for youtube/link type.",
        //                    StatusCode = 400
        //                });
        //            }
        //        }

        //        // SAVE TO DATABASE
        //        bool isInserted = await trainingCalendarRepository.InsertMaterialAsync(materialData);

        //        modelResponse.IsSuccess = isInserted;
        //        modelResponse.Message = isInserted
        //            ? "Training material inserted successfully."
        //            : "Failed to insert training material.";
        //        modelResponse.StatusCode = isInserted ? 200 : 400;

        //        return Ok(modelResponse);
        //    }
        //    catch (Exception ex)
        //    {
        //        modelResponse.IsSuccess = false;
        //        modelResponse.Message = ex.Message;
        //        modelResponse.StatusCode = 500;
        //        return Ok(modelResponse);
        //    }
        //}


        //feedback

        [HttpPost("GiveFeedback")]
        [Authorize]
        public async Task<IActionResult> InsertTrainingFeedbackAsync([FromBody] TrainingFeedback feedback)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                // Retrieve user, company, and location details from token context
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();

                // Set contextual values
                feedback.fk_empId = decryptedUserId;
                feedback.Date = feedback.Date ?? DateTime.Now;

                bool isInserted = await trainingCalendarRepository.InsertTrainingFeedbackAsync(feedback);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "Feedback submitted successfully." : "Failed to submit feedback.";
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
    }





}

