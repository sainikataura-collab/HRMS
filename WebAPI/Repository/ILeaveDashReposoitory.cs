namespace HRMSWebAPI.Repository
{
    public interface ILeaveDashReposoitory
    {
        Task<dynamic> GetLeaveDashboardAsync(int month, int year, string empId);


        Task<dynamic> GetUserDashboardAsync(int month, int year, string empId);

        Task<dynamic> GetHRDashboardAsync(int month, int year, string empId);
        Task<dynamic> GetTaskboxDashboard(int month, int year);
        Task<dynamic> GetEmpmanagementDashboard(int month, int year, string empId);
        Task<dynamic> GetAttendanceDashboard(int month, int year, string empId);

        Task<dynamic> GetleaveDashboard(int month, int year, string empId);



    }
}
