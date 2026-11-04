using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;
using System.Net;

namespace HRMSWebAPI.Repository
{
    public class UserMasterRepository : IUserMasterRepository
    {




        public async Task<bool> InsertAadhaarAsync(AadhaarModel model)
        {
            try
            {
                DynamicParameters param = new DynamicParameters();

                // Wrap inside dataset (same pattern as Candidate)


                // Convert to XML
                string xmlData = XmlUtility.XmlSerializeToString(model);

                // Add XML parameter
                param.Add("@xmlDoc", xmlData, DbType.String);

                // Execute SP
                int result = await DataBaseFactory.QuerySPAsync(
                              "KYC_AadhaarVerification_Ins",
                              param,
                              "Aadhaar_Insert");

                return result > 0;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Insert Aadhaar Error: " + ex.Message);
                return false;
            }
        }

        public async Task<bool> InsertPANAsync(PANModel model)
        {
            try
            {
                DynamicParameters param = new DynamicParameters();

                // Convert to XML
                string xmlData = XmlUtility.XmlSerializeToString(model);

                // Add XML parameter
                param.Add("@xmlDoc", xmlData, DbType.String);

                // Execute SP
                int result = await DataBaseFactory.QuerySPAsync(
                    "KYC_PANVerification_Ins",
                    param,
                    "PAN_Insert");

                return result > 0;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Insert PAN Error: " + ex.Message);
                return false;
            }
        }






