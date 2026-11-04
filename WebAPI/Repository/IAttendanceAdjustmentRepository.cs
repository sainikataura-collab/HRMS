using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IAttendanceAdjustmentRepository
    {

        Task<(int totalCount, EmployeeDetailResult)> GetAll(int pageIndex, int pageSize, int pageIndex1, int pageSize1, EmpAttendanceAdjRequest filter);


        //
        Task<bool>UpdateAttendanceAdjustmentAsync(AttendanceAdjustmentXmlModel model, string Fk_UserID, string Fk_LocID);
    }
}
