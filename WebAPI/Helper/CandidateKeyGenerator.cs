using System;
using System.Security.Cryptography;

public static class CandidateKeyGenerator
{
    
    /// Generate a URL-safe unique key for candidate onboarding
    /// No encryption needed - just a cryptographically secure random string
   
    public static string GenerateUrlSafeKey()
    {
        // Generate 32 random bytes (256 bits of entropy)
        //byte[] randomBytes = new byte[32];
        byte[] randomBytes = new byte[64];
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(randomBytes);
        }

        // Convert to URL-safe Base64
        return Convert.ToBase64String(randomBytes)
            .Replace('+', '-')
            .Replace('/', '_')
            .TrimEnd('=');
    }

    
}