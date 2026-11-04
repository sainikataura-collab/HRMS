using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class CardAppreciatorController : ControllerBase
    {
        private readonly ICardAppreciatorRepository cardAppreciatorRepository;

        public CardAppreciatorController(ICardAppreciatorRepository _cardAppreciatorRepository)

        {
            cardAppreciatorRepository = _cardAppreciatorRepository;
        }


        [HttpPost]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> InsertAsync([FromBody] CardAppreciatorMst CardAppreciatorMst)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId

                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId

                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId

                CardAppreciatorMst.Fk_UserID = decryptedUserId;
                CardAppreciatorMst.fk_companyId = decryptedCompanyId;
                CardAppreciatorMst.Fk_LocID = decryptedLocationId;


                bool isInserted = await cardAppreciatorRepository.InsertAsync(CardAppreciatorMst);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "detail inserted successfully." : "Failed to insert detail.";
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
        [Authorize]
        public async Task<IActionResult> GetAll(int pageIndex = 0, int pageSize = 10)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {


                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId


                var (totalCount, result) = await cardAppreciatorRepository.GetAll(pageIndex, pageSize, decryptedCompanyId);
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
        [HttpGet("{pk_crdauthId}")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetByIdAsync([FromRoute] int pk_crdauthId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {


                CardAppreciatorMst result = await cardAppreciatorRepository.GetByIdAsync(pk_crdauthId);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid Id";
                    return Ok(modelResponse);
                }
                else
                {
                    result.pk_crdauthId = pk_crdauthId;
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

        [HttpDelete("{pk_crdauthId}")]
        [Authorize]
        public async Task<IActionResult> DeleteAsync([FromRoute] int pk_crdauthId)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                bool isDeleted = await cardAppreciatorRepository.DeleteAsync(pk_crdauthId);

                modelResponse.IsSuccess = isDeleted;
                modelResponse.Message = isDeleted ? "detail delete successfully." : "Failed to delete detail.";
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

        [HttpPut]
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult> UpdateAsync([FromBody] CardAppreciatorMst CardAppreciatorMst)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString(); // Retrieve and ensure it's a string
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId

                // Assign decrypted values              
                CardAppreciatorMst.Fk_UserID = decryptedUserId;

                CardAppreciatorMst.fk_companyId = decryptedCompanyId;
                CardAppreciatorMst.Fk_LocID = decryptedLocationId;
                bool isUpdated = await cardAppreciatorRepository.UpdateAsync(CardAppreciatorMst);
                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated ? "Updated successfully." : "Failed to update .";
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
