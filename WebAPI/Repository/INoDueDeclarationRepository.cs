using HRBook_WebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface INoDueDeclarationRepository
    {
        Task<bool> InsertNoDueDeclarationAsync(NoDueDeclarationMst noDueDeclarationMst);

        Task<(int totalCount, IEnumerable<NoDueDeclarationMst>)> GetAll( int pageIndex, int pageSize, string fk_empid);

        Task<NoDueDeclarationMst> GetNoDueDeclarationByIdAsync(int pk_noDueDeclarationId);

        Task<NoDueDeclarationMst> GetEmpDetailsAsync(string fk_empid);

        Task<bool> UpdateNoDueDeclarationAsync(NoDueDeclarationMst noDueDeclarationMst);

        Task<bool> DeleteNoDueDeclarationAsync(int pk_noDueDeclarationId);
        Task<NoDueDeclarationMst> GetNoDueDeclarationReportAsync(int pk_noDueDeclarationId);
        Task<(int totalCount, IEnumerable<NoDueDeclarationMst>)>GetAdminHodNoDueDeclarationsAsync( string empId, bool isAdmin, int pageIndex, int pageSize);
        Task<NoDueDeclarationMst> GetAdminHodNoDueDeclarationByIdAsync( int pk_noDueDeclarationId, string empId, bool isAdmin);
    }
}