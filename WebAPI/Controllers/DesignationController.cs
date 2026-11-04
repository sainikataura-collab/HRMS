using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using iTextSharp.text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers
{

    [Route("api/v1/[controller]")]
    [ApiController]
    public class DesignationController : ControllerBase
    {
        private readonly IDesignationRepository designationRepository ;



        public DesignationController(IDesignationRepository _designationRepository)

        {
            designationRepository = _designationRepository;
        }


        [HttpPost]
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult> InsertDesignationAsync([FromBody] DesignationMst designationMst)
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


                
               // Decrypt CompanyId 
               //var (isValid, decryptedfk_LevelId, message) = IdHelper.ValidateAndDecryptId(designationMst.fk_levelid, "fk_levelid");

               //if (!isValid || decryptedfk_LevelId == null)
               //{
               //    modelResponse.IsSuccess = false;
               //    modelResponse.Message = message;
               //    modelResponse.StatusCode = 400;
               //    return Ok(modelResponse);
               //}

               designationMst.fk_companyId = decryptedCompanyId;
               designationMst.fk_locid = decryptedLocationId;
               designationMst.fk_userid = decryptedUserId;
               //designationMst.fk_levelid = decryptedfk_LevelId;



               bool isInserted = await designationRepository.InsertDesignationMstAsync(designationMst);

               modelResponse.IsSuccess = isInserted;
               modelResponse.Message = isInserted ? "Designation inserted successfully." : "Failed to insert designation.";
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

               //var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString();  // Retrieve the UserId
               //var encryptedUserId = HttpContext.Items["EncryptedUserId"]?.ToString(); // Retrieve encryptedUserId-string

               var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
               var encryptedCompanyId = HttpContext.Items["EncryptedCompanyId"]?.ToString(); // Retrieve encryptedCompanyId-string

               //var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId
               //var encryptedLocationId = HttpContext.Items["EncryptedLocationId"]?.ToString(); // Retrieve encryptedLocationId-string

               /*
               // Decrypt CompanyId 
               var (isValid, decryptedCompanyId, message) = IdHelper.ValidateAndDecryptId(companyId, "CompanyId");

               if (!isValid || decryptedCompanyId == null)
               {
                   modelResponse.IsSuccess = false;
                   modelResponse.Message = message;
                   modelResponse.StatusCode = 400;
                   return Ok(modelResponse);

               }
               */

                var (totalCount, result) = await designationRepository.GetAll(pageIndex, pageSize, decryptedCompanyId, searchTerm);
                if (result.Count() == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                //foreach (var item in result)
                //{
                //    if (item.pk_desgid != null)
                //    {
                //        // Encrypt the BankId
                //        string encryptedDesignationID = EncryptionStaticHelper.EncryptToUrlSafeBase64(item.pk_desgid);

                //        // Reassign the encrypted encryptedBankID
                //        item.pk_desgid = encryptedDesignationID;
                //    }

                //}

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Designation List retrieved successfully.";
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








        [HttpGet("{desigId}")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetBankByIdAsync([FromRoute] string desigId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                

                DesignationMst result = await designationRepository.GetDesignationByIdAsync(desigId);

             

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid DesigId";
                    return Ok(modelResponse);
                }


                modelResponse.IsSuccess = true;
                modelResponse.Message = "Designation detail retrieved successfully.";
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
        public async Task<IActionResult> UpdateDesignationMstAsync([FromBody] DesignationMst designationMst)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString();  // Retrieve the user ID
                var encryptedUserId = HttpContext.Items["EncryptedUserId"]?.ToString(); // Retrieve encryptedUserId-string


                //var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
                //var encryptedCompanyId = HttpContext.Items["EncryptedCompanyId"]?.ToString(); // Retrieve encryptedCompanyId-string


                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId
                var encryptedLocationId = HttpContext.Items["EncryptedLocationId"]?.ToString(); // Retrieve encryptedLocationId-string

              
                designationMst.fk_locid = decryptedLocationId;
                designationMst.fk_userid = decryptedUserId.ToString();
                


                bool isUpdated = await designationRepository.UpdateDesignationMstAsync(designationMst);

                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated ? "Designation detail updated successfully." : "Failed to update Designation detail.";
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





        [HttpDelete("{desigId}")]
        [Authorize]
        public async Task<IActionResult> DeleteBankMstAsync([FromRoute] string desigId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                bool isDeleted = await designationRepository.DeleteDesignationMstAsync(desigId);

                modelResponse.IsSuccess = isDeleted;
                modelResponse.Message = isDeleted ? "Designation detail delete successfully." : "Failed to delete Designation detail.";
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
