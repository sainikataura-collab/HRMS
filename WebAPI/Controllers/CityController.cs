using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;




namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class CityController : ControllerBase
    {
        private readonly ICityRepository cityRepository;

        public CityController(ICityRepository _cityRepository)

        {
            cityRepository = _cityRepository;
        }

        [HttpGet("CitybyStateList/{StateId}")]
        [Authorize]
        public async Task<IActionResult> CitybyStateList([FromRoute] int StateId)
        {
            ModelResponse modelResponse = new ModelResponse();

            //if (string.IsNullOrWhiteSpace(StateId))
            //{
            //    modelResponse.IsSuccess = false;
            //    modelResponse.Message = "StateId are required.";
            //    modelResponse.StatusCode = 400;
            //    return Ok(modelResponse);
            //}
            try
            {

                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
                var result = await cityRepository.GetCityDropdownListbystateAsync(StateId, decryptedCompanyId);


                modelResponse.IsSuccess = result.IsSuccessfull;
                modelResponse.Message = result.Message;
                modelResponse.Data = result.Data;
                modelResponse.StatusCode = result.IsSuccessfull ? 200 : 400;

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







        [HttpGet("{pk_cityid}")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetCityByIdAsync([FromRoute] string pk_cityid)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            { 


                CityMst result = await cityRepository.GetCityByIdAsync(pk_cityid);


                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid CityId";
                    return Ok(modelResponse);
                }

             

                //result.metro = Convert.ToChar(result.isMetro.ToString().Substring(0, 1));
                   
             

                modelResponse.IsSuccess = true;
                modelResponse.Message = "City detail retrieved successfully.";
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



        [HttpPost]
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult> InsertCityAsync([FromBody] CityMst cityMst)
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

                cityMst.fk_InsuserId = decryptedUserId;
                cityMst.fk_companyId = decryptedCompanyId;
                cityMst.fk_locId = decryptedLocationId;

                cityMst.metro = cityMst.isMetro ? 'Y' : 'N';

                bool isInserted = await cityRepository.InsertCityAsync(cityMst);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "City inserted successfully." : "Failed to insert city.";
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
        public async Task<IActionResult> UpdateCityAsync([FromBody] CityMst city)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId

                city.fk_updUserId = decryptedUserId;
                city.fk_locId = decryptedLocationId;

                city.metro = city.isMetro ? 'Y' : 'N';

                bool isUpdated = await cityRepository.UpdateCityAsync(city);

                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated ? "City updated successfully." : "Failed to update city.";
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



        [HttpGet]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetAll(int pageIndex = 0, int pageSize = 10, string fk_stateid = "", string searchTerm = "")
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {

                //var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString();  // Retrieve the UserId
                //var encryptedUserId = HttpContext.Items["EncryptedUserId"]?.ToString(); // Retrieve encryptedUserId-string

                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
                var encryptedCompanyId = HttpContext.Items["EncryptedCompanyId"]?.ToString(); // Retrieve encryptedCompanyId-string

                var decrypteLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the locationid




                var (totalCount, result) = await cityRepository.GetAll(pageIndex, pageSize, fk_stateid, decryptedCompanyId, searchTerm);
                if (result.Count() == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                

                modelResponse.IsSuccess = true;
                modelResponse.Message = "City List retrieved successfully.";
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


        [HttpDelete("{pk_cityid}")]
        [Authorize]
        public async Task<IActionResult> DeleteDepMstAsync([FromRoute] string pk_cityid)
        {
            ModelResponse modelResponse = new ModelResponse();



            try
            {
                bool isDeleted = await cityRepository.DeleteCityMstAsync(pk_cityid);

                modelResponse.IsSuccess = isDeleted;
                modelResponse.Message = isDeleted ? "city detail delete successfully." : "Failed to delete city detail.";
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






        [HttpGet("CityDropdownList/{StateId}")]
        [Authorize]
        public async Task<IActionResult> GetCityDropdownListAsync([FromRoute] string StateId)
        {
            ModelResponse modelResponse = new ModelResponse();

            if (string.IsNullOrWhiteSpace(StateId))
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = "StateId are required.";
                modelResponse.StatusCode = 400;
                return Ok(modelResponse);
            }
            try
            {


                var result = await cityRepository.GetCityDropdownListAsync(StateId);


                modelResponse.IsSuccess = result.IsSuccessfull;
                modelResponse.Message = result.Message;
                modelResponse.Data = result.Data;
                modelResponse.StatusCode = result.IsSuccessfull ? 200 : 400;

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

        [HttpPost("UpdateAttendance")]
        [Authorize]
        public async Task<IActionResult> UpdateAttendance(
   [FromBody] UpdateAttendanceModel model)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                //    bool result =
                //        await cityRepository
                //
                //     .UpdateAttendanceAsync(model);


                _ = Task.Run(async () =>
                {
                    await cityRepository.UpdateAttendanceAsync(model);
                });
                modelResponse.IsSuccess = true;
                modelResponse.Message = "Attendance update job submitted successfully. Processing in background.";

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


        [HttpGet("locationbyZoneList/{fk_zoneId?}")]
        [Authorize]
        public async Task<IActionResult> locationbyzoneList([FromRoute] string? fk_zoneId = null)
        {
            ModelResponse modelResponse = new ModelResponse();


            try
            {

                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
                var result = await cityRepository.GetLocationDropdownListbyZoneAsync(fk_zoneId ?? "", decryptedCompanyId);


                modelResponse.IsSuccess = result.IsSuccessfull;
                modelResponse.Message = result.Message;
                modelResponse.Data = result.Data;
                modelResponse.StatusCode = result.IsSuccessfull ? 200 : 400;

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
