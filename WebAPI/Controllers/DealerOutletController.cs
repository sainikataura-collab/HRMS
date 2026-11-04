using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using System.Data;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class DealerOutletController : ControllerBase
    {
        private readonly IDealerOutletRepository dealerOutletRepository;

        public DealerOutletController(IDealerOutletRepository _dealerOutletRepository)
        {
            
            dealerOutletRepository = _dealerOutletRepository;
           
        }



        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAllUsers(int pageIndex = 0, int pageSize = 10)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                // Retrieve decrypted values from HttpContext.Items
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString();

                // Validate CompanyId and UserId
                if (string.IsNullOrEmpty(decryptedCompanyId) || string.IsNullOrEmpty(decryptedUserId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Company ID or User ID is required.";
                    modelResponse.StatusCode = 400;
                    return BadRequest(modelResponse);
                }

                // Call repository method to get users
                var (totalCount, result) = await dealerOutletRepository.GetAllAsync(pageIndex, pageSize, decryptedUserId, decryptedCompanyId);
                if (result == null || !result.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No  records found.";
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = " List retrieved successfully.";
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


        [HttpPost]
        [Authorize]
        public async Task<IActionResult> InsertDealerOutletAsync([FromBody] List<DealerOutletMst> outletList)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                // Get values from token (HttpContext)
               
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString();

                // Validation
                if (outletList == null || outletList.Count == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Outlet list cannot be empty";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                if (string.IsNullOrEmpty(decryptedCompanyId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Company ID is missing";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

              
                foreach (var item in outletList)
                {
                    item.fk_companyId = decryptedCompanyId; // optional (safe)
                }

                //  Call repository
                bool isInserted = await dealerOutletRepository.InsertDealerOutletAsync(
                    outletList,
                    decryptedCompanyId
                );

                //  Response
                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "Dealer Outlet inserted successfully." : "Failed to insert Dealer Outlet";
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




        [HttpDelete("{pk_dealerOutletId}")]
        [Authorize]
        public async Task<IActionResult> DeleteDealerOutlet(int pk_dealerOutletId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                if (pk_dealerOutletId <= 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid Dealer Outlet Id";
                    modelResponse.StatusCode = 400;
                    return BadRequest(modelResponse);
                }

                bool isDeleted = await dealerOutletRepository.DeleteDealerOutletAsync(pk_dealerOutletId);

                modelResponse.IsSuccess = isDeleted;
                modelResponse.Message = isDeleted ? "Deleted successfully" : "Delete failed";
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

        [HttpGet("{pk_dealerOutletId}")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetById([FromRoute] int pk_dealerOutletId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {



                DealerOutletMst result = await dealerOutletRepository.GetDealerOutletByIdAsync(pk_dealerOutletId);

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



        [HttpPut]
        [Authorize]
        public async Task<IActionResult> UpdateDealerOutletAsync([FromBody] List<DealerOutletMst> outletList)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                
              
                // Validation
                if (outletList == null || outletList.Count == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Outlet list cannot be empty";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

               
                //  Call UPDATE repo (important change)
                bool isUpdated = await dealerOutletRepository.UpdateDealerOutletAsync(outletList);

                // Response
                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated
                    ? "Dealer Outlet updated successfully."
                    : "Failed to update Dealer Outlet";

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
