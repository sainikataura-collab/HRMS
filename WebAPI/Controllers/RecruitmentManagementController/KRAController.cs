using Dapper;
using DocumentFormat.OpenXml.Wordprocessing;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using System.Data;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class KRAController : ControllerBase
    {
        private readonly IKRARepository kRARepository;
        private readonly AppSettings appSettings;
        private readonly FileService _FileService;

        public KRAController(IKRARepository _kRARepository, IOptions<AppSettings> appSettings, FileService fileService)
        {
            kRARepository = _kRARepository;
            this.appSettings = appSettings.Value;
            _FileService = fileService;
        }

        //Rolewise 

        [HttpPost]
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult> InsertKRAAsync([FromForm] KRARequest kRARequest)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {


                if (kRARequest.FileBytes != null && kRARequest.FileBytes.Length > 0)
                {
                    // Optional: Validate it's an image
                    if (!_FileService.IsImageFile(kRARequest.FileBytes))
                    {
                        return BadRequest(new { message = "Only image files (jpg, jpeg, png) are allowed." });
                    }

                    // Save the file
                    var savedFileName = await _FileService.SaveFileAsync(kRARequest.FileBytes);

                    // Save the file path in LogoPath (this will go to DB)
                    kRARequest.AttachmentPath = savedFileName;
                }

                kRARequest.FileBytes = null;

                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString(); // Retrieve encryptedLocationId-string
                kRARequest.UserId = decryptedUserId;
                if (kRARequest.fk_empId != null)
                {
                    bool isEmployeewiseInserted = await kRARepository.InsertEmployeewiseKRAAsync(kRARequest);
                    modelResponse.IsSuccess = isEmployeewiseInserted;
                    modelResponse.Message = isEmployeewiseInserted ? "KRA Details inserted or Update successfully." : "Failed to insert or Update KRA Details.";
                    modelResponse.StatusCode = isEmployeewiseInserted ? 200 : 400;
                }
                else
                {
                    bool isRolewiseInserted = await kRARepository.InsertRolewiseKRAAsync(kRARequest);
                    modelResponse.IsSuccess = isRolewiseInserted;
                    modelResponse.Message = isRolewiseInserted ? "KRA Details inserted or Update successfully." : "Failed to insert or Update KRA Details.";
                    modelResponse.StatusCode = isRolewiseInserted ? 200 : 400;
                }

                //kRARequest.Message = isInserted.ToString();


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










        [HttpDelete("DeleteRolewise")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> DeleteRolewiseAsync([FromQuery] int roleId, [FromQuery] long SrNo)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                bool rolewise = await kRARepository.Del_RolewiseKRA_Async(roleId, SrNo);

                if (rolewise == false)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No records found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Rolewise list Delete successfully.";
                modelResponse.Data = rolewise;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = "An error occurred. " + ex.Message;
                modelResponse.StatusCode = 500;
                return Ok(modelResponse);
            }
        }


        [HttpDelete("DeleteEmployeewise")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> DeleteEmployeewiseAsync([FromQuery] string fk_empId, [FromQuery] long SrNo)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                bool employeewise = await kRARepository.Del_Employeewise_KRA_Async(fk_empId, SrNo);

                if (employeewise == false)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No records found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Empwise list Delete successfully.";
                modelResponse.Data = employeewise;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = "An error occurred. " + ex.Message;
                modelResponse.StatusCode = 500;
                return Ok(modelResponse);
            }
        }



        [HttpGet]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetRolewiseAsync()
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var employeewise = await kRARepository.GetRolewise_list_Async();

                if (employeewise == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No records found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Rolewise list  successfully.";
                modelResponse.Data = employeewise;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = "An error occurred. " + ex.Message;
                modelResponse.StatusCode = 500;
                return Ok(modelResponse);
            }
        }


        [HttpGet("GetRoleId")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetRoleIdAsync([FromQuery] string roleId, [FromQuery] long SrNo)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                List<KRAList> result = await kRARepository.GetRolewiseByIdAsync(roleId, SrNo);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid Id";
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Rolewise detail retrieved successfully.";
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


        //--   Empwise  KRA


        [HttpGet("GetEmpList")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetEmpwiseAsync()
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var employeewise = await kRARepository.GetEmpwise_list_Async();

                if (employeewise == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No records found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Empwise list  successfully.";
                modelResponse.Data = employeewise;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = "An error occurred. " + ex.Message;
                modelResponse.StatusCode = 500;
                return Ok(modelResponse);
            }
        }




        [HttpGet("GetEmpId")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetEmpIdAsync([FromQuery] string fk_empId, [FromQuery] long SrNo)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                List<KRAList> result = await kRARepository.GetEmpwiseByIdAsync(fk_empId, SrNo);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid Id";
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Empwise detail retrieved successfully.";
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




        //Self Assesment KRA













        //[HttpPost("Self_KRA")]
        //[Authorize]
        //public async Task<IActionResult> InsertAsync([FromForm] List<IFormFile> files, [FromForm] List<Self_Assesment_KRA> kraJson)
        //{
        //    var modelResponse = new ModelResponse();

        //    try
        //    {
        //        var models = kraJson;

        //        if (models == null || !models.Any())
        //            return BadRequest(new { message = "No data to process." });

        //        foreach (var model in models)
        //        {
        //            // Handle self file (filename)
        //            if (!string.IsNullOrEmpty(model.AttachmentPath))
        //            {
        //                var file = files.FirstOrDefault(f => f.FileName == model.AttachmentPath);
        //                if (file != null)
        //                {
        //                    if (!_FileService.IsImageFile(file))
        //                        return BadRequest(new { message = $"Invalid file for {file.FileName}" });

        //                    var savedName = await _FileService.SaveFileAsync(file);
        //                    model.AttachmentPath = savedName;
        //                }
        //            }

        //            // Handle RM file (Rmfilename)
        //            if (!string.IsNullOrEmpty(model.Rmfilename))
        //            {
        //                var rmFile = files.FirstOrDefault(f => f.FileName == model.Rmfilename);
        //                if (rmFile != null)
        //                {
        //                    if (!_FileService.IsImageFile(rmFile))
        //                        return BadRequest(new { message = $"Invalid RM file for {rmFile.FileName}" });

        //                    var savedRmName = await _FileService.SaveFileAsync(rmFile);
        //                    model.Rmfilename = savedRmName;
        //                }
        //            }

        //            // Handle HOD file (HODfilename)
        //            if (!string.IsNullOrEmpty(model.HODfilename))
        //            {
        //                var hodFile = files.FirstOrDefault(f => f.FileName == model.HODfilename);
        //                if (hodFile != null)
        //                {
        //                    if (!_FileService.IsImageFile(hodFile))
        //                        return BadRequest(new { message = $"Invalid HOD file for {hodFile.FileName}" });

        //                    var savedHODName = await _FileService.SaveFileAsync(hodFile);
        //                    model.HODfilename = savedHODName;
        //                }
        //            }

        //            // Clean up
        //            model.FileBytes = null;
        //        }

        //        // Call repository
        //        bool isInserted = await kRARepository.Insert_Self_Assesment_Multiple(models);

        //        modelResponse.IsSuccess = isInserted;
        //        modelResponse.Message = isInserted ? "Self Assessment data saved successfully." : "Insert failed.";
        //        modelResponse.StatusCode = isInserted ? 200 : 400;

        //        return Ok(modelResponse);
        //    }
        //    catch (Exception ex)
        //    {
        //        modelResponse.IsSuccess = false;
        //        modelResponse.Message = ex.Message;
        //        modelResponse.StatusCode = 500;

        //        return StatusCode(500, modelResponse);
        //    }
        //}




        [HttpPost("Self_KRA")]
        [Authorize]
        public async Task<IActionResult> InsertAsync(
        [FromForm] List<IFormFile> files,
        [FromForm] List<kraSelfAss> kraJson)
        {
            var modelResponse = new ModelResponse();

            try
            {
                var models = kraJson;



                if (models == null || !models.Any())
                    return BadRequest(new { message = "No data to process." });

                foreach (var model in models)
                {
                    // Save AttachmentPath file (e.g., Self's uploaded file)
                    //if (!string.IsNullOrEmpty(model.AttachmentPath))
                    //{
                    //    var file = files.FirstOrDefault(f => f.FileName == model.AttachmentPath);
                    //    if (file != null)
                    //    {
                    //        if (!_FileService.IsImageFile(file))
                    //            return BadRequest(new { message = $"Invalid file for {file.FileName}" });

                    //        var savedPath = await _FileService.SaveFileAsync(file);
                    //        model.AttachmentPath = savedPath;
                    //    }
                    //}

                    // Save AssessmentAttachmentPath file (e.g., Remarks upload)
                    if (!string.IsNullOrEmpty(model.AssessmentAttachmentPath))
                    {
                        var assessFile = files.FirstOrDefault(f => f.FileName == model.AssessmentAttachmentPath);
                        if (assessFile != null)
                        {
                            if (!_FileService.IsImageFile(assessFile))
                                return BadRequest(new { message = $"Invalid file for {assessFile.FileName}" });

                            var savedPath = await _FileService.SaveFileAsync(assessFile);
                            model.AssessmentAttachmentPath = savedPath;
                        }
                    }

                    // Clean up unused file property
                    model.FileBytes = null;
                    var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString(); // Retrieve encryptedLocationId-string
                    model.fk_empid = decryptedUserId;
                }



                // Call repository to insert multiple records via your proc
                bool isInserted = await kRARepository.Insert_Self_Assesment_Multiple(models);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted
                    ? "Self Assessment data saved successfully."
                    : "Insert failed.";
                modelResponse.StatusCode = isInserted ? 200 : 400;

                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;

                return StatusCode(500, modelResponse);
            }
        }






        //Update


        [HttpPut("Self_KRA_Update")]
        [Authorize]
        public async Task<IActionResult> UpdateAsync([FromForm] List<IFormFile> files, [FromForm] List<kraSelfAss> kraJson)
        {
            var modelResponse = new ModelResponse();

            try
            {
                var models = kraJson;

                if (models == null || !models.Any())
                    return BadRequest(new { message = "No data to update." });

                foreach (var model in models)
                {
                    // Check and update AssessmentAttachmentPath only if new file is uploaded
                    if (!string.IsNullOrEmpty(model.AssessmentAttachmentPath))
                    {
                        var assessFile = files.FirstOrDefault(f => f.FileName == model.AssessmentAttachmentPath);
                        if (assessFile != null)
                        {
                            if (!_FileService.IsImageFile(assessFile))
                                return BadRequest(new { message = $"Invalid file for {assessFile.FileName}" });

                            var savedPath = await _FileService.SaveFileAsync(assessFile);
                            model.AssessmentAttachmentPath = savedPath;
                        }
                        else
                        {
                            // File not uploaded, don't overwrite existing path
                            model.AssessmentAttachmentPath = null;
                        }
                    }

                    // Clean file bytes or unused props
                    model.FileBytes = null;

                    // Set user from token/decrypted
                    var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                    model.fk_empid = decryptedUserId;
                }


                // Call your repository update logic
                bool isUpdated = await kRARepository.Update_Self_Assessment_Multiple(models);

                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated
                    ? "Self Assessment updated successfully."
                    : "Update failed.";
                modelResponse.StatusCode = isUpdated ? 200 : 400;

                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;
                return StatusCode(500, modelResponse);
            }
        }






        [HttpPut("RM_Assessment_Update")]
        [Authorize]
        public async Task<IActionResult> Update([FromForm] List<IFormFile> files, [FromForm] List<UpdModel> kraJson)
        {
            var modelResponse = new ModelResponse();

            try
            {
                var models = kraJson;

                if (models == null || !models.Any())
                    return BadRequest(new { message = "No data to update." });

                foreach (var model in models)
                {
                    // Check and update AssessmentAttachmentPath only if new file is uploaded
                    if (!string.IsNullOrEmpty(model.AssessmentAttachmentPath))
                    {
                        var assessFile = files.FirstOrDefault(f => f.FileName == model.AssessmentAttachmentPath);
                        if (assessFile != null)
                        {
                            if (!_FileService.IsImageFile(assessFile))
                                return BadRequest(new { message = $"Invalid file for {assessFile.FileName}" });

                            var savedPath = await _FileService.SaveFileAsync(assessFile);
                            model.AssessmentAttachmentPath = savedPath;
                        }
                        else
                        {
                            // File not uploaded, don't overwrite existing path
                            model.AssessmentAttachmentPath = null;
                        }
                    }

                    // Clean file bytes or unused props
                    model.FileBytes = null;

                    // Set user from token/decrypted
                    var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                    model.fk_empAppById = decryptedUserId;
                }


                // Call your repository update logic
                bool isUpdated = await kRARepository.Update_RM_Assessment_Multiple(models);

                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated
                    ? "Self Assessment updated successfully."
                    : "Update failed.";
                modelResponse.StatusCode = isUpdated ? 200 : 400;

                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;
                return StatusCode(500, modelResponse);
            }
        }




        [HttpPut("HOD_Assessment_Update")]
        [Authorize]
        public async Task<IActionResult> HODUpdate([FromForm] List<IFormFile> files, [FromForm] List<HODUpddel> kraJson)
        {
            var modelResponse = new ModelResponse();

            try
            {
                var models = kraJson;

                if (models == null || !models.Any())
                    return BadRequest(new { message = "No data to update." });

                foreach (var model in models)
                {
                    // Check and update AssessmentAttachmentPath only if new file is uploaded
                    if (!string.IsNullOrEmpty(model.AssessmentAttachmentPath))
                    {
                        var assessFile = files.FirstOrDefault(f => f.FileName == model.AssessmentAttachmentPath);
                        if (assessFile != null)
                        {
                            if (!_FileService.IsImageFile(assessFile))
                                return BadRequest(new { message = $"Invalid file for {assessFile.FileName}" });

                            var savedPath = await _FileService.SaveFileAsync(assessFile);
                            model.AssessmentAttachmentPath = savedPath;
                        }
                        else
                        {
                            // File not uploaded, don't overwrite existing path
                            model.AssessmentAttachmentPath = null;
                        }
                    }

                    // Clean file bytes or unused props
                    model.FileBytes = null;

                    // Set user from token/decrypted
                    var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                    model.fk_empAppById = decryptedUserId;
                }


                // Call your repository update logic
                bool isUpdated = await kRARepository.Update_HOD_Assessment_Multiple(models);

                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated
                    ? "Hod Assessment updated successfully."
                    : "Update failed.";
                modelResponse.StatusCode = isUpdated ? 200 : 400;

                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;
                return StatusCode(500, modelResponse);
            }
        }









        [HttpGet("Self_Assesment_Data")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetEmp_Self_Assessment()
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId

                List<KRA_Get_Assesment_data> result = await kRARepository.GetEmp_Self_Assess_ByIdAsync(decryptedUserId);

                if (result == null || !result.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "no data found for this emp id";
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Self Assessment Data By Emp detail retrieved successfully.";
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



        [HttpGet("Assesment_DataByID")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetEmp_Assessment([FromQuery] string kraId, long fk_kraperiodId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                List<KRA_Get_Assesment_data> result = await kRARepository.GetAssessmnet_ByIdAsync(kraId, fk_kraperiodId);

                if (result == null || !result.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "no data found for this emp id";
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = " Assessment Data retrieved successfully.";
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



        [HttpGet("RMAssesment_DataByID")]
        [Authorize]  // Secured endpoint // Secured endpoint
        public async Task<IActionResult> GetRM_Assessment([FromQuery] string empid, long fk_kraperiodId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {

                List<KRA_Get_Assesment_data> result = await kRARepository.GetRMAssessmnet_ByIdAsync(empid, fk_kraperiodId);

                if (result == null || !result.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "no data found for this emp id";
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = " Assessment Data retrieved successfully.";
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




        [HttpGet("HODAssesment_DataByID")]
        [Authorize]  // Secured endpoint // Secured endpoint
        public async Task<IActionResult> GetHOD_Assessment([FromQuery] string empid, long fk_kraperiodId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {

                List<KRA_Get_Assesment_data> result = await kRARepository.GetHODAssessmnet_ByIdAsync(empid, fk_kraperiodId);

                if (result == null || !result.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "no data found for this emp id";
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = " Assessment Data retrieved successfully.";
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




        //[HttpGet("Assesment_DataByID")]
        //public async Task<IActionResult> GetEmp_Assessment([FromQuery] string kraId)
        //{
        //    ModelResponse modelResponse = new ModelResponse();

        //    try
        //    {

        //        var (AssessmentList, KRAList) = await kRARepository.GetAssessmnet_ByIdAsync(kraId);

        //        if (AssessmentList == null)
        //        {
        //            modelResponse.IsSuccess = false;
        //            modelResponse.Message = "No Record Found Or Invalid Id";
        //            modelResponse.StatusCode = 404;
        //            return Ok(modelResponse);
        //        }

        //        modelResponse.IsSuccess = true;
        //        modelResponse.Message = "data retrieved successfully.";
        //        modelResponse.Data = new
        //        {
        //            AssessmentList = AssessmentList,
        //            KRAList = KRAList,
        //        };
        //        modelResponse.StatusCode = 200;
        //        return Ok(modelResponse);
        //    }
        //    catch (Exception ex)
        //    {
        //        modelResponse.IsSuccess = false;
        //        modelResponse.Message = ex.Message;
        //        return Ok(modelResponse);
        //    }
        //}





        [HttpGet("RMList")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetAll(int pageIndex = 0, int pageSize = 10, string fk_empid = "")
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId


                var (totalCount, result) = await kRARepository.GetAllRMList(pageIndex, pageSize, decryptedUserId);
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

        [HttpGet("SelfList")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> Self_GetAll(int pageIndex = 0, int pageSize = 10)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId

                var (totalCount, result) = await kRARepository.GetAllSelfList(pageIndex, pageSize, decryptedUserId);
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

        [HttpGet("HODList")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> HOD_GetAll(int pageIndex = 0, int pageSize = 10, string fk_empid = "")
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {

                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId

                var (totalCount, result) = await kRARepository.GetAllHODList(pageIndex, pageSize, decryptedUserId);
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













        // RoleWise Insert KRA Assessment
        [HttpPost("RoleWise_Assessment_Insert")]
        [Authorize]
        public async Task<IActionResult> InsertRoleAssessment([FromForm] List<IFormFile> files, [FromForm] List<Self_Assesment_KRA> kraJson)
        {
            var modelResponse = new ModelResponse();

            try
            {
                var models = kraJson;

                if (models == null || !models.Any())
                    return BadRequest(new { message = "No data to process." });

                foreach (var model in models)
                {
                    // Handle self file (filename)
                    if (!string.IsNullOrEmpty(model.filename))
                    {
                        var file = files.FirstOrDefault(f => f.FileName == model.filename);
                        if (file != null)
                        {
                            if (!_FileService.IsImageFile(file))
                                return BadRequest(new { message = $"Invalid file for {file.FileName}" });

                            var savedName = await _FileService.SaveFileAsync(file);
                            model.filename = savedName;
                        }
                    }

                    // Handle RM file (Rmfilename)
                    if (!string.IsNullOrEmpty(model.Rmfilename))
                    {
                        var rmFile = files.FirstOrDefault(f => f.FileName == model.Rmfilename);
                        if (rmFile != null)
                        {
                            if (!_FileService.IsImageFile(rmFile))
                                return BadRequest(new { message = $"Invalid RM file for {rmFile.FileName}" });

                            var savedRmName = await _FileService.SaveFileAsync(rmFile);
                            model.Rmfilename = savedRmName;
                        }
                    }

                    // Handle HOD file (HODfilename)
                    if (!string.IsNullOrEmpty(model.HODfilename))
                    {
                        var hodFile = files.FirstOrDefault(f => f.FileName == model.HODfilename);
                        if (hodFile != null)
                        {
                            if (!_FileService.IsImageFile(hodFile))
                                return BadRequest(new { message = $"Invalid HOD file for {hodFile.FileName}" });

                            var savedHODName = await _FileService.SaveFileAsync(hodFile);
                            model.HODfilename = savedHODName;
                        }
                    }

                    // Clean up
                    model.FileBytes = null;
                }

                // Call repository
                bool isInserted = await kRARepository.Insert_Role_Assesment_Multiple(models);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "Self Assessment data saved successfully." : "Insert failed.";
                modelResponse.StatusCode = isInserted ? 200 : 400;

                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;

                return StatusCode(500, modelResponse);
            }
        }




        [HttpGet("Role_Assesment_Data")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetRole_Self_Assessment([FromQuery] int RoleId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                List<KRA_Get_Assesment_data> result = await kRARepository.GetRole_Assess_ByIdAsync(RoleId);

                if (result == null || !result.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "no data found for this Role id";
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Self Assessment Data By Role detail retrieved successfully.";
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



        [HttpGet("Role_Assessment_List")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> RoleAssessment_GetAll(int pageIndex = 0, int pageSize = 10)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var (totalCount, result) = await kRARepository.GetAll_Role_AssessmentList(pageIndex, pageSize);
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



        // KRA Period

        [HttpGet("KRAPeriod")]
        [Authorize]
        public async Task<IActionResult> GetDropdownList()
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {

                var result = await kRARepository.GetPeriodDropdownList();


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


        //


        [HttpGet("GetEmployeeKRAIdAsync")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetEmployeeKRAIdAsync([FromQuery] long? SrNo)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString(); // Retrieve encryptedLocationId-string

                List<KRAList> result = await kRARepository.GetEmployeeKRAIdAsync(decryptedUserId, SrNo);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid Id";
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Empwise detail retrieved successfully.";
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




        //Duplicacy Check
        //[HttpGet("validatePeriod/{empId}/{kraperiodId}")]
        //[Authorize]
        //public async Task<IActionResult> ValidateKRAPeriodAsync([FromRoute] string empId, [FromRoute] int kraperiodId)
        //{
        //    ModelResponse modelResponse = new ModelResponse();

        //    if (empId =="" || kraperiodId <= 0)
        //    {
        //        modelResponse.IsSuccess = false;
        //        modelResponse.Message = "Invalid employee ID or KRA period ID.";
        //        modelResponse.StatusCode = 400;
        //        return Ok(modelResponse);
        //    }

        //    try
        //    {
        //        var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString();
        //        var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();

        //        var result = await kRARepository.ValidateKRAPeriodAsync(empId, kraperiodId);

        //        modelResponse.IsSuccess = result.IsSuccessfull;
        //        modelResponse.Message = result.Message;
        //        modelResponse.Data = result.Data;
        //        modelResponse.StatusCode = result.IsSuccessfull ? 200 : 400;

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





        [HttpGet("validatePeriod/{kraperiodId}")]
        [Authorize]
        public async Task<IActionResult> ValidateKRAPeriodAsync([FromRoute] int kraperiodId)
        {
            ModelResponse modelResponse = new ModelResponse();

            var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();

            if (string.IsNullOrWhiteSpace(decryptedUserId) || kraperiodId <= 0)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = "Invalid User ID or KRA period ID.";
                modelResponse.StatusCode = 400;
                return Ok(modelResponse);
            }

            try
            {
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString();

                var result = await kRARepository.ValidateKRAPeriodAsync(decryptedUserId, kraperiodId);

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



    }
}