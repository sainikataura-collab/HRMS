using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class ShiftController : Controller
    {


        private readonly IShiftRepository shiftRepository;

        public ShiftController(IShiftRepository _zoneRepository)

        {
            shiftRepository = _zoneRepository;
        }



        [HttpGet]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetAll(int pageIndex = 0, int pageSize = 10)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {

                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString();  // Retrieve the UserId
                var encryptedUserId = HttpContext.Items["EncryptedUserId"]?.ToString(); // Retrieve encryptedUserId-string

                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
                var encryptedCompanyId = HttpContext.Items["EncryptedCompanyId"]?.ToString(); // Retrieve encryptedCompanyId-string



                var (totalCount, result) = await shiftRepository.GetAll(pageIndex, pageSize, decryptedCompanyId);
                if (result.Count() == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }


                modelResponse.IsSuccess = true;
                modelResponse.Message = "Shift List retrieved successfully.";
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









        [HttpGet("{pk_shiftId}")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetShiftByIdAsync([FromRoute] string pk_shiftId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {


                ShiftMst result = await shiftRepository.GetShiftByIdAsync(pk_shiftId);



                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid ZoneId";
                    return Ok(modelResponse);
                }



                modelResponse.IsSuccess = true;
                modelResponse.Message = "Shift detail retrieved successfully.";
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
        public async Task<IActionResult> InsertShiftAsync([FromBody] ShiftMst shiftMst)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId

                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId

                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId



                shiftMst.fk_companyId = decryptedCompanyId;
                shiftMst.fk_locId = decryptedLocationId;


                string[] st = shiftMst.startHrs.Split(":");
                shiftMst.startHrs = st[0];
                shiftMst.startMinute = st[1];
                string[] et = shiftMst.endHrs.Split(":");
                shiftMst.endHrs = et[0];
                shiftMst.endMinute = et[1];


                // Insert shift data
                bool isInserted = await shiftRepository.InsertShiftMstAsync(shiftMst);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "Shift inserted successfully." : "Failed to insert shift.";
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
        public async Task<IActionResult> UpdateShiftAsync([FromBody] ShiftMst shiftMst)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                var encryptedUserId = HttpContext.Items["EncryptedUserId"]?.ToString();

                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]?.ToString();
                var encryptedLocationId = HttpContext.Items["EncryptedLocationId"]?.ToString();

                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString();
                var encryptedCompanyId = HttpContext.Items["EncryptedCompanyId"]?.ToString();

                //Assign decrypted values

                shiftMst.fk_InsuserId = decryptedUserId;
                shiftMst.fk_companyId = decryptedCompanyId;
                shiftMst.fk_locId = decryptedLocationId;




                // Validate and split start time
                if (!string.IsNullOrEmpty(shiftMst.startHrs) && shiftMst.startHrs.Contains(":"))
                {
                    string[] st = shiftMst.startHrs.Split(":");
                    shiftMst.startHrs = st.Length > 0 ? st[0] : "00";
                    shiftMst.startMinute = st.Length > 1 ? st[1] : "00";
                }

                // Validate and split end time
                if (!string.IsNullOrEmpty(shiftMst.endHrs) && shiftMst.endHrs.Contains(":"))
                {
                    string[] et = shiftMst.endHrs.Split(":");
                    shiftMst.endHrs = et.Length > 0 ? et[0] : "00";
                    shiftMst.endMinute = et.Length > 1 ? et[1] : "00";
                }



                bool isUpdated = await shiftRepository.UpdateShiftMstAsync(shiftMst);

                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated ? "Shift updated successfully." : "Failed to update Shift.";
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


        [HttpDelete("{pk_shiftId}")]
        [Authorize]
        public async Task<IActionResult> DeleteDepMstAsync([FromRoute] long pk_shiftId)
        {
            ModelResponse modelResponse = new ModelResponse();



            try
            {
                bool isDeleted = await shiftRepository.DeleteZoneMstAsync(pk_shiftId);

                modelResponse.IsSuccess = isDeleted;
                modelResponse.Message = isDeleted ? "Shift detail delete successfully." : "Failed to delete shift detail.";
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
