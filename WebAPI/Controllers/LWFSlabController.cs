using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class LWFSlabController : ControllerBase
    {

        

        private readonly ILWFSlabRepository lwfSlabRepository;


        public LWFSlabController(ILWFSlabRepository _accountMasterRepository)

        {
            lwfSlabRepository = _accountMasterRepository;
        }



        //[HttpGet]
        //[Authorize]  // Secured endpoint
        //public async Task<IActionResult> GetAll(int pageIndex = 0, int pageSize = 10)
        //{
        //    ModelResponse modelResponse = new ModelResponse();

        //    try
        //    {

        //        //var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString();  // Retrieve the UserId
        //        //var encryptedUserId = HttpContext.Items["EncryptedUserId"]?.ToString(); // Retrieve encryptedUserId-string

        //        var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
        //        var encryptedCompanyId = HttpContext.Items["EncryptedCompanyId"]?.ToString(); // Retrieve encryptedCompanyId-string




        //        var (totalCount, result) = await lwfSlabRepository.GetAll(pageIndex, pageSize, decryptedCompanyId);
        //        if (result.Count() == 0)
        //        {
        //            modelResponse.IsSuccess = false;
        //            modelResponse.Message = "No Record found.";
        //            modelResponse.StatusCode = 400;
        //            return Ok(modelResponse);
        //        }


        //        modelResponse.IsSuccess = true;
        //        modelResponse.Message = "LWF Slab List retrieved successfully.";
        //        modelResponse.Data = result;
        //        modelResponse.TotalCount = totalCount;
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




        [HttpGet]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetAll(short? fk_stateid = null, int pageIndex = 0, int pageSize = 10, string searchTerm = "")
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {

                //var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString();  // Retrieve the UserId
                //var encryptedUserId = HttpContext.Items["EncryptedUserId"]?.ToString(); // Retrieve encryptedUserId-string

                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
                var encryptedCompanyId = HttpContext.Items["EncryptedCompanyId"]?.ToString(); // Retrieve encryptedCompanyId-string




                var (totalCount, result) = await lwfSlabRepository.GetAll(pageIndex, pageSize, decryptedCompanyId, fk_stateid, searchTerm);
                if (result.Count() == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }


                modelResponse.IsSuccess = true;
                modelResponse.Message = "LWF Slab List retrieved successfully.";
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




        [HttpGet("{pk_slabid}")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetById([FromRoute] long pk_slabid)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {


                LWF_SlabMst result = await lwfSlabRepository.GetById(pk_slabid);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid LWF";
                    return Ok(modelResponse);
                }


                modelResponse.IsSuccess = true;
                modelResponse.Message = "LWF detail retrieved successfully.";
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






        // Controller
        [HttpPost]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> InsertLWFSlabAsync([FromBody] LWF_SlabMst lwfSlabMst)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString();
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString();

                lwfSlabMst.fk_insUserID = decryptedUserId;
                lwfSlabMst.fk_locId = decryptedLocationId;

                bool isInserted = await lwfSlabRepository.InsertLWFSlabAsync(lwfSlabMst);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "LWF Slab inserted successfully." : "Failed to insert LWF Slab.";
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

        [HttpPut]
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult> UpdateLWFAsync([FromBody] LWF_SlabMst lwfSlabMst)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString(); // Retrieve and ensure it's a string
                var encryptedUserId = HttpContext.Items["EncryptedUserId"]?.ToString(); // Retrieve encryptedUserId-string

                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId
                var encryptedLocationId = HttpContext.Items["EncryptedLocationId"]?.ToString(); // Retrieve encryptedLocationId-string

             

                // Assign decrypted values              
                lwfSlabMst.fk_insUserID = decryptedUserId;
                lwfSlabMst.fk_locId = decryptedLocationId;


                bool isUpdated = await lwfSlabRepository.UpdateLWFSlabAsync(lwfSlabMst);

                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated ? "LWF Slab updated successfully." : "Failed to update LWF Slab.";
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

      
        //pk_slabid


        [HttpDelete("{pk_slabid}")]
        [Authorize]
        public async Task<IActionResult> DeleteDepMstAsync([FromRoute] long pk_slabid)
        {
            ModelResponse modelResponse = new ModelResponse();



            try
            {
                bool isDeleted = await lwfSlabRepository.Delete(pk_slabid);

                modelResponse.IsSuccess = isDeleted;
                modelResponse.Message = isDeleted ? "LWF detail delete successfully." : "Failed to delete Zone detail.";
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
