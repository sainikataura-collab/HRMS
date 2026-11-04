using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IKRARepository
    {
        Task<bool> InsertRolewiseKRAAsync(KRARequest kRARequest);
        Task<bool> Del_RolewiseKRA_Async(int roleId, long SrNo);
        Task<IEnumerable<KRAList>> GetRolewise_list_Async();
        Task<List<KRAList>> GetRolewiseByIdAsync(string roleId, long SrNo);

        Task<bool> InsertEmployeewiseKRAAsync(KRARequest kRARequest);
        Task<bool> Del_Employeewise_KRA_Async(string fk_empId, long SrNo);

        Task<IEnumerable<KRAList>> GetEmpwise_list_Async();
        //Task<KRAList> GetEmpwiseByIdAsync(string fk_empId, long SrNo);
        Task<List<KRAList>> GetEmpwiseByIdAsync(string fk_empId, long SrNo);
        //Task<bool> Insert_Self_Assesment_Multiple(List<Self_Assesment_KRA> kraList);
        Task<bool> Insert_Self_Assesment_Multiple(List<kraSelfAss> kraList);
        Task<bool> Insert_Role_Assesment_Multiple(List<Self_Assesment_KRA> kraList);



        Task<List<KRA_Get_Assesment_data>> GetEmp_Self_Assess_ByIdAsync(string fk_empId);
        Task<List<KRA_Get_Assesment_data>> GetAssessmnet_ByIdAsync(string kraId, long fk_kraperiodId);
        Task<List<KRA_Get_Assesment_data>> GetRole_Assess_ByIdAsync(int RoleId);

        //Task<(List<KRA_Get_Assesment_data>, List<KRA_Get_Self_Assesment_data>)> GetAssessmnet_ByIdAsync(string kraId);


        Task<(int totalCount, IEnumerable<getlistforRM>)> GetAllRMList(int pageIndex, int pageSize, string fk_empid);

        //Task<(int totalCount, IEnumerable<getlistforSelf>)> GetAllSelfList(int pageIndex, int pageSize);

        Task<(int totalCount, IEnumerable<getlistforSelf>)> GetAllSelfList(int pageIndex, int pageSize, string fk_empid);

        Task<(int totalCount, IEnumerable<getlistforHOD>)> GetAllHODList(int pageIndex, int pageSize, string fk_empid);


        Task<(int totalCount, IEnumerable<RoleAssessmentList>)> GetAll_Role_AssessmentList(int pageIndex, int pageSize);

        Task<Result<List<NameValue>>> GetPeriodDropdownList();

        Task<List<KRAList>> GetEmployeeKRAIdAsync(string fk_empId, long? SrNo);


        //Check Duplicate period
        Task<Result<string>> ValidateKRAPeriodAsync(string empId, int kraperiodId);

        Task<bool> Update_Self_Assessment_Multiple(List<kraSelfAss> kraList);


        Task<bool> Update_RM_Assessment_Multiple(List<UpdModel> kraList);


        Task<List<KRA_Get_Assesment_data>> GetRMAssessmnet_ByIdAsync(string fk_empid, long fk_kraperiodId);

        Task<bool> Update_HOD_Assessment_Multiple(List<HODUpddel> kraList);

        Task<List<KRA_Get_Assesment_data>> GetHODAssessmnet_ByIdAsync(string fk_empid, long fk_kraperiodId);



    }

}
