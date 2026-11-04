using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class RecruitModeMasterController : ControllerBase
    {
        private readonly IRecruitModeRepository recruitModeRepository;

        public RecruitModeMasterController(IRecruitModeRepository _recruitModeRepository)

        {
            recruitModeRepository = _recruitModeRepository;
        }


        [HttpPost]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> InsertAsync([FromBody] RecruitModeMst RecruitModeMst)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {

                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId

                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId


                RecruitModeMst.fk_companyId = decryptedCompanyId;
                RecruitModeMst.fk_locid = decryptedLocationId;


                bool isInserted = await recruitModeRepository.InsertAsync(RecruitModeMst);

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
        public async Task<IActionResult> UpdateAsync([FromBody] RecruitModeMst RecruitModeMst)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {


                bool isInserted = await recruitModeRepository.UpdateAsync(RecruitModeMst);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "detail update successfully." : "Failed to update detail.";
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


                var (totalCount, result) = await recruitModeRepository.GetAll(pageIndex, pageSize, decryptedCompanyId);
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

        [HttpGet("{pk_recmodeid}")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetByIdAsync([FromRoute] string pk_recmodeid)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {


                RecruitModeMst result = await recruitModeRepository.GetByIdAsync(pk_recmodeid);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid Id";
                    return Ok(modelResponse);
                }
                else
                {
                    result.pk_recmodeid = pk_recmodeid;
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

        [HttpDelete("{pk_recmodeid}")]
        [Authorize]
        public async Task<IActionResult> DeleteAsync([FromRoute] string pk_recmodeid)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                bool isDeleted = await recruitModeRepository.DeleteAsync(pk_recmodeid);

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


        //shiv


        [HttpGet("AppraisalDetails")]
        [Authorize]
        public async Task<IActionResult> GetAttendanceByEmp(string? fk_empid = null, string? year = null)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var (empinfo, KRAEvaluation, BehavioralAttributes) = await recruitModeRepository.GetEmployeeAttendanceByEmpIdYearAsync(fk_empid, year);

                if (empinfo == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No record found.";
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Attendance details retrieved successfully.";
                modelResponse.Data = new
                {
                    empInfo = empinfo,
                    kraevaluation = KRAEvaluation,
                    BehavioralAttribute = BehavioralAttributes
                };
                modelResponse.StatusCode = 200;
                modelResponse.TotalCount = KRAEvaluation?.Count + BehavioralAttributes?.Count ?? 0;

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



        [HttpGet("AppraisalYearDdl")]
        [Authorize]
        public async Task<IActionResult> GetDropdownList()
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var result = await recruitModeRepository.GetAppraisalDropdownList();
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



        [HttpPost("AppraisalInsert")]
        [Authorize]
        public async Task<IActionResult> InsertAppraisalAsync([FromBody] AppraisalDataSet request)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {

                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();

                // Call repository method
                bool isInserted = await recruitModeRepository.InsertAppraisalAsync(
                    request.Main,
                    request.KRAList,
                    request.BehavioralList,
                    decryptedUserId
                );

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "Appraisal inserted successfully." : "Failed to insert appraisal.";
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


        [HttpGet("EmployeeAppraisalList")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetAll()
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {

                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                var result = await recruitModeRepository.GetAllAppraisalsAsync(decryptedUserId);
                if (result.Count() == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }



                modelResponse.IsSuccess = true;
                modelResponse.Message = "EmployeeAppraisalList List retrieved successfully.";
                modelResponse.Data = result;

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


        [HttpGet("EmployeeAppraisalListforHOd")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetAllForHOD()
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {

                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                var result = await recruitModeRepository.GetAllAppraisalsHodAsync(decryptedUserId);
                if (result.Count() == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }



                modelResponse.IsSuccess = true;
                modelResponse.Message = "EmployeeAppraisalList List retrieved successfully.";
                modelResponse.Data = result;

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

        //getById

        [HttpGet("AppraisalDetailsById")]
        [Authorize]
        public async Task<IActionResult> GetAppraisaldetailById(string? fk_empid,int fk_yearId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var (empinfo, KRAEvaluation, BehavioralAttributes) = await recruitModeRepository.GetByIdAppraisalDetailsAsync(fk_empid, @fk_yearId);

                if (empinfo == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No record found.";
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "AppraisalDetails details retrieved successfully.";
                modelResponse.Data = new
                {
                    empInfo = empinfo,
                    kraevaluation = KRAEvaluation,
                    BehavioralAttribute = BehavioralAttributes
                };
                modelResponse.StatusCode = 200;
                modelResponse.TotalCount = KRAEvaluation?.Count + BehavioralAttributes?.Count ?? 0;

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



        [HttpGet("Appraisalcheck-duplicate")]
        [Authorize]
        public async Task<IActionResult> CheckDuplicate([FromQuery] string empId, [FromQuery] short appId)
        {
            var modelResponse = new ModelResponse();

            try
            {
                bool isDuplicate = await recruitModeRepository.CheckAppraisalDuplicateAsync(empId, appId);

                modelResponse.IsSuccess = true;
                modelResponse.StatusCode = 200;
                modelResponse.Message = isDuplicate
                    ? "Appraisal already exists for this employee and year."
                    : "No duplicate appraisal found.";
                modelResponse.Data = new { isDuplicate };

                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.StatusCode = 500;
                modelResponse.Message = ex.Message;
                return Ok(modelResponse);
            }
        }





    }
}
