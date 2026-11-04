using Microsoft.Extensions.Configuration;

namespace HRMSWebAPI.Helper
{
    public static class ConnectionString
    {
        private static IConfiguration _configuration;

        // Initialize IConfiguration
        public static void Initialize(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        // Method to get connection string by name
        public static string GetConnectionString(string name)
        {
            return _configuration.GetConnectionString(name);
        }
    }
}
