using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class VendorEmployeeDocController : ControllerBase
    {
        private readonly IVendorEmployeeDocRepository _repo;
        private readonly IConfiguration _config;

        public VendorEmployeeDocController(IVendorEmployeeDocRepository repo, IConfiguration config)
        {
            _repo   = repo;
            _config = config;
        }

        // ── GET FOR VENDOR ──────────────────────────────────────────────────────────
        [HttpGet("GetVendorEmpDocList")]
        [Authorize]
        public async Task<IActionResult> GetVendorEmpDocList(
            [FromQuery] string vendorId = "",
            [FromQuery] string searchTerm = "",
            [FromQuery] int pageIndex = 0,
            [FromQuery] int pageSize = 20)
        {
            var modelResponse = new ModelResponse();
            try
            {
                var companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";
                var userId    = HttpContext.Items["DecryptedUserId"]?.ToString() ?? "";

                // If vendorId is not provided, look it up from logged in user's UM_Users_Mst
                if (string.IsNullOrEmpty(vendorId))
                {
                    vendorId = (await _repo.GetVendorIdByUserIdAsync(userId, companyId)) ?? "";
                }

                if (string.IsNullOrEmpty(vendorId))
                {
                    modelResponse.IsSuccess  = true;
                    modelResponse.Message    = "No vendor mapped to current user.";
                    modelResponse.Data       = new { totalCount = 0, list = new List<VendorEmpDocSummaryModel>() };
                    modelResponse.StatusCode = 200;
                    return Ok(modelResponse);
                }

                var (totalCount, list) = await _repo.GetVendorEmpDocListForVendorAsync(vendorId, companyId, searchTerm, pageIndex, pageSize);
                modelResponse.IsSuccess  = true;
                modelResponse.Message    = "Employee document list retrieved.";
                modelResponse.Data       = new { totalCount, list, vendorId };
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess  = false;
                modelResponse.Message    = ex.Message;
                modelResponse.StatusCode = 500;
                return Ok(modelResponse);
            }
        }

        // ── GET FOR HR / ADMIN ──────────────────────────────────────────────────────
        [HttpGet("GetHREmpDocList")]
        [Authorize]
        public async Task<IActionResult> GetHREmpDocList(
            [FromQuery] string vendorId = "",
            [FromQuery] string locationId = "",
            [FromQuery] string status = "",
            [FromQuery] string searchTerm = "",
            [FromQuery] int pageIndex = 0,
            [FromQuery] int pageSize = 20)
        {
            var modelResponse = new ModelResponse();
            try
            {
                var companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";
                var cleanVendorId = (vendorId == "null" || vendorId == "undefined") ? "" : (vendorId ?? "").Trim();
                var cleanLocationId = (locationId == "null" || locationId == "undefined") ? "" : (locationId ?? "").Trim();
                var cleanStatus = (status == "null" || status == "undefined") ? "" : (status ?? "").Trim();
                var cleanSearchTerm = (searchTerm == "null" || searchTerm == "undefined") ? "" : (searchTerm ?? "").Trim();

                var (totalCount, list) = await _repo.GetVendorEmpDocListForHRAsync(companyId, cleanVendorId, cleanLocationId, cleanStatus, cleanSearchTerm, pageIndex, pageSize);

                modelResponse.IsSuccess  = true;
                modelResponse.Message    = "HR verification list retrieved.";
                modelResponse.Data       = new { totalCount, list };
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess  = false;
                modelResponse.Message    = ex.Message;
                modelResponse.StatusCode = 500;
                return Ok(modelResponse);
            }
        }

        // ── EXPORT HR VERIFICATION LIST ─────────────────────────────────────────────
        [HttpGet("ExportHREmpDocList")]
        [Authorize]
        public async Task<IActionResult> ExportHREmpDocList(
            [FromQuery] string? vendorId = null,
            [FromQuery] string? locationId = null,
            [FromQuery] string? status = null,
            [FromQuery] string? searchTerm = null)
        {
            var modelResponse = new ModelResponse();
            try
            {
                var companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";
                var cleanVendorId = (vendorId == "null" || vendorId == "undefined") ? "" : (vendorId ?? "").Trim();
                var cleanLocationId = (locationId == "null" || locationId == "undefined") ? "" : (locationId ?? "").Trim();
                var cleanStatus = (status == "null" || status == "undefined") ? "" : (status ?? "").Trim();
                var cleanSearchTerm = (searchTerm == "null" || searchTerm == "undefined") ? "" : (searchTerm ?? "").Trim();

                var list = await _repo.ExportVendorEmpDocListForHRAsync(companyId, cleanVendorId, cleanLocationId, cleanStatus, cleanSearchTerm);

                modelResponse.IsSuccess  = true;
                modelResponse.Message    = "Export data retrieved.";
                modelResponse.Data       = list;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess  = false;
                modelResponse.Message    = ex.Message;
                modelResponse.StatusCode = 500;
                return Ok(modelResponse);
            }
        }

        // ── GET DOCS FOR EMPLOYEE ───────────────────────────────────────────────────
        [HttpGet("GetDocsByEmpAndVendor")]
        [Authorize]
        public async Task<IActionResult> GetDocsByEmpAndVendor(
            [FromQuery] string empId,
            [FromQuery] string? vendorId = null)
        {
            var modelResponse = new ModelResponse();
            try
            {
                var companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";
                var userId    = HttpContext.Items["DecryptedUserId"]?.ToString() ?? "";

                if (string.IsNullOrWhiteSpace(vendorId))
                {
                    vendorId = await _repo.GetVendorIdByUserIdAsync(userId, companyId);
                }

                if (string.IsNullOrWhiteSpace(vendorId))
                {
                    vendorId = await _repo.GetVendorIdByEmpIdAsync(empId);
                }

                var docs = await _repo.GetDocsByEmpAndVendorAsync(vendorId ?? "", empId);
                modelResponse.IsSuccess  = true;
                modelResponse.Data       = docs;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess  = false;
                modelResponse.Message    = ex.Message;
                modelResponse.StatusCode = 500;
                return Ok(modelResponse);
            }
        }

        // ── UPLOAD EMPLOYEE DOCUMENTS ───────────────────────────────────────────────
        [HttpPost("UploadEmployeeDocuments")]
        [Authorize]
        public async Task<IActionResult> UploadEmployeeDocuments(
            [FromForm] string empId,
            [FromForm] string? vendorId = null,
            [FromForm] int    docTypeCodeId = 0,
            [FromForm] string? docTypeName = null,
            IFormFileCollection? files = null)
        {
            var modelResponse = new ModelResponse();
            try
            {
                if (string.IsNullOrEmpty(empId))
                    return Ok(new ModelResponse { IsSuccess = false, Message = "Employee ID is required.", StatusCode = 400 });

                var userId    = HttpContext.Items["DecryptedUserId"]?.ToString()    ?? "";
                var companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";

                if (string.IsNullOrWhiteSpace(vendorId))
                {
                    vendorId = await _repo.GetVendorIdByUserIdAsync(userId, companyId);
                }

                if (string.IsNullOrWhiteSpace(vendorId))
                {
                    vendorId = await _repo.GetVendorIdByEmpIdAsync(empId);
                }

                if (string.IsNullOrWhiteSpace(vendorId))
                {
                    vendorId = "";
                }

                var uploadsFolder = _config["AppSettings:VendorEmployeeDocUploads"];
                if (string.IsNullOrEmpty(uploadsFolder))
                    uploadsFolder = _config["AppSettings:VendorDocumentUploads"];
                if (string.IsNullOrEmpty(uploadsFolder))
                    uploadsFolder = "D:/VendorEmployeeDocUploads";

                try
                {
                    if (!Directory.Exists(uploadsFolder))
                        Directory.CreateDirectory(uploadsFolder);
                }
                catch
                {
                    uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "Uploads", "VendorEmployeeDocUploads");
                    if (!Directory.Exists(uploadsFolder))
                        Directory.CreateDirectory(uploadsFolder);
                }

                var results = new List<object>();
                foreach (var file in files)
                {
                    var ext       = Path.GetExtension(file.FileName);
                    var baseName  = Path.GetFileNameWithoutExtension(file.FileName);
                    var savedName = $"{baseName}_{DateTime.Now:ddMMyyyy_HHmmss}{ext}";
                    var physPath  = Path.Combine(uploadsFolder, savedName);

                    using (var stream = new FileStream(physPath, FileMode.Create))
                        await file.CopyToAsync(stream);

                    var doc = new VendorEmployeeDocModel
                    {
                        fk_vendorId      = vendorId,
                        fk_empId         = empId,
                        DocTypeCodeId    = docTypeCodeId,
                        DocTypeName      = docTypeName,
                        OriginalFileName = file.FileName,
                        SavedFileName    = savedName,
                        FilePath         = physPath,
                        FileSize         = file.Length,
                        MimeType         = file.ContentType
                    };

                    var saveResult = await _repo.SaveVendorEmployeeDocumentAsync(doc, userId, companyId);
                    results.Add(new
                    {
                        FileName       = file.FileName,
                        IsSuccessfully = saveResult.IsSuccessfully,
                        Message        = saveResult.IsMessage,
                        pk_docId       = saveResult.pk_docId
                    });
                }

                modelResponse.IsSuccess  = true;
                modelResponse.Message    = $"{files.Count} document(s) uploaded successfully.";
                modelResponse.Data       = results;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess  = false;
                modelResponse.Message    = ex.Message;
                modelResponse.StatusCode = 500;
                return Ok(modelResponse);
            }
        }

        // ── GET USER ROLE INFO (IS VENDOR CHECK) ──────────────────────────────────
        [HttpGet("GetUserRoleInfo")]
        [Authorize]
        public async Task<IActionResult> GetUserRoleInfo()
        {
            var modelResponse = new ModelResponse();
            try
            {
                var companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";
                var userId    = HttpContext.Items["DecryptedUserId"]?.ToString() ?? "";

                var isVendor = await _repo.IsUserVendorAsync(userId, companyId);
                var vendorId = await _repo.GetVendorIdByUserIdAsync(userId, companyId);

                modelResponse.IsSuccess  = true;
                modelResponse.Data       = new { isVendor, vendorId };
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess  = false;
                modelResponse.Message    = ex.Message;
                modelResponse.StatusCode = 500;
                return Ok(modelResponse);
            }
        }

        // ── UPDATE STATUS (APPROVE / REJECT) ────────────────────────────────────────
        [HttpPost("UpdateDocStatus")]
        [Authorize]
        public async Task<IActionResult> UpdateDocStatus([FromBody] VendorEmpDocApprovalRequest request)
        {
            var modelResponse = new ModelResponse();
            try
            {
                if (request.pk_docId <= 0 || string.IsNullOrEmpty(request.Status))
                    return Ok(new ModelResponse { IsSuccess = false, Message = "Invalid request.", StatusCode = 400 });

                var companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";
                var userId    = HttpContext.Items["DecryptedUserId"]?.ToString() ?? "";

                // Vendors are not permitted to approve/reject documents; only Company HR / Admin can
                var isVendor = await _repo.IsUserVendorAsync(userId, companyId);
                if (isVendor)
                {
                    return Ok(new ModelResponse
                    {
                        IsSuccess = false,
                        Message = "Unauthorized. Only company HR or Admin can approve or reject employee documents.",
                        StatusCode = 403
                    });
                }

                var result = await _repo.UpdateDocStatusAsync(request.pk_docId, request.Status, request.RejectionRemarks, userId);
                modelResponse.IsSuccess  = result.IsSuccessfully;
                modelResponse.Message    = result.IsMessage;
                modelResponse.StatusCode = result.IsSuccessfully ? 200 : 400;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess  = false;
                modelResponse.Message    = ex.Message;
                modelResponse.StatusCode = 500;
                return Ok(modelResponse);
            }
        }

        // ── DELETE DOCUMENT ─────────────────────────────────────────────────────────
        [HttpDelete("DeleteDocument/{pk_docId}")]
        [Authorize]
        public async Task<IActionResult> DeleteDocument(long pk_docId)
        {
            var modelResponse = new ModelResponse();
            try
            {
                var userId = HttpContext.Items["DecryptedUserId"]?.ToString() ?? "";
                var result = await _repo.DeleteDocAsync(pk_docId, userId);

                modelResponse.IsSuccess  = result.IsSuccessfully;
                modelResponse.Message    = result.IsMessage;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess  = false;
                modelResponse.Message    = ex.Message;
                modelResponse.StatusCode = 500;
                return Ok(modelResponse);
            }
        }

        // ── PREVIEW / DOWNLOAD DOCUMENT ─────────────────────────────────────────────
        [HttpGet("DownloadDocument/{pk_docId}")]
        [Authorize]
        public async Task<IActionResult> DownloadDocument(long pk_docId)
        {
            try
            {
                var doc = await _repo.GetDocByIdAsync(pk_docId);
                if (doc == null)
                    return NotFound(new { Message = "Document not found." });

                // Mark document as viewed in database
                await _repo.MarkDocAsViewedAsync(pk_docId);

                if (!System.IO.File.Exists(doc.FilePath))
                    return NotFound(new { Message = "File does not exist on disk." });

                var provider = new Microsoft.AspNetCore.StaticFiles.FileExtensionContentTypeProvider();
                if (!provider.TryGetContentType(doc.FilePath, out string contentType))
                {
                    contentType = "application/octet-stream";
                }

                return PhysicalFile(doc.FilePath, contentType);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        // ── MARK DOCUMENT AS VIEWED ────────────────────────────────────────────────
        [HttpPost("MarkDocAsViewed/{pk_docId}")]
        [Authorize]
        public async Task<IActionResult> MarkDocAsViewed(long pk_docId)
        {
            try
            {
                var success = await _repo.MarkDocAsViewedAsync(pk_docId);
                return Ok(new ModelResponse { IsSuccess = success, Message = "Document marked as viewed.", StatusCode = 200 });
            }
            catch (Exception ex)
            {
                return Ok(new ModelResponse { IsSuccess = false, Message = ex.Message, StatusCode = 500 });
            }
        }

        // ── GET EMPLOYEES BY VENDOR (FOR VENDOR & ADMIN DROPDOWNS) ─────────────────
        [HttpGet("GetEmployeesByVendor")]
        [Authorize]
        public async Task<IActionResult> GetEmployeesByVendor(
            [FromQuery] string? vendorId = null,
            [FromQuery] string? searchTerm = null)
        {
            var modelResponse = new ModelResponse();
            try
            {
                var companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";
                var userId    = HttpContext.Items["DecryptedUserId"]?.ToString() ?? "";

                if (string.IsNullOrEmpty(vendorId))
                {
                    vendorId = await _repo.GetVendorIdByUserIdAsync(userId, companyId);
                }

                var list = await _repo.GetEmployeesByVendorAsync(companyId, vendorId, searchTerm);

                modelResponse.IsSuccess  = true;
                modelResponse.Data       = list;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess  = false;
                modelResponse.Message    = ex.Message;
                modelResponse.StatusCode = 500;
                return Ok(modelResponse);
            }
        }
    }
}
