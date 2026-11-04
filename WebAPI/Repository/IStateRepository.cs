using HRMSWebAPI.Models;
namespace HRMSWebAPI.Repository
{
    public interface IStateRepository
    {
        public Task<bool> InsertStateAsync(StateMst state);

        public  Task<(int totalCount, IEnumerable<StateMst>)> GetAll(int pageIndex, int pageSize, string fk_companyId, string searchTerm = "");
        public  Task<StateMst> GetStateByIdAsync(string stateId);
        public Task<bool> UpdateStateAsync(StateMst state);
        public Task<bool> DeleteStateMstAsync(string stateId);
        public Task<IEnumerable<HeadMst>> GetEarningHeadsAsync(string fk_companyId);
    }
}
