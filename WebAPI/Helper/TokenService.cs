

using Microsoft.IdentityModel.Tokens;
using System;
using System.Security.Claims;
using System.Text;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Cryptography;

public class TokenService
{
    private readonly IConfiguration _configuration;

    public TokenService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string GenerateAccessToken(string userId,string locationId, string companyId,string financialYearId)
    {
        var claims = new[]
        {
             //new Claim("UserType", "User"),// Custom claim for jyoti
            new Claim(JwtRegisteredClaimNames.Sub, userId), // User ID as the subject
            new Claim("Loc", locationId),// Custom claim for locationId //encrypted one
            new Claim("Com", companyId),// Custom claim for companyId //encrypted one
           new Claim("FY", financialYearId),// Custom claim for companyId //encrypted one
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()), // Unique identifier for the token
            new Claim(JwtRegisteredClaimNames.Iat, DateTime.UtcNow.ToString()), // Issued at
        };

        // Define token expiration
        var expirationTime = DateTime.UtcNow.AddMinutes(600*24); // Token valid for 30 minutes //changed to 30Minutes for testing
                                                              // Console.WriteLine($"Token issued at: {DateTime.UtcNow}, expires at: {expirationTime}"); // Log token lifetime

        // Create security key and credentials
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        // Create the token
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = expirationTime,
            SigningCredentials = creds,
            Issuer = _configuration["Jwt:Issuer"],
            Audience = _configuration["Jwt:Audience"]
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token); // Return the generated token
    }


   


   /// Generate Refresh Token
        public string GenerateRefreshToken()
    {
        var randomNumber = new byte[32];
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }
    }

    //Generate reset token during forgot password
    public string GenerateResetTokenForForgotPassword()
    {
        var randomNumber = new byte[32];
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber)
                .Replace("+", "-")  // Replace '+' with '-'
                .Replace("/", "_")  // Replace '/' with '_'
                .TrimEnd('=');      // Remove padding '='
        }
    }


    ////Employee login


    //public string EmpGenerateAccessToken(string userId)
    //{
    //    var claims = new[]
    //    {
    //            new Claim("UserType", "Employee"),// Custom claim for jyoti
    //        new Claim(JwtRegisteredClaimNames.Sub, userId), // User ID as the subject
    //        new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()), // Unique identifier for the token
    //        new Claim(JwtRegisteredClaimNames.Iat, DateTime.UtcNow.ToString()), // Issued at
    //    };

    //    // Define token expiration
    //    var expirationTime = DateTime.UtcNow.AddMinutes(600 * 24); // Token valid for 30 minutes //changed to 30Minutes for testing
    //                                                               // Console.WriteLine($"Token issued at: {DateTime.UtcNow}, expires at: {expirationTime}"); // Log token lifetime

    //    // Create security key and credentials
    //    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
    //    var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

    //    // Create the token
    //    var tokenDescriptor = new SecurityTokenDescriptor
    //    {
    //        Subject = new ClaimsIdentity(claims),
    //        Expires = expirationTime,
    //        SigningCredentials = creds,
    //        Issuer = _configuration["Jwt:Issuer"],
    //        Audience = _configuration["Jwt:Audience"]
    //    };

    //    var tokenHandler = new JwtSecurityTokenHandler();
    //    var token = tokenHandler.CreateToken(tokenDescriptor);
    //    return tokenHandler.WriteToken(token); // Return the generated token
    //}



}
