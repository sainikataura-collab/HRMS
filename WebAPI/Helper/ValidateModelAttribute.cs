


using HRMSWebAPI.Models;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using System.Reflection;
using HRMSWebAPI.Helper;

public class ValidateModelAttribute : ActionFilterAttribute
{
    public override void OnActionExecuting(ActionExecutingContext context)
    {
        var errors = new List<string>();

        // 1. Process existing model state errors (e.g., for [Required], [Range], etc.)
        if (!context.ModelState.IsValid)
        {
            foreach (var entry in context.ModelState)
            {
                // Get the property name from the model
                var field = entry.Key.StartsWith("$.") ? entry.Key.Substring(2) : entry.Key;
                var errorsList = entry.Value.Errors;

                foreach (var error in errorsList)
                {
                    errors.Add($"{field}: {error.ErrorMessage}");
                }
            }
        }

        // 2. Check for type mismatches or null values for required fields (invalid data types)
        var model = context.ActionArguments.Values.FirstOrDefault(); // Assuming the model is the first argument

        if (model != null)
        {
            // Use reflection to check all properties of the model
            var properties = model.GetType().GetProperties(BindingFlags.Public | BindingFlags.Instance);
            foreach (var property in properties)
            {
                // Skip properties with index parameters (e.g., indexers)
                if (property.GetIndexParameters().Length > 0)
                {
                    continue; // Skip properties that are indexed (e.g., collections, indexers)
                }

                var value = property.GetValue(model); // Fetch the value
                var propertyType = property.PropertyType;

                // Check if the property is marked with [Required] attribute
                var isRequired = property.GetCustomAttribute<RequiredAttribute>() != null;

                // If the property is required and null, or it has a type mismatch, generate the appropriate error message
                if (value == null && isRequired)
                {
                    // Add error messages only if the field is required and null
                    if (propertyType == typeof(int) || propertyType == typeof(int?))
                    {
                        errors.Add($"The field {property.Name} must be a valid integer.");
                    }
                    else if (propertyType == typeof(bool) || propertyType == typeof(bool?))
                    {
                        errors.Add($"The field {property.Name} must be a valid boolean.");
                    }
                    else if (propertyType == typeof(string))
                    {
                        errors.Add($"The field {property.Name} must be a valid string.");
                    }
                    else if (propertyType == typeof(long) || propertyType == typeof(long?))
                    {
                        errors.Add($"The field {property.Name} must be a valid long.");
                    }
                    else if (propertyType == typeof(float) || propertyType == typeof(float?))
                    {
                        errors.Add($"The field {property.Name} must be a valid float.");
                    }
                    else if (propertyType == typeof(byte) || propertyType == typeof(byte?))
                    {
                        errors.Add($"The field {property.Name} must be a valid byte.");
                    }
                    else if (propertyType == typeof(short) || propertyType == typeof(short?))
                    {
                        errors.Add($"The field {property.Name} must be a valid short.");
                    }
                }
            }
        }

        // 3. If there are any errors, return them in the response
        if (errors.Count > 0)
        {
            var modelResponse = new ModelResponse
            {
                IsSuccess = false,
                Message = string.Join("; ", errors),
                StatusCode = 400
            };

            context.Result = new OkObjectResult(modelResponse);
        }
    }
}
