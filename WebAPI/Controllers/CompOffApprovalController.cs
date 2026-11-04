using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class CompOffApprovalController : ControllerBase
    {

        private readonly ICompOffApprovalRepository compOffApprovalRepository;


        public CompOffApprovalController(ICompOffApprovalRepository _compOffApprovalRepository)

        {
            compOffApprovalRepository = _compOffApprovalRepository;
        }


        [HttpGet]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetAll_ApprovalApplyCompOffAsync()
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {

                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId
                var result = await compOffApprovalRepository.GetAll_ApprovalApplyCompOffAsync(decryptedUserId);
                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Approval List Details retrieved successfully.";
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



        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Insert_ApprovalApplyCompOffReqMstAsync(LeaveModuleMst model)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId
                model.fk_empid = decryptedUserId;

                bool isInserted = await compOffApprovalRepository.Insert_ApprovalApplyCompOffReqMstAsync(model);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "Approva  successfully." : "Failed to Approval  .";
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








        [HttpGet("{applycompoffId}")]
        [Authorize]
        public async Task<IActionResult> GetCompOfById([FromRoute] string applycompoffId)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                CompOffRequestSelforGrid result = await compOffApprovalRepository.GetAllCompOffByEmpIdAsync(applycompoffId);
                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid CityId";
                    return Ok(modelResponse);
                }
                modelResponse.IsSuccess = true;
                modelResponse.Message = "CompOffRequestSelforGrid detail retrieved successfully.";
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



    }
}