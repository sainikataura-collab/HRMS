using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers.TransactionsControllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class ManualPunchController : ControllerBase
    {
        private readonly IManualRepository manualRepository;

        public ManualPunchController(IManualRepository _manualRepository)

        {
            manualRepository = _manualRepository;
        }


        [HttpGet]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> ManualPunchDetails(string fk_empid = "", string fk_monthId = "", string fk_yearId="", string flag = "")
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {

                //var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString();  // Retrieve the UserId
                //var encryptedUserId = HttpContext.Items["EncryptedUserId"]?.ToString(); // Retrieve encryptedUserId-string

                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
                var encryptedCompanyId = HttpContext.Items["EncryptedCompanyId"]?.ToString(); // Retrieve encryptedCompanyId-string

                var decrypteLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the locationid




                var  result = await manualRepository.GetAllAsync(fk_empid, fk_monthId, fk_yearId, flag);
                //if (result.Count() == 0)
                //{
                //    modelResponse.IsSuccess = false;
                //    modelResponse.Message = "No Record found.";
                //    modelResponse.StatusCode = 400;
                //    return Ok(modelResponse);
                //}



                modelResponse.IsSuccess = true;
                modelResponse.Message = "Manual List retrieved successfully.";
                modelResponse.Data = result;
                //modelResponse.TotalCount = totalCount;
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

        [HttpGet("InOut/{pk_inoutid}")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetInOutByIdAsync([FromRoute] string pk_inoutid)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {


                ManualMst result = await manualRepository.GetInOutByIdAsync(pk_inoutid);


                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid inoutid";
                    return Ok(modelResponse);
                }



                //result.metro = Convert.ToChar(result.isMetro.ToString().Substring(0, 1));



                modelResponse.IsSuccess = true;
                modelResponse.Message = "Inout detail retrieved successfully.";
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


        [HttpPut("InOut")]
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult> UpdatemanualMstAsync([FromBody] ManualMst manualMst)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {

                bool isUpdated = await manualRepository.UpdateInOutAsync(manualMst);

                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated ? "ManualMst updated successfully." : "Failed to update ManualMst.";
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
