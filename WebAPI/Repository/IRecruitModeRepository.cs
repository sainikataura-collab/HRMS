using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IRecruitModeRepository
    {
        //INSERT
        public Task<bool> InsertAsync(RecruitModeMst recruitModeMst);

        //UPDATE
        public Task<bool> UpdateAsync(RecruitModeMst recruitModeMst);

        //GET ALL
        public Task<(int totalCount, IEnumerable<RecruitModeMst>)> GetAll(int pageIndex, int pageSize, string fk_companyId);

        //BY ID
        public Task<RecruitModeMst> GetByIdAsync(string pk_recmodeid);
        // DELETE
        public Task<bool> DeleteAsync(string pk_recmodeid);


        //shiv
        Task<(dynamic summary, List<dynamic> KRAEvaluation, List<dynamic> BehavioralAttributes)> GetEmployeeAttendanceByEmpIdYearAsync(string empId, string year);
        Task<Result<List<NameValue>>> GetAppraisalDropdownList();
        Task<bool> InsertAppraisalAsync(AppraisalMain header, List<KRA> kraList, List<Behavioral> behavioralList, string fk_userid);
        //Task<List<AppraisalSummaryModel>> GetAllAppraisalsAsync();
        Task<List<AppraisalSummaryModel>> GetAllAppraisalsAsync(string empId);
        Task<(dynamic summary, List<dynamic> KRAEvaluation, List<dynamic> BehavioralAttributes)> GetByIdAppraisalDetailsAsync(string empId,int fk_yearId);

        Task<bool> CheckAppraisalDuplicateAsync(string empId, short appId);
        Task<List<AppraisalSummaryModel>> GetAllAppraisalsHodAsync(string empId);
    }
}
