using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IPageRightsRepository
    {
        Task<IEnumerable<string>> GetUserLocationsAsync(string fk_userId);
        Task<IEnumerable<dynamic>> GetWebPagesOnUserModIdAsync(string fk_userId, int fk_moduleId);


        Task<bool> InsertUserPageRightsAsync(PagerightMst model);
        Task<IEnumerable<UserFullMenuModel>> GetUserFullMenuAsync(string fk_userId);

        Task<IEnumerable<EmployeeModuleActive>> GetActiveModulesAsync();


        Task<UserAccessRightsModel> GetUserAccessRightsAsync(string userId, int moduleId);

    }
}
