using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMSWebAPI.Middleware
{
    public class RequestTrackingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<RequestTrackingMiddleware> _logger;
        private readonly IServiceScopeFactory _serviceScopeFactory;

        private readonly string[] _pathsToSkip = new[]
        {
            "/swagger",
            "/favicon.ico"
        };

        // Content types to skip (binary files)
        private readonly string[] _contentTypesToSkip = new[]
        {
            "image/",
            "video/",
            "audio/",
            "application/pdf",
            "application/zip",
            "application/octet-stream"
        };

        public RequestTrackingMiddleware(
            RequestDelegate next,
            ILogger<RequestTrackingMiddleware> logger,
            IServiceScopeFactory serviceScopeFactory)
        {
            _next = next;
            _logger = logger;
            _serviceScopeFactory = serviceScopeFactory;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            if (ShouldSkipLogging(context.Request.Path))
            {
                await _next(context);
                return;
            }

            var correlationId = Guid.NewGuid().ToString();
            var stopwatch = Stopwatch.StartNew();

            var userAgent = context.Request.Headers["User-Agent"].ToString();
            var deviceInfo = DeviceDetectionHelper.GetDeviceInformation(userAgent);

            var requestLog = new RequestLog
            {
                CorrelationId = correlationId,
                RequestTimestamp = DateTime.UtcNow,
                RequestMethod = context.Request.Method,
                RequestPath = context.Request.Path,
                QueryString = context.Request.QueryString.ToString(),
                IpAddress = GetClientIpAddress(context),
                UserAgent = userAgent,
                DeviceType = deviceInfo.DeviceType,
                DeviceBrand = deviceInfo.DeviceBrand,
                DeviceModel = deviceInfo.DeviceModel,
                OS = deviceInfo.OS,
                OSVersion = deviceInfo.OSVersion,
                Browser = deviceInfo.Browser,
                BrowserVersion = deviceInfo.BrowserVersion,
                Platform = deviceInfo.Platform,
                IsBot = deviceInfo.IsBot
            };

            // Capture request body for POST/PUT/PATCH
            if (context.Request.Method == "POST" ||
                context.Request.Method == "PUT" ||
                context.Request.Method == "PATCH")
            {
                requestLog.RequestBody = await CaptureRequestBody(context);
            }

            //Store original response stream
            var originalBodyStream = context.Response.Body;
            using var responseBodyStream = new MemoryStream();
            context.Response.Body = responseBodyStream;

            try
            {
                await _next(context);

                stopwatch.Stop();

                requestLog.ResponseStatusCode = context.Response.StatusCode;
                requestLog.ResponseTime = stopwatch.ElapsedMilliseconds;
                requestLog.IsSuccessful = context.Response.StatusCode >= 200 &&
                                         context.Response.StatusCode < 300;

                // Capture response body
                if (ShouldCaptureResponseBody(context))
                {
                    requestLog.ResponseBody = await CaptureResponseBody(responseBodyStream, originalBodyStream);
                }
                else
                {
                    requestLog.ResponseBody = $"[Binary Content: {context.Response.ContentType}]";

                    // Copy stream so client receives response
                    responseBodyStream.Seek(0, SeekOrigin.Begin);
                    await responseBodyStream.CopyToAsync(originalBodyStream);
                }

                // Extract user context
                requestLog.UserId = context.Items["DecryptedUserId"]?.ToString();
                requestLog.CompanyId = context.Items["DecryptedCompanyId"]?.ToString();
                requestLog.LocationId = context.Items["DecryptedLocationId"]?.ToString();
            }
            catch (Exception ex)
            {
                stopwatch.Stop();

                requestLog.ResponseStatusCode = 500;
                requestLog.ResponseTime = stopwatch.ElapsedMilliseconds;
                requestLog.IsSuccessful = false;
                requestLog.ExceptionMessage = ex.Message;

                _logger.LogError(ex, "Error occurred while processing request");

                // Try to capture error response
                try
                {
                    if (responseBodyStream.Length > 0)
                    {
                        requestLog.ResponseBody = await CaptureResponseBody(responseBodyStream, originalBodyStream);
                    }
                }
                catch { }

                throw;
            }
            finally
            {
                //  Restore original stream
                context.Response.Body = originalBodyStream;

                // Log to database asynchronously
                _ = Task.Run(async () => await LogRequestToDatabase(requestLog));
            }
        }

        private bool ShouldSkipLogging(PathString path)
        {
            if (!path.HasValue) return false;
            var pathValue = path.Value;
            return _pathsToSkip.Any(skip =>
                pathValue.StartsWith(skip, StringComparison.OrdinalIgnoreCase));
        }

        private bool ShouldCaptureResponseBody(HttpContext context)
        {
            var contentType = context.Response.ContentType?.ToLowerInvariant() ?? "";
            return !_contentTypesToSkip.Any(skip => contentType.StartsWith(skip));
        }

        private string GetClientIpAddress(HttpContext context)
        {
            var forwardedFor = context.Request.Headers["X-Forwarded-For"].FirstOrDefault();
            if (!string.IsNullOrEmpty(forwardedFor))
                return forwardedFor.Split(',')[0].Trim();

            var realIp = context.Request.Headers["X-Real-IP"].FirstOrDefault();
            if (!string.IsNullOrEmpty(realIp))
                return realIp;

            return context.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
        }

        private async Task<string?> CaptureRequestBody(HttpContext context)
        {
            try
            {
                context.Request.EnableBuffering();

                using var reader = new StreamReader(
                    context.Request.Body,
                    Encoding.UTF8,
                    detectEncodingFromByteOrderMarks: false,
                    bufferSize: 1024,
                    leaveOpen: true);

                var body = await reader.ReadToEndAsync();
                context.Request.Body.Position = 0;

                if (string.IsNullOrEmpty(body))
                    return null;

                // Truncate at 5KB
                if (body.Length > 5120)
                    return body.Substring(0, 5120) + $"... [TRUNCATED - Original: {body.Length} chars]";

                return body;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to capture request body");
                return null;
            }
        }

        private async Task<string?> CaptureResponseBody(MemoryStream responseBodyStream, Stream originalBodyStream)
        {
            try
            {
                if (responseBodyStream.Length == 0)
                    return null;

                responseBodyStream.Seek(0, SeekOrigin.Begin);

                using var reader = new StreamReader(
                    responseBodyStream,
                    Encoding.UTF8,
                    detectEncodingFromByteOrderMarks: false,
                    bufferSize: 1024,
                    leaveOpen: true);

                var responseBody = await reader.ReadToEndAsync();

                // Copy response back to original stream so client receives it
                responseBodyStream.Seek(0, SeekOrigin.Begin);
                await responseBodyStream.CopyToAsync(originalBodyStream);

                if (string.IsNullOrEmpty(responseBody))
                    return null;

                // Truncate at 5KB
                if (responseBody.Length > 5120)
                    return responseBody.Substring(0, 5120) + $"... [TRUNCATED - Original: {responseBody.Length} chars]";

                return responseBody;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to capture response body");

                // Still copy stream to client
                try
                {
                    responseBodyStream.Seek(0, SeekOrigin.Begin);
                    await responseBodyStream.CopyToAsync(originalBodyStream);
                }
                catch { }

                return null;
            }
        }

        private async Task LogRequestToDatabase(RequestLog requestLog)
        {
            try
            {
                using var scope = _serviceScopeFactory.CreateScope();
                var requestLogRepository = scope.ServiceProvider.GetRequiredService<IRequestLogRepository>();

                await requestLogRepository.LogRequestAsync(requestLog);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to log request to database");
            }
        }
    }
}
