using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class VendorLiteController : ControllerBase
    {
        private readonly IVendorLiteRepository _repo;
        private readonly IConfiguration _config;
        private readonly FileService _fileService;

        public VendorLiteController(IVendorLiteRepository repo, IConfiguration config, FileService fileService)
        {
            _repo        = repo;
            _config      = config;
            _fileService = fileService;
        }

        // ── GET ALL ──────────────────────────────────────────────────────────────
        [HttpGet("GetAll")]
        [Authorize]
        public async Task<IActionResult> GetAll(
            [FromQuery] int pageIndex = 0,
            [FromQuery] int pageSize = 20,
            [FromQuery] string searchTerm = "")
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";
                var (totalCount, list) = await _repo.GetAllVendorLiteAsync(pageIndex, pageSize, companyId, searchTerm);
                modelResponse.IsSuccess  = true;
                modelResponse.Message    = "Vendor list retrieved successfully.";
                modelResponse.Data       = new { totalCount, list };
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message   = ex.Message;
                return Ok(modelResponse);
            }
        }

        // ── GET BY ID ────────────────────────────────────────────────────────────
        [HttpGet("GetById/{pk_recId}")]
        [Authorize]
        public async Task<IActionResult> GetById(string pk_recId)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var vendor = await _repo.GetVendorLiteByIdAsync(pk_recId);
                modelResponse.IsSuccess  = vendor != null;
                modelResponse.Data       = vendor;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message   = ex.Message;
                return Ok(modelResponse);
            }
        }

        // ── INSERT ───────────────────────────────────────────────────────────────
        [HttpPost("InsertVendorLite")]
        [Authorize]
        public async Task<IActionResult> InsertVendorLite([FromBody] VendorLiteModel model)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var userId    = HttpContext.Items["DecryptedUserId"]?.ToString()    ?? "";
                var companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";
                var locId     = HttpContext.Items["DecryptedLocationId"]?.ToString() ?? "";

                var result = await _repo.InsertVendorLiteAsync(model, userId, companyId, locId);
                modelResponse.IsSuccess  = result.IsSuccessfully;
                modelResponse.Message    = result.IsMessage;
                modelResponse.Data       = result.pk_recId;
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

        // ── UPDATE ───────────────────────────────────────────────────────────────
        [HttpPost("UpdateVendorLite")]
        [Authorize]
        public async Task<IActionResult> UpdateVendorLite([FromBody] VendorLiteModel model)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var userId    = HttpContext.Items["DecryptedUserId"]?.ToString()    ?? "";
                var companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";

                var result = await _repo.UpdateVendorLiteAsync(model, userId, companyId);
                modelResponse.IsSuccess  = result.IsSuccessfully;
                modelResponse.Message    = result.IsMessage;
                modelResponse.Data       = result.pk_recId;
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

        // ── UPLOAD DOCUMENTS ─────────────────────────────────────────────────────
        [HttpPost("UploadVendorDocuments")]
        [Authorize]
        public async Task<IActionResult> UploadVendorDocuments(
            [FromForm] string vendorId,
            [FromForm] int    docTypeCodeId,
            [FromForm] string docTypeName,
            [FromForm] List<int> docIndices,
            IFormFileCollection files)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                if (string.IsNullOrEmpty(vendorId))
                    return Ok(new ModelResponse { IsSuccess = false, Message = "Vendor ID is required.", StatusCode = 400 });

                if (files == null || files.Count == 0)
                    return Ok(new ModelResponse { IsSuccess = false, Message = "No files provided.", StatusCode = 400 });

                var userId    = HttpContext.Items["DecryptedUserId"]?.ToString()    ?? "";
                var companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";

                var uploadsFolder = _config["AppSettings:VendorDocumentUploads"];
                //if (string.IsNullOrEmpty(uploadsFolder))
                //    uploadsFolder = "D:/VendorDocumentUploads";

                if (!Directory.Exists(uploadsFolder))
                    Directory.CreateDirectory(uploadsFolder);

                var results = new List<object>();
                for (int i = 0; i < files.Count; i++)
                {
                    var file = files[i];
                    var docIndex = (docIndices != null && docIndices.Count > i) ? docIndices[i] : (i + 1);

                    var ext       = Path.GetExtension(file.FileName);
                    var baseName  = Path.GetFileNameWithoutExtension(file.FileName);
                    var savedName = $"{baseName}_{DateTime.Now:ddMMyyyy_HHmmss}_{companyId}_{vendorId}_{docTypeCodeId}{ext}";
                    var physPath  = Path.Combine(uploadsFolder, savedName);

                    using (var stream = new FileStream(physPath, FileMode.Create))
                        await file.CopyToAsync(stream);

                    var doc = new VendorDocumentModel
                    {
                        fk_vendorId      = vendorId,
                        DocTypeCodeId    = docTypeCodeId,
                        DocTypeName      = docTypeName,
                        DocIndex         = docIndex,
                        OriginalFileName = file.FileName,
                        SavedFileName    = savedName,
                        FilePath         = physPath,
                        FileSize         = file.Length,
                        MimeType         = file.ContentType
                    };

                    var saveResult = await _repo.SaveVendorDocumentAsync(doc, userId, companyId);
                    results.Add(new
                    {
                        FileName        = file.FileName,
                        IsSuccessfully  = saveResult.IsSuccessfully,
                        Message         = saveResult.IsMessage,
                        pk_docId        = saveResult.pk_docId
                    });
                }

                modelResponse.IsSuccess  = true;
                modelResponse.Message    = $"{files.Count} file(s) processed.";
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

        // ── GET VENDOR DOCUMENTS ──────────────────────────────────────────────────
        [HttpGet("GetVendorDocuments/{vendorId}")]
        [Authorize]
        public async Task<IActionResult> GetVendorDocuments(string vendorId)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var docs = await _repo.GetVendorDocumentsByVendorIdAsync(vendorId);
                modelResponse.IsSuccess  = true;
                modelResponse.Data       = docs;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message   = ex.Message;
                return Ok(modelResponse);
            }
        }

        // ── DELETE DOCUMENT ───────────────────────────────────────────────────────
        [HttpDelete("DeleteDocument/{pk_docId}")]
        [Authorize]
        public async Task<IActionResult> DeleteDocument(long pk_docId)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var userId = HttpContext.Items["DecryptedUserId"]?.ToString() ?? "";
                var result = await _repo.DeleteVendorDocumentAsync(pk_docId, userId);
                modelResponse.IsSuccess  = result.IsSuccessfully;
                modelResponse.Message    = result.IsMessage;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message   = ex.Message;
                return Ok(modelResponse);
            }
        }

        // ── DOWNLOAD/VIEW DOCUMENT ────────────────────────────────────────────────
        [HttpGet("DownloadVendorDocument/{pk_docId}")]
        [Authorize]
        public async Task<IActionResult> DownloadVendorDocument(long pk_docId)
        {
            try
            {
                var doc = await _repo.GetVendorDocumentByIdAsync(pk_docId);
                if (doc == null)
                    return NotFound(new { Message = "Document not found or inactive." });

                if (!System.IO.File.Exists(doc.FilePath))
                    return NotFound(new { Message = "File does not exist on server." });

                var provider = new Microsoft.AspNetCore.StaticFiles.FileExtensionContentTypeProvider();
                if (!provider.TryGetContentType(doc.FilePath, out string contentType))
                {
                    contentType = "application/octet-stream";
                }

                // If you want it to download, return PhysicalFile with the third parameter (doc.SavedFileName).
                // If you want it to view in browser, omit the third parameter, and just return PhysicalFile(doc.FilePath, contentType);
                // We'll return it inline (view) by default if the browser supports it.
                return PhysicalFile(doc.FilePath, contentType);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        // ── UPLOAD VENDOR LOGO ────────────────────────────────────────────────────
        [HttpPost("UploadVendorLogo")]
        [Authorize]
        public async Task<IActionResult> UploadVendorLogo([FromForm] VendorLogoUploadModel model)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                if (string.IsNullOrEmpty(model.VendorId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Vendor Id is required.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                if (model.Logo != null && model.Logo.Length > 0)
                {
                    if (!_fileService.IsImageFile(model.Logo))
                    {
                        return Ok(new ModelResponse
                        {
                            IsSuccess = false,
                            Message = "Only image files (jpg, jpeg, png) are allowed.",
                            StatusCode = 400
                        });
                    }

                    var savedLogoName = await _fileService.SaveVendorLogoFileAsync(model.Logo, model.VendorId);
                    model.LogoName = savedLogoName;
                }

                // Remove IFormFile before passing down
                model.Logo = null;

                bool result = await _repo.UploadVendorLogoAsync(model.VendorId, model.LogoName ?? "");

                modelResponse.IsSuccess = result;
                modelResponse.Message = result
                    ? "Vendor logo uploaded successfully."
                    : "Vendor logo upload failed.";
                modelResponse.Data = model.LogoName;
                modelResponse.StatusCode = result ? 200 : 400;

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
