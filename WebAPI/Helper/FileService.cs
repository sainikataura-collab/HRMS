using HRMSWebAPI.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using System;
using System.IO;
using System.Threading.Tasks;

public class FileService
{
    private readonly AppSettings _appSettings;

    public FileService(IOptions<AppSettings> appSettings)
    {
        _appSettings = appSettings.Value;
    }

    public async Task<string> SaveFileAsync(IFormFile file)
    {
        if (file == null || file.Length == 0)
            throw new ArgumentException("File cannot be null or empty.");

        // Generate a unique filename
        var uniqueFileName = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";

        // Combine the uploads folder path with the user's folder
        var folderPath = Path.Combine(_appSettings.UploadsFolderPath);


        // Ensure the user folder exists
        if (!Directory.Exists(folderPath))
        {
            Directory.CreateDirectory(folderPath);
        }


        var filePath = Path.Combine(folderPath, uniqueFileName);

        // Save the file to the specified path
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        // Return the relative path to the saved file
        //return Path.Combine(userFolder, uniqueFileName); // Adjust the return path as needed

        return $"{uniqueFileName}";
    }


    public async Task<string> SaveCompanylogoFileAsync(IFormFile file, string CompanyId)

    {
        if (file == null || file.Length == 0)
            throw new ArgumentException("File cannot be null or empty.");



        // File name without extension
        var originalName = Path.GetFileNameWithoutExtension(file.FileName);

        // First word + lowercase
        var shortName = originalName
            .Split(new[] { ' ', '_', '-' }, StringSplitOptions.RemoveEmptyEntries)[0]
            .ToLower();

        // New file name
        var uniqueFileName = $"{CompanyId}_logo{Path.GetExtension(file.FileName)}";



        var folderPath = Path.Combine(_appSettings.CompanyLogoFolderPath);

        // Ensure the user folder exists
        if (!Directory.Exists(folderPath))
        {
            Directory.CreateDirectory(folderPath);
        }


        var filePath = Path.Combine(folderPath, uniqueFileName);

        // Save the file to the specified path
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }



        return $"{uniqueFileName}";
    }



    // Helper method to check if a file is an image
    public bool IsImageFile(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return false;

       
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".pdf", "docx" };
        var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();

        return allowedExtensions.Contains(fileExtension);//&& file.ContentType.StartsWith("image/");
    }


    //added code LR 25June

    public async Task<string> GenerateFilePathAsync(IFormFile file)
    {
        if (file == null || file.Length == 0)
            throw new ArgumentException("File cannot be null or empty.");

        // Generate a unique filename
        var uniqueFileName = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";



        // Return the relative path to the saved file
        //return Path.Combine(userFolder, uniqueFileName); // Adjust the return path as needed

        return $"{uniqueFileName}";
    }


    public async Task<string> SaveCompanyStampFileAsync(IFormFile file)
    {
        if (file == null || file.Length == 0)
            throw new ArgumentException("File cannot be null or empty.");

        var originalName = Path.GetFileNameWithoutExtension(file.FileName);
        var shortName = originalName
            .Split(new[] { ' ', '_', '-' }, StringSplitOptions.RemoveEmptyEntries)[0]
            .ToLower();

        var uniqueFileName = $"{shortName}_stamp_{Guid.NewGuid().ToString().Substring(0, 8)}{Path.GetExtension(file.FileName)}";
        var folderPath = Path.Combine(_appSettings.CompanyLogoFolderPath);

        if (!Directory.Exists(folderPath))
        {
            Directory.CreateDirectory(folderPath);
        }

        var filePath = Path.Combine(folderPath, uniqueFileName);
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        return $"{uniqueFileName}";
    }

    public async Task<string> SaveFileInLocationAsync(IFormFile file, string uniqueFileName)
    {

        // Combine the uploads folder path with the user's folder
        var folderPath = Path.Combine(_appSettings.UploadsFolderPath);


        // Ensure the user folder exists
        if (!Directory.Exists(folderPath))
        {
            Directory.CreateDirectory(folderPath);
        }


        var filePath = Path.Combine(folderPath, uniqueFileName);

        // Save the file to the specified path
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        // Return the relative path to the saved file
        //return Path.Combine(userFolder, uniqueFileName); // Adjust the return path as needed

        return $"{uniqueFileName}";
    }

    public bool IsVideoFile(IFormFile file)
    {
        var permittedExtensions = new[] { ".mp4", ".avi", ".mov", ".mkv" };
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        return !string.IsNullOrEmpty(ext) && permittedExtensions.Contains(ext);
    }

    public bool IsDocumentFile(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return false;

        var allowedExtensions = new[] { ".pdf", ".doc", ".docx", ".ppt", ".pptx" };
        var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();

        // For documents, ignore ContentType check
        return allowedExtensions.Contains(fileExtension);
    }


    //added code 4 dec 2025 LR
    public async Task<string> SaveCandidateFileAsync(IFormFile file, string candidateId)
    {
        if (file == null || file.Length == 0)
            throw new ArgumentException("File cannot be null or empty.");

        // Generate a unique filename with candidate ID prefix
        var uniqueFileName = $"{candidateId}_{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";

        // Use CandidateFolderPath from appsettings
        var folderPath = _appSettings.CandidateFolderPath;

        // Ensure the folder exists
        if (!Directory.Exists(folderPath))
        {
            Directory.CreateDirectory(folderPath);
        }

        var filePath = Path.Combine(folderPath, uniqueFileName);

        // Save the file
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        return uniqueFileName;
    }

   
    public bool DeleteCandidateFile(string fileName)
    {
        if (string.IsNullOrEmpty(fileName))
            return false;

        try
        {
            var filePath = Path.Combine(_appSettings.CandidateFolderPath, fileName);

            if (File.Exists(filePath))
            {
                File.Delete(filePath);
                return true;
            }

            return false;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error deleting candidate file: {ex.Message}");
            return false;
        }
    }

    
    public bool IsCandidateDocumentFile(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return false;

        var allowedExtensions = new[] { ".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png" };
        var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();

        return allowedExtensions.Contains(fileExtension);
    }

    
    public string GetCandidateFilePath(string fileName)
    {
        if (string.IsNullOrEmpty(fileName))
            return null;

        return Path.Combine(_appSettings.CandidateFolderPath, fileName);
    }

    public async Task<string> SaveVendorLogoFileAsync(IFormFile file, string vendorId)
    {
        if (file == null || file.Length == 0)
            throw new ArgumentException("File cannot be null or empty.");

        var uniqueFileName = $"vendor_{vendorId}_logo_{Guid.NewGuid().ToString().Substring(0, 8)}{Path.GetExtension(file.FileName)}";
        var folderPath = Path.Combine(_appSettings.CompanyLogoFolderPath);

        if (!Directory.Exists(folderPath))
        {
            Directory.CreateDirectory(folderPath);
        }

        var filePath = Path.Combine(folderPath, uniqueFileName);
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        return $"{uniqueFileName}";
    }

    public async Task<string> SaveClientLogoFileAsync(IFormFile file, string clientId)
    {
        if (file == null || file.Length == 0)
            throw new ArgumentException("File cannot be null or empty.");

        var uniqueFileName = $"client_{clientId}_logo_{Guid.NewGuid().ToString().Substring(0, 8)}{Path.GetExtension(file.FileName)}";
        var folderPath = Path.Combine(_appSettings.CompanyLogoFolderPath);

        if (!Directory.Exists(folderPath))
        {
            Directory.CreateDirectory(folderPath);
        }

        var filePath = Path.Combine(folderPath, uniqueFileName);
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        return $"{uniqueFileName}";
    }
}