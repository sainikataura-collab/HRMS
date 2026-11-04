using Dapper;
using HRMSWebAPI.Helper;

namespace HRMSWebAPI.Repository
{
    public class EventRepository:IEventRepository
    {

        public async Task<IEnumerable<dynamic>> GetTodayBirthdaysAsync()
        {
            try
            {
                DynamicParameters parameters = new DynamicParameters();
                // No parameters required for this SP

                var result = DataBaseFactory.QuerySP<dynamic>(
                    "[dbo].[SAL_Employee_TodayBirthday_Sel]",
                    parameters,
                    "SAL_Employee_TodayBirthday_Sel"
                );

                return result ?? Enumerable.Empty<dynamic>();
            }
            catch (Exception ex)
            {
                Console.WriteLine("SAL_Employee_TodayBirthday_Sel Error: " + ex.Message);
                return Enumerable.Empty<dynamic>();
            }
        }

        public async Task<IEnumerable<dynamic>> GetUpcomingBirthdaysAsync()
        {
            try
            {
                DynamicParameters parameters = new DynamicParameters();
                // No parameters required for this SP

                var result = DataBaseFactory.QuerySP<dynamic>(
                    "[dbo].[SAL_Employee_UpcomingBirthday_Sel]",
                    parameters,
                    "SAL_Employee_UpcomingBirthday_Sel"
                );

                return result ?? Enumerable.Empty<dynamic>();
            }
            catch (Exception ex)
            {
                Console.WriteLine("SAL_Employee_UpcomingBirthday_Sel Error: " + ex.Message);
                return Enumerable.Empty<dynamic>();
            }
        }



        public async Task<IEnumerable<dynamic>> GetEvents()
        {
            try
            {
                DynamicParameters parameters = new DynamicParameters();
                // No parameters required for this SP

                var result = DataBaseFactory.QuerySP<dynamic>(
                    "[dbo].[HR_Event_SelectActive]",
                    parameters,
                    "HR_Event_SelectActive"
                );

                return result ?? Enumerable.Empty<dynamic>();
            }
            catch (Exception ex)
            {
                Console.WriteLine("SAL_Hr_event Error: " + ex.Message);
                return Enumerable.Empty<dynamic>();
            }
        }

        public async Task<IEnumerable<dynamic>> GetAniversary()
        {
            try
            {
                DynamicParameters parameters = new DynamicParameters();
                // No parameters required for this SP

                var result = DataBaseFactory.QuerySP<dynamic>(
                    "[dbo].SAL_Employee_Anniversary_Select",
                    parameters,
                    "SAL_Employee_Anniversary_Select"
                );

                return result ?? Enumerable.Empty<dynamic>();
            }
            catch (Exception ex)
            {
                Console.WriteLine("SAL_Employee_Anniversary_Select Error: " + ex.Message);
                return Enumerable.Empty<dynamic>();
            }
        }


        public async Task<IEnumerable<dynamic>> RecentAcitvityofHR()
        {
            try
            {
                DynamicParameters parameters = new DynamicParameters();
                // No parameters required for this SP

                var result = DataBaseFactory.QuerySP<dynamic>(
                    "[dbo].HR_Chat_RecentActivity",
                    parameters,
                    "HR_Chat_RecentActivity"
                );

                return result ?? Enumerable.Empty<dynamic>();
            }
            catch (Exception ex)
            {
                Console.WriteLine("SAL_Employee_recent_Select Error: " + ex.Message);
                return Enumerable.Empty<dynamic>();
            }
        }



    }
}
