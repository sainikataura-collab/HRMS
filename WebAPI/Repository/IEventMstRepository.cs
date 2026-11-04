
using HRMSWebAPI.Models;
using System.Threading.Tasks;

namespace HRMSWebAPI.Repository
{
    public interface IEventMstRepository
    {

        //Task<bool> InsertEventAsync(EventMst eventMst);
        //Task<bool> InsertEventAsync(EventMst eventMst, List<DeptDetail> eventDetail);
        Task<bool> InsertEventAsync(EventMst eventMst, List<DeptDetail> deptDetails, List<locDetail> locDetails);
        Task<bool> UpdateEventAsync(EventMst eventMst, List<DeptDetail> deptDetails, List<locDetail> locDetails);
        Task<(EventMst, List<DeptDetail>, List<locDetail>)> GetEventByIdAsync(int pk_eventId);



        Task<(int totalCount, IEnumerable<EventMst>)> GetAll(int pageIndex, int pageSize);

        //Task<bool> UpdateEventAsync(EventMst eventdata);
        //Task<EventMst> GetEventByIdAsync(int pk_eventId);
        //Task<(EventMst, List<DeptDetail>)> GetEventByIdAsync(int pk_eventId);
        //Task<bool> UpdateEventAsync(EventMst eventMst, List<DeptDetail> eventDetail);
        Task<bool> DeleteEventMstAsync(int pk_eventId);
        Task<(EventDashboardModel, List<EmployeeBirthdayModel>, List<EmployeeBirthdayModel>, List<EventListModel>, List<AnniversariesModel>)> GetEventDashboardDataAsync(long? fk_yearid = null, long? monthid = null);

        IEnumerable<RecentActivityModel> GetRecentActivity();

    }
}
