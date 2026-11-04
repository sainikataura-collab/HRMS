using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class ProfessionalTaxSlabController : ControllerBase
    {
        private readonly IProfessionalTaxSlabRepository professionalTaxSlabRepository;



        public ProfessionalTaxSlabController(IProfessionalTaxSlabRepository _professionalTaxSlabRepository)

        {
            professionalTaxSlabRepository = _professionalTaxSlabRepository;
        }


        [HttpPost]
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult> InsertProfessionalAsync([FromBody] ProfessionalTaxSlabMst ProfessionalTaxSlabMst)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {

                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId

                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId

                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId

                bool isInserted = await professionalTaxSlabRepository.InsertProfessionalAsync(ProfessionalTaxSlabMst, decryptedUserId, decryptedLocationId);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "ProfessionalTaxSlabMst details inserted successfully." : "Failed to insert ProfessionalTaxSlabMst details.";
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
        public async Task<IActionResult> GetAll(short? fk_stateid = null, int pageIndex = 0, int pageSize = 10, string searchTerm = "")
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId

                var (totalCount, result) = await professionalTaxSlabRepository.GetAll(pageIndex, pageSize, fk_stateid, searchTerm, decryptedCompanyId);
                if (result.Count() == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }


                modelResponse.IsSuccess = true;
                modelResponse.Message = "ProfessionalTaxSlab List retrieved successfully.";
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




        [HttpGet("{SlabId}")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetProfessionalByIdAsync([FromRoute] long SlabId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {


                ProfessionalTaxSlabMst result = await professionalTaxSlabRepository.GetProfessionalByIdAsync(SlabId);



                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid SlabId";
                    return Ok(modelResponse);
                }



                modelResponse.IsSuccess = true;
                modelResponse.Message = "ProfessionalTaxSlab detail retrieved successfully.";
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

        [HttpDelete("{SlabId}")]
        [Authorize]
        public async Task<IActionResult> DeleteProfessionalAsync([FromRoute] long SlabId)
        {
            ModelResponse modelResponse = new ModelResponse();



            try
            {
                bool isDeleted = await professionalTaxSlabRepository.DeleteProfessionalAsync(SlabId);

                modelResponse.IsSuccess = isDeleted;
                modelResponse.Message = isDeleted ? "ProfessionalTaxSlab detail delete successfully." : "Failed to delete ProfessionalTaxSlab detail.";
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
        public async Task<IActionResult> UpdateProfessionalAsync([FromBody] ProfessionalTaxSlabMst ProfessionalTaxSlabMst)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId

                bool isUpdated = await professionalTaxSlabRepository.UpdateProfessionalAsync(ProfessionalTaxSlabMst, decryptedUserId, decryptedLocationId);

                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated ? "ProfessionalTaxSlab updated successfully." : "Failed to update ProfessionalTaxSlab.";
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



    

