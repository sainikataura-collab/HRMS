using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers.TransactionsControllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class LeaveEncashmentController : ControllerBase
    {

        private readonly ILeaveEncashmentRepository LeaveEncashmentRepository;

        public LeaveEncashmentController(ILeaveEncashmentRepository _LeaveEncashmentRepository)

        {
            LeaveEncashmentRepository = _LeaveEncashmentRepository;
        }
        //for get all
        [HttpGet]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetAll(int pageIndex = 0, int pageSize = 10, string? fk_empid = null)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                //var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
                //var encryptedCompanyId = HttpContext.Items["EncryptedCompanyId"]?.ToString(); // Retrieve encryptedCompanyId-string



                var (totalCount, result) = await LeaveEncashmentRepository.GetAll

                    (pageIndex, pageSize, fk_empid);
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
        [HttpGet("{pk_encashid}")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetByIdAsync([FromRoute] string pk_encashid)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                LeaveEncashmentMst result = await LeaveEncashmentRepository.GetByIdAsync(pk_encashid);
                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid Id";
                    return Ok(modelResponse);
                }
                modelResponse.IsSuccess = true;
                modelResponse.Message = "detail retrieved successfully.";
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
        [HttpDelete("{pk_encashid}")]
        [Authorize]
        public async Task<IActionResult> Delete([FromRoute] string pk_encashid)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                bool isDeleted = await LeaveEncashmentRepository.Delete(pk_encashid);

                modelResponse.IsSuccess = isDeleted;
                modelResponse.Message = isDeleted ? "detail deleted successfully." : "Failed to delete detail.";
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

        public async Task<IActionResult> Insert([FromBody] LeaveEncashmentDetail detail)
        {

            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId
                //var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId
                //var decryptedFinancialYearId = HttpContext.Items["DecryptedFinancialYearId"]!.ToString(); // Retrieve the FinancialYear

                // Call repository method, passing the list of holidays
                bool isInserted = await LeaveEncashmentRepository.InsertAsync(detail, detail.amount_N, decryptedLocationId, decryptedUserId);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? " Details inserted successfully." : "Failed to insert data .";
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

        //for update'

        [HttpPut]
        [Authorize]  // Secured endpoint        

        public async Task<IActionResult> Update([FromBody] LeaveEncashmentDetail detail)
        {

            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId
                //var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId

                bool isUpdated = await LeaveEncashmentRepository.Update(detail.pk_encashid, detail, detail.amount_N, decryptedLocationId, decryptedUserId);

                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated ? " detail updated successfully." : "Failed to update detail.";
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

        [HttpGet("{fk_empid}/{fk_leaveid}")]
        [Authorize]
        public async Task<IActionResult> GetBalanceLeave([FromRoute] string fk_empid, [FromRoute] decimal fk_leaveid)
        {
            var modelResponse = new ModelResponse();

            try
            {
                var result = await LeaveEncashmentRepository.balanceleave(fk_empid, fk_leaveid);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No balance leave data found.";
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Balance leave retrieved successfully.";
                modelResponse.Data = result;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = "An error occurred while fetching balance leave.";
                modelResponse.StatusCode = 500;
                modelResponse.Data = ex.Message;
                return Ok(modelResponse);
            }
        }

        [HttpPost("calculate")]
        [Authorize]
        public async Task<IActionResult> calculatedAmmount([FromBody] calculateAmmount Ammount)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                decimal result = await LeaveEncashmentRepository.calculatedAmmount(Ammount);

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Calculation successful.";
                modelResponse.StatusCode = 200;
                modelResponse.Data = result;

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

