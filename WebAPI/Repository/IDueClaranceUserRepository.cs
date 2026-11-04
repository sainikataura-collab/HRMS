using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IDueClaranceUserRepository
    {
        Task<bool> CreateAsync(ClearanceDepartmentUserModel model, string Fk_LocID, string Fk_UserID);
        Task<(int totalCount, IEnumerable<ClearanceDepartmentUserView>)> GetAll(int pageIndex, int pageSize, string fk_companyId);
        // Task<ClearanceDepartmentUserModel> GetBehavioralByIdAsync(long pk_deptUserId);
        Task<ClearanceDepartmentUserModel_previous> GetByIdAsync(long pk_deptUserId);
        Task<bool> DeleteAsync(long pk_deptUserId);
        Task<bool> UpdateTravelMstAsync(ClearanceDepartmentUserModel model, long pk_deptUserId, string Fk_LocID, string Fk_UserID);

    }
}
