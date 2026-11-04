
namespace HRMSWebAPI.Helper
{
    public static class OTPHelper
    {
        // Generates a random OTP with the specified length
        public static string GenerateOtp(int length = 6)
        {
            const string characters = "0123456789";
            Random random = new();
            return new string(Enumerable.Repeat(characters, length)
                                        .Select(s => s[random.Next(s.Length)])
                                        .ToArray());
        }
    }
}
