using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IOfficeTypeMasterRepository
    {
        public Task<bool>InsertOfficeTypeMasterMstAsync(OfficeTypeMasterMst OfficeTypeMasterMst);
        public Task<(int totalCount, IEnumerable<OfficeTypeMasterMst>)> GetAll(int pageIndex, int pageSize, string fk_companyId);

        public Task<bool> UpdateOfficeTypeMasterMstAsync(OfficeTypeMasterMst OfficeTypeMasterMst);

        public Task<OfficeTypeMasterMst>GetOfficeTypeMasterByIdAsync(string pk_offtypeid);

        public Task<bool> DeleteOfficeTypeMasterAsync(int pk_offtypeid);

    }
}
