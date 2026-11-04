using HRMSWebAPI.Models;
using Dapper;
using System.Data;
using HRMSWebAPI.Helper;
using System.Net;
using static System.Net.WebRequestMethods;
using Microsoft.AspNetCore.Mvc;
using System.Data.Common;
using static Dapper.SqlMapper;


namespace HRMSWebAPI.Repository
{
    public class UserRepository : IUserRepository
    {
        public async Task<string?> ChangePasswordAsync(string fk_empid, string password)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@fk_empid", fk_empid, DbType.String);
            dynamicParameters.Add("@password", password, DbType.String);


            return DataBaseFactory
                .QuerySP<string>("Comm_ChangePassword_WebUserNew", dynamicParameters, "Change Password")
                .FirstOrDefault();
        }

        public string Encrypt(string sData)
        {
            try
            {
                byte[] encData_byte = new byte[sData.Length];
                encData_byte = System.Text.Encoding.UTF8.GetBytes(sData);
                string encodedData = Convert.ToBase64String(encData_byte); return encodedData;
            }
            catch (Exception ex)
            {
                throw new Exception("Error in base64Encode" + ex.Message);
            }
        }

        public string Decrypt(string sData)
        {
            System.Text.UTF8Encoding encoder = new System.Text.UTF8Encoding();
            System.Text.Decoder utf8Decode = encoder.GetDecoder();
            byte[] todecode_byte = Convert.FromBase64String(sData);
            int charCount = utf8Decode.GetCharCount(todecode_byte, 0, todecode_byte.Length);
            char[] decoded_char = new char[charCount];
            utf8Decode.GetChars(todecode_byte, 0, todecode_byte.Length, decoded_char, 0);
            string result = new String(decoded_char); return result;
        }

        public async Task<CompanyValidationResult> ValidateCompanyCodeAsync(string companyCode)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@CompanyCode", (object)companyCode, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            //var resultTuple = DataBaseFactory.QueryMultipleSP<CompanyValidationResult>(
            //    "General_ValidateCompanyCode",
            //    dynamicParameters,
            //    "General_ValidateCompanyCode");

            //var companyDetails = resultTuple.Item1?.FirstOrDefault();
            ////var officeTypes = resultTuple.Item2?.ToList() ?? new List<NameValue>();

            //return (companyDetails);
            var companyDetails = DataBaseFactory.QuerySP<CompanyValidationResult>("General_ValidateCompanyCode",dynamicParameters,"General_ValidateCompanyCode")?.FirstOrDefault();

