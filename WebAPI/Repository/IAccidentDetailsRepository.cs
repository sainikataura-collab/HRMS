using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IAccidentDetailsRepository
    {

        Task<(int TotalCount, List<AccidentDetailsMst> detailsMst)> GetEmployeeAccidentsAsync(int pageIndex, int pageSize, string fk_empid);

        public Task<AccidentDetailsMst> GetById(string pk_accidentId);
        //delete
        public Task<bool> Delete(string pk_accidentId);

        public Task<bool> InsertEmployeeAccidentAsync(AccidentDetailsMst AccidentDetails, string fk_locid, string fk_userid);

        public Task<bool> UpdateEmployeeAccidentAsync(string pk_accidentId,AccidentDetailsMst AccidentDetails, string fk_locid, string fk_userid);



    }
}
