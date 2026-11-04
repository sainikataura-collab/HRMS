using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Org.BouncyCastle.Asn1.Ocsp;

namespace HRMSWebAPI.Controllers.TrainingTransaction
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class TrainingNeedIdentificationController : ControllerBase
    {

        private readonly AppSettings appSettings;
        private readonly FileService _FileService;
        private readonly ITNIRepository TniRepository;


        public TrainingNeedIdentificationController(ITNIRepository _TniRepository, IOptions<AppSettings> appSettings, FileService fileService)
        {
            TniRepository = _TniRepository;
            this.appSettings = appSettings.Value;
            _FileService = fileService;
        }




        [HttpPost("Insert")]
        [Authorize] // secure endpoint
        public async Task<IActionResult> InsertTNIAsync([FromForm] TNIRequest tniRequest, [FromForm] List<TNIRequestLine> tniDetails )
        {

            ModelResponse modelResponse = new ModelResponse();
            try
            {
                // Handle File Upload
                if (tniRequest.FileBytes != null && tniRequest.FileBytes.Length > 0)
                {
                    // Optional: Validate it's an image
                    if (!_FileService.IsImageFile(tniRequest.FileBytes))
                    {
                        return BadRequest(new { message = "Only image files (jpg, jpeg, png) are allowed." });
                    }

                    // Save the file
                    var savedFileName = await _FileService.SaveFileAsync(tniRequest.FileBytes);

                    // Save the file path in LogoPath (this will go to DB)
                    tniRequest.AttachmentPath = savedFileName;
                }



                // Set UserId from Token/Session
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                tniRequest.UserId = decryptedUserId;
                tniRequest.FileBytes = null; // prevent saving raw file in DB

             
                bool isInserted = await TniRepository.InsertTNIAsync(
                tniRequest,
                   tniDetails);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "TNI Request submitted successfully." : "Failed to submit TNI Request.";
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




        [HttpGet("GetAll_TNI")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetAllTNI(int pageIndex = 0, int pageSize = 10)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();

                var (totalCount, result) = await TniRepository.GetAll(pageIndex, pageSize,decryptedUserId);
                if (result.Count() == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }



                modelResponse.IsSuccess = true;
                modelResponse.Message = "TNI  List retrieved successfully.";
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



        //ForbidResult admin portal


        [HttpGet("admin/list")]
        [Authorize]  // Secure endpoint
        public async Task<IActionResult> GetTNIAdminList([FromQuery] TNIListFilter filter)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var (totalCount, result) = await TniRepository.GetTNIAdminListAsync(filter);

                if (result == null || !result.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "TNI List retrieved successfully.";
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





        [HttpPost("admin/action")]
        [Authorize]
        public async Task<IActionResult> TakeTNIAction([FromBody] TNIActionRequest request)
        {
            var userId = HttpContext.Items["DecryptedUserId"]?.ToString();
            request.UserId = userId;

            var ok = await TniRepository.TakeTNIActionAsync(request);
            return Ok(new ModelResponse
            {
                IsSuccess = ok,
                Message = ok ? "Action completed." : "Action failed.",
                StatusCode = ok ? 200 : 400
            });
        }
       



        [HttpGet("approved-TNI-List")]
        [Authorize]
        public async Task<IActionResult> GetApprovedTNI([FromQuery] int? subProgramId = null, [FromQuery] int? TNIId=null)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var result = await TniRepository.GetApprovedTNIAsync(subProgramId, TNIId);

                if (result == null || !result.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No perticular approved subprogram TNI found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "perticular approved subprogram TNI retrieved successfully.";
                modelResponse.Data = result;
                modelResponse.TotalCount = result.Count();
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



       





        //------------------SubprogramDropDown base on programId---------------------

        [HttpGet("Subprogram/{fk_programId}")]
        [Authorize]
        public async Task<IActionResult> GetDropdownList([FromRoute] string fk_programId)
        {
            ModelResponse modelResponse = new ModelResponse();

            if (string.IsNullOrWhiteSpace(fk_programId))
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = "Id are required.";
                modelResponse.StatusCode = 400;
                return Ok(modelResponse);
            }
            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString(); // UserId
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString(); // CompanyId


                var result = await TniRepository.GetsubProgDropdownList(fk_programId, decryptedUserId, decryptedCompanyId);


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
        [HttpGet("SubprogramForTni/{fk_programId}")]
        [Authorize]
        public async Task<IActionResult> GetsubprogramfortniList([FromRoute] string fk_programId)
        {
            ModelResponse modelResponse = new ModelResponse();

            if (string.IsNullOrWhiteSpace(fk_programId))
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = "Id are required.";
                modelResponse.StatusCode = 400;
                return Ok(modelResponse);
            }
            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString(); // UserId
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString(); // CompanyId


                var result = await TniRepository.GetTNIsubProgDropdownList(fk_programId, decryptedUserId, decryptedCompanyId);


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



        //TNI  Get By ID for Employee view






        [HttpGet("employee-view")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetTNIEmp([FromQuery] long pk_programId, [FromQuery] long pk_subprogramId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();

                TrainingCalendarEmployeeView result = await TniRepository.GetEmpView(decryptedUserId, pk_programId, pk_subprogramId);
                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid Ids";
                    return Ok(modelResponse);
                }


                modelResponse.IsSuccess = true;
                modelResponse.Message = "View detail retrieved successfully.";
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




        //[HttpGet("approved-TNI-List")]
        //[Authorize]  // Secured endpoint
        //public async Task<IActionResult> GetApprovedTNI()
        //{
        //    ModelResponse modelResponse = new ModelResponse();

        //    try
        //    {
        //        var result = await TniRepository.GetApprovedTNIAsync();

        //        if (result == null || !result.Any())
        //        {
        //            modelResponse.IsSuccess = false;
        //            modelResponse.Message = "No approved TNI found.";
        //            modelResponse.StatusCode = 400;
        //            return Ok(modelResponse);
        //        }

        //        modelResponse.IsSuccess = true;
        //        modelResponse.Message = "Approved TNI retrieved successfully.";
        //        modelResponse.Data = result;
        //        modelResponse.TotalCount = result.Count(); // Total approved TNIs
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


    }
}
