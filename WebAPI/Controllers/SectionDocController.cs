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
    public class SectionDocController : ControllerBase
    {
        private readonly ISectionDocRepository sectionDocRepository;
        private readonly FileService fileService;
        private readonly AppSettings appSettings;

        public SectionDocController(ISectionDocRepository _sectionDocRepository, FileService _fileService, IOptions<AppSettings> _appSettings)

        {
            sectionDocRepository = _sectionDocRepository;
            fileService = _fileService;
            
            appSettings = _appSettings.Value;
        }
        


        [HttpGet("SubsectionDropdownList/{sectionId}")]
        [Authorize]
        public async Task<IActionResult> GetSubsectionDropdownListAsync([FromRoute] string sectionId)
        {
            ModelResponse modelResponse = new ModelResponse();

            if (string.IsNullOrWhiteSpace(sectionId))
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = "sectionId are required.";
                modelResponse.StatusCode = 400;
                return Ok(modelResponse);
            }
            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString(); // UserId
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString(); // CompanyId

               
                var result = await sectionDocRepository.GetSubsectionDropdownListAsync(sectionId, decryptedCompanyId, decryptedUserId);


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




        //get all
        [HttpGet]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetAll(int pageIndex = 0, int pageSize = 10, string? fk_empid = null, string? fk_finid=null)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                //var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
                //var encryptedCompanyId = HttpContext.Items["EncryptedCompanyId"]?.ToString(); // Retrieve encryptedCompanyId-string



                var (totalCount, result) = await sectionDocRepository.GetAll(pageIndex, pageSize, fk_empid,fk_finid);
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

        //get by id
        [HttpGet("{pk_docid}")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetBYId([FromRoute] string pk_docid)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                SectionDocMst result = await sectionDocRepository.GetBYId(pk_docid);
                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid Id";
                    return Ok(modelResponse);
                }
                modelResponse.IsSuccess = true;
                modelResponse.Message = "Details retrieved successfully.";
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

        //for delete 
        [HttpDelete("{pk_docid}")]
        [Authorize]
        public async Task<IActionResult> Delete([FromRoute] string pk_docid)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                bool isDeleted = await sectionDocRepository.Delete(pk_docid);

                modelResponse.IsSuccess = isDeleted;
                modelResponse.Message = isDeleted ? "Detail delete successfully." : "Failed to delete.";
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

        public async Task<IActionResult> Insert([FromForm] SectionDocMst section)
        {

            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId
                //var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId
                var decryptedFinancialYearId = HttpContext.Items["DecryptedFinancialYearId"]!.ToString(); // Retrieve the FinancialYear
                if (section.Ifilename != null && section.Ifilename.Length > 0)
                {
                    // Optional: Validate it's an image
                    if (!fileService.IsImageFile(section.Ifilename))
                    {
                        return BadRequest(new { message = "Only image files (jpg, jpeg, png) are allowed." });
                    }

                    // Save the file
                    var savedFileName = await fileService.SaveFileAsync(section.Ifilename);

                    // Save the file path in LogoPath (this will go to DB)
                    section.filename = savedFileName;
                }

                section.Ifilename = null;
                // Assign fk_finid to each item in the list
               
                    section.fk_finid = (decryptedFinancialYearId);

               


                // Call repository method, passing the list of holidays
                bool isInserted = await sectionDocRepository.Insert(section);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "Data inserted successfully." : "Failed to insert data.";
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

        [HttpPut]
        [Authorize]
        public async Task<IActionResult> Update([FromForm] SectionDocMst section)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString();
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString();
                var decryptedFinancialYearId = HttpContext.Items["DecryptedFinancialYearId"]!.ToString();

                if (section.Ifilename != null && section.Ifilename.Length > 0)
                {
                    // Validate image file
                    if (!fileService.IsImageFile(section.Ifilename))
                    {
                        return BadRequest(new { message = "Only image files (jpg, jpeg, png) are allowed." });
                    }

                    // Save file
                    var savedFileName = await fileService.SaveFileAsync(section.Ifilename);

                    // Assign filename to model
                    section.filename = savedFileName;
                }

                // Clear file from model before DB call
                section.Ifilename = null;

                // Assign financial year ID
                section.fk_finid = decryptedFinancialYearId;

                // Update via repository
                bool isUpdated = await sectionDocRepository.Update(section.pk_docid, section);

                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated ? "Detail updated successfully." : "Failed to update.";
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


     


    }
}
