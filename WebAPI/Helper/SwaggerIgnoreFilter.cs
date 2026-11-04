using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using System.Reflection;

namespace HRMSWebAPI.Helper
{
    public class SwaggerIgnoreFilter : ISchemaFilter
    {
        public void Apply(OpenApiSchema schema, SchemaFilterContext context)
        {
            if (schema?.Properties == null || context?.Type == null) return;

            var propertiesToIgnore = context.Type.GetProperties()
                .Where(prop => prop.GetCustomAttribute<SwaggerIgnoreAttribute>() != null);

            foreach (var property in propertiesToIgnore)
            {
                var propertyToRemove = schema.Properties.Keys
                    .SingleOrDefault(x => x.ToLower() == property.Name.ToLower());

                if (propertyToRemove != null)
                {
                    schema.Properties.Remove(propertyToRemove);
                }
            }

            foreach (var property in propertiesToIgnore)
            {
                var propertyName = property.Name.ToLowerInvariant();
                if (schema.Properties.ContainsKey(propertyName))
                {
                    schema.Properties.Remove(propertyName);
                }
            }
        }
    }

    [AttributeUsage(AttributeTargets.Property)]
    public class SwaggerIgnoreAttribute : Attribute { }
}
