using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly IAccountRepository accountMasterRepository;


        public AccountController(IAccountRepository _accountMasterRepository)

        {
            accountMasterRepository = _accountMasterRepository;
        }













        
        [HttpPost]
        [Authorize]  // Secured endpoint 
        public async Task<IActionResult> InsertAccountMaster([FromBody] AccountMst AccountMaster)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                

                bool isInserted = await accountMasterRepository.InsertAccountMaster(AccountMaster);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "Account  Details inserted successfully." : "Failed to insert Account  details.";
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

        public async Task<IActionResult> GetAll(int pageIndex = 0, int pageSize = 10)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
              
                var (totalCount, result) = await accountMasterRepository.GetAll(pageIndex, pageSize);
                if (result.Count() == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

               
                modelResponse.IsSuccess = true;
                modelResponse.Message = "Account List retrieved successfully.";
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








        [HttpGet("{id}")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetById([FromRoute] string id)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                

                AccountMst result = await accountMasterRepository.GetById(id);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid id";
                    return Ok(modelResponse);
                }
                

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Account detail retrieved successfully.";
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
        [Authorize]
        public async Task<IActionResult> UpdateMasterAccount([FromBody] AccountMst AccountMaster)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {

                bool isUpdated = await accountMasterRepository.UpdateMasterAccount(AccountMaster);

                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated ? "Account detail updated successfully." : "Failed to update Account detail.";
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





        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteAccountMaster([FromRoute] string id)
        {
            ModelResponse modelResponse = new ModelResponse();

            

            try
            {
                bool isDeleted = await accountMasterRepository.DeleteAccountMaster(id);

                modelResponse.IsSuccess = isDeleted;
                modelResponse.Message = isDeleted ? "Account detail delete successfully." : "Failed to delete Account  detail.";
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
