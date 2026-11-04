using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;

public class CandidateKeyValidationMiddleware
{
    private readonly RequestDelegate _next;
    private readonly string[] _candidateApiPaths = new[]
    {
        "/api/v1/candidateexperiencedetails",
        "/api/v1/candidatequalificationdetails", 
        "/api/v1/candidatedemographicdetails"
    };

    public CandidateKeyValidationMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, ICandidateRepository candidateRepository)
    {
        string requestPath = context.Request.Path.ToString().ToLowerInvariant().TrimEnd('/');
        bool isCandidateApi = _candidateApiPaths.Any(path => requestPath.StartsWith(path));

        if (isCandidateApi)
        {
            // Allow admin / authorized requests or specific candidateId path in download-onboarding-pdf/{candidateId}
            bool isAdminPdfDownload = requestPath.Contains("/download-onboarding-pdf/") &&
                requestPath.Length > requestPath.IndexOf("/download-onboarding-pdf/", StringComparison.OrdinalIgnoreCase) + "/download-onboarding-pdf/".Length;

            bool hasAdminAuth = context.Request.Headers.ContainsKey("Authorization") &&
                context.Request.Headers["Authorization"].ToString().StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase);

            bool isImagePath = requestPath.Contains("/candidateexperiencedetails/images/");

            if (isImagePath || isAdminPdfDownload || (hasAdminAuth && requestPath.Contains("/download-onboarding-pdf")))
            {
                await _next(context);
                return;
            }

            string candidateKey = null;

            if (context.Request.Headers.TryGetValue("X-Candidate-Key", out var headerKey))
            {
                candidateKey = headerKey.ToString();
            }
            else if (context.Request.Query.TryGetValue("key", out var queryKey))
            {
                candidateKey = queryKey.ToString();
            }

            if (string.IsNullOrWhiteSpace(candidateKey))
            {
                await WriteResponse(context, StatusCodes.Status401Unauthorized,
                    "Candidate key is missing. Please use the link sent to your email.", false);
                return;
            }

            var candidate = await ValidateCandidateKey(candidateRepository, candidateKey);

            if (candidate == null || string.IsNullOrEmpty(candidate.pk_recId))
            {
                await WriteResponse(context, StatusCodes.Status401Unauthorized,
                    "Invalid or expired candidate key. Please contact HR for a new link.", false);
                return;
            }

            // Allow downloading PDF even if onboarding is already completed
            bool isPdfDownloadPath = requestPath.Contains("/download-onboarding-pdf");

            if (candidate.IsOnboardingDone && !isPdfDownloadPath)
            {
                await WriteResponse(context, StatusCodes.Status403Forbidden,
                    "Onboarding process is already completed. Please contact HR if you need to make changes.", false);
                return;
            }

            context.Items["CandidateId"] = candidate.pk_recId;
            context.Items["CandidateKey"] = candidateKey;
            context.Items["CandidateName"] = candidate.candidate_name;
        }

        await _next(context);
    }

    //public async Task InvokeAsync(HttpContext context, ICandidateRepository candidateRepository)
    //{
    //    string requestPath = context.Request.Path.ToString().ToLowerInvariant().TrimEnd('/');
    //    bool isCandidateApi = _candidateApiPaths.Any(path => requestPath.StartsWith(path));

    //    if (isCandidateApi)
    //    {
    //        string candidateKey = null;

    //        if (context.Request.Headers.TryGetValue("X-Candidate-Key", out var headerKey))
    //        {
    //            candidateKey = headerKey.ToString();
    //        }
    //        else if (context.Request.Query.TryGetValue("key", out var queryKey))
    //        {
    //            candidateKey = queryKey.ToString();
    //        }

    //        if (string.IsNullOrWhiteSpace(candidateKey))
    //        {
    //            await WriteResponse(context, StatusCodes.Status401Unauthorized,
    //                "Candidate key is missing. Please use the link sent to your email.", false);
    //            return;
    //        }

    //        var candidate = await ValidateCandidateKey(candidateRepository, candidateKey);

    //        if (candidate == null || string.IsNullOrEmpty(candidate.pk_recId))
    //        {
    //            await WriteResponse(context, StatusCodes.Status401Unauthorized,
    //                "Invalid or expired candidate key. Please contact HR for a new link.", false);
    //            return;
    //        }

    //        if (candidate.IsOnboardingDone)
    //        {
    //            await WriteResponse(context, StatusCodes.Status403Forbidden,
    //                "Onboarding process is already completed. Please contact HR if you need to make changes.", false);
    //            return;
    //        }

    //        context.Items["CandidateId"] = candidate.pk_recId;
    //        context.Items["CandidateKey"] = candidateKey;
    //        context.Items["CandidateName"] = candidate.candidate_name;
    //    }

    //    await _next(context);
    //}

    private async Task<CandidateKeyValidationDto> ValidateCandidateKey(
        ICandidateRepository candidateRepository, string candidateKey)
    {
        try
        {
            return await candidateRepository.GetCandidateByKey(candidateKey);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error validating candidate key: {ex.Message}");
            return null;
        }
    }

    
    private Task WriteResponse(HttpContext context, int statusCode, string message, bool isSuccess)
    {
        var modelResponse = new ModelResponse
        {
            IsSuccess = isSuccess,
            Message = message,
            StatusCode = statusCode
        };

        //  Use the actual status code
        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/json";

        return context.Response.WriteAsJsonAsync(modelResponse);
    }
}