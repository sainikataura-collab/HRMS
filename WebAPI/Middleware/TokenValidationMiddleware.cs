
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using Microsoft.AspNetCore.Mvc.Razor;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;


using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Security.Claims;
using System.Text;
using static System.Net.Mime.MediaTypeNames;
using static System.Net.WebRequestMethods;

public class TokenValidationMiddleware
{
    private readonly RequestDelegate _next;
    private readonly JwtSettings _jwtSettings;

    // Define paths to skip token validation
    private readonly string[] _pathsToSkip = new[]
    {
        "/swagger",                // Swagger UI route
        "/swagger/index.html",     // Swagger UI index
        "/swagger/v1/swagger.json",// Swagger JSON file
         "/api/v1/user/login",
         "/api/v1/User/validateCompanyCode",
         "/api/v1/User/GetLocationByOfficeType",
        "/api/v1/User/verify-otp",
        "/api/v1/candidateexperiencedetails", //added code
         "/api/v1/candidatequalificationdetails" ,//added code
         "/api/v1/hrcandidatereview",
          "/chatHub", //Use for notificcation and live chat messages
           "/api/v1/webhooks", // Added code for webhook endpoints which use custom auth header tokens
             "/api/location", // Location Tracker APIs
                          "/api/v1/atsjobrequisition", // ATS Job Requisition & Workflow APIs
             "/api/v1/atslifecycle", // ATS Full Lifecycle & Pipeline APIs

        "/api/v1/locationtracker", // Location Tracker continuous telemetry & status
        "/api/location", // Location Tracker legacy / mobile background patch endpoint
        "/api/Otp/SendOtp",
        "/api/Otp/VerifyOtp",
        "/api/ocr",
        "/api/v1/ocr",
          "/api/v1/employeesalaryslip/generatepermanenttoken"  // Add this

    };




    public TokenValidationMiddleware(RequestDelegate next, IOptions<JwtSettings> jwtSettings)
    {
        _next = next;
        _jwtSettings = jwtSettings.Value;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        ModelResponse modelResponse = new ModelResponse();

        // Skip token validation for any request under the "/swagger" path
        if (context.Request.Path.StartsWithSegments("/swagger", StringComparison.OrdinalIgnoreCase))
        {
            await _next(context); // Proceed to the next middleware
            return;
        }

        // Normalize request path (lowercase and remove trailing slash)
        string requestPath = context.Request.Path.ToString().ToLowerInvariant().TrimEnd('/');

        // Normalize paths to skip (lowercase and remove trailing slash)
        var normalizedPathsToSkip = _pathsToSkip.Select(p => p.ToLowerInvariant().TrimEnd('/')).ToArray();

        // Check if the request path is in the list of paths to skip
        //if (normalizedPathsToSkip.Contains(requestPath))
        //{
        //    await _next(context);  // Skip token validation
        //    return;
        //}

        // Skip token validation if the request path *starts with* any of the paths to skip
        if (normalizedPathsToSkip.Any(p => requestPath.StartsWith(p)))
        {
            await _next(context);  // Skip token validation
            return;
        }

        // Check if Authorization header is present
        if (context.Request.Headers.TryGetValue("Authorization", out var token))
        {
            if (token.ToString().StartsWith("Bearer "))
            {
                var tokenValue = token.ToString().Substring("Bearer ".Length).Trim();

                // Token validation parameters
                var tokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.Key)),
                    ValidIssuer = _jwtSettings.Issuer,
                    ValidAudience = _jwtSettings.Audience,
                    ClockSkew = TimeSpan.Zero // Disable clock skew for testing
                };

                var tokenHandler = new JwtSecurityTokenHandler();
                try
                {
                    // Validate the token and set the claims principal
                    var principal = tokenHandler.ValidateToken(tokenValue, tokenValidationParameters, out SecurityToken validatedToken);
                    context.User = principal; // Attach validated principal to HttpContext


                    // Extract user ID from the token claims
                    var userIdClaim = principal.FindFirst(JwtRegisteredClaimNames.Sub)
                                       ?? principal.FindFirst(ClaimTypes.NameIdentifier) // Fallback to NameIdentifier
                                       ?? principal.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier");
                    var locationIdClaim = principal.FindFirst("Loc")?.Value; // Retrieve LocationId claim
                    var companyIdClaim = principal.FindFirst("Com")?.Value; // Retrieve CompanyId claim
                    var fyClaim = principal.FindFirst("FY")?.Value; // Retrieve fyClaim claim
                    var jwtToken = (JwtSecurityToken)validatedToken;
                    var expClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Exp)?.Value;
                    var expTime = DateTimeOffset.FromUnixTimeSeconds(long.Parse(expClaim ?? "0")).UtcDateTime;
                    //Console.WriteLine($"Token expiration time (UTC): {expTime}, Current server time (UTC): {DateTime.UtcNow}");

