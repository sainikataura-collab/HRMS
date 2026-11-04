using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class RoleMastersController : ControllerBase
    {
        private readonly IRoleMastersRepository roleMastersRepository;

        public RoleMastersController(IRoleMastersRepository _roleMastersRepository)

        {
            roleMastersRepository = _roleMastersRepository;
        }

        //for get all

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAll(int pageindex = 0, int pagesize = 10)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {

                var (totalCount, result) = await roleMastersRepository.GetAll(pageindex, pagesize);
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


        [HttpGet("{RoleId}")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetByIdAsync([FromRoute] int RoleId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {



                RoleMastersMst result = await roleMastersRepository.GetByIdAsync(RoleId);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid Id";
                    return Ok(modelResponse);
                }
                else
                {
                    result.RoleId = RoleId;
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


        //delete

        [HttpDelete("{RoleId}")]
        [Authorize]
        public async Task<IActionResult> DeleteAsync([FromRoute] int RoleId)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                bool isDeleted = await roleMastersRepository.DeleteAsync(RoleId);

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

        //for insert
        [HttpPost]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> InsertAsync([FromBody] RoleMastersMst roleMst)

        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {

                bool isInserted = await roleMastersRepository.InsertAsync(roleMst);

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


        [HttpPut]
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult> UpdateAsync([FromBody] RoleMastersMst roleMst)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                bool isUpdated = await roleMastersRepository.UpdateAsync(roleMst);
                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated ? "detail updated successfully." : "Failed to update detail.";
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
