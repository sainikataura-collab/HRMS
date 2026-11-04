using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class FinancialYearController : ControllerBase
    {


        private readonly IFinancialYearRepository financialYearRepository;

        public FinancialYearController(IFinancialYearRepository _financialYearRepository)
        {
            financialYearRepository = _financialYearRepository;
        }


        [HttpPost("Insert")]
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult> InsertFinacialYearAsync([FromBody] FinancialYear financialyr)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId



                financialyr.Fk_UserID = decryptedUserId;
                financialyr.Fk_LocID = decryptedLocationId;


                bool isInserted = await financialYearRepository.InsertFinancialYearAsync(financialyr);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "Financial Year inserted successfully." : "Failed to Financial Year";
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





        [HttpPut("Update")]
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult> UpdateFinancialYearAsync([FromBody] FinancialYear financialyr)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString(); // Retrieve and ensure it's a string
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId



                // Assign decrypted values              
                financialyr.Fk_UserID = decryptedUserId;
                financialyr.Fk_LocID = decryptedLocationId;

                bool isUpdated = await financialYearRepository.UpdateFinancialYearAsync(financialyr);

                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated ? "Financial Year updated successfully." : "Failed to update Financial Year.";
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

        [HttpGet("GetAll")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetAll(int pageIndex = 0, int pageSize = 10)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString(); // Retrieve and ensure it's a string

                var (totalCount, result) = await financialYearRepository.GetAll(pageIndex, pageSize, decryptedUserId);
                if (result.Count() == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }


                modelResponse.IsSuccess = true;
                modelResponse.Message = "Financial Year List retrieved successfully.";
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



        [HttpDelete("Delete/{fk_finid}")]
        [Authorize]
        public async Task<IActionResult> Delete([FromRoute] string fk_finid)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {

                bool isDeleted = await financialYearRepository.Delete(fk_finid);

                modelResponse.IsSuccess = isDeleted;
                modelResponse.Message = isDeleted ? " Financial year detail delete successfully." : "Failed to delete ";
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



        [HttpGet("GetById/{fk_finid}")]
        [Authorize]
        public async Task<IActionResult> GetById([FromRoute] string fk_finid)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var  SalaryMessage = await financialYearRepository.GetFinancialYearById(fk_finid);

                if (SalaryMessage == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record Found Or Invalid Id";
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Financial year data retrieved successfully.";
                modelResponse.Data = SalaryMessage;
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


        [HttpGet("changeyeardata")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetAllFinancialYearChange()
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
                                                                                              //var encryptedCompanyId = HttpContext.Items["EncryptedCompanyId"]?.ToString(); // Retrieve encryptedCompanyId-string

                var result = await financialYearRepository.GetFinancialYearschangeAsync(decryptedCompanyId);
                if (result.Count() == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }



                modelResponse.IsSuccess = true;
                modelResponse.Message = "All_FY_Change List retrieved successfully.";
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






        [HttpPut("OnChange/{fk_finid}")]
        [Authorize]
        public async Task<IActionResult> OnChange([FromRoute] string fk_finid)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                bool ChangeFinancialYear = await financialYearRepository.FinancialYearOnChnage(fk_finid);

                if (!ChangeFinancialYear)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid Id.. Not Changed";
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = " Financial Year Changed successfully.";
               // modelResponse.Data = SalaryMessage;
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




    }
}
