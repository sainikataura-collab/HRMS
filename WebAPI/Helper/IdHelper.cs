using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace HRMSWebAPI.Helper
{
    public static class IdHelper
    {
        public static (bool isValid, string? id, string message) ValidateAndDecryptId(string encryptedId, string fieldName)
        {
            // Since we're using URL-safe Base64, check if the Id is a valid URL-safe Base64 string
            var isIdValidBase64String = EncryptionStaticHelper.IsBase64String(EncryptionStaticHelper.ConvertFromUrlSafeBase64(encryptedId));
            if (!isIdValidBase64String)
            {
                return (false, null, $"Invalid {fieldName}. Please provide a valid {fieldName}.");
            }

            // Decrypt the Id using the URL-safe Base64 decryption method
            var decryptedIdString = EncryptionStaticHelper.DecryptFromUrlSafeBase64(encryptedId);

            if (string.IsNullOrEmpty(decryptedIdString))
            {
                return (false, null, $"Invalid {fieldName}. Please provide a valid {fieldName}.");
            }           

            // Return the parsed id if everything is valid
            return (true, decryptedIdString, string.Empty);
        }
        public static string? GetUserId(HubConnectionContext connection)
        {
            // Try to get from query string first (for testing without JWT)
            var userIdFromQuery = connection.GetHttpContext()?.Request.Query["userId"].ToString();
            if (!string.IsNullOrEmpty(userIdFromQuery))
            {
                Console.WriteLine($"✅ SignalR User Connected via Query: {userIdFromQuery}");
                return userIdFromQuery;
            }

            // Try to get from JWT token claims
            var userIdFromClaim = connection.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!string.IsNullOrEmpty(userIdFromClaim))
            {
                Console.WriteLine($"✅ SignalR User Connected via JWT: {userIdFromClaim}");
                return userIdFromClaim;
            }

            Console.WriteLine("⚠️ SignalR User Connected without userId");
            return null;
        }


    }
}





