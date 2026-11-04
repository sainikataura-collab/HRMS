using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IFinancialYearRepository
    {
        public Task<bool> InsertFinancialYearAsync(FinancialYear financialyr);
        public Task<(int totalCount, IEnumerable<FinancialyearGetAll>)> GetAll(int pageIndex, int pageSize, string Fk_UserID);
        public Task<bool> UpdateFinancialYearAsync(FinancialYear financialyr);
        public Task<bool> Delete(string fk_finid);
        public Task<FinancialyearGetAll> GetFinancialYearById(string pk_finid);
        //public Task<FinancialyearGetAll> FinancialYearOnChnage(string zoneId);

        public  Task<bool> FinancialYearOnChnage(string pk_finid);
        public Task<IEnumerable<FinancialyearGetAll>> GetFinancialYearschangeAsync(string fk_companyId);





    }
}
