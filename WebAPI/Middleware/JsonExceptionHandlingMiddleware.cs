using System.Net;
using System.Text.Json;
using HRMSWebAPI.Models;

public class JsonExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;

    public JsonExceptionHandlingMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (JsonException ex)
        {
            // Handle JSON parsing errors (e.g., invalid format, invalid data type)
            var modelResponse = new ModelResponse
            {
                IsSuccess = false,
                Message = $"Invalid JSON format or data type: {ex.Message}",
                Data = null,
                StatusCode = 400
            };

            //context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
            context.Response.StatusCode = (int)HttpStatusCode.OK;
            //sending 200 to make consistent return,though returning StatusCode 400 in response model
            context.Response.ContentType = "application/json";

            var response = JsonSerializer.Serialize(modelResponse);
            await context.Response.WriteAsync(response);
        }
        catch (Exception ex)
        {
            // Handle other exceptions
            var modelResponse = new ModelResponse
            {
                IsSuccess = false,
                Message = $"An unexpected error occurred: {ex.Message}",
                Data = null,
                StatusCode=500
            };

            //context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;            
            context.Response.StatusCode = (int)HttpStatusCode.OK;
            //sending 200 to make consistent return,though returning StatusCode 500 in response model
            context.Response.ContentType = "application/json";

            var response = JsonSerializer.Serialize(modelResponse);
            await context.Response.WriteAsync(response);
        }
    }
}
