using Dapper;
using HRMSWebAPI.Helper;
using System;
using System.Data;
using System.Linq;
using System.Threading.Tasks;

namespace HRMSWebAPI.Repository
{
    public class OtpRepository : IOtpRepository
    {
        public async Task<int> InsertOTPAsync(string mobileNo, string otp, int expiresInMinutes)
        {
            try
            {
                DynamicParameters param = new DynamicParameters();
                param.Add("@MobileNo", mobileNo, DbType.String);
                param.Add("@OTP", otp, DbType.String);
                param.Add("@ExpiresInMinutes", expiresInMinutes, DbType.Int32);

                int result = DataBaseFactory.QuerySP("sp_InsertOTP", param, "OTP_Insert");
                return await Task.FromResult(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Insert OTP Error: " + ex.Message);
                return 0;
            }
        }

        public async Task<bool> VerifyOTPAsync(string mobileNo, string otp)
        {
            try
            {
                DynamicParameters param = new DynamicParameters();
                param.Add("@MobileNo", mobileNo, DbType.String);
                param.Add("@OTP", otp, DbType.String);

                // Use the synchronous DataBaseFactory method with dynamic to avoid reference type constraint
                var result = DataBaseFactory.QuerySP<dynamic>("sp_VerifyOTP", param, "OTP_Verify");
                var row = result.FirstOrDefault();
                
                bool isVerified = false;
                if (row != null)
                {
                    // Map the returned IsValid column safely
                    isVerified = Convert.ToBoolean(row.IsValid);
                }
                
                return await Task.FromResult(isVerified);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Verify OTP Error: " + ex.Message);
                return false;
            }
        }

        public async Task<bool> CheckMobileExistsAsync(string mobileNo)
        {
            try
            {
                DynamicParameters param = new DynamicParameters();
                param.Add("@MobileNo", mobileNo, DbType.String);

                var result = DataBaseFactory.QuerySP<dynamic>("sp_CheckMobileExists", param, "CheckMobileExists");
                var row = result.FirstOrDefault();

                bool exists = false;
                if (row != null)
                {
                    exists = Convert.ToBoolean(row.Exists);
                }

                return await Task.FromResult(exists);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Check Mobile Exists Error: " + ex.Message);
                return false;
            }
        }
    }
}
