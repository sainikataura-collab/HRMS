using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class EmployeeRentDetailController : ControllerBase
    {

        private readonly IEmployeeRentDetailRepository EmployeeRentDetailRepository;

        public EmployeeRentDetailController(IEmployeeRentDetailRepository _EmployeeRentDetailRepository)

        {
            EmployeeRentDetailRepository = _EmployeeRentDetailRepository;
        }


        // add this in rent detail controller

        [HttpPost("autoIncentiveProcess")]
        [Authorize]
        public async Task<IActionResult> GetautoIncentiveProcessList([FromBody] EmpAttendanceRequestModel request)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var (notMarkedCount, markedCount, lockedCount, employees) = await EmployeeRentDetailRepository.GetAutoIncentiveprocessAsync(
                    request.PageIndex1, request.PageSize1,
                    request.PageIndex2, request.PageSize2,
                    request.PageIndex3, request.PageSize3,
                    request.EmpCode,
                    request.EmpCodeManual,
                    request.EmpName,
                    request.SelectedDepartments,
                    request.SelectedDesignation,
                    request.SelectedLocations,
                    request.SelectedNature,
                    request.SelectedCity,
                    request.SortBy,
                    request.FkMonthId,
                    request.FkYearId,
                    request.fk_costcentreid,

                    request.EmpStatus,
                    request.fromDate,
                    request.toDate
                );

                if ((employees.SalaryNotProcessed?.Count ?? 0) +
                    (employees.SalaryProcessed?.Count ?? 0) +
                    (employees.SalaryLock?.Count ?? 0) == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Employee salary Process data retrieved successfully.";
                modelResponse.Data = employees;

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

        [HttpPost("InsertautoIncentiveProcess")]
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult> InsertautoIncentiveProcess([FromBody] AutoSalaryProcessPostModel empData)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId

                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId

                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();

                var decryptedFinancialYearId = HttpContext.Items["DecryptedFinancialYearId"]?.ToString();


                bool isInserted = await EmployeeRentDetailRepository.InsertAutoIncentiveProcessAsync(empData, decryptedLocationId, decryptedUserId, decryptedFinancialYearId);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? " Inserted successfully." : "Failed to insert .";
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

        [HttpPost("deleteIncentiveProcess")]
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult> deleteIncentiveProcess([FromBody] AutoSalaryProcessPostModel empData)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {


                bool isInserted = await EmployeeRentDetailRepository.DeleteIncentiveProcessAsync(empData);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? " Delete successfully." : "Failed to Delete .";
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



        //for get all
        [HttpGet]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetAll(string? fk_empid = null)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {



                var (totalCount, result) = await EmployeeRentDetailRepository.GetAll(fk_empid);

                if (result.Count() == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = " List retrieved successfully.";
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
        [HttpGet("{fk_empid}")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetById([FromRoute] string fk_empid)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedFinancialYearId = HttpContext.Items["DecryptedFinancialYearId"]!.ToString();

                EmployeeRentDetailResult result = await EmployeeRentDetailRepository.GetById(fk_empid, decryptedFinancialYearId);
                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid Id";
                    return Ok(modelResponse);
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

        //insert'
        [HttpPost]
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult> Insert([FromBody] EmployeeRentDetailDataSet rentData)
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

                // Optionally inject the financial year ID if it's not already set on the RentMst
                if (string.IsNullOrEmpty(rentData.RentMst.fk_finid))
                {
                    var decryptedFinancialYearId = HttpContext.Items["DecryptedFinancialYearId"]!.ToString();
                    rentData.RentMst.fk_finid = decryptedFinancialYearId;
                }


                bool isInserted = await EmployeeRentDetailRepository.Insert(rentData, decryptedLocationId, decryptedUserId);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? " Inserted successfully." : "Failed to insert .";
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
        [Authorize] // Secured endpoint
        public async Task<IActionResult> Update([FromBody] EmployeeRentDetailDataSet rentData)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId
                var encryptedUserId = HttpContext.Items["EncryptedUserId"]?.ToString(); // Retrieve encryptedUserId-string

                //var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Optional
                //var encryptedCompanyId = HttpContext.Items["EncryptedCompanyId"]?.ToString(); // Optional

                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId
                var encryptedLocationId = HttpContext.Items["EncryptedLocationId"]?.ToString(); // Optional

                // Optionally inject the financial year ID if it's not already set
                if (string.IsNullOrEmpty(rentData.RentMst.fk_finid))
                {
                    var decryptedFinancialYearId = HttpContext.Items["DecryptedFinancialYearId"]!.ToString();
                    rentData.RentMst.fk_finid = decryptedFinancialYearId;
                }

                // Ensure pk_rentId is applied to RentMst


                bool isUpdated = await EmployeeRentDetailRepository.Update((int)rentData.RentMst.pk_rentId, rentData, decryptedLocationId, decryptedUserId);

                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated ? "Updated successfully." : "Failed to update.";
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

        //for delete

        //get by id
        [HttpDelete("{fk_empid}")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> delete([FromRoute] string fk_empid)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedFinancialYearId = HttpContext.Items["DecryptedFinancialYearId"]!.ToString();

                EmployeeRentDetailResult result = await EmployeeRentDetailRepository.delete(fk_empid, decryptedFinancialYearId);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid Id";
                    return Ok(modelResponse);
                }
                modelResponse.IsSuccess = true;
                modelResponse.Message = "detail deleted successfully.";
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




        [HttpGet("MonthDropdownList/{EmpId}")]
        [Authorize]
        public async Task<IActionResult> GetMOnthDropdownList([FromRoute] string EmpId)
        {
            ModelResponse modelResponse = new ModelResponse();

            if (string.IsNullOrWhiteSpace(EmpId))
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = "sectionId are required.";
                modelResponse.StatusCode = 400;
                return Ok(modelResponse);
            }
            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString(); // UserId
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString(); // CompanyId


                var result = await EmployeeRentDetailRepository.GetMonthDropdownList(EmpId, decryptedCompanyId, decryptedUserId);


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




        [HttpPost("GetAttendanceList")]
        [Authorize]
        public async Task<IActionResult> GetAttendanceList([FromBody] EmpAttendanceRequestModel request)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var (notMarkedCount, markedCount, lockedCount, employees) = await EmployeeRentDetailRepository.GetEmployeeAttendanceAsync(
                    request.PageIndex1, request.PageSize1,
                    request.PageIndex2, request.PageSize2,
                    request.PageIndex3, request.PageSize3,
                    request.EmpCode,
                    request.EmpCodeManual,
                    request.EmpName,
                    request.SelectedDepartments,
                    request.SelectedDesignation,
                    request.SelectedLocations,
                    request.SelectedNature,
                    request.SelectedCity,
                    request.SortBy,
                    request.FkMonthId,
                    request.FkYearId,
                     request.fk_costcentreid

                );

                if ((employees.NotMarkedAttendance?.Count ?? 0) +
                    (employees.MarkedAttendance?.Count ?? 0) +
                    (employees.LockedAttendance?.Count ?? 0) == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Employee attendance data retrieved successfully.";
                modelResponse.Data = employees;

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

        //insert'
        [HttpPost("InsertAttendance")]
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult> InsertAttendanceList([FromBody] EmpAttendancePostModel empData)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId

                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId

                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();

                var decryptedFinancialYearId = HttpContext.Items["DecryptedFinancialYearId"]?.ToString();


                bool isInserted = await EmployeeRentDetailRepository.InsertEmployeeAttendanceAsync(empData, decryptedLocationId, decryptedUserId, decryptedCompanyId, decryptedFinancialYearId);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? " Inserted successfully." : "Failed to insert .";
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



        [HttpPost("DeleteAttendance")]
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult> DeletetAttendanceList([FromBody] EmpAttendancePostModel empData)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {


                bool isInserted = await EmployeeRentDetailRepository.DeleteEmployeeAttendanceAsync(empData);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? " Delete successfully." : "Failed to Delete .";
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


        //auto salary process

        [HttpPost("autoSalaryProcess")]
        [Authorize]
        public async Task<IActionResult> GetautoSalaryProcessList([FromBody] EmpAttendanceRequestModel request)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var (notMarkedCount, markedCount, lockedCount, employees) = await EmployeeRentDetailRepository.GetAutosalaryprocessAsync(
                    request.PageIndex1, request.PageSize1,
                    request.PageIndex2, request.PageSize2,
                    request.PageIndex3, request.PageSize3,
                    request.EmpCode,
                    request.EmpCodeManual,
                    request.EmpName,
                    request.SelectedDepartments,
                    request.SelectedDesignation,
                    request.SelectedLocations,
                    request.SelectedNature,
                    request.SelectedCity,
                    request.SortBy,
                    request.FkMonthId,
                    request.FkYearId,
                    request.fk_costcentreid



                );

                if ((employees.SalaryNotProcessed?.Count ?? 0) +
                    (employees.SalaryProcessed?.Count ?? 0) +
                    (employees.SalaryLock?.Count ?? 0) == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Employee salary Process data retrieved successfully.";
                modelResponse.Data = employees;

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

        [HttpPost("InsertautoSalaryProcess")]
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult> InsertautoSalaryProcess([FromBody] AutoSalaryProcessPostModel empData)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId

                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId

                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();

                var decryptedFinancialYearId = HttpContext.Items["DecryptedFinancialYearId"]?.ToString();


                bool isInserted = await EmployeeRentDetailRepository.InsertAutoSalaryProcessAsync(empData, decryptedLocationId, decryptedUserId, decryptedFinancialYearId);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? " Inserted successfully." : "Failed to insert .";
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

        [HttpPost("deleteSalaryProcess")]
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult> deleteSalaryProcess([FromBody] AutoSalaryProcessPostModel empData)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {


                bool isInserted = await EmployeeRentDetailRepository.DeleteSalaryProcessAsync(empData);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? " Delete successfully." : "Failed to Delete .";
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



        //auto bonus process

        [HttpPost("autoBonusProcess")]
        [Authorize]
        public async Task<IActionResult> GetautoBonusProcessList([FromBody] EmpAttendanceRequestModel request)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var (notMarkedCount, markedCount, lockedCount, employees) = await EmployeeRentDetailRepository.GetAutobonusprocessAsync(
                    request.PageIndex1, request.PageSize1,
                    request.PageIndex2, request.PageSize2,
                    request.PageIndex3, request.PageSize3,
                    request.EmpCode,
                    request.EmpCodeManual,
                    request.EmpName,
                    request.SelectedDepartments,
                    request.SelectedDesignation,
                    request.SelectedLocations,
                    request.SelectedNature,
                    request.SelectedCity,
                    request.SortBy,
                    request.FkMonthId,
                    request.FkYearId,
                    request.fk_costcentreid,
                    request.fromDate,
                    request.toDate,
                    request.EmpStatus
                );

                if ((employees.SalaryNotProcessed?.Count ?? 0) +
                    (employees.SalaryProcessed?.Count ?? 0) +
                    (employees.SalaryLock?.Count ?? 0) == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Employee salary Process data retrieved successfully.";
                modelResponse.Data = employees;

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

        [HttpPost("InsertautoBonusProcess")]
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult> InsertautoBonusProcess([FromBody] AutoSalaryProcessPostModel empData)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId

                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId

                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();

                var decryptedFinancialYearId = HttpContext.Items["DecryptedFinancialYearId"]?.ToString();


                bool isInserted = await EmployeeRentDetailRepository.InsertAutoBonusProcessAsync(empData, decryptedLocationId, decryptedUserId, decryptedFinancialYearId);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? " Inserted successfully." : "Failed to insert .";
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

        [HttpPost("deleteBonusProcess")]
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult> deleteBonusProcess([FromBody] AutoSalaryProcessPostModel empData)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {


                bool isInserted = await EmployeeRentDetailRepository.DeleteBonusProcessAsync(empData);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? " Delete successfully." : "Failed to Delete .";
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





        //arrear process


        [HttpPost("GetArrearProcessList")]
        [Authorize]
        public async Task<IActionResult> GetArrearProcessList([FromBody] EmpArrearProccessRequestModel request)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var (arrearProcessedCount, arrearUnProcessedCount, employees) = await EmployeeRentDetailRepository.GetArrearprocessAsync(
                    request.PageIndex1, request.PageSize1,
                    request.PageIndex2, request.PageSize2,
                    request.EmpCode,
                    request.EmpCodeManual,
                    request.EmpName,
                    request.SelectedDepartments,
                    request.SelectedDesignation,
                    request.SelectedLocations,
                    request.SelectedNature,
                    request.SelectedCity,
                    request.SortBy,
                    request.FkMonthId,
                    request.FkYearId,
                    request.Type
                );
                if ((employees.ArrearUnProcessed?.Count ?? 0) +

                    (employees.ArrearProcessed?.Count ?? 0) == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Arrear Processs data retrieved successfully.";
                modelResponse.Data = employees;
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

        [HttpPost("InserArrearProcess")]
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult> InserArrearProcess([FromBody] ArrearProcessPostModel empData)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId

                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId

                var decryptedFinancialYearId = HttpContext.Items["DecryptedFinancialYearId"]?.ToString();


                bool isInserted = await EmployeeRentDetailRepository.InsertArrearProcessAsync(empData, decryptedLocationId, decryptedUserId, decryptedFinancialYearId);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? " Inserted successfully." : "Failed to insert .";
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

        [HttpPost("deleteArrearProcess")]
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult> deleteArrearProcess([FromBody] ArrearProcessPostModel empData)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {


                bool isInserted = await EmployeeRentDetailRepository.ArrearUnProcessAsync(empData);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? " Delete successfully." : "Failed to Delete .";
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


        //ITProcesse

        [HttpPost("GetITProcessList")]
        [Authorize]
        public async Task<IActionResult> GetITProcessList([FromBody] ITProcessRequestModel request)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var (UnProcessedCount, ProcessedCount, LockedCount, employees) = await EmployeeRentDetailRepository.GetITProcessedDataAsync(
                    request.PageIndex1, request.PageSize1,
                    request.PageIndex2, request.PageSize2,
                    request.PageIndex3, request.PageSize3,
                    request.EmpCode,
                    request.EmpCodeManual,
                    request.EmpName,
                    request.SelectedDepartments,
                    request.SelectedDesignation,
                    request.SelectedLocations,
                    request.SelectedNature,
                    request.SelectedCity,
                    request.SortBy,
                    request.FkMonthId,
                    request.FkYearId

                );
                if ((employees.UnProcessedList?.Count ?? 0) +
                     (employees.ProcessedList?.Count ?? 0) +
                    (employees.LockedList?.Count ?? 0) == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "IT Processs data retrieved successfully.";
                modelResponse.Data = employees;
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




        [HttpPost("InserITProcess")]
        [Authorize]  // Secured endpoint            
        public async Task<IActionResult> InserITProcess([FromBody] ITProcessePostModel empData)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {


                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId

                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId

                var decryptedFinancialYearId = HttpContext.Items["DecryptedFinancialYearId"]?.ToString();



                var resultModel = await EmployeeRentDetailRepository.InsertITProcessAsync(empData, decryptedLocationId, decryptedUserId, decryptedFinancialYearId);
                modelResponse.IsSuccess = true;
                modelResponse.Message = "Inserted successfully.";
                modelResponse.StatusCode = 200;
                modelResponse.Data = resultModel;

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



        [HttpPost("deleteITProcess")]
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult> DeleteITProcess([FromBody] ITProcessePostModel empData)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {


                bool isInserted = await EmployeeRentDetailRepository.ITUnProcessAsync(empData);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? " Delete successfully." : "Failed to Delete .";
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


        //ITProcesse

        [HttpPost("GetLockITList")]
        [Authorize]
        public async Task<IActionResult> GetLockITList([FromBody] ITProcessRequestModel request)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var (UnProcesseCount, ProcessedCount, LockedCount, employees) = await EmployeeRentDetailRepository.GetLockITAsync(
                    request.PageIndex1, request.PageSize1,
                    request.PageIndex2, request.PageSize2,
                    request.PageIndex3, request.PageSize3,
                    request.EmpCode,
                    request.EmpCodeManual,
                    request.EmpName,
                    request.SelectedDepartments,
                    request.SelectedDesignation,
                    request.SelectedLocations,
                    request.SelectedNature,
                    request.SelectedCity,
                    request.SortBy,
                    request.FkMonthId,
                    request.FkYearId

                );
                if ((employees.ITNotLockList?.Count ?? 0) +
                     (employees.ITLockList?.Count ?? 0) +
                    (employees.ITLocked_NotProcessedList?.Count ?? 0) == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "IT data retrieved successfully.";
                modelResponse.Data = employees;
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


        [HttpPost("InserLockITProcess")]
        [Authorize]  // Secured endpoint            
        public async Task<IActionResult> InserLockITProcess([FromBody] ITProcessePostModel empData)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {


                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId

                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId

                var decryptedFinancialYearId = HttpContext.Items["DecryptedFinancialYearId"]?.ToString();



                var resultModel = await EmployeeRentDetailRepository.InsertITLockAsync(empData, decryptedLocationId, decryptedUserId, decryptedFinancialYearId);
                modelResponse.IsSuccess = true;
                modelResponse.Message = "Inserted successfully.";
                modelResponse.StatusCode = 200;
                modelResponse.Data = resultModel;

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




        [HttpPost("DeleteITLock")]
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult> DeleteITLock([FromBody] ITProcessePostModel empData)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {


                bool isInserted = await EmployeeRentDetailRepository.ITLockAsync(empData);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? " Delete successfully." : "Failed to Delete .";
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


        //for Attendance InOut Shift


        //
        [HttpPost("GetAllEmpDetailsinoutForAll")]
        [Authorize]
        public async Task<IActionResult> AttendanceDetailsinoutForAll([FromBody] AttendanceDetailsinoutForAll request)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var (totalCount, result, cycleType) = await EmployeeRentDetailRepository.AttendanceDetailsinoutForAll(
                    request.PageIndex, request.PageSize,

                    request.EmpCode,
                    request.EmpCodeManual,
                    request.EmpName,
                    request.SelectedDepartments,
                    request.SelectedDesignation,
                    request.SelectedLocations,
                    request.SelectedNature,
                    request.SelectedCity,
                    request.SortBy,
                    request.FkMonthId,
                   request.FkYearId,
                   request.fk_costcentreid



                );

                if (result.Count() == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }
                modelResponse.IsSuccess = true;
                modelResponse.Message = "data retrieved successfully.";
                modelResponse.Data = result;
                modelResponse.TotalCount = totalCount;
                modelResponse.DocumentNo = cycleType;
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

        //here i have to add

        [HttpPut("UpdateAttendanceInOut")]
        [Authorize] // Secured endpoint
        public async Task<IActionResult> UpdateAttendanceInOut([FromBody] AttendanceUpdateModel empData)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedFinancialYearId = HttpContext.Items["DecryptedFinancialYearId"]!.ToString();
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId

                var result = await EmployeeRentDetailRepository.UpdateAttendanceAsync(empData, decryptedFinancialYearId, decryptedUserId);
                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No response.";
                    modelResponse.StatusCode = 500;
                    return Ok(modelResponse);
                }
                modelResponse.IsSuccess = result.IsSuccessfull;
                modelResponse.Message = result.Message;
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


        //
        [HttpGet("ShiftMstGetByName")]
        public async Task<IActionResult> ShiftMstGetByNameAsync(long pk_shiftId)
        {
            var modelResponse = new ModelResponse();

            try
            {
                var result = await EmployeeRentDetailRepository.ShiftMstGetByNameAsync(pk_shiftId);

                if (result == null || !result.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No record found.";
                    modelResponse.StatusCode = 404; // 404 is more accurate for "not found"
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Data retrieved successfully.";
                modelResponse.Data = result;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = $"Error: {ex.Message}";
                modelResponse.StatusCode = 500;
                return Ok(modelResponse);
            }
        }




        [HttpGet("AttendanceStatus")]
        public async Task<IActionResult> GetAttendanceStatus()
        {
            var modelResponse = new ModelResponse();

            try
            {
                var empId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId

                var result = await EmployeeRentDetailRepository.GetAttendanceStatusForDDLAsync(empId);

                if (result == null || !result.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No record found.";
                    modelResponse.StatusCode = 404; // 404 is more accurate for "not found"
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Data retrieved successfully.";
                modelResponse.Data = result;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = $"Error: {ex.Message}";
                modelResponse.StatusCode = 500;
                return Ok(modelResponse);
            }
        }



        //Reim

        [HttpPost("autoSalaryProcessReim")]
        [Authorize]
        public async Task<IActionResult> GetautoSalaryProcessReimList([FromBody] EmpAttendanceRequestModel request)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var (notMarkedCount, markedCount, lockedCount, employees) = await EmployeeRentDetailRepository.GetAutosalaryprocessReimAsync(
                    request.PageIndex1, request.PageSize1,
                    request.PageIndex2, request.PageSize2,
                    request.PageIndex3, request.PageSize3,
                    request.EmpCode,
                    request.EmpCodeManual,
                    request.EmpName,
                    request.SelectedDepartments,
                    request.SelectedDesignation,
                    request.SelectedLocations,
                    request.SelectedNature,
                    request.SelectedCity,
                    request.SortBy,
                    request.FkMonthId,
                    request.FkYearId,
                    request.fk_costcentreid
                );

                if ((employees.SalaryNotProcessed?.Count ?? 0) +
                    (employees.SalaryProcessed?.Count ?? 0) +
                    (employees.SalaryLock?.Count ?? 0) == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Employee salary Process data retrieved successfully.";
                modelResponse.Data = employees;

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

        [HttpPost("InsertautoSalaryProcessReim")]
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult> InsertautoSalaryProcessReim([FromBody] AutoSalaryProcessPostModel empData)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId

                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId

                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();

                var decryptedFinancialYearId = HttpContext.Items["DecryptedFinancialYearId"]?.ToString();


                bool isInserted = await EmployeeRentDetailRepository.InsertAutoSalaryProcessReimAsync(empData, decryptedLocationId, decryptedUserId, decryptedFinancialYearId);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? " Inserted successfully." : "Failed to insert .";
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



        [HttpPost("deleteSalaryProcessReim")]
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult> deleteSalaryProcessReim([FromBody] AutoSalaryProcessPostModel empData)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {


                bool isInserted = await EmployeeRentDetailRepository.DeleteSalaryProcessReimAsync(empData);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? " Delete successfully." : "Failed to Delete .";
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


        [HttpPost("autoLTAProcess")]
        [Authorize]
        public async Task<IActionResult> GetautoLTAProcessList([FromBody] EmpAttendanceRequestModel request)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var (notMarkedCount, markedCount, lockedCount, employees) = await EmployeeRentDetailRepository.GetAutoLTAprocessAsync(
                    request.PageIndex1, request.PageSize1,
                    request.PageIndex2, request.PageSize2,
                    request.PageIndex3, request.PageSize3,
                    request.EmpCode,
                    request.EmpCodeManual,
                    request.EmpName,
                    request.SelectedDepartments,
                    request.SelectedDesignation,
                    request.SelectedLocations,
                    request.SelectedNature,
                    request.SelectedCity,
                    request.SortBy,
                    request.FkMonthId,
                    request.FkYearId,
                    request.fk_costcentreid,
                    request.fromDate,
                    request.toDate,
                    request.EmpStatus
                );

                if ((employees.SalaryNotProcessed?.Count ?? 0) +
                    (employees.SalaryProcessed?.Count ?? 0) +
                    (employees.SalaryLock?.Count ?? 0) == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Employee LTA Process data retrieved successfully.";
                modelResponse.Data = employees;

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

        [HttpPost("InsertautoLTAProcess")]
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult> InsertautoLTAProcess([FromBody] AutoSalaryProcessPostModel empData)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId

                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId

                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();

                var decryptedFinancialYearId = HttpContext.Items["DecryptedFinancialYearId"]?.ToString();


                bool isInserted = await EmployeeRentDetailRepository.InsertAutoLTAProcessAsync(empData, decryptedLocationId, decryptedUserId, decryptedFinancialYearId);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? " Inserted successfully." : "Failed to insert .";
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

        [HttpPost("deleteLTAProcess")]
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult> deleteLTAProcess([FromBody] AutoSalaryProcessPostModel empData)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {


                bool isInserted = await EmployeeRentDetailRepository.DeleteLTAProcessAsync(empData);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? " Delete successfully." : "Failed to Delete .";
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




    }
}