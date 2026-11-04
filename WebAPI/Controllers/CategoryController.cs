using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers
{

    [Route("api/v1/[controller]")]
    [ApiController]
    public class CategoryController : ControllerBase
    {
        private readonly ICategoryRepository categoryRepository;



        public CategoryController(ICategoryRepository _categoryRepository)

        {
            categoryRepository = _categoryRepository;
        }


        [HttpPost]
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult> InsertCategoryMstAsync([FromBody] CategoryMst CategoryMst)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {

                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId
                var encryptedUserId = HttpContext.Items["EncryptedUserId"]?.ToString(); // Retrieve encryptedUserId-string

                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
                var encryptedCompanyId = HttpContext.Items["EncryptedCompanyId"]?.ToString(); // Retrieve encryptedCompanyId-string

                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId
                var encryptedLocationId = HttpContext.Items["EncryptedLocationId"]?.ToString(); // Retrieve encrypt

                CategoryMst.fk_companyId = decryptedCompanyId;
                CategoryMst.Fk_LocID = decryptedLocationId;
                CategoryMst.Fk_UserID = decryptedUserId.ToString();

                bool isInserted = await categoryRepository.InsertCategoryMstAsync(CategoryMst);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "Category details inserted successfully." : "Failed to insert Category details.";
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
                var encryptedCompanyId = HttpContext.Items["EncryptedCompanyId"]?.ToString(); // Retrieve encryptedCompanyId-string

                
                var (totalCount, result) = await categoryRepository.GetAll(pageIndex, pageSize, decryptedCompanyId);
                if (result.Count() == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

               
                modelResponse.IsSuccess = true;
                modelResponse.Message = "Category List retrieved successfully.";
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

        [HttpGet("{categoryId}")]
        [Authorize]

        public async Task<IActionResult> GetCategoryByIdAsync([FromRoute] string categoryId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {

                CategoryMst result = await categoryRepository.GetCategoryByIdAsync(categoryId);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid CategoryId";
                    return Ok(modelResponse);
                }
 

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Category detail retrieved successfully.";
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
     
        public async Task<IActionResult> UpdateCategoryMstAsync([FromBody] CategoryMst CategoryMst)
        {
            ModelResponse modelResponse = new ModelResponse();

            
            try
            {
               var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString();  // Retrieve the user ID
                var encryptedUserId = HttpContext.Items["EncryptedUserId"]?.ToString(); // Retrieve encryptedUserId-string
                
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
                var encryptedCompanyId = HttpContext.Items["EncryptedCompanyId"]?.ToString(); // Retrieve encryptedCompanyId-string

                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId
                var encryptedLocationId = HttpContext.Items["EncryptedLocationId"]?.ToString(); // Retriev
                // Decrypt CategoryId 
               


               // CategoryMst.Fk_CompanyId = decryptedCompanyId;
                CategoryMst.Fk_LocID = decryptedLocationId;
                CategoryMst.Fk_UserID = decryptedUserId.ToString();

                bool isUpdated = await categoryRepository.UpdateCategoryMstAsync(CategoryMst);

                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated ? "Category detail updated successfully." : "Failed to update Category detail.";
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



        [HttpDelete("{categoryId}")]
        [Authorize]
      

        public async Task<IActionResult> DeleteCategoryMstAsync([FromRoute] string categoryId)
        {
            ModelResponse modelResponse = new ModelResponse();
            
            try
            {
                bool isDeleted = await categoryRepository.DeleteCategoryMstAsync(categoryId);

                modelResponse.IsSuccess = isDeleted;
                modelResponse.Message = isDeleted ? "Category detail delete successfully." : "Failed to delete Category detail.";
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
