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
    public class ExperienceDetailsController : ControllerBase
    {
        private readonly IExperienceDetailsRepository experienceDetailsRepository;
        private readonly AppSettings appSettings;
        private readonly FileService fileService;





        public ExperienceDetailsController(IExperienceDetailsRepository _experienceDetailsRepository, IOptions<AppSettings> appSettings,
      FileService _fileService)

        {
            experienceDetailsRepository = _experienceDetailsRepository;
            this.appSettings = appSettings.Value;

            fileService = _fileService;
        }

        [HttpGet]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetAllExperienceDetails(int pageIndex = 0, int pageSize = 10, string fk_empid =null)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var (totalCount, result) = await experienceDetailsRepository.GetAll(pageIndex, pageSize, fk_empid);

                if (result.Count() == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Experience Details List retrieved successfully.";
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



        [HttpGet("{pk_pjobid}")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetById([FromRoute] long pk_pjobid)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {

                ExperienceDetails result = await experienceDetailsRepository.GetById(pk_pjobid);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid pk_pjobid";
                    return Ok(modelResponse);
                }


                modelResponse.IsSuccess = true;
                modelResponse.Message = "Experience detail retrieved successfully.";
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


        //[HttpPost]
        //[Authorize]
        //public async Task<IActionResult> InsertEmployeePrevJobAsync([FromBody] ExperienceDetails experiencePrevJobDataSet)
        //{
        //    ModelResponse modelResponse = new ModelResponse();
        //    try
        //    {
        //        bool isInserted = await experienceDetailsRepository.InsertEmployeePrevJob(experiencePrevJobDataSet);

        //        modelResponse.IsSuccess = isInserted;
        //        modelResponse.Message = isInserted ? "Employee previous job details inserted successfully." : "Failed to insert previous job details.";
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
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> InsertEmployeePrevJobAsync([FromForm] ExperienceDetails experiencePrevJobDataSet)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                // Handle file upload
                //if (experiencePrevJobDataSet.UploadFile != null && experiencePrevJobDataSet.UploadFile.Length >= 0)
                //{
                //    string uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/uploads");
                //    if (!Directory.Exists(uploadsFolder))
                //    {
                //        Directory.CreateDirectory(uploadsFolder);
                //    }

                //    string uniqueFileName = Guid.NewGuid().ToString() + "_" + experiencePrevJobDataSet.UploadFile.FileName;
                //    string filePath = Path.Combine(uploadsFolder, uniqueFileName);

                //    using (var stream = new FileStream(filePath, FileMode.Create))
                //    {
                //        await experiencePrevJobDataSet.UploadFile.CopyToAsync(stream);
                //    }

                //    // Set the file path to the XML element field
                //    experiencePrevJobDataSet.documentupload = uniqueFileName;
                //}
                if (experiencePrevJobDataSet.UploadFile != null && experiencePrevJobDataSet.UploadFile.Length > 0)
                {
                    // Optional: Validate it's an image 
                    if (!fileService.IsImageFile(experiencePrevJobDataSet.UploadFile))
                    {
                        return BadRequest(new { message = "Only image files (jpg, jpeg, png) are allowed." });
                    }

                    // Save the file 
                    var savedFileName = await fileService.SaveFileAsync(experiencePrevJobDataSet.UploadFile);

                    // Save the file path to the documentupload property (this will go to DB)
                    experiencePrevJobDataSet.documentupload = savedFileName;  // ← Fixed!
                }
                else
                {
                    experiencePrevJobDataSet.documentupload = null;
                }
                // Insert data into the repository
                bool isInserted = await experienceDetailsRepository.InsertEmployeePrevJob(experiencePrevJobDataSet);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "Employee previous job details inserted successfully." : "Failed to insert previous job details.";
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
        [Authorize]
        public async Task<IActionResult> UpdateEmployeePrevJobAsync([FromForm] ExperienceDetails experiencePrevJobDataSet)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                // Handle file upload
                //if (experiencePrevJobDataSet.UploadFile != null && experiencePrevJobDataSet.UploadFile.Length >= 0)
                //{
                //    string uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/uploads");
                //    if (!Directory.Exists(uploadsFolder))
                //    {
                //        Directory.CreateDirectory(uploadsFolder);
                //    }

                //    string uniqueFileName = Guid.NewGuid().ToString() + "_" + experiencePrevJobDataSet.UploadFile.FileName;
                //    string filePath = Path.Combine(uploadsFolder, uniqueFileName);

                //    using (var stream = new FileStream(filePath, FileMode.Create))
                //    {
                //        await experiencePrevJobDataSet.UploadFile.CopyToAsync(stream);
                //    }

                //    // Set the file path to the XML element field
                //    experiencePrevJobDataSet.documentupload = uniqueFileName;
                //}
                if (experiencePrevJobDataSet.UploadFile != null && experiencePrevJobDataSet.UploadFile.Length > 0)
                {
                    // Optional: Validate it's an image 
                    if (!fileService.IsImageFile(experiencePrevJobDataSet.UploadFile))
                    {
                        return BadRequest(new { message = "Only image files (jpg, jpeg, png) are allowed." });
                    }

                    // Save the file 
                    var savedFileName = await fileService.SaveFileAsync(experiencePrevJobDataSet.UploadFile);

                    // Save the file path to the documentupload property (this will go to DB)
                    experiencePrevJobDataSet.documentupload = savedFileName;  // ← Fixed!
                }
                else
                {
                    experiencePrevJobDataSet.documentupload = null;
                }
                // Update data in the repository
                bool isUpdated = await experienceDetailsRepository.UpdateExperienceDetailsAsync(experiencePrevJobDataSet);

                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated ? "Employee previous job details updated successfully." : "Failed to update previous job details.";
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


        //[HttpPut]
        //[Authorize]  // Secured endpoint        
        //public async Task<IActionResult> UpdateAsync([FromBody] ExperienceDetails designationMst)
        //{
        //    ModelResponse modelResponse = new ModelResponse();

        //    try
        //    {   
        //        bool isUpdated = await experienceDetailsRepository.UpdateExperienceDetailsAsync(designationMst);

        //        modelResponse.IsSuccess = isUpdated;
        //        modelResponse.Message = isUpdated ? "Experience detail updated successfully." : "Failed to update Experience detail.";
        //        modelResponse.StatusCode = isUpdated ? 200 : 400;

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



        //

        [HttpDelete("{pk_pjobid}")]
        [Authorize]
        public async Task<IActionResult> DeleteBankMstAsync([FromRoute] string pk_pjobid)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                bool isDeleted = await experienceDetailsRepository.DeleteExperienceAsync(pk_pjobid);

                modelResponse.IsSuccess = isDeleted;
                modelResponse.Message = isDeleted ? "Experience detail delete successfully." : "Failed to delete Experience detail.";
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
