using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface INatureRepository
    {
        public Task<bool> InsertNatureMstAsync(NatureMst NatureMst);
        public Task<(int totalCount, IEnumerable<NatureMst>)> GetAll(int pageIndex, int pageSize, string fk_companyId);

        public Task<NatureMst> GetNatureByIdAsync(string bankId);

        public  Task<bool> UpdateNatureMstAsync(NatureMst NatureMst);
        public  Task<bool> DeleteNatureMstAsync(string bankId);


    }
}
