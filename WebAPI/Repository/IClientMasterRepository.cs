using System.Collections.Generic;
using System.Threading.Tasks;
using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IClientMasterRepository
    {
        Task<Result> InsertClientMasterAsync(ClientMasterModel client, string userId, string locId);
        Task<Result> UpdateClientMasterAsync(ClientMasterModel client, string userId, string locId);
        Task<ClientMasterModel> GetClientMasterByIdAsync(long pk_cost_centre_id);
        Task<(int totalCount, IEnumerable<ClientMasterListModel>)> GetAll(int pageIndex, int pageSize, string fk_companyId, string searchTerm);
        Task<Result> DeleteClientMasterAsync(long pk_cost_centre_id);
        Task<IEnumerable<NameValue>> GetModelListByClientAsync(long fk_cost_centre_id, string fk_companyId = "");
        Task<IEnumerable<NameValue>> GetEarningHeadsAsync(string fk_companyId = "");
        Task<bool> UploadClientLogoAsync(long clientId, string logoName);
    }
}
