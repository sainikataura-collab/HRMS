using System.Threading.Tasks;

namespace HRMSWebAPI.Repository
{
    public interface IOtpRepository
    {
        Task<int> InsertOTPAsync(string mobileNo, string otp, int expiresInMinutes);
        Task<bool> VerifyOTPAsync(string mobileNo, string otp);
        Task<bool> CheckMobileExistsAsync(string mobileNo);
    }
}
