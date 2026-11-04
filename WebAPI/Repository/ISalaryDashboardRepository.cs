namespace HRMSWebAPI.Repository
{
    public interface ISalaryDashboardRepository
    {
        //Task<dynamic> EMPSalaryDetails(string Month, string Year, string EmpId);
        Task<(dynamic SalaryOverview, dynamic AnnualTrend)> EMPSalaryDetails(string Month, string Year, string EmpId);

    }
}
