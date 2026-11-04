using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class EventMstRepository: IEventMstRepository
    {



        //public async Task<bool> InsertEventAsync(EventMst eventMst)
        //{
        //    DynamicParameters dynamicParameters = new DynamicParameters();

        //    dynamicParameters.Add("@eventName", eventMst.eventName, DbType.String);
        //    dynamicParameters.Add("@eventDate", eventMst.eventDate, DbType.DateTime);
        //    dynamicParameters.Add("@eventVenue", eventMst.eventVenue, DbType.String);
        //    dynamicParameters.Add("@isActive", eventMst.isActive, DbType.Boolean);
        //    dynamicParameters.Add("@Fk_UserId", eventMst.Fk_UserID, DbType.String);

        //    int result = DataBaseFactory.QuerySP("HR_Event_Ins", dynamicParameters, "Event_Insert");

        //    return result > 0;
        //}
        public async Task<bool> InsertEventAsync(EventMst eventMst, List<DeptDetail> deptDetails, List<locDetail> locDetails)
        {
            DynamicParameters parameters = new DynamicParameters();

            // Serialize both department and location lists into XML
            string deptXml = XmlUtility.XmlSerializeToString(deptDetails);
            string locXml = XmlUtility.XmlSerializeToString(locDetails);

            // Add parameters
            parameters.Add("@eventName", eventMst.eventName, DbType.String);
            parameters.Add("@eventDate", eventMst.eventDate, DbType.DateTime);
            parameters.Add("@eventVenue", eventMst.eventVenue, DbType.String);
            parameters.Add("@isActive", eventMst.isActive, DbType.Boolean);
            parameters.Add("@Fk_UserId", eventMst.Fk_UserID, DbType.String);
            parameters.Add("@DeptXML", deptXml, DbType.String);
            parameters.Add("@LocXML", locXml, DbType.String);

            // Execute SP
            int result = DataBaseFactory.QuerySP("HR_Event_Ins", parameters, "HR_Event_Ins");

            return result > 0;
        }


        //public async Task<bool> InsertEventAsync(EventMst eventMst, List<EventDetail> eventDetail)
        //{
        //    DynamicParameters parameters = new DynamicParameters();

        //    // Serialize EventDetails list into XML
        //    string xmlData = XmlUtility.XmlSerializeToString(eventDetail);

        //    parameters.Add("@eventName", eventMst.eventName, DbType.String);
        //    parameters.Add("@eventDate", eventMst.eventDate, DbType.DateTime);
        //    //parameters.Add("@fk_locId", eventMst.fk_locId, DbType.String);
        //    parameters.Add("@isActive", eventMst.isActive, DbType.Boolean);
        //    parameters.Add("@Fk_UserId", eventMst.Fk_UserID, DbType.String);
        //    parameters.Add("@EventXML", xmlData, DbType.String);

        //    int result = DataBaseFactory.QuerySP("HR_Event_Ins", parameters, "HR_Event_Ins");

        //    return result > 0;
        //}



        public async Task<(int totalCount, IEnumerable<EventMst>)> GetAll(int pageIndex, int pageSize)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@pageindex", (object)pageIndex, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pageSize, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, EventMst>("HR_Event_SelForGrid", dynamicParameters, "Event_GetAll");
            if (tuple == null || tuple.Item2 == null) return (0, []);
            //Convert Total Count
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

            return (totalCount, tuple?.Item2?.ToList());
        }

        public async Task<bool> UpdateEventAsync(EventMst eventMst, List<DeptDetail> deptDetails, List<locDetail> locDetails)
        {
            DynamicParameters parameters = new DynamicParameters();

            // Serialize both XML datasets
            string deptXml = XmlUtility.XmlSerializeToString(deptDetails);
            string locXml = XmlUtility.XmlSerializeToString(locDetails);

            parameters.Add("@pk_eventId", eventMst.pk_eventId, DbType.Int32);
            parameters.Add("@eventName", eventMst.eventName, DbType.String);
            parameters.Add("@eventDate", eventMst.eventDate, DbType.DateTime);
            parameters.Add("@eventVenue", eventMst.eventVenue, DbType.String);
            parameters.Add("@isActive", eventMst.isActive, DbType.Boolean);
            parameters.Add("@Fk_UserId", eventMst.Fk_UserID, DbType.String);
            parameters.Add("@DeptXML", deptXml, DbType.String);
            parameters.Add("@LocXML", locXml, DbType.String);

            int n = DataBaseFactory.QuerySP("HR_Event_Upd", parameters, "HR_Event_Upd");

            return n > 0;
        }


        //public async Task<bool> UpdateEventAsync(EventMst eventMst, List<EventDetail> eventDetail)
        //{
        //    DynamicParameters parameters = new DynamicParameters();

        //    // Serialize EventDetails list into XML
        //    string xmlData = XmlUtility.XmlSerializeToString(eventDetail);
        //    parameters.Add("@pk_eventId", eventMst.pk_eventId, DbType.Int32);
        //    parameters.Add("@eventName", eventMst.eventName, DbType.String);
        //    parameters.Add("@eventDate", eventMst.eventDate, DbType.DateTime);
        //    //parameters.Add("@fk_locId", eventMst.fk_locId, DbType.String);
        //    parameters.Add("@isActive", eventMst.isActive, DbType.Boolean);
        //    parameters.Add("@Fk_UserId", eventMst.Fk_UserID, DbType.String);
        //    parameters.Add("@EventXML", xmlData, DbType.String);
        //    int n = DataBaseFactory.QuerySP("HR_Event_Upd", parameters, "HR_Event_Upd");
        //    return n > 0;
        //}


        //public async Task<EventMst> GetEventByIdAsync(int pk_eventId)
        //{
        //    DynamicParameters dynamicParameters = new DynamicParameters();
        //    dynamicParameters.Add("@pk_eventId", (object)pk_eventId, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    return DataBaseFactory.QuerySP<EventMst>("HR_Event_Edit", (object)dynamicParameters, "Event Master - GetById").FirstOrDefault<EventMst>();
        //}


        public async Task<(EventMst, List<DeptDetail>, List<locDetail>)> GetEventByIdAsync(int pk_eventId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_eventId", pk_eventId, DbType.Int32, ParameterDirection.Input);

            var tuple = DataBaseFactory.QueryMultipleSP<EventMst, DeptDetail, locDetail>("HR_Event_Edit", dynamicParameters, "HR_Event_Edit");

            EventMst eventdata = null;

            List<DeptDetail> deptDetails = new();
            List<locDetail> locDetails = new();

            if (tuple != null && tuple.Item1 != null)
            {
                eventdata = tuple.Item1.FirstOrDefault();
            }

            if (tuple != null && tuple.Item2 != null && eventdata != null)
            {
                deptDetails = tuple.Item2.ToList();
            }
            if (tuple != null && tuple.Item3 != null && eventdata != null)
            {
                locDetails = tuple.Item3.ToList();
            }

            return (eventdata, deptDetails,locDetails);
        }



        public async Task<bool> DeleteEventMstAsync(int pk_eventId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_eventId", (object)pk_eventId, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int n = DataBaseFactory.QuerySP("HR_Event_Del", dynamicParameters, "HR_Event_Del");
            return n > 0;
        }


        //EventDashboard
        public async Task<(EventDashboardModel, List<EmployeeBirthdayModel>, List<EmployeeBirthdayModel>, List<EventListModel>, List<AnniversariesModel>)> GetEventDashboardDataAsync(long? fk_yearid = null, long? monthid = null)
        {
            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("@Year", (object)fk_yearid, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?());
            parameters.Add("@Month", (object)monthid, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?());
            var tuple = DataBaseFactory.QueryMultipleSP<
                EventDashboardModel,
                EmployeeBirthdayModel,
                EmployeeBirthdayModel,
                EventListModel, AnniversariesModel

            >("HR_EventDashboard_GetData", parameters, "HR_EventDashboard_GetData");

            EventDashboardModel dashboard = null;
            List<EmployeeBirthdayModel> todayBirthdays = new();
            List<EmployeeBirthdayModel> upcomingBirthdays = new();
            List<EventListModel> upcomingEvents = new();
            List<AnniversariesModel> Anniversaries = new();

            if (tuple != null && tuple.Item1 != null)
                dashboard = tuple.Item1.FirstOrDefault();

            if (tuple != null && tuple.Item2 != null && dashboard != null)
                todayBirthdays = tuple.Item2.ToList();

            if (tuple != null && tuple.Item3 != null && dashboard != null)
                upcomingBirthdays = tuple.Item3.ToList();

            if (tuple != null && tuple.Item4 != null && dashboard != null)
                upcomingEvents = tuple.Item4.ToList();

            if (tuple != null && tuple.Item5 != null && dashboard != null)
                Anniversaries = tuple.Item5.ToList();



            return (dashboard, todayBirthdays, upcomingBirthdays, upcomingEvents, Anniversaries);
        }


        public IEnumerable<RecentActivityModel> GetRecentActivity()
        {
            return DataBaseFactory.QuerySP<RecentActivityModel>("HR_Chat_RecentActivityEmp");
        }



    }
}
