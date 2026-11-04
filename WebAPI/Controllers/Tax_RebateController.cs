using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace HRMSWebAPI.Controllers.Emp_Compensation
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class Tax_RebateController : ControllerBase
    {
        private readonly FileService fileService;
        private readonly IRebateRepository rebateRepository;
        private readonly AppSettings appSettings;

        public Tax_RebateController(IRebateRepository _rebateRepository, FileService _fileService, IOptions<AppSettings> _appSettings)
        {
             rebateRepository = _rebateRepository;
            fileService = _fileService;
            appSettings = _appSettings.Value;
        }

        //vewi team Attendance

        [HttpGet("GetRebateDocumentList")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetAll()
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();

                var result = await rebateRepository.rebatedocumentDetails(decryptedUserId);
                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Rebate Document list retrieved successfully.";
                modelResponse.Data = result;
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
        [HttpGet("sectiondropdown")]
        [Authorize]
        public async Task<IActionResult> GetsectiondropdownAsync()
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                //var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                var result = await rebateRepository.sectionDropdownAsync();

                modelResponse.IsSuccess = result.Data.Count > 0;
                modelResponse.Message = result.Data.Count > 0 ? "Sucessfully retrieved" : "No data found";
                modelResponse.Data = result.Data;
                modelResponse.StatusCode = result.Data.Count > 0 ? 200 : 400;

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


        [HttpGet("Subsectiondropdown")]
        [Authorize]
        public async Task<IActionResult> GetsubsectiondropdownAsync(string pk_secid)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                //var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                var result = await rebateRepository.subsectionDropdownAsync(pk_secid);

                modelResponse.IsSuccess = result.Data.Count > 0;
                modelResponse.Message = result.Data.Count > 0 ? "Sucessfully retrieved" : "No data found";
                modelResponse.Data = result.Data;
                modelResponse.StatusCode = result.Data.Count > 0 ? 200 : 400;

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


      
        [HttpPost("InsertRebateDoc")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> InsertRebate([FromForm] RebateDocStatus rebateDoc)
        {
            rebateresponse modelResponse = new rebateresponse();

            try
            {
                if (rebateDoc.filepath != null && rebateDoc.filepath.Length > 0)
                {
                    // Optional: Validate it's an image
                    if (!fileService.IsImageFile(rebateDoc.filepath))
                    {
                        return BadRequest(new { message = "Only image files (jpg, jpeg, png) are allowed." });
                    }
                    
                    // Save the file
                    var savedFileName = await fileService.SaveFileAsync(rebateDoc.filepath);
                    var contenttype = Path.GetExtension(savedFileName).ToLowerInvariant();
                    // Save the file path in LogoPath (this will go to DB)
                    rebateDoc.attachment = savedFileName;
                    rebateDoc.contenttype = contenttype;
                }
                rebateDoc.filepath = null;
              
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString(); // Retrieve the UserId
                var decryptedFinancialYearId = HttpContext.Items["DecryptedFinancialYearId"]?.ToString();
                rebateDoc.fk_empid = decryptedUserId;
                rebateDoc.fk_finid = decryptedFinancialYearId;
                var isInserted = await rebateRepository.InsertRebateDoc(rebateDoc);
                if (isInserted == null)
                {
                    modelResponse.IsSuccessfull = false;
                    modelResponse.Message = "Invalid Rebate Doc Id";
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccessfull = isInserted.IsSuccessfull;
                modelResponse.Message = "Rebate Doc inserted successfully.";
                modelResponse.StatusCode =  200;
                modelResponse.DocumentId = isInserted.DocumentId;
                modelResponse.DocumentNo = isInserted.DocumentNo;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccessfull = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;

                return Ok(modelResponse);
            }
        }


        [HttpPut("UpdateRebateDoc")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> UpdateRebate([FromForm] RebateDocStatus rebateDoc)
        {
            rebateresponse modelResponse = new rebateresponse();

            try
            {
                if (rebateDoc.filepath != null && rebateDoc.filepath.Length > 0)
                {
                    // Optional: Validate it's an image
                    if (!fileService.IsImageFile(rebateDoc.filepath))
                    {
                        return BadRequest(new { message = "Only image files (jpg, jpeg, png) are allowed." });
                    }

                    // Save the file
                    var savedFileName = await fileService.SaveFileAsync(rebateDoc.filepath);
                    var contenttype = Path.GetExtension(savedFileName).ToLowerInvariant();
                    // Save the file path in LogoPath (this will go to DB)
                    rebateDoc.attachment = savedFileName;
                    rebateDoc.contenttype = contenttype;
                }
                rebateDoc.filepath = null;

                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString(); // Retrieve the UserId
                var decryptedFinancialYearId = HttpContext.Items["DecryptedFinancialYearId"]?.ToString();
                rebateDoc.fk_empid = decryptedUserId;
                rebateDoc.fk_finid = decryptedFinancialYearId;
                var isInserted = await rebateRepository.UpdateRebateDoc(rebateDoc);
                if (isInserted == null)
                {
                    modelResponse.IsSuccessfull = false;
                    modelResponse.Message = "Invalid Rebate Doc Id";
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccessfull = isInserted.IsSuccessfull;
                modelResponse.Message = "Update Rebate Doc successfully.";
                modelResponse.StatusCode = 200;
                modelResponse.DocumentId = isInserted.DocumentId;
                modelResponse.DocumentNo = isInserted.DocumentNo;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccessfull = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;

                return Ok(modelResponse);
            }
        }


        [HttpGet("download-file")]
        [Authorize]
        public IActionResult DownloadFile(string filename)
        {
            if (string.IsNullOrEmpty(filename))
                return BadRequest("Filename is required.");

            var folderPath = appSettings.UploadsFolderPath;
            var filePath = Path.Combine(folderPath, filename);

            if (!System.IO.File.Exists(filePath))
                return NotFound("File not found.");

            var contentType = GetMimeType(filePath);
            var fileBytes = System.IO.File.ReadAllBytes(filePath);
            return File(fileBytes, contentType, filename);
        }

        private string GetMimeType(string filePath)
        {
            var fileExtension = Path.GetExtension(filePath).ToLower();
            return fileExtension switch
            {
                ".jpg" => "image/jpeg",
                ".jpeg" => "image/jpeg",
                ".png" => "image/png",
                ".gif" => "image/gif",
                ".bmp" => "image/bmp",
                ".tiff" => "image/tiff",
                ".pdf" => "application/pdf",
                _ => "application/octet-stream",
            };
        }


        [HttpGet("RebateDoc/GetById")]
        [Authorize]
        public async Task<IActionResult> GetById(string pk_docid)
        {
            var modelResponse = new ModelResponse();

            try
            {


                var result = await rebateRepository.GetById(pk_docid);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "RebateDoc list retrieved successfully.";
                modelResponse.Data = result;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = "Server error: " + ex.Message;
                modelResponse.StatusCode = 500;
                return Ok(modelResponse);
            }
        }





        //-------------------------------Tax Computation

        [HttpGet("GetTaxComputationList")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetAllTaxComputation()
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                string Fk_companyid = "GU-1";
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                var decryptedFinancialYearId = HttpContext.Items["DecryptedFinancialYearId"]?.ToString();
             
                var result = await rebateRepository.TaxComputationDetails(decryptedUserId, decryptedFinancialYearId, Fk_companyid);
                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Tax Computation list retrieved successfully.";
                modelResponse.Data = result;
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


        [HttpGet("GetFinyear")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetGetFinyear()
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
             
                var decryptedFinancialYearId = HttpContext.Items["DecryptedFinancialYearId"]?.ToString();

                var result = await rebateRepository.getfinancalyear(decryptedFinancialYearId);
                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Financial YearId list retrieved successfully.";
                modelResponse.Data = result;
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
        [HttpGet("getheadnamelist")]
        [Authorize]  // Secured endpoint        

        public async Task<IActionResult> getheadnamelistAsync([FromQuery] string pk_headId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString(); // Retrieve the UserId
                var decryptedFinancialYearId = HttpContext.Items["DecryptedFinancialYearId"]?.ToString();
                var (head1, head2) = await rebateRepository.GetHeadListAsync(decryptedUserId, pk_headId,decryptedFinancialYearId);

                if (head1 == null && head2 == null) // Check if both are null
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No records found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "HeadName list retrieved successfully.";
                modelResponse.Data = new { head1, head2 }; // Convert Tuple into JSON
                modelResponse.StatusCode = 200;
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

        [HttpGet("GetEmp_Salary_PaySlip")]
        [Authorize]  // Secured endpoint        

        public async Task<IActionResult> GetEmp_SalaryPaySlipAsyncAsync([FromQuery] string fk_monthid, [FromQuery] string fk_yearid)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();

                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString(); // Retrieve the UserId
              //  var decryptedFinancialYearId = HttpContext.Items["DecryptedFinancialYearId"]?.ToString();
                var (list1, list2) = await rebateRepository.GetEmp_Salary_PaySlipAsync(decryptedUserId, fk_monthid, fk_yearid, decryptedCompanyId);

                if (list1 == null && list2 == null) // Check if both are null
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No records found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Salary PaySlip list retrieved successfully.";
                modelResponse.Data = new { list1, list2 }; // Convert Tuple into JSON
                modelResponse.StatusCode = 200;
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

        [HttpGet("GetConsolidatedSalary")]
        [Authorize]  // Secured endpoint        

        public async Task<IActionResult> GetConsolidatedSalaryAsync([FromQuery] string fk_finid)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString(); // Retrieve the UserId
                 //var decryptedFinancialYearId = HttpContext.Items["DecryptedFinancialYearId"]?.ToString();
                var (list1, list2) = await rebateRepository.GetConsolidatedSalaryAsync(decryptedUserId, fk_finid);

                if (list1 == null && list2 == null) // Check if both are null
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No records found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "PF Saving & Income Tax list retrieved successfully.";
                modelResponse.Data = new { list1, list2 }; // Convert Tuple into JSON
                modelResponse.StatusCode = 200;
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



        [HttpGet("EMP_GetSalarySlip")]
        [Authorize]  // Secured endpoint        

        public async Task<IActionResult> GetEMP_GetSalarySlipAsync([FromQuery] string fk_monthid, [FromQuery] string fk_yearid)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString(); // Retrieve the UserId
                                                                                        //  var decryptedFinancialYearId = HttpContext.Items["DecryptedFinancialYearId"]?.ToString();
                var list1 = await rebateRepository.GetGetSalarySlipAsync(decryptedUserId, fk_monthid, fk_yearid);

                if (list1 == null) // Check if both are null
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No records found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "EMP_GetSalarySlip retrieved successfully.";
                modelResponse.Data = new { list1 }; // Convert Tuple into JSON
                modelResponse.StatusCode = 200;
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
