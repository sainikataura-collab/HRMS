using HRMSWebAPI.Models;
using static HRMSWebAPI.Repository.PrograssionDetailRepository;

namespace HRMSWebAPI.Repository
{
    public interface IPrograssionDetailRepository
    {
        public Task<IEnumerable<dynamic>> GetAllPrograssionDetailMst(string fk_empid);


        //compensation
        Task<List<EmployeeRentModel>> RentDetailsList(string EmpId);
        Task<(int totalCount, IEnumerable<EmployeeRentModel>)> GetAll(int pageIndex, int pageSize, string? EmpId, string? searchTerm);
        Task<bool> Insert_rentDetailsAsync(ModelRentDetails model);
        Task<List<dynamic>> Getfinancalyearmonth(string fk_finid);
        Task<RentDetailsResponse> GetRentDetailsByIdAsync(string fk_empid, string fk_finid);
        Task<bool> UpdateRentDetailsAsync(ModelRentDetails model);

        Task<dynamic> FinAvailableAsync(string fk_empid, string fk_finid);
    }
}
