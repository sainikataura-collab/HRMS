using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using Dapper;
using Microsoft.AspNetCore.Mvc;
using System.Data;
using System.Net;


namespace HRMSWebAPI.Repository
{
    public interface IUserRepository
    {
        Task<string?> ChangePasswordAsync(string fk_empid, string password);
        public string Decrypt(string sData);
        public string Encrypt(string sData);

        //not in used
        public Task<CompanyValidationResult> ValidateCompanyCodeAsync(string companyCode);
        //not in used
        public Task<List<NameValue>> GetLocationByOfficeTypeAsync(string companyId, string officeTypeId);
       // login
        Task<UnifiedLoginDetail> LoginCompleteAsync(LoginModel loginModel, string ipAddress, string deviceInfo);
       // save otp 
        public Task<bool> SaveUserOTPAsync(string userId, string otp, string LocationId,string CompanyCode);

        //verify otp
        public Task<LoginResult> VerifyOtpAsync(string userId, string otp, string UserType);
       //reset passowrd
        Task<ModelResponse> ResetPasswordAsync(ResetPasswordRequest request);

        public Task<bool> VerifyOldPasswordAsync(string userId, string userType, string oldPassword);

        // for switching 
        Task<dynamic> SwitchEmployeeToAdminAsync(SwitchEmployeeToAdminDto model);

        Task<dynamic> SwitchAdmintoEmployeeAsync(SwitchEmployeeToAdminDto model);
    }


}
