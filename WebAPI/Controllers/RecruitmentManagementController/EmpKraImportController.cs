
using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using Org.BouncyCastle.Asn1.Pkcs;
using System.Dynamic;
using static HRMSWebAPI.Models.EmpKraImportModel;

namespace HRMSWebAPI.Controllers.RecruitmentManagementController
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class EmpKraImportController : ControllerBase
    {
        private readonly IEmpKraImportRepository empKraImportRepository;

        public EmpKraImportController(IEmpKraImportRepository _empKraImportRepository)

        {
            empKraImportRepository = _empKraImportRepository;
        }



        //[HttpPost("ImportEmpKRANew")]
        //[Authorize]
        //public async Task<IActionResult> ImportEmpWisekra(IFormFile file)
        //{
        //    ModelResponse modelResponse = new ModelResponse();
        //    try
        //    {
        //        if (file == null || file.Length == 0)
        //        {
        //            return Ok(new ModelResponse
        //            {
        //                IsSuccess = false,
        //                Message = "File is required.",
        //                StatusCode = 400
        //            });
        //        }

        //        var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
        //        if (fileExtension != ".xlsx" && fileExtension != ".xls")
        //        {
        //            return Ok(new ModelResponse
        //            {
        //                IsSuccess = false,
        //                Message = "Only .xlsx or .xls files are allowed.",
        //                StatusCode = 400
        //            });
        //        }

        //        var data = ExcelHelper.ReadExcelDynamic(file);

        //        if (data == null || !data.Any())
        //        {
        //            return Ok(new ModelResponse
        //            {
        //                IsSuccess = false,
        //                Message = "Excel file has no data.",
        //                StatusCode = 400
        //            });
        //        }


        //        var employees = ExcelHelper.ConvertToModelList<ExcelUploadModelKRANew>(data);


        //        var request = new ExcelUploadKRARequestNew
        //        {
        //            Employees = employees
        //        };

        //        var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();

        //        if (string.IsNullOrEmpty(decryptedUserId))
        //        {
        //            return Ok(new ModelResponse
        //            {
        //                IsSuccess = false,
        //                Message = "UserId not found.",
        //                StatusCode = 401
        //            });
        //        }

        //        bool result = await empKraImportRepository.ImportEmpWiseKRA(request, decryptedUserId);

        //        modelResponse.IsSuccess = result;
        //        modelResponse.Message = result ? "KRA data imported successfully." : "KRA import failed.";
        //        modelResponse.Data = result;
        //        modelResponse.StatusCode = 200;

        //        return Ok(modelResponse);
        //    }
        //    catch (Exception ex)
        //    {
        //        return Ok(new ModelResponse
        //        {
        //            IsSuccess = false,
        //            Message = ex.Message,
        //            StatusCode = 500
        //        });
        //    }
        //}






        [HttpPost("ImportEmpKRANew")]
        [Authorize]
        public async Task<IActionResult> ImportEmpWisekra(IFormFile file)
        {
            try
            {

                var data = ExcelHelper.ReadExcelDynamic(file);
                if (data == null || !data.Any())
                    return BadRequest(new ModelResponse
                    {
                        IsSuccess = false,
                        Message = "Excel file has no data."
                    });

                var models = ExcelHelper.ConvertToModelList<ExcelUploadModelKRANew>(data);
                var request = new ExcelUploadKRARequestNew { Employees = models };

                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();

                if (string.IsNullOrEmpty(decryptedUserId))
                    return Unauthorized(new ModelResponse
                    {
                        IsSuccess = false,
                        Message = "UserId not found.",
                        StatusCode = 401
                    });

                var kraResult = await empKraImportRepository.ImportEmpWiseKRA(request, decryptedUserId);

                return Ok(new ModelResponse
                {
                    IsSuccess = true,
                    Message = "Rolewise KRA Imported.",
                    Data = kraResult,
                    StatusCode = 200
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ModelResponse { IsSuccess = false, Message = ex.Message });
            }
        }













    }
}
