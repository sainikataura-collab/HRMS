using Microsoft.AspNetCore.Authorization;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

public class AuthorizeCheckOperationFilter : IOperationFilter
{
    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        // Check if the endpoint has the [AllowAnonymous] attribute
        var hasAllowAnonymous = context.MethodInfo.GetCustomAttributes(true)
                                .OfType<AllowAnonymousAttribute>().Any()
                                || context.MethodInfo.DeclaringType.GetCustomAttributes(true)
                                   .OfType<AllowAnonymousAttribute>().Any();

        if (hasAllowAnonymous)
        {
            // If [AllowAnonymous] is present, we skip the authorization requirement
            return;
        }

        // Check if the endpoint has the [Authorize] attribute
        var hasAuthorize = context.MethodInfo.DeclaringType.GetCustomAttributes(true)
                              .OfType<AuthorizeAttribute>().Any()
                              || context.MethodInfo.GetCustomAttributes(true)
                                 .OfType<AuthorizeAttribute>().Any();

        if (hasAuthorize)
        {
            // Apply the Bearer token requirement if [Authorize] is present
            operation.Security = new List<OpenApiSecurityRequirement>
            {
                new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                        new string[] { }
                    }
                }
            };
        }
    }
}
