using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IMonthlySalSlipRepository
    {
        public Task<bool> InsertMonthlySalarySlipMessageAsync(ManthlySalSlipDataset salaryMessages, string fk_finid);
        public  Task<bool> UpdateMonthlySalarySlipMessageAsync(ManthlySalSlipDataset salaryMessages, string fk_finid);
        public  Task<(List<GetbyidModelTempMassage>, List<GetbyidModelMassage>)> GetById(string fk_finid);
        public Task<bool> Delete(string fk_finid);




    }
}