            return companyDetails;

        }

        //not in used
        public async Task<List<NameValue>> GetLocationByOfficeTypeAsync(string companyId, string officeTypeId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@OfficeTypeId", (object)officeTypeId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@CompanyId", (object)companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());


            var data = DataBaseFactory.QuerySP<NameValue>("General_GetLocationByOfficeType", dynamicParameters, "Location Dropdown");

            return data?.ToList() ?? [];
        }
        //not in used
         public async Task<UnifiedLoginDetail> LoginCompleteAsync(LoginModel loginModel, string ipAddress, string deviceInfo)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@LoginID", loginModel.LoginId, DbType.String);
            dynamicParameters.Add("@Password", loginModel.Password, DbType.String);
            dynamicParameters.Add("@compCode", loginModel.CompanyCode, DbType.String);

            try
            {
                //  Call the stored procedure - it returns 4 result sets:
                // 1. Main login data
                // 2. System parameters (from Sp_Sel_System_Parameter)
                // 3. Financial year info
                // 4. Role details

                var resultTuple = DataBaseFactory.QueryMultipleSP<UnifiedLoginDetail, dynamic, FinancialYearInfo, RoleInfo,dynamic>(
                    "UM_SP_Login",
                    dynamicParameters,
                    "UM_SP_Login_Execution"
                );

                var result = new UnifiedLoginDetail();

                //  RESULT SET 1: Main Login Data
                if (resultTuple.Item1?.Any() == true)
                {
                    var loginData = resultTuple.Item1.FirstOrDefault();

                    if (loginData != null)
                    {
                        // Map all fields from first result set
                        result.LoginType = loginData.LoginType;
                        result.ShowAdminSwitch = loginData.ShowAdminSwitch;
                        result.pk_userId = loginData.pk_userId;
                        result.fk_roleId = loginData.fk_roleId;
                        result.UserId = loginData.UserId;
                        result.name = loginData.name;
                        result.email = loginData.email;
                        result.fk_locid = loginData.fk_locid;
                        result.FinStartDate = loginData.FinStartDate;
                        result.FinEndDate = loginData.FinEndDate;
                        result.FinancialYearId = loginData.FinancialYearId;
                        result.CompanyCode = loginData.CompanyCode;
                        result.CompanyName = loginData.CompanyName;
                        result.CompanyId = loginData.CompanyId;
                    }
                }

                // RESULT SET 2: System Parameters (if needed)
                // var systemParams = resultTuple.Item2;
                // Process system parameters if required

                //  RESULT SET 3: Financial Year Info
                if (resultTuple.Item3?.Any() == true)
                {
                    var finData = resultTuple.Item3.FirstOrDefault();
                    if (finData != null)
                    {
                        result.pk_finid = finData.PkFinId;
                        result.date1 = finData.Date1;
                        result.date2 = finData.Date2;
                        result.CompanyId = finData.PkCompanyId;
                        result.compname = finData.CompName;
                    }
                }

                // RESULT SET 4: Role Details
                if (resultTuple.Item4?.Any() == true)
                {
                    var roleData = resultTuple.Item4.FirstOrDefault();
                    if (roleData != null)
                    {
                        result.RoleId = roleData.PkRoleId;
                        result.RoleName = roleData.RoleName;
                        result.RoleAlias = roleData.MappedAlias;
                        result.RoleLevel = roleData.RoleLevel;
                        result.RoleRemarks = roleData.Remarks;
                    }
                }

                if (resultTuple.Item5?.Any() == true)
                {
                    var configData = resultTuple.Item5.FirstOrDefault();
                    if (configData != null)
                    {
                        result.isotprequired = configData.isotprequired;
                        result.contractor_LabelName = configData.contractor_LabelName;
                        result.ContractorApplicable = configData.ContractorApplicable;
                        result.showclientdetails = configData.showclientdetails;
                        result.vendor_Applicable = configData.Vendor_Applicable;
                        result.isAutoEmpcode = configData.isAutoEmpcode;


                    }
                }

                //  Validate login success
                if (string.IsNullOrEmpty(result.UserId) && string.IsNullOrEmpty(result.pk_userId))
                {
                    result.IsLoginSuccessfull = false;
                    result.Message = "Invalid credentials.";
                }
                else
                {
                    result.IsLoginSuccessfull = true;
                    result.Message = "Successfully Login";
                }

                return result;
            }
            catch (Exception ex)
            {
                return new UnifiedLoginDetail
                {
                    IsLoginSuccessfull = false,
                    Message = $"Login failed: {ex.Message}"
                };
            }
        }
        public async Task<bool> SaveUserOTPAsync(string userId, string otp,
           string LocationId,
            string CompanyCode)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@UserId", userId);
            dynamicParameters.Add("@OTP", otp);
           dynamicParameters.Add("@fk_locid", LocationId);
            dynamicParameters.Add("@compCode", CompanyCode);
            dynamicParameters.Add("@Expiry", DateTime.Now.AddMinutes(5)); // OTP expiry time set to 5 minutes


            // Optional: You can add ExpiryTime in SP using DATEADD in SQL itself

            var n = DataBaseFactory.QuerySP("SaveUserOTP", dynamicParameters, "SaveUserOTP");

            return n > 0;
        }


        public async Task<LoginResult> VerifyOtpAsync(string userId, string otp, string UserType)
        {
            // Initialize dynamic parameters to pass to the stored procedure
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Add parameters to DynamicParameters
            dynamicParameters.Add("@UserId", (object)userId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Otp", (object)otp, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());


            //if (UserType == "User" || UserType == "UserEmployee")
            if (UserType == "User")
            {

                var resultTuple = DataBaseFactory.QueryMultipleSP<UserAuthenticationDetail, dynamic, FinancialYearInfo, RoleInfo, dynamic, dynamic>("VerifyUserOtp", (object)dynamicParameters, "VerifyUserOtp");

                var result = new LoginResult();

                // Map User Authentication Details
                if (resultTuple.Item1?.Any() == true)
                {
                    var data = resultTuple.Item1.FirstOrDefault();
                    if (data != null)
                    {
                        result.UserId = !string.IsNullOrWhiteSpace(data.pk_userId)
       ? data.pk_userId
       : data.UserId;

                        result.UserName = data.Name;
                        result.UserEmail = data.email;
                    }
                }

                // Map Financial Year Info
                if (resultTuple.Item3?.Any() == true)
                {
                    var data = resultTuple.Item3.FirstOrDefault();
                    if (data != null)
                    {
                        result.CompanyId = data.PkCompanyId;
                        result.FinancialYearId = data.PkFinId;
                        result.Date1 = data.Date1;
                        result.Date2 = data.Date2;
                        result.CompanyName = data.CompName ?? data.CompanyName;
                    }
                }

                // Map Role Info
                if (resultTuple.Item4?.Any() == true)
                {
                    var roleData = resultTuple.Item4.FirstOrDefault();
                    if (roleData != null)
                    {
                        result.pk_roleId = roleData.PkRoleId;
                        result.rolename = roleData.RoleName;
                    }
                }

                // Fallback: Check Item1 FkRoleId if pk_roleId is still null
                if (result.pk_roleId == null && resultTuple.Item1?.Any() == true)
                {
                    var data = resultTuple.Item1.FirstOrDefault();
                    if (data != null && data.FkRoleId > 0)
                    {
                        result.pk_roleId = data.FkRoleId;
                    }
                }

                if (resultTuple.Item6 != null)
                {
                    var locationData = ((IEnumerable<dynamic>)resultTuple.Item6).FirstOrDefault();

                    if (locationData != null)
                    {
                        // Assuming the column name returned by the SP is exactly "fk_locid"
                        result.LocationId = locationData.fk_locid;
                        result.ContractorApplicable = locationData.ContractorApplicable;
                        result.contractor_LabelName = locationData.contractor_LabelName;

                        try
                        {
                            if (locationData.pk_roleId != null)
                            {
                                result.pk_roleId = Convert.ToInt32(locationData.pk_roleId);
                            }
                            if (locationData.rolename != null)
                            {
                                result.rolename = locationData.rolename.ToString();
                            }
                        }
                        catch { }
                    }
                }



                if (string.IsNullOrEmpty(result.UserId) || string.IsNullOrEmpty(result.CompanyId))
                {
                    result.IsLoginSuccessfull = false;
                    result.Message = "Invalid credentials or missing company details.";
                }
                else
                {
                    result.IsLoginSuccessfull = true;
                    result.Message = "Successfully Login";
                }

                return result;
            }
            else
            {
                var resultTuple = DataBaseFactory.QueryMultipleSP<LoginResult, dynamic, dynamic, dynamic, dynamic, dynamic>("VerifyEmpOtp", (object)dynamicParameters, "VerifyUserOtp");

                var result = new LoginResult();

                // Map User Authentication Details
                if (resultTuple.Item1 != null && resultTuple.Item1.Any())
                {
                    var data = resultTuple.Item1.FirstOrDefault();
                    if (data != null)
                    {
                        result.UserId = data.UserId;
                        result.UserName = data.Name;
                        result.CompanyId = data.CompanyId;
                        result.DepartmentId = data.DepartmentId;
                        result.LocationId = data.fk_locid;
                        result.FinancialYearId = data.FinancialYearId;
                        result.CompanyName = data.CompanyName;
                        if (data.pk_roleId != null)
                        {
                            result.pk_roleId = data.pk_roleId;
                        }
                        if (!string.IsNullOrEmpty(data.rolename))
                        {
                            result.rolename = data.rolename;
                        }

                    }
                }
                if (resultTuple.Item5 != null && resultTuple.Item5.Any())
                {
                    var configData = resultTuple.Item5.FirstOrDefault();
                    if (configData != null)
                    {
                        result.contractor_LabelName = configData.contractor_LabelName;
                    }
                }
                // Map Financial Year Info
                if (resultTuple.Item6 != null && resultTuple.Item6.Any())
                {
                    var data = resultTuple.Item6.FirstOrDefault();
                    if (data != null)
                    {

                        result.Message = data.Message;
                        result.IsValid = data.IsValid;
                        //result.LoginUserName = data.LoginUserName;
                        //result. = data.Password;
                    }
                }


                if (string.IsNullOrEmpty(result.UserId))
                {
                    result.IsLoginSuccessfull = false;
                    result.Message = "Invalid credentials or missing company details.";
                }
                else
                {
                    result.IsLoginSuccessfull = true;
                    result.Message = "Successfully Login";
                }

                return result;
            }

        }



        //public async Task<LoginResult> VerifyOtpAsync(string userId, string otp, string UserType)
        //    {
        //        // Initialize dynamic parameters to pass to the stored procedure
        //        DynamicParameters dynamicParameters = new DynamicParameters();

        //        // Add parameters to DynamicParameters
        //        dynamicParameters.Add("@UserId", (object)userId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //        dynamicParameters.Add("@Otp", (object)otp, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());


        //        //if (UserType == "User" || UserType == "UserEmployee")
        //        if (UserType == "User")
        //        {

        //            var resultTuple = DataBaseFactory.QueryMultipleSP<UserAuthenticationDetail, dynamic, FinancialYearInfo, RoleInfo,dynamic, dynamic>("VerifyUserOtp", (object)dynamicParameters, "VerifyUserOtp");

        //            var result = new LoginResult();

        //            // Map User Authentication Details
        //            if (resultTuple.Item1?.Any() == true)
        //            {
        //                var data = resultTuple.Item1.FirstOrDefault();
        //                if (data != null)
        //                {
        //                    result.UserId = !string.IsNullOrWhiteSpace(data.pk_userId)
        //   ? data.pk_userId
        //   : data.UserId;

        //                    result.UserName = data.Name;
        //                    result.UserEmail = data.email;
        //                }
        //            }

        //            // Map Financial Year Info
        //            if (resultTuple.Item3?.Any() == true)
        //            {
        //                var data = resultTuple.Item3.FirstOrDefault();
        //                if (data != null)
        //                {
        //                    result.CompanyId = data.PkCompanyId;
        //                    result.FinancialYearId = data.PkFinId;
        //                    result.Date1 = data.Date1;
        //                    result.Date2 = data.Date2;
        //                    result.CompanyName = data.CompName ?? data.CompanyName;
        //                }
        //            }

        //            if (resultTuple.Item6 != null)
        //            {
        //                var locationData = ((IEnumerable<dynamic>)resultTuple.Item6).FirstOrDefault();

        //                if (locationData != null)
        //                {
        //                    // Assuming the column name returned by the SP is exactly "fk_locid"
        //                    result.LocationId = locationData.fk_locid;
        //                    result.ContractorApplicable = locationData.ContractorApplicable;
        //                    result.contractor_LabelName = locationData.contractor_LabelName;
        //                    result.pk_roleId = locationData.pk_roleId;
        //                    result.rolename = locationData.rolename;
        //                }
        //            }



        //            if (string.IsNullOrEmpty(result.UserId) || string.IsNullOrEmpty(result.CompanyId))
        //            {
        //                result.IsLoginSuccessfull = false;
        //                result.Message = "Invalid credentials or missing company details.";
        //            }
        //            else
        //            {
        //                result.IsLoginSuccessfull = true;
        //                result.Message = "Successfully Login";
        //            }

        //            return result;
        //        }
        //        else
        //        {
        //            var resultTuple = DataBaseFactory.QueryMultipleSP<LoginResult, dynamic,dynamic,dynamic,dynamic,dynamic>("VerifyEmpOtp", (object)dynamicParameters, "VerifyUserOtp");

        //            var result = new LoginResult();

        //            // Map User Authentication Details
        //            if (resultTuple.Item1 != null && resultTuple.Item1.Any())
        //            {
        //                var data = resultTuple.Item1.FirstOrDefault();
        //                if (data != null)
        //                {
        //                    result.UserId = data.UserId;
        //                    result.UserName = data.Name;
        //                    result.CompanyId = data.CompanyId;
        //                    result.DepartmentId = data.DepartmentId;
        //                    result.LocationId = data.fk_locid;
        //                    result.FinancialYearId = data.FinancialYearId;
        //                    result.CompanyName = data.CompanyName;
        //                    if (data.pk_roleId != null)
        //                    {
        //                        result.pk_roleId = data.pk_roleId;
        //                    }
        //                    if (!string.IsNullOrEmpty(data.rolename))
        //                    {
        //                        result.rolename = data.rolename;
        //                    }


        //                }
        //            }
        //            if (resultTuple.Item5 != null && resultTuple.Item5.Any())
        //            {
        //                var configData = resultTuple.Item5.FirstOrDefault();
        //                if (configData != null)
        //                {
        //                    result.contractor_LabelName = configData.contractor_LabelName;
        //                }
        //            }
        //            // Map Financial Year Info
        //            if (resultTuple.Item6 != null && resultTuple.Item6.Any())
        //            {
        //                var data = resultTuple.Item6.FirstOrDefault();
        //                if (data != null)
        //                {

        //                    result.Message = data.Message;
        //                    result.IsValid = data.IsValid;
        //                    //result.LoginUserName = data.LoginUserName;
        //                    //result. = data.Password;
        //                }
        //            }


        //            if (string.IsNullOrEmpty(result.UserId))
        //            {
        //                result.IsLoginSuccessfull = false;
        //                result.Message = "Invalid credentials or missing company details.";
        //            }
        //            else
        //            {
        //                result.IsLoginSuccessfull = true;
        //                result.Message = "Successfully Login";
        //            }

        //            return result;
        //        }

        //    }

        // Reset password
        public async Task<ModelResponse> ResetPasswordAsync(ResetPasswordRequest request)
        {
            var response = new ModelResponse();
            try
            {
                DynamicParameters param = new DynamicParameters();

                if (request.UserType == "User") // For Admin/User
                {
                    param.Add("@UserID", request.UserId, DbType.String);
                    param.Add("@newpwd", request.NewPassword, DbType.String);

                     DataBaseFactory.QuerySP<dynamic>(
                        "UM_SP_ChangePassword",
                        param,
                        "Reset_User_Password"
                    );

                    response.IsSuccess = true;
                    response.Message = "User password reset successfully.";
                    response.StatusCode = 200;
                }
                else // For Employee
                {
                    param.Add("@fk_empid", request.UserId, DbType.String);
                    param.Add("@password", request.NewPassword, DbType.String);

                    DataBaseFactory.QuerySP<dynamic>(
                        "UM_EMP_Password_Reset",
                        param,
                        "Reset_Employee_Password"
                    );

                    response.IsSuccess = true;
                    response.Message = "Employee password reset successfully.";
                    response.StatusCode = 200;
                }
            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.Message = $"Error resetting password: {ex.Message}";
                response.StatusCode = 500;
            }

            return response;
        }
       //verfy old password
        public async Task<bool> VerifyOldPasswordAsync(string userId, string userType, string oldPassword)
        {
            try
            {
                DynamicParameters param = new DynamicParameters();

                //if (userType == "User")
                //{
                //    oldPassword = Encrypt(oldPassword); // Encrypt for comparison
                //}

                param.Add("@UserID", userId, DbType.String);
                param.Add("@UserType", userType, DbType.String);
                param.Add("@OldPassword", oldPassword, DbType.String);
                param.Add("@IsValid", dbType: DbType.Boolean, direction: ParameterDirection.Output);

                DataBaseFactory.QuerySP<dynamic>(
                    "UM_SP_VerifyOldPassword",
                    param,
                    "Verify_Old_Password"
                );

                bool isValid = param.Get<bool>("@IsValid");
                return isValid;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error verifying old password: {ex.Message}");
            }
        }

        public async Task<dynamic> SwitchEmployeeToAdminAsync(SwitchEmployeeToAdminDto model)
        {
            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("@EmpCode", model.EmpCode, DbType.String);
            parameters.Add("@CompCode",model. CompCode, DbType.String);

            var result =  DataBaseFactory.QuerySP<dynamic>(
                "UM_SP_SwitchEmployeeToAdmin",
                parameters,
                "UM_SP_SwitchEmployeeToAdmin"
            );

            return result.FirstOrDefault(); // returns dynamic row
        }

        public async Task<dynamic> SwitchAdmintoEmployeeAsync(SwitchEmployeeToAdminDto model)
        {
            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("@UserId", model.EmpCode, DbType.String);
            parameters.Add("@CompCode", model.CompCode, DbType.String);

            var result = DataBaseFactory.QuerySP<dynamic>(
                "UM_SP_SwitchAdminToEmployee",
                parameters,
                "UM_SP_SwitchAdminToEmployee"
            );

            return result.FirstOrDefault(); // returns dynamic row
        }

    }
}