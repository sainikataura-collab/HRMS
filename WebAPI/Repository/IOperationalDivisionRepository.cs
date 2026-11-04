using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IOperationalDivisionRepository
    {
        public Task<bool> InsertOperationalMst(OperationalDivisionMst OperationalDivisionMst);

        public Task<(int totalCount, IEnumerable<OperationalDivisionMst>)> GetAll(int pageIndex, int pageSize, string fkCompanyId);
        public Task<OperationalDivisionMst> GetOperationalDivisionById(string OperationalId);
        public Task<bool> UpdateOperationalDivision(OperationalDivisionMst operationalDivision);
        public  Task<bool> DeleteOperationalDivision(string OperationalId);

    }
}
