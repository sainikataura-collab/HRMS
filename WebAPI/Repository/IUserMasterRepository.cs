using HRMSWebAPI.Models;
using System.Net;

namespace HRMSWebAPI.Repository
{
    public interface IUserMasterRepository 
    {


        Task<BasicInfoModel> GetBasicInfoByIdAsync(string pk_recId);
        Task<bool> InsertBasicInfoAsync(
          string pk_recId,
          string stateId,
          string cityId,
          string pincode,
          string address,
          string photoFileName);
        Task LogAPICallDataAsync(string apiUrl, string requestType, string requestPayload, string responsePayload, HttpStatusCode statusCode, bool isSuccess,string candidateId);
        Task<PANModel> GetPanByIdAsync(string pk_recId);

        Task<AadhaarModel> GetAadhaarByIdAsync(string pk_recId);
        Task<bool> InsertPANAsync(PANModel model);
        Task<bool> InsertAadhaarAsync(AadhaarModel aadhaar
                                         );
        public Task<bool> InsertUserAsync(List<UserMst> userList, string fk_insUserID, string fk_locID, string fk_companyId);

        public Task<(int totalCount, IEnumerable<UserMst>)> GetAllUsersAsync(int pageIndex, int pageSize, string fk_userId, string fk_companyId, string searchText = "");
        public Task<UserMst> GetUserByIdAsync(string pk_userId);

        public Task<bool> UpdateUserAsync(List<UserMst> userList, string fk_updUserID, string fk_locID, string pk_userId, byte[] timestamp);

        public Task<bool> DeleteUserAsync(string pk_userId);



        Task<OnboardingDashboardResponse> GetOnBoardingDashboardData(string companyId = null);

        Task<(int totalCount, IEnumerable<OnBoardCandidateModel>)> GetOnBoardingCandidatelist(int pageIndex, int pageSize, string fk_userId, string fk_companyId);

        Task<bool> SendUserEmailAsync(string toAddress, string subject, string body, string companyId, string userId);
        Task<(string subject, string body)> GetUserEmailBodyAsync(string emailType, string userName, string loginId, string password, string companyCode, int totalVendors, int incompleteVendors, double percentage);



    }
}
