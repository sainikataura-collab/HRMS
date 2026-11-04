using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class EmployeeOtherIncomeController : ControllerBase
    {

        private readonly IEmployeeOtherIncomeRepository EmployeeOtherIncomeRepository;

        public EmployeeOtherIncomeController(IEmployeeOtherIncomeRepository _EmployeeOtherIncomeRepository)

        {
            EmployeeOtherIncomeRepository = _EmployeeOtherIncomeRepository;
        }

        //for get all

        //for get all
        [HttpGet]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetAll(int pageIndex = 0, int pageSize = 10, string? fk_finid = null)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                //var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
                //var encryptedCompanyId = HttpContext.Items["EncryptedCompanyId"]?.ToString(); // Retrieve encryptedCompanyId-string



                var (totalCount, result) = await EmployeeOtherIncomeRepository.GetAll(pageIndex, pageSize, fk_finid);
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

        //get by id
        [HttpGet("{pk_incomeid}")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult>GetBYId([FromRoute] string pk_incomeid)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                EmployeeOtherIncome result = await EmployeeOtherIncomeRepository.GetBYId(pk_incomeid);
                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid Id";
                    return Ok(modelResponse);
                }
                modelResponse.IsSuccess = true;
                modelResponse.Message = "Details retrieved successfully.";
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
        //for delete 
        [HttpDelete("{pk_incomeid}")]
        [Authorize]
        public async Task<IActionResult> Delete([FromRoute] string pk_incomeid)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                bool isDeleted = await EmployeeOtherIncomeRepository.Delete(pk_incomeid);

                modelResponse.IsSuccess = isDeleted;
                modelResponse.Message = isDeleted ? "Detail delete successfully." : "Failed to delete.";
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
        public async Task<IActionResult> Insert([FromBody] EmployeeOtherIncome Employee)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId
                var encryptedUserId = HttpContext.Items["EncryptedUserId"]?.ToString(); // Retrieve encryptedUserId-string

                //var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
                //var encryptedCompanyId = HttpContext.Items["EncryptedCompanyId"]?.ToString(); // Retrieve encryptedCompanyId-string

                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId
                var encryptedLocationId = HttpContext.Items["EncryptedLocationId"]?.ToString(); // Retrieve encryptedLocationId-string
                var decryptedFinancialYearId = HttpContext.Items["DecryptedFinancialYearId"]!.ToString(); // Retrieve the FinancialYear
                                                                                                          // Assign fk_finid to each item in the list

                Employee.fk_finid = decryptedFinancialYearId;
               Result result = await EmployeeOtherIncomeRepository.Insert(Employee, decryptedUserId, decryptedLocationId, Employee.fk_empid,Employee.fk_finid);

                modelResponse.IsSuccess = result.IsSuccessfull;
                modelResponse.Message = result.Message ;
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

      
        //for update
        [HttpPut]
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult> Update([FromBody] EmployeeOtherIncome Employee)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString(); // Retrieve and ensure it's a string
                var encryptedUserId = HttpContext.Items["EncryptedUserId"]?.ToString(); // Retrieve encryptedUserId-string

                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId
                var encryptedLocationId = HttpContext.Items["EncryptedLocationId"]?.ToString(); // Retrieve encryptedLocationId-string

                


               bool isUpdated = await EmployeeOtherIncomeRepository.Update(Employee, decryptedUserId,decryptedLocationId, Employee.fk_empid, Employee.fk_finid);

                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated ? "Detail updated successfully." : "Failed to update.";
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
