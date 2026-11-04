using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using iTextSharp.text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class GradeController : Controller
    {
        private readonly IGradeRepository gradeRepository;

        public GradeController(IGradeRepository _gradeRepository)

        {
            gradeRepository = _gradeRepository;
        }
        //for insert
        [HttpPost]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> InsertGradeAsync([FromBody] grade grade)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId
                var encryptedUserId = HttpContext.Items["EncryptedUserId"]?.ToString(); // Retrieve encryptedUserId-string

                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
                var encryptedCompanyId = HttpContext.Items["EncryptedCompanyId"]?.ToString(); // Retrieve encryptedCompanyId-string

                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId
                var encryptedLocationId = HttpContext.Items["EncryptedLocationId"]?.ToString(); // Retrieve encryptedLocationId-string

                grade.Fk_UserID = decryptedUserId;
                grade.fk_companyId = decryptedCompanyId;
                grade.Fk_LocID = decryptedLocationId;


                bool isInserted = await gradeRepository.InsertGradeAsync(grade);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "grade inserted successfully." : "Failed to insert grade.";
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

        //for get all

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAll(int pageIndex = 0, int pageSize = 10)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {

                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString();  // Retrieve the UserId
                var encryptedUserId = HttpContext.Items["EncryptedUserId"]?.ToString(); // Retrieve encryptedUserId-string

                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
                var encryptedCompanyId = HttpContext.Items["EncryptedCompanyId"]?.ToString(); // Retrieve encryptedCompanyId-string

                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId
                var encryptedLocationId = HttpContext.Items["EncryptedLocationId"]?.ToString(); // Retrieve encryptedLocationId-string

                var (totalCount, result) = await gradeRepository.GetAll(pageIndex, pageSize, decryptedCompanyId);
                if (result.Count() == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

               

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Grade List retrieved successfully.";
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
        //get by id 

        [HttpGet("{gradeId}")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetGradeByIdAsync([FromRoute] string gradeId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString();  // Retrieve the user ID
                var encryptedUserId = HttpContext.Items["EncryptedUserId"]?.ToString(); // Retrieve encryptedUserId-string

                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
                var encryptedCompanyId = HttpContext.Items["EncryptedCompanyId"]?.ToString(); // Retrieve encryptedCompanyId-string

                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId
                var encryptedLocationId = HttpContext.Items["EncryptedLocationId"]?.ToString(); // Retrieve encryptedLocationId-string


                grade result = await gradeRepository.GetGradeByIdAsync(gradeId);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid gradeId";
                    return Ok(modelResponse);
                }
                else
                {
                    result.pk_classid = gradeId;
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "grade detail retrieved successfully.";
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

        //delete

          [HttpDelete("{gradeId}")]
        [Authorize]
        public async Task<IActionResult> DeleteGradeAsync([FromRoute]string gradeId)
        {
            ModelResponse modelResponse = new ModelResponse();

            var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString();  // Retrieve the user ID
            var encryptedUserId = HttpContext.Items["EncryptedUserId"]?.ToString(); // Retrieve encryptedUserId-string
            var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
            var encryptedCompanyId = HttpContext.Items["EncryptedCompanyId"]?.ToString(); // Retrieve encryptedCompanyId-string

            var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId
            var encryptedLocationId = HttpContext.Items["EncryptedLocationId"]?.ToString(); // Retrieve encryptedLocationId-string

           
           
            try
            {
                bool isDeleted = await gradeRepository.DeleteGradeAsync(gradeId);

                modelResponse.IsSuccess = isDeleted;
                modelResponse.Message = isDeleted ? "grade detail delete successfully." : "Failed to delete grade detail.";
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
        //update
        [HttpPut]
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult> UpdateGradeAsync([FromBody] grade grade)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString(); // Retrieve and ensure it's a string
                var encryptedUserId = HttpContext.Items["EncryptedUserId"]?.ToString(); // Retrieve encryptedUserId-string

                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId
                var encryptedLocationId = HttpContext.Items["EncryptedLocationId"]?.ToString(); // Retrieve encryptedLocationId-string

                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
                var encryptedCompanyId = HttpContext.Items["EncryptedCompanyId"]?.ToString(); // Retrieve encryptedCompanyId-string

                // Assign decrypted values              
                grade.Fk_UserID = decryptedUserId;
              
               //  grade.fk_companyId = decryptedCompanyId;
                grade.Fk_LocID = decryptedLocationId;
                bool isUpdated = await gradeRepository.UpdateGradeAsync(grade);
                 modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated ? "grade updated successfully." : "Failed to update grade.";
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



    }
}
