using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Mvc;
using System.Net;
using UAParser;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Authorization;
using static System.Net.WebRequestMethods;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Options;
//using Newtonsoft.Json.Linq;
using Microsoft.Extensions.Configuration;
using System.Net.Http.Headers;
using System.ComponentModel.Design;
//using Newtonsoft.Json;


namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class BankController : ControllerBase
    {
        private readonly IBankRepository bankRepository;



        public BankController(IBankRepository _bankRepository)

        {
            bankRepository = _bankRepository;
        }


        [HttpPost]
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult> InsertBankMstAsync([FromBody] BankMst BankMst)
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

              


                BankMst.Fk_CompanyId = decryptedCompanyId;
                BankMst.Fk_LocID = decryptedLocationId;
                BankMst.Fk_UserID = decryptedUserId.ToString();

                bool isInserted = await bankRepository.InsertBankMstAsync(BankMst);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "Bank details inserted successfully." : "Failed to insert bank details.";
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

        [HttpGet]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetAll(int pageIndex = 0, int pageSize = 10, string searchTerm = "")
        {
            ModelResponse modelResponse = new ModelResponse();
          
            try
            {

                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
                var encryptedCompanyId = HttpContext.Items["EncryptedCompanyId"]?.ToString(); // Retrieve encryptedCompanyId-string



                var (totalCount, result) = await bankRepository.GetAll(pageIndex, pageSize, decryptedCompanyId, searchTerm);
                if (result.Count() == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }


                modelResponse.IsSuccess = true;
                modelResponse.Message = "Bank List retrieved successfully.";
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

        [HttpGet("{bankId}")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetBankByIdAsync([FromRoute] string bankId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
               
                BankMst result = await bankRepository.GetBankByIdAsync(bankId);


                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid BankId";
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Bank detail retrieved successfully.";
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

        [HttpPut]
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult> UpdateBankMstAsync([FromBody] BankMst BankMst)
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

               
             //  BankMst.Fk_CompanyId = decryptedCompanyId;
                BankMst.Fk_LocID = decryptedLocationId;
                BankMst.Fk_UserID = decryptedUserId.ToString();

                bool isUpdated = await bankRepository.UpdateBankMstAsync(BankMst);

                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated ? "Bank detail updated successfully." : "Failed to update bank detail.";
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

        

        [HttpDelete("{bankId}")]
        [Authorize]
        public async Task<IActionResult> DeleteBankMstAsync([FromRoute]string bankId)
        {
            ModelResponse modelResponse = new ModelResponse();

           
            try
            {
                bool isDeleted = await bankRepository.DeleteBankMstAsync(bankId);

                modelResponse.IsSuccess = isDeleted;
                modelResponse.Message = isDeleted ? "Bank detail delete successfully." : "Failed to delete bank detail.";
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

       
        //[HttpGet("isBankNameAvailable/{bankName}")]
        //[Authorize]  // Secured endpoint
        //public async Task<IActionResult> IsBankNameAvailableAsync([FromRoute] string bankName)
        //{
        //    ModelResponse modelResponse = new ModelResponse();
        //    try
        //    {

        //        var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); ; // Retrieve the user ID
        //        var encryptedUserId = HttpContext.Items["EncryptedUserId"]?.ToString(); // Retrieve encryptedUserId-string
        //        var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
        //        var encryptedCompanyId = HttpContext.Items["EncryptedCompanyId"]?.ToString(); // Retrieve encryptedCompanyId-string

        //        var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId
        //        var encryptedLocationId = HttpContext.Items["EncryptedLocationId"]?.ToString(); // Retrieve encryptedLocationId-string



        //        // Validate the input
        //        if (string.IsNullOrWhiteSpace(bankName))
        //        {
        //            modelResponse.IsSuccess = false;
        //            modelResponse.Message = "BankName is required and cannot be empty.";
        //            modelResponse.StatusCode = 400;
        //            return Ok(modelResponse);
        //        }

                

        //        Result bankNameAvailabilityResult = await this.bankRepository.IsBankNameAvailableAsync(decryptedCompanyId, bankName);

        //        if (!bankNameAvailabilityResult.IsSuccessfull)
        //        {
        //            modelResponse.IsSuccess = false;
        //            modelResponse.Message = bankNameAvailabilityResult.Message;
        //            modelResponse.StatusCode = 400;
        //            return Ok(modelResponse);
        //        }

        //        modelResponse.IsSuccess = bankNameAvailabilityResult.IsSuccessfull;
        //        modelResponse.Message = bankNameAvailabilityResult.Message;
        //        modelResponse.StatusCode = 200;
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

        


    }
}
