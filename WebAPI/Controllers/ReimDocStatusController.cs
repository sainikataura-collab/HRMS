using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class ReimDocStatusController : ControllerBase
    {

        private readonly IReimDocStatusRepository ReimDocStatusRepository;

        public ReimDocStatusController(IReimDocStatusRepository _ReimDocStatusRepository)

        {
            ReimDocStatusRepository = _ReimDocStatusRepository;
        }
      
        //insert
        [HttpPost]
        [Authorize]  // Secured endpoint        

        public async Task<IActionResult> InsertReimDocStatus([FromBody] List<ReimDocStatusMst> reimDocStatusMst)
        {

            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId
                //var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId
                var decryptedFinancialYearId = HttpContext.Items["DecryptedFinancialYearId"]!.ToString(); // Retrieve the FinancialYear

                // Assign fk_finid to each item in the list
                foreach (var item in reimDocStatusMst)
                {
                    item.fk_finid = (decryptedFinancialYearId);
                    item.fk_headid = (int)(item.fk_headid!);
                }


                // Call repository method, passing the list of holidays
                bool isInserted = await ReimDocStatusRepository.InsertReimDocStatus(reimDocStatusMst, decryptedLocationId, decryptedUserId);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? " Reim.Doc status inserted successfully." : "Failed to insert Reim.Doc status.";
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

        public async Task<IActionResult> UpdateReimDocStatus([FromBody] ReimDocStatusMst reimDocStatusMst)
        {

            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId
                //var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId
               
                bool isUpdated = await ReimDocStatusRepository.UpdateReimDocStatus(reimDocStatusMst.pk_docid, reimDocStatusMst, decryptedLocationId, decryptedUserId);

                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated ? " Reim.Doc status updated successfully." : "Failed to updated Reim.Doc status.";
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



                var (totalCount, result) = await ReimDocStatusRepository.GetAll(pageIndex, pageSize, fk_empid);
                if (result.Count() == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Reim. Doc status List retrieved successfully.";
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
        [HttpGet("{pk_docid}")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetReimDocstatusById([FromRoute] string pk_docid)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                ReimDocStatusMst result = await ReimDocStatusRepository.GetReimDocstatusById(pk_docid);
                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid Id";
                    return Ok(modelResponse);
                }
                modelResponse.IsSuccess = true;
                modelResponse.Message = "doc status detail retrieved successfully.";
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
        //for delete 
        [HttpDelete("{pk_docid}")]
        [Authorize]
        public async Task<IActionResult> DeleteDocStatus([FromRoute] string pk_docid)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                bool isDeleted = await ReimDocStatusRepository.DeleteDocStatus(pk_docid);

                modelResponse.IsSuccess = isDeleted;
                modelResponse.Message = isDeleted ? "Reim. doc status  detail delete successfully." : "Failed to delete Reim. doc status.";
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
