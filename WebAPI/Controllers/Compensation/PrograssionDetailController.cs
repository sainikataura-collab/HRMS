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
    public class PrograssionDetailController : ControllerBase
    {
        private readonly IPrograssionDetailRepository prograssionDetailRepository;
        private readonly AppSettings appSettings;
        private readonly FileService fileService;

        public PrograssionDetailController(IPrograssionDetailRepository _prograssionDetailRepository, IOptions<AppSettings> appSettings, FileService _fileService)
        {
            prograssionDetailRepository = _prograssionDetailRepository;
            this.appSettings = appSettings.Value;
            fileService = _fileService;
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAllPrograssionDetailMst()
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();

                if (string.IsNullOrEmpty(decryptedUserId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "User ID not found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                var result = await prograssionDetailRepository.GetAllPrograssionDetailMst(decryptedUserId);

                if (result == null || !result.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No PrograssionDetail record found.";
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "PrograssionDetail list retrieved successfully.";
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




        //upload rent Details

        //COMPENSATION > Rent Details   

        [HttpGet("RentDetailsList")]
        [Authorize]
        public async Task<IActionResult> RentDetailsListAsync()
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString(); // UserId

                if (string.IsNullOrWhiteSpace(decryptedUserId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "RentDetailsList  is required.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }
                var result = await prograssionDetailRepository.RentDetailsList(decryptedUserId);


                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "error";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }
                modelResponse.IsSuccess = true;
                modelResponse.Message = "RentDetails  Details retrieved successfully.";
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







        [HttpGet("GetAll")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetAllExperienceDetails(int pageIndex = 0, int pageSize = 10, string searchTerm = null)
        {
            ModelResponse modelResponse = new ModelResponse();
            var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString(); // UserId

            try
            {
                var (totalCount, result) = await prograssionDetailRepository.GetAll(pageIndex, pageSize, decryptedUserId, searchTerm);

                if (result.Count() == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "RentDetails  Details retrieved successfully.";
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

        // Inesrt    

        [HttpPost("RentDetails")]
        [Authorize]
        public async Task<IActionResult> RentDetails([FromForm] ModelRentDetails model)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                //if (model.file != null && model.file.Length > 0)
                //{
                //    // Optional: Validate it's an image
                //    if (!fileService.IsImageFile(model.file))
                //    {
                //        return BadRequest(new { message = "Only image files (jpg, jpeg, png) are allowed." });
                //    }

                //    // Save the file
                //    var savedFileName = await fileService.SaveFileAsync(model.file);

                //    // Save the file path in LogoPath (this will go to DB)
                //    model.filename = savedFileName;
                //}
                //else
                //{
                //    model.filename = null;
                //}


                //model.file = null;

                //var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId
                //var decryptedFinancialYearId = HttpContext.Items["DecryptedFinancialYearId"]!.ToString(); // Retrieve the UserId
                //model.fk_empid = decryptedUserId;
                //model.fk_finid = decryptedFinancialYearId;

               
                    if (model.file != null && model.file.Length > 0)
                    {
                        // Optional: Validate it's an image
                        if (!fileService.IsImageFile(model.file))
                        {
                            return BadRequest(new { message = "Only image files (jpg, jpeg, png) are allowed." });
                        }

                        // Save the file
                        var savedFileName = await fileService.SaveFileAsync(model.file);

                        // Save the file path in LogoPath (this will go to DB)
                        model.filename = savedFileName;
                    }
                    else
                    {
                        model.filename = null;
                    }


                    model.file = null;

                    var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString();
                    var decryptedFinancialYearId = HttpContext.Items["DecryptedFinancialYearId"]!.ToString();

                    model.fk_empid = decryptedUserId;
                    model.fk_finid = decryptedFinancialYearId;

                    bool isInserted = await prograssionDetailRepository.Insert_rentDetailsAsync(model);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "short apply  successfully." : "Failed to insert Leaver apply.";
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







        // GET: Rent Details by ID for Edit
        [HttpGet("RentDetailsById")]
        [Authorize]
        public async Task<IActionResult> GetRentDetailsByIdAsync()
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                var decryptedFinancialYearId = HttpContext.Items["DecryptedFinancialYearId"]?.ToString();

                var result = await prograssionDetailRepository.GetRentDetailsByIdAsync(decryptedUserId, decryptedFinancialYearId);


                if (result == null || result.MasterData == null)
                {
                    return Ok(new ModelResponse
                    {
                        IsSuccess = false,
                        Message = "Rent details not found",
                        StatusCode = 404
                    });
                }

                return Ok(new ModelResponse
                {
                    IsSuccess = true,
                    Message = "Rent detail retrieved successfully",
                    Data = result,
                    StatusCode = 200
                });


              
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;
                return Ok(modelResponse);
            }
        }

        // PUT: Update Rent Details
        [HttpPut("UpdateRentDetails")]
        [Authorize]
        public async Task<IActionResult> UpdateRentDetails([FromForm] ModelRentDetails model)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                if (model.file != null && model.file.Length > 0)
                {
                    // Optional: Validate it's an image
                    if (!fileService.IsImageFile(model.file))
                    {
                        return BadRequest(new { message = "Only image files (jpg, jpeg, png) are allowed." });
                    }

                    // Save the file
                    var savedFileName = await fileService.SaveFileAsync(model.file);

                    // Save the file path in LogoPath (this will go to DB)
                    model.filename = savedFileName;
                }
                else
                {
                    model.filename = null;
                }


                model.file = null;

                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString();
                var decryptedFinancialYearId = HttpContext.Items["DecryptedFinancialYearId"]!.ToString();

                model.fk_empid = decryptedUserId;
                model.fk_finid = decryptedFinancialYearId;

                bool isUpdated = await prograssionDetailRepository.UpdateRentDetailsAsync(model);

                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated ? "Rent details updated successfully." : "Failed to update rent details.";
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








        [HttpGet("GetFinyear")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetGetFinyear()
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {

                var decryptedFinancialYearId = HttpContext.Items["DecryptedFinancialYearId"]?.ToString();

                var result = await prograssionDetailRepository.Getfinancalyearmonth(decryptedFinancialYearId);
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









        // GET: Rent Details by ID for Edit
        [HttpGet("FinAvailable")]
        [Authorize]
        public async Task<IActionResult> FinAvailable()
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                var decryptedFinancialYearId = HttpContext.Items["DecryptedFinancialYearId"]?.ToString();

                var result = await prograssionDetailRepository.FinAvailableAsync(decryptedUserId, decryptedFinancialYearId);


                if (result == null || result.MasterData == null)
                {
                    return NotFound(new ModelResponse
                    {
                        IsSuccess = false,
                        Message = "Rent details not found",
                        StatusCode = 404
                    });
                }

                return Ok(new ModelResponse
                {
                    IsSuccess = true,
                    Message = "Rent detail retrieved successfully",
                    Data = result,
                    StatusCode = 200
                });



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