                    if (userIdClaim != null)
                    {
                        string encryptedUserId = userIdClaim.Value; // Retrieve the user ID from token

                        // Decrypt the User ID
                        var (isValid, decryptedUserId, message) = IdHelper.ValidateAndDecryptId(encryptedUserId, "UserId");
                        if (!isValid || decryptedUserId == null)
                        {
                            await WriteResponse(context, StatusCodes.Status401Unauthorized, "Invalid user. Please login and provide correct credentials.", false);
                            return;
                        }

                        // Add the decrypted user ID to HttpContext for later use
                        context.Items["DecryptedUserId"] = decryptedUserId;
                        context.Items["EncryptedUserId"] = userIdClaim.Value;
                    }
                    else
                    {
                        // If userId is null, respond with error
                        await WriteResponse(context, StatusCodes.Status401Unauthorized, "Invalid user. Please login and provide correct credentials.", false);
                        return;
                    }

                    if (locationIdClaim != null)
                    {
                        string encryptedLocationId = locationIdClaim; // Retrieve the locationId from token

                        // Decrypt the Location ID
                        var (isValid, decryptedLocationId, message) = IdHelper.ValidateAndDecryptId(encryptedLocationId, "LocationId");
                        if (!isValid || decryptedLocationId == null)
                        {
                            await WriteResponse(context, StatusCodes.Status401Unauthorized, "Invalid user. Please login and provide correct credentials.", false);
                            return;
                        }

                        // Add the decrypted location ID to HttpContext for later use
                        context.Items["DecryptedLocationId"] = decryptedLocationId;
                        context.Items["EncryptedLocationId"] = locationIdClaim;
                    }
                    else
                    {
                        // If locationId is null, respond with error
                        await WriteResponse(context, StatusCodes.Status401Unauthorized, "Invalid user. Please login and provide correct credentials.", false);
                        return;
                    }

                    if (companyIdClaim != null)
                    {
                        string encryptedCompanyId = companyIdClaim; // Retrieve the companyId from token

                        // Decrypt the CompanyId
                        var (isValid, decryptedCompanyId, message) = IdHelper.ValidateAndDecryptId(encryptedCompanyId, "CompanyId");
                        if (!isValid || decryptedCompanyId == null)
                        {
                            await WriteResponse(context, StatusCodes.Status401Unauthorized, "Invalid user. Please login and provide correct credentials.", false);
                            return;
                        }

                        // Add the decrypted companyId to HttpContext for later use
                        context.Items["DecryptedCompanyId"] = decryptedCompanyId;
                        context.Items["EncryptedCompanyId"] = companyIdClaim;
                    }
                    else
                    {
                        // If locationId is null, respond with error
                        await WriteResponse(context, StatusCodes.Status401Unauthorized, "Invalid user. Please login and provide correct credentials.", false);
                        return;
                    }


                    if (fyClaim != null)
                    {
                        string encryptedFinancialYearId = fyClaim; // Retrieve the fy ID from token

                        // Decrypt the User ID
                        var (isValid, decryptedFinancialYearId, message) = IdHelper.ValidateAndDecryptId(encryptedFinancialYearId, "FinancialYearId");
                        if (!isValid || decryptedFinancialYearId == null)
                        {
                            await WriteResponse(context, StatusCodes.Status401Unauthorized, "Invalid user. Please login and provide correct credentials.", false);
                            return;
                        }

                        // Add the decrypted user ID to HttpContext for later use
                        context.Items["DecryptedFinancialYearId"] = decryptedFinancialYearId;
                        context.Items["EncryptedFinancialYearId"] = fyClaim;
                    }
                    else
                    {
                        // If userId is null, respond with error
                        await WriteResponse(context, StatusCodes.Status401Unauthorized, "Invalid user. Please login and provide correct credentials.", false);
                        return;
                    }

                    await _next(context); // Call the next middleware
                    return;
                }
                catch (SecurityTokenExpiredException)
                {
                    await WriteResponse(context, StatusCodes.Status401Unauthorized, "Token has expired.", false);
                    return;
                }
                catch (SecurityTokenException)
                {
                    await WriteResponse(context, StatusCodes.Status401Unauthorized, "Invalid token.", false);
                    return;
                }
            }
            else
            {
                await WriteResponse(context, StatusCodes.Status401Unauthorized, "Authorization header must be Bearer.", false);
                return;
            }
        }
        else
        {
            await WriteResponse(context, StatusCodes.Status401Unauthorized, "Authorization header missing.", false);
            return;
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

        //context.Response.StatusCode = statusCode;
        context.Response.StatusCode = (int)HttpStatusCode.OK;
        //sending 200 to make consistent return,though returning respective StatusCode  in response model
        return context.Response.WriteAsJsonAsync(modelResponse);
    }
}










