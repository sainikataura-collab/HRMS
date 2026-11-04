using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IDueClearanceRepository
    {
        Task<(int totalCount, dynamic result)> GetAll(int pageIndex, int pageSize, string companyId);
        
        Task<bool> CreateAsync(ClearanceDepartmentModel model, string Fk_UserID, string Fk_LocID);

        Task<bool> UpdateClearanceMstAsync(ClearanceDepartmentModel model, long pk_clsdeptId, string Fk_UserID, string Fk_LocID);
        Task<bool> Delete(long pk_clsdeptId);
        Task<ClearanceDepartmentModel> GetByIdAsync(long pk_clsdeptId);

        Task<dynamic> GetParamsByDept(string fk_deptid, string fk_companyId);

        Task<bool> CreateUserClearanceAsync( ClearanceDepartmentUserModel model, string Fk_UserID, string Fk_LocID);

        Task<ClearanceDepartmentUserModel> GetUserClearanceByIdAsync(long pk_deptUserId);

        Task<(int totalCount, dynamic result)> GetUserClearanceList( int pageIndex, int pageSize, string fk_deptid, string fk_companyId);

        Task<bool> UpdateUserClearanceAsync( ClearanceDepartmentUserModel model, long pk_deptUserId, string Fk_UserID, string Fk_LocID);

        Task<(int totalCount, dynamic result)> GetHODClearanceList( int pageIndex, int pageSize, string fk_companyId, string fk_userId);

        Task<ClearanceDepartmentUserModel> GetHODClearanceByEmpIdAsync( string fk_empid, string Fk_UserID, string fk_companyId);

        Task<bool> UpdateHODClearanceAsync( ClearanceDepartmentUserModel model, string Fk_UserID, string Fk_LocID);
        // ============================
        // EMPLOYEE
        // ============================
        Task<(int totalCount, dynamic result)> GetMyClearanceStatus( int pageIndex, int pageSize, string fk_companyId, string fk_empid);

        Task<ClearanceDepartmentUserModel> GetMyClearanceByEmpIdAsync( string fk_empid, string fk_companyId);

        Task<(int totalCount, dynamic result)> GetAdminClearanceStatusList( int pageIndex, int pageSize, string fk_companyId, string fk_userId);
        Task<bool> SkipClearanceAsync(long pk_seprequestId, string Fk_UserID);
    }
}