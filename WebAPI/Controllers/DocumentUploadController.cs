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
    public class DocumentUploadController : ControllerBase
    {


        private readonly IDocumentUploadRepository documentUploadRepository;
        private readonly AppSettings appSettings;

        private readonly FileService fileService;

        public DocumentUploadController(IDocumentUploadRepository _documentUploadRepository, IOptions<AppSettings> appSettings, FileService _fileService)
        {

            documentUploadRepository = _documentUploadRepository;
            this.appSettings = appSettings.Value;

            fileService = _fileService;
        }






        [HttpPost]
        [Authorize]
        public async Task<IActionResult> InsertDocumentAsync([FromForm] Upload_Documents uploadDoc, [FromForm] List<string> fk_deptid)
        {
            var documentUpldRoot = new DocumentUpldRoot
            {
                Upload_Documents = uploadDoc,
                Upload_trn = fk_deptid.Select(id => new Upload_trn { fk_deptid = id }).ToList()
            };

            var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString();
            var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();
            var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString();


            // Handle file upload
            //if (uploadDoc.filename != null && uploadDoc.filename.Length > 0)
            //{
            //    string uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/uploads");
            //    if (!Directory.Exists(uploadsFolder))
            //    {
            //        Directory.CreateDirectory(uploadsFolder);
            //    }

            //    string uniqueFileName = Guid.NewGuid().ToString() + "_" + uploadDoc.filename.FileName;
            //    string filePath = Path.Combine(uploadsFolder, uniqueFileName);

            //    using (var stream = new FileStream(filePath, FileMode.Create))
            //    {
            //        await uploadDoc.filename.CopyToAsync(stream);
            //    }

            //    uploadDoc.SavedFileName = uniqueFileName;
            //    uploadDoc.contenttype = uploadDoc.filename.ContentType;
            //}

            if (uploadDoc.filename != null && uploadDoc.filename.Length > 0)
            {
                // Optional: Validate it's an image
                if (!fileService.IsImageFile(uploadDoc.filename))
                {
                    return BadRequest(new { message = "Only image files (jpg, jpeg, png) are allowed." });
                }

                // Save the file
                var savedFileName = await fileService.SaveFileAsync(uploadDoc.filename);

                // Save the file path in LogoPath (this will go to DB)
                uploadDoc.SavedFileName = savedFileName;
            }
            else
            {
                uploadDoc.SavedFileName = null;
            }



            // You can now use documentUpldRoot with the repository
            var success = await documentUploadRepository.InsertDocumentAsync(
                documentUpldRoot,
               decryptedUserId,

               decryptedLocationId, decryptedCompanyId
            );

            return Ok(new ModelResponse
            {
                IsSuccess = success,
                Message = success ? "Document Uploaded successfully." : "Document Uploaded failed.",
                StatusCode = success ? 200 : 400
            });
        }



        [HttpGet("GetFile/{filename}")]
        [Authorize]
        public IActionResult DownloadFile(string filename)
        {
            if (string.IsNullOrEmpty(filename))
                return BadRequest("Filename is required.");

            var folderPath = appSettings.UploadsFolderPath;
            var filePath = Path.Combine(folderPath, filename);

            Console.WriteLine($"Looking for: {filePath}");


            if (!System.IO.File.Exists(filePath))
                return NotFound("File not found.");

            var contentType = GetMimeType(filePath);
            var fileBytes = System.IO.File.ReadAllBytes(filePath);
            return File(fileBytes, contentType, filename);
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
                ".pdf" => "application/pdf",
                _ => "application/octet-stream",
            };
        }





        [HttpPut]
        [Authorize]
        public async Task<IActionResult> UpdateDocumentAsync(
            [FromForm] Upload_Documents uploadDoc,
            [FromForm] List<string> fk_deptid,
            [FromForm] long pk_uploadId,
            [FromForm] string? UpdAppChange
           )
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                string decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString();
                string decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString();

                string? uniqueFileName = null;
                string? contentType = null;

                // Handle updated file
                //if (UpdAppChange == "Y" && uploadDoc.filename != null && uploadDoc.filename.Length > 0)
                //{
                //    string uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/uploads");
                //    if (!Directory.Exists(uploadsFolder))
                //        Directory.CreateDirectory(uploadsFolder);

                //    uniqueFileName = Guid.NewGuid() + "_" + uploadDoc.filename.FileName;
                //    string filePath = Path.Combine(uploadsFolder, uniqueFileName);

                //    using (var stream = new FileStream(filePath, FileMode.Create))
                //    {
                //        await uploadDoc.filename.CopyToAsync(stream);
                //    }

                //    uploadDoc.SavedFileName = uniqueFileName;
                //    uploadDoc.contenttype = uploadDoc.filename.ContentType;
                //}

                if (uploadDoc.filename != null && uploadDoc.filename.Length > 0)
                {
                    // Optional: Validate it's an image
                    if (!fileService.IsImageFile(uploadDoc.filename))
                    {
                        return BadRequest(new { message = "Only image files (jpg, jpeg, png) are allowed." });
                    }

                    // Save the file
                    var savedFileName = await fileService.SaveFileAsync(uploadDoc.filename);

                    // Save the file path in LogoPath (this will go to DB)
                    uploadDoc.SavedFileName = savedFileName;
                }
                else
                {
                    uploadDoc.SavedFileName = null;
                }



                // Build model like Insert
                var documentUpldRoot = new DocumentUpldRoot
                {
                    pk_uploadId = pk_uploadId,
                    UpdAppChange = UpdAppChange,

                    Upload_Documents = uploadDoc,
                    Upload_trn = fk_deptid.Select(id => new Upload_trn { fk_deptid = id }).ToList()
                };

                bool result = await documentUploadRepository.UpdateDocumentAsync(
                    documentUpldRoot, decryptedUserId, decryptedLocationId);

                modelResponse.IsSuccess = result;
                modelResponse.Message = result ? "Document updated successfully." : "Update failed.";
                modelResponse.StatusCode = result ? 200 : 400;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;
                return StatusCode(500, modelResponse);
            }
        }




        [HttpGet]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetAll(int pageIndex = 0, int pageSize = 10)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
                var (totalCount, result) = await documentUploadRepository.GetAll(pageIndex, pageSize, decryptedCompanyId);
                if (result.Count() == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }


                modelResponse.IsSuccess = true;
                modelResponse.Message = "Document Uploaded data  retrieved successfully.";
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



        [HttpGet("GetById/{fk_uploadId}")]
        [Authorize]

        public async Task<IActionResult> GetDocumnetUpdloadByIdAsync([FromRoute] long fk_uploadId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {

                var (DocumenteData, DepartmentList) = await documentUploadRepository.GetById(fk_uploadId);

                if (DocumenteData == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record Found Or Invalid Id";
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Document Upload detail retrieved successfully.";
                modelResponse.Data = new
                {
                    DocumenteData = DocumenteData,
                    DepartmentList = DepartmentList,
                };
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


        [HttpDelete("{pk_uploadId}")]
        [Authorize]
        public async Task<IActionResult> Delete([FromRoute] long pk_uploadId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                bool isDeleted = await documentUploadRepository.DeleteAsync(pk_uploadId);

                modelResponse.IsSuccess = isDeleted;
                modelResponse.Message = isDeleted ? "Document delete successfully." : "Failed to delete Document detail.";
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
