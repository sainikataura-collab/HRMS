using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class EmployeeController : ControllerBase
    {


        private readonly IEmployeeRepository employeeRepository;
        private readonly AppSettings appSettings;
        FileService _FileService;
        public EmployeeController(IEmployeeRepository _employeeRepository, IOptions<AppSettings> appSettings, FileService fileService)

        {
            employeeRepository = _employeeRepository;
            this.appSettings = appSettings.Value;
            _FileService = fileService;
        }

        [HttpPost("GetAllEmployees")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetAllEmployeesAsync(
    [FromQuery] int pageIndex,
    [FromQuery] int pageSize,
    [FromBody] EmployeeFilterRequest request)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();


                var (totalCount, employees) = await employeeRepository.GetAllEmployeesAsync(
                    pageIndex, pageSize, request.EmpCode, request.EmpCodeManual,
                    request.EmpName, request.SelectedDepartments, request.SelectedDesignation,
                    request.SelectedLocations, request.SelectedNature, request.SelectedCity,
                    request.SortBy, decryptedUserId, request.EmpStatus
                );

                if (!employees.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No records found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Employee list retrieved successfully.";
                modelResponse.Data = employees;
                modelResponse.TotalCount = totalCount;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = "An error occurred. " + ex.Message;
                modelResponse.StatusCode = 500;
                return Ok(modelResponse);
            }
        }




        [HttpGet("GetEmployeeProfileView")]
        [Authorize]
        public async Task<IActionResult> GetEmployeeProfileViewAsync([FromQuery] string empId)
        {
            var modelResponse = new ModelResponse();
            try
            {
                var profile = await employeeRepository.GetEmployeeProfileViewAsync(empId);

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Employee profile retrieved successfully.";
                modelResponse.Data = profile;
                modelResponse.StatusCode = 200;

                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = "An error occurred: " + ex.Message;
                modelResponse.StatusCode = 500;

                return Ok(modelResponse);
            }
        }






        [HttpPost("GetEmployeesForDropdown")]
        [Authorize] // Secure the endpoint
        public async Task<IActionResult> GetEmployeesForDropdownAsync([FromBody] EmployeeFilterRequest request)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();

                // Call repository method
                var employees = await employeeRepository.GetEmployeesForDropdownAsync(
                    request.EmpCode,
                    request.EmpCodeManual,
                    request.EmpName,
                    request.SelectedDepartments,
                    request.SelectedDesignation,
                    request.SelectedLocations,
                    request.SelectedNature,
                    request.SelectedCity,
                    request.SortBy,
                    decryptedUserId,
                    request.EmpStatus
                );

                if (!employees.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No records found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Employee dropdown list retrieved successfully.";
                modelResponse.Data = employees;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = "An error occurred. " + ex.Message;
                modelResponse.StatusCode = 500;
                return Ok(modelResponse);
            }
        }

        //Image Upload


        [HttpPost("UploadEmployeeImage")]
        [Authorize]
        public async Task<IActionResult> UploadEmployeeImage(EmployeeImageMeta employeeImageMeta)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {

                if (employeeImageMeta.FileBytes != null && employeeImageMeta.FileBytes.Length > 0)
                {
                    // Optional: Validate it's an image
                    if (!_FileService.IsImageFile(employeeImageMeta.FileBytes))
                    {
                        return BadRequest(new { message = "Only image files (jpg, jpeg, png) are allowed." });
                    }

                    // Save the file
                    var savedFileName = await _FileService.SaveFileAsync(employeeImageMeta.FileBytes);

                    // Save the file path in LogoPath (this will go to DB)
                    employeeImageMeta.Filename = savedFileName;
                }

                employeeImageMeta.FileBytes = null;



                int result = await employeeRepository.ImageUploadAsync(employeeImageMeta);

                if (result == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No records found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }
                modelResponse.IsSuccess = true;
                modelResponse.Message = "Record saved successfully!";
                modelResponse.Data = result;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = "An error occurred. " + ex.Message;
                modelResponse.StatusCode = 500;
                return Ok(modelResponse);
            }
        }

        [HttpPost("GetImageForEmployees")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetImageForEmployeesAsync([FromQuery] int pageIndex, [FromQuery] int pageSize)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var (totalCount, employees) = await employeeRepository.GetEmployee_ImageAsync(pageIndex, pageSize);

                if (!employees.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No records found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Employee list retrieved successfully.";
                modelResponse.Data = employees;
                modelResponse.TotalCount = totalCount;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = "An error occurred. " + ex.Message;
                modelResponse.StatusCode = 500;
                return Ok(modelResponse);
            }
        }

        [HttpGet("images/{imageName}")]
        [Authorize]
        public async Task<IActionResult> GetImageByUserIdAsync(string imageName)
        {
            var modelResponse = new ModelResponse();


            try
            {
                // Define the path to the folder where images are stored (based on decrypted user ID)
                //string imageFolderPath = Path.Combine(@"C:\Users\admin\Documents\Empower Logics\Uploads\" + encryptedUserId);
                string imageFolderPath = Path.Combine(appSettings.UploadsFolderPath);


                // Check if the image file exists
                string imagePath = Path.Combine(imageFolderPath, imageName);
                if (!System.IO.File.Exists(imagePath))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Image not found.";
                    modelResponse.StatusCode = 404; // Not Found
                    return Ok(modelResponse);
                }

                // Read the image file into a stream asynchronously
                var imageStream = new FileStream(imagePath, FileMode.Open, FileAccess.Read);
                var mimeType = GetMimeType(imagePath);

                // Return the image as a file response with MIME type based on the image extension
                return File(imageStream, mimeType);
            }
            catch (Exception ex)
            {
                // Log exception details for further analysis
                Console.WriteLine($"Error occurred: {ex.Message}");

                modelResponse.IsSuccess = false;
                modelResponse.Message = $"An unexpected error occurred: {ex.Message}";
                modelResponse.StatusCode = 500; // Internal Server Error
                return Ok(modelResponse);
            }
        }

        private string GetMimeType(string filePath)
        {
            var fileExtension = Path.GetExtension(filePath).ToLower();
            return fileExtension switch
            {
                ".jpg" => "image/jpeg",
                ".jpeg" => "image/jpeg",
                ".png" => "image/png",
                ".gif" => "image/gif",
                ".bmp" => "image/bmp",
                ".tiff" => "image/tiff",
                _ => "application/octet-stream",
            };
        }


        [HttpDelete("DeleteImage")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> DeleteEmployeeImageAsync([FromQuery] string imgId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                bool employees = await employeeRepository.Del_Employee_ImageAsync(imgId);

                if (employees == false)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No records found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Employee list Delete successfully.";
                modelResponse.Data = employees;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = "An error occurred. " + ex.Message;
                modelResponse.StatusCode = 500;
                return Ok(modelResponse);
            }
        }



        // add code by lalit  23june

        //[HttpGet("GetEmployeeInfoForAttendanceMark")]
        //[Authorize]
        //public async Task<IActionResult> GetEmployeeInfoForAttendanceMarkAsync()
        //{
        //    var modelResponse = new ModelResponse();

        //    try
        //    {
        //        var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();

        //        if (string.IsNullOrEmpty(decryptedUserId))
        //        {
        //            modelResponse.IsSuccess = false;
        //            modelResponse.Message = "Unauthorized or missing user ID.";
        //            modelResponse.StatusCode = 401;
        //            return Ok(modelResponse);
        //        }

        //        var data = await employeeRepository.GetEmployeeInfoForAttendanceMarkAsync(decryptedUserId);

        //        modelResponse.IsSuccess = true;
        //        modelResponse.Message = "Employee info for mark attendance retrieved successfully.";
        //        modelResponse.Data = data;
        //        modelResponse.StatusCode = 200;

        //        return Ok(modelResponse);
        //    }
        //    catch (Exception ex)
        //    {
        //        modelResponse.IsSuccess = false;
        //        modelResponse.Message = "An error occurred: " + ex.Message;
        //        modelResponse.StatusCode = 500;

        //        return Ok(modelResponse);
        //    }
        //}




        //added code LR


        [HttpGet("GetEmployeeInfoForAttendanceMark")]
        [Authorize]
        public async Task<IActionResult> GetEmployeeInfoForAttendanceMarkAsync()
        {
            var modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();

                if (string.IsNullOrEmpty(decryptedUserId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Unauthorized or missing user ID.";
                    modelResponse.StatusCode = 401;
                    return Ok(modelResponse);
                }

                var data = await employeeRepository.GetEmployeeInfoForAttendanceMarkAsync(decryptedUserId);

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Employee info for mark attendance retrieved successfully.";
                modelResponse.Data = data;
                modelResponse.StatusCode = 200;

                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = "An error occurred: " + ex.Message;
                modelResponse.StatusCode = 500;

                return Ok(modelResponse);
            }
        }


        [HttpPost("MarkEmployeeAttendanceAsync")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> InsertEmployeeAttendanceAsync([FromForm] MarkEmployeeAttendance obj)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var savedFileName = "";
                if (obj.AttendanceImageFile != null && obj.AttendanceImageFile.Length > 0)
                {
                    // Optional: Validate it's an image
                    if (!_FileService.IsImageFile(obj.AttendanceImageFile))
                    {

                        modelResponse.IsSuccess = false;
                        modelResponse.Message = "Only image files(jpg, jpeg, png) are allowed.";
                        modelResponse.StatusCode = 400;
                        return Ok(modelResponse);

                    }

                    // Save the file
                    //var savedFileName = await _FileService.SaveFileAsync(obj.AttendanceImageFile);
                    savedFileName = await _FileService.GenerateFilePathAsync(obj.AttendanceImageFile);


                    // Save the file path in LogoPath (this will go to DB)


                    obj.FilePath = savedFileName;
                }

                //temp save the file 
                IFormFile actualImageFile = obj.AttendanceImageFile!;
                obj.AttendanceImageFile = null;


                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString(); // Retrieve the UserId
                var encryptedUserId = HttpContext.Items["EncryptedUserId"]?.ToString(); // Retrieve encryptedUserId-string
                obj.FkEmpId = decryptedUserId;



                (bool IsSuccessful, string ErrorMessage) = await employeeRepository.InsertEmployeeAttendance(obj);

                if (IsSuccessful)
                {
                    //save file to actual location
                    if (actualImageFile != null)
                    {
                        await _FileService.SaveFileInLocationAsync(actualImageFile, savedFileName);
                    }

                }
                modelResponse.IsSuccess = IsSuccessful;
                modelResponse.Message = IsSuccessful ? "Attendance marked successfully." : ErrorMessage;
                modelResponse.StatusCode = IsSuccessful ? 200 : 400;

                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = "An error occurred. " + ex.Message;
                modelResponse.StatusCode = 500;
                return Ok(modelResponse);
            }
        }




        //[HttpPost("MarkEmployeeAttendanceAsync")]
        //[Authorize]  // Secured endpoint
        //public async Task<IActionResult> InsertEmployeeAttendanceAsync([FromForm] MarkEmployeeAttendance obj)
        //{
        //    ModelResponse modelResponse = new ModelResponse();

        //    try
        //    {
        //        var savedFileName = "";
        //        if (obj.AttendanceImageFile != null && obj.AttendanceImageFile.Length > 0)
        //        {
        //            // Optional: Validate it's an image
        //            if (!_FileService.IsImageFile(obj.AttendanceImageFile))
        //            {

        //                modelResponse.IsSuccess = false;
        //                modelResponse.Message = "Only image files(jpg, jpeg, png) are allowed.";
        //                modelResponse.StatusCode = 400;
        //                return Ok(modelResponse);

        //            }

        //            // Save the file
        //            //var savedFileName = await _FileService.SaveFileAsync(obj.AttendanceImageFile);
        //            savedFileName = await _FileService.GenerateFilePathAsync(obj.AttendanceImageFile);


        //            // Save the file path in LogoPath (this will go to DB)


        //            obj.FilePath = savedFileName;
        //        }

        //        //temp save the file 
        //        IFormFile actualImageFile = obj.AttendanceImageFile!;
        //        obj.AttendanceImageFile = null;


        //        var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString(); // Retrieve the UserId
        //        var encryptedUserId = HttpContext.Items["EncryptedUserId"]?.ToString(); // Retrieve encryptedUserId-string
        //        obj.FkEmpId = decryptedUserId;



        //        (bool IsSuccessful, string ErrorMessage) = await employeeRepository.InsertEmployeeAttendance(obj);

        //        if (IsSuccessful)
        //        {
        //            //save file to actual location
        //            await _FileService.SaveFileInLocationAsync(actualImageFile, savedFileName);
        //        }
        //        modelResponse.IsSuccess = IsSuccessful;
        //        modelResponse.Message = IsSuccessful ? "Attendance marked successfully." : ErrorMessage;
        //        modelResponse.StatusCode = IsSuccessful ? 200 : 400;

        //        return Ok(modelResponse);
        //    }
        //    catch (Exception ex)
        //    {
        //        modelResponse.IsSuccess = false;
        //        modelResponse.Message = "An error occurred. " + ex.Message;
        //        modelResponse.StatusCode = 500;
        //        return Ok(modelResponse);
        //    }
        //}


        [HttpPost("GetEmployeesForDropdownfor50")]
        [Authorize] // Secure the endpoint
        public async Task<IActionResult> Employee_GetAll_Ddlfor50([FromBody] EmployeeFilterRequest request)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();

                // Call repository method
                var employees = await employeeRepository.GetEmployeesForDropdownAsyncfor50(
                    request.EmpCode,
                    request.EmpCodeManual,
                    request.EmpName,
                    request.SelectedDepartments,
                    request.SelectedDesignation,
                    request.SelectedLocations,
                    request.SelectedNature,
                    request.SelectedCity,
                    request.SortBy,
                    decryptedUserId,
                    request.EmpStatus,
                    request.Search,
                    request.PageNo,
                    request.PageSize
                );

                if (!employees.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No records found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Employee dropdown list retrieved successfully.";
                modelResponse.Data = employees;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = "An error occurred. " + ex.Message;
                modelResponse.StatusCode = 500;
                return Ok(modelResponse);
            }
        }






    }
}
