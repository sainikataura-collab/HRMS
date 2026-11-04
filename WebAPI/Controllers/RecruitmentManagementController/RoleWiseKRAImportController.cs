using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using Org.BouncyCastle.Asn1.Pkcs;
using System.Dynamic;

using static HRMSWebAPI.Models.RoleWiseKRAImportModel;
namespace HRMSWebAPI.Controllers.RecruitmentManagementController
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class RoleWiseKRAImportController : ControllerBase
    {

        private readonly IRoleWiseKRAImportRepository roleWiseKRAImportRepository;

        public RoleWiseKRAImportController(IRoleWiseKRAImportRepository _roleWiseKRAImportRepository)

        {
            roleWiseKRAImportRepository = _roleWiseKRAImportRepository;
        }



        //[HttpPost("ImportRolewiseKRA")]
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


        //        var employees = ExcelHelper.ConvertToModelList<ExcelUploadRolewiseKRAModel>(data);


        //        var request = new ExcelUploadRolewiseKRAModelRequest
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

        //        bool result = await roleWiseKRAImportRepository.ImportEmpWiseKRA(request, decryptedUserId);

        //        modelResponse.IsSuccess = result;
        //        modelResponse.Message = result ? "Rolewise KRA data imported successfully." : "KRA import failed.";
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





        //[HttpPost("ImportRolewiseKRA")]
        //[Authorize]
        //public async Task<IActionResult> ImportEmpWisekra(IFormFile file)
        //{
        //    try
        //    {

        //        var data = ExcelHelper.ReadExcelDynamic(file);
        //        if (data == null || !data.Any())
        //        {
        //            return BadRequest(new ModelResponse { IsSuccess = false, Message = "Excel file has no data." });
        //        }

        //        var employees = ExcelHelper.ConvertToModelList<ExcelUploadRolewiseKRAModel>(data);
        //        var request = new ExcelUploadRolewiseKRAModelRequest { Employees = employees };

        //        var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
        //        if (string.IsNullOrEmpty(decryptedUserId))
        //        {
        //            return Unauthorized(new ModelResponse { IsSuccess = false, Message = "UserId not found." });
        //        }

        //        var invalidRoles = await roleWiseKRAImportRepository.ImportEmpWiseKRA(request, decryptedUserId);

        //        return Ok(new ModelResponse
        //        {
        //            IsSuccess = invalidRoles.Count == 0,
        //            Message = invalidRoles.Count == 0 ? "Rolewise KRA data imported successfully." : "Some roles are not found.",
        //            Data = invalidRoles,
        //            StatusCode = 200
        //        });
        //    }
        //    catch (Exception ex)
        //    {
        //        return StatusCode(500, new ModelResponse { IsSuccess = false, Message = ex.Message });
        //    }
        //}







[HttpPost("ImportRolewiseKRA")]
[Authorize]
public async Task<IActionResult> ImportEmpWisekra(IFormFile file)
{
    try
    {
        
        var data = ExcelHelper.ReadExcelDynamic(file);
        if (data == null || !data.Any())
            return BadRequest(new ModelResponse { 
                IsSuccess = false, 
                Message = "Excel file has no data."
            });

        var models = ExcelHelper.ConvertToModelList<ExcelUploadRolewiseKRAModel>(data);
        var request = new ExcelUploadRolewiseKRAModelRequest { Employees = models };

        var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();

        if (string.IsNullOrEmpty(decryptedUserId))
            return Unauthorized(new ModelResponse {
                IsSuccess = false,
                Message = "UserId not found.",
                StatusCode = 401
            });

        var kraResult = await roleWiseKRAImportRepository.ImportEmpWiseKRA(request, decryptedUserId);

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
