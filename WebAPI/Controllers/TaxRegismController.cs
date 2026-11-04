using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class TaxRegismController : ControllerBase
    {
        private readonly ITaxRegismRepository taxRegismRepository;

        public TaxRegismController(ITaxRegismRepository _taxRegismRepository)
        {
            taxRegismRepository = _taxRegismRepository;
        }


        [HttpPut("UpdateAsync")]
        [Authorize]  // Secured endpoint
                     // 

        public async Task<IActionResult> UpdateAsync(string TaxRegime)
        {
            ModelResponse modelResponse = new ModelResponse();
            var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId
            try
            {
                bool isUpdated = await taxRegismRepository.UpdateRegismMstAsync(decryptedUserId, TaxRegime);
                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated ? "TaxRegime updated successfully." : "TaxRegime not update again.";
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
