
using Dapper;
using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;


namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class LanguageMasterController : ControllerBase
    {
        private readonly ILanguageMasterRepository languageMasterRepository;
        public LanguageMasterController(ILanguageMasterRepository _languageMasterRepository)
        {
            languageMasterRepository = _languageMasterRepository;
        }


        //Insert language master

  

        [HttpPost]
        [Authorize]  // Secured endpoint     
        public async Task<IActionResult> InsertLanguageMasterMstAsync([FromBody] LanguageMasterMst LanguageMasterMst)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {

                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId

                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
                
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId
               
                LanguageMasterMst.Fk_UserID = decryptedUserId;
                LanguageMasterMst.fk_companyId = decryptedCompanyId;
                LanguageMasterMst.Fk_LocID = decryptedLocationId;


                bool isInserted = await languageMasterRepository.InsertLanguageMasterMstAsync(LanguageMasterMst);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "Language  mater details inserted successfully." : "Failed to insert Language mater details.";
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



        //Get all Language master

        [HttpGet]
        [Authorize]
        public async Task<IActionResult>GetAll(int pageIndex = 0, int pageSize = 10)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {

                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString();  // Retrieve the UserId
               
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
               
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId

               
                var (totalCount, result) = await languageMasterRepository.GetAll(pageIndex, pageSize, decryptedCompanyId);
                if (result.Count() == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }



                modelResponse.IsSuccess = true;
                modelResponse.Message = "Language master List retrieved successfully.";
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



        // Get by id language master
        [HttpGet("{pk_langid}")]
        [Authorize]

        public async Task<IActionResult> GetLanguageMasterByIdAsync([FromRoute] long pk_langid)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {

                LanguageMasterMst result = await languageMasterRepository.GetLanguageMasterByIdAsync(pk_langid);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid Language master Id";
                    return Ok(modelResponse);
                }


                modelResponse.IsSuccess = true;
                modelResponse.Message = "language Mater detail retrieved successfully.";
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
                     // 

        //public async Task<IActionResult> UpdateLanguageMasterMstAsync([FromBody] LanguageMasterMst LanguageMasterMst)
        //{
        //    ModelResponse modelResponse = new ModelResponse();




        //    try
        //    {
        //        bool isUpdated = await languageMasterRepository.UpdateLanguageMasterMstAsync(LanguageMasterMst);
        //        modelResponse.IsSuccess = isUpdated;
        //        modelResponse.Message = isUpdated ? "LanguageMaster detail updated successfully." : "Failed to update LanguageMaster detail.";
        //        modelResponse.StatusCode = isUpdated ? 200 : 400;

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



        //update
          
        public async Task<IActionResult> UpdateLanguageMasterAsync([FromBody] LanguageMasterMst LanguageMasterMst)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString(); // Retrieve and ensure it's a string

                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId

                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId

                // Assign decrypted values              
                LanguageMasterMst.Fk_UserID = decryptedUserId;

                //  grade.fk_companyId = decryptedCompanyId;
                LanguageMasterMst.Fk_LocID = decryptedLocationId;
                bool isUpdated = await languageMasterRepository.UpdateLanguageMasterAsync(LanguageMasterMst);
                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated ? "Language updated successfully." : "Failed to update Language.";
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



        // Delete Office type master

        [HttpDelete("{pk_langid}")]
        [Authorize]
        public async Task<IActionResult> DeleteLanguageMasterMstAsync([FromRoute] long pk_langid)
        {
            ModelResponse modelResponse = new ModelResponse();




            try
            {
                bool isDeleted = await languageMasterRepository.DeleteLanguageMasterMstAsync(pk_langid);

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



    }
}