        public async Task<bool> InsertUserAsync(List<UserMst> userList, string fk_insUserID, string fk_locID, string fk_companyId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Wrap the model in the required dataset structure
            UserMsttDataSet dataset = new UserMsttDataSet { UserMst = userList };

            // Serialize to XML
            string xmlData = XmlUtility.XmlSerializeToString(dataset);

            // Add parameters exactly as in the stored procedure
            dynamicParameters.Add("@xmlDoc", (object)xmlData, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_userId", (object)fk_insUserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_locid", (object)fk_locID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            // Log XML for debugging
            Console.WriteLine("Generated XML:\n" + xmlData);

            // Execute stored procedure
            int result = await DataBaseFactory.QuerySPAsync("UM_Users_Ins", dynamicParameters, "User_Insert");
            return result > 0;
        }

        public async Task<(int totalCount, IEnumerable<UserMst>)> GetAllUsersAsync(int pageIndex, int pageSize, string fk_userId, string fk_companyId, string searchText = "")
        { 
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Add parameters matching the stored procedure
            dynamicParameters.Add("@pageindex", (object)pageIndex, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pageSize, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_userId", (object)fk_userId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@SearchText", (object)(searchText ?? ""), new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            // Execute stored procedure using QueryMultipleSP
            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, UserMst>("UM_Users_SelForGrid", dynamicParameters, "User_GetAll");

            if (tuple == null || tuple.Item2 == null)
                return (0, new List<UserMst>());

            // Extract totalCount safely
            int totalCount = 0;
            if (tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any())
            {
                var firstItem = totalList.First() as IDictionary<string, object>;
                if (firstItem != null && firstItem.Values.Any())
                {
                    totalCount = Convert.ToInt32(firstItem.Values.First());
                }
            }
            return (totalCount, tuple.Item2?.ToList() ?? new List<UserMst>());
        }

        public async Task<UserMst> GetUserByIdAsync(string pk_userId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_userId", (object)pk_userId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            // Execute stored procedure and fetch result
            var result = await DataBaseFactory.QuerySPAsync<UserMst>("UM_Users_Edit", (object)dynamicParameters, "User_GetById");

            return result.FirstOrDefault();
        }

        public async Task<bool> UpdateUserAsync(List<UserMst> userList, string fk_updUserID, string fk_locID, string pk_userId, byte[] timestamp)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            UserMsttDataSet dataset = new UserMsttDataSet { UserMst = userList };

            string xmlData = XmlUtility.XmlSerializeToString(dataset);

            dynamicParameters.Add("@pk_userId", (object)pk_userId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@xmlDoc", (object)xmlData, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_userId", (object)fk_updUserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_locid", (object)fk_locID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Timestamp", (object)timestamp, new DbType?(DbType.Binary), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            // Log XML for debugging
            Console.WriteLine("Generated XML:\n" + xmlData);

            int result = await DataBaseFactory.QuerySPAsync("UM_Users_Upd", dynamicParameters, "User_Update");
            return result > 0;
        }

        public async Task<bool> DeleteUserAsync(string pk_userId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_userId", (object)pk_userId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int result = await DataBaseFactory.QuerySPAsync("UM_Users_Del", dynamicParameters, "User_Delete");
            return result > 0;
        }


        public async Task<AadhaarModel> GetAadhaarByIdAsync(string pk_recId)
        {
            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("@pk_recId", pk_recId, DbType.String);

            var result = await DataBaseFactory.QuerySPAsync<AadhaarModel>(
                "KYC_AadhaarVerification_Sel_ById",
                parameters,
                "Aadhaar_GetById"
            );

            return result.FirstOrDefault();
        }

        public async Task<PANModel> GetPanByIdAsync(string pk_recId)
        {
            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("@pk_recId", pk_recId, DbType.String);

            var result = await DataBaseFactory.QuerySPAsync<PANModel>(
                "KYC_PanVerification_Sel_ById",
                parameters,
                "Aadhaar_GetById"
            );

            return result.FirstOrDefault();
        }


        public async Task LogAPICallDataAsync(string apiUrl, string requestType, string requestPayload, string responsePayload, HttpStatusCode statusCode, bool isSuccess, string candidateId)
        {
            var dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@RequestType", requestType);
            dynamicParameters.Add("@RequestUrl", apiUrl);
            dynamicParameters.Add("@RequestPayload", requestPayload, DbType.String);
            dynamicParameters.Add("@ResponsePayload", responsePayload, DbType.String);
            dynamicParameters.Add("@StatusCode", (int)statusCode);
            dynamicParameters.Add("@Message", isSuccess ? "Success" : "Failure");
            dynamicParameters.Add("@UsedByCandidateId", candidateId);

            DataBaseFactory.QuerySP("Usp_APILog_Req_Res_Insert", dynamicParameters);
        }




        //basic info======================================================

        public async Task<bool> InsertBasicInfoAsync(
          string pk_recId,
          string stateId,
          string cityId,
          string pincode,
          string address,
          string photoFileName)
        {
            var parameters = new DynamicParameters();

            parameters.Add("@pk_recId", pk_recId);
            parameters.Add("@StateId", stateId);
            parameters.Add("@CityId", cityId);
            parameters.Add("@Pincode", pincode);
            parameters.Add("@Address", address);
            parameters.Add("@Photo", photoFileName);

            int result = await DataBaseFactory.QuerySPAsync(
                "REC_Candidate_BasicInfo_Ins",
                parameters,
                "BasicInfo_Insert"
            );

            return result > 0;
        }



        public async Task<BasicInfoModel> GetBasicInfoByIdAsync(string pk_recId)
        {
            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("@pk_recId", pk_recId, DbType.String);

            var result = await DataBaseFactory.QuerySPAsync<BasicInfoModel>(
                "REC_Candidate_BasicInfo_Edit",
                parameters,
                "BasicInfo_GetById"
            );

            return result.FirstOrDefault();
        }

        public async Task<(int totalCount, IEnumerable<OnBoardCandidateModel>)> GetOnBoardingCandidatelist(int pageIndex, int pageSize, string fk_userId, string fk_companyId)

        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@pageindex", pageIndex, DbType.Int32);
            dynamicParameters.Add("@pagesize", pageSize, DbType.Int32);
            dynamicParameters.Add("@fk_userId", fk_userId, DbType.String);
            dynamicParameters.Add("@fk_companyId", fk_companyId, DbType.String);

            // Call the SP
            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, OnBoardCandidateModel>(
                "REC_Candidates_SelForGrid",
                dynamicParameters,
                "OnBoardCandidate_GetAll"
            );

            if (tuple == null || tuple.Item2 == null)
                return (0, new List<OnBoardCandidateModel>());

            // Extract total count
            int totalCount = 0;

            if (tuple.Item1 is IEnumerable<dynamic> countList && countList.Any())
            {
                var row = countList.First() as IDictionary<string, object>;
                if (row != null && row.Values.Any())
                {
                    totalCount = Convert.ToInt32(row.Values.First());
                }
            }

            return (totalCount, tuple.Item2?.ToList() ?? new List<OnBoardCandidateModel>());
        }




        public async Task<OnboardingDashboardResponse> GetOnBoardingDashboardData(
           string companyId = null
         )
        {
            try
            {
                DynamicParameters dynamicParameters = new DynamicParameters();
                dynamicParameters.Add("@fk_companyId", companyId, DbType.String);


                var result = DataBaseFactory.QueryMultipleSP<
                    StatsResult,
                    WeeklySummaryResult,
                    MonthlySummaryResult,
                    RecentOnboarding,
                    TimelineItem
                >(
                    "REC_OnboardingDashboard_Get",
                    dynamicParameters,
                    "OnboardingDashboard_Get"
                );

                if (result == null)
                {
                    return new OnboardingDashboardResponse
                    {
                        TotalUsers = 0,
                        Stats = new DashboardStats(),
                        WeeklySummary = new WeeklySummary(),
                        MonthlySummary = new MonthlySummary(),
                        RecentOnboardings = new List<RecentOnboarding>(),
                        Timeline = new List<TimelineItem>()
                    };
                }

                var statsResult = result.Item1?.FirstOrDefault();
                var weeklyResult = result.Item2?.FirstOrDefault();
                var monthlyResult = result.Item3?.FirstOrDefault();

                return new OnboardingDashboardResponse
                {
                    TotalUsers = statsResult?.TotalUsers ?? 0,
                    Stats = new DashboardStats
                    {
                        Completed = statsResult?.Completed ?? 0,
                        InProgress = statsResult?.InProgress ?? 0,
                        Initiated = statsResult?.Initiated ?? 0,
                        Total = statsResult?.Total ?? 0
                    },
                    WeeklySummary = new WeeklySummary
                    {
                        ThisWeek = weeklyResult?.ThisWeek ?? 0,
                        LastWeek = weeklyResult?.LastWeek ?? 0,
                        PendingApprovals = weeklyResult?.PendingApprovals ?? 0
                    },
                    MonthlySummary = new MonthlySummary
                    {
                        New = monthlyResult?.NewThisMonth ?? 0,
                        Total = monthlyResult?.TotalThisMonth ?? 0,
                        Cancelled = monthlyResult?.CancelledThisMonth ?? 0
                    },
                    RecentOnboardings = result.Item4?.ToList() ?? new List<RecentOnboarding>(),
                    Timeline = result.Item5?.ToList() ?? new List<TimelineItem>()
                };
            }
            catch (Exception ex)
            {
                // Log error
                throw new Exception($"Error fetching dashboard data: {ex.Message}", ex);
            }
        }


        public async Task<bool> SendUserEmailAsync(string toAddress, string subject, string body, string companyId, string userId)
        {
            try
            {
                DynamicParameters parameters = new DynamicParameters();
                parameters.Add("@TOAddress", toAddress, DbType.String);
                parameters.Add("@TOSubject", subject, DbType.String);
                parameters.Add("@MailBody", body, DbType.String);
                parameters.Add("@fk_companyId", companyId, DbType.String);
                parameters.Add("@fk_userId", userId, DbType.String);

                int result = await DataBaseFactory.QuerySPAsync("UM_InsertEmailLog", parameters, "InsertEmailLog");
                return true; // We don't rely strictly on row count here if SP returns cleanly
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error sending email: " + ex.Message);
                return false;
            }
        }

        // added by shiv
        public async Task<(string subject, string body)> GetUserEmailBodyAsync(string emailType, string userName, string loginId, string password, string companyCode, int totalVendors, int incompleteVendors, double percentage)
        {
            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("@EmailType", emailType, DbType.String);
            parameters.Add("@UserName", userName ?? "", DbType.String);
            parameters.Add("@LoginId", loginId ?? "", DbType.String);
            parameters.Add("@Password", password ?? "", DbType.String);
            parameters.Add("@CompanyCode", companyCode ?? "", DbType.String);
            parameters.Add("@TotalVendors", totalVendors, DbType.Int32);
            parameters.Add("@IncompleteVendors", incompleteVendors, DbType.Int32);
            parameters.Add("@Percentage", (decimal)percentage, DbType.Decimal);

            var result = DataBaseFactory.QuerySP<dynamic>("USP_Get_UserEmailBody", parameters, "GetUserEmailBody");

            if (result != null && result.Any())
            {
                var firstRow = (IDictionary<string, object>)result.First();
                string subject = firstRow.ContainsKey("MailSubject") ? firstRow["MailSubject"]?.ToString() ?? "" : "";
                string body = firstRow.ContainsKey("MailBody") ? firstRow["MailBody"]?.ToString() ?? "" : "";
                return (subject, body);
            }
            return ("", "");
        }









    }
}
