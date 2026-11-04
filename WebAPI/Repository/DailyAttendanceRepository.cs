using Dapper;
using HRBook.Models;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.Extensions.Configuration;
using System;
using System.Data;
using System.Threading.Tasks;

namespace HRBook.Repository
{
    public class DailyAttendanceRepository : IDailyAttendanceRepository
    {
        private readonly IConfiguration configuration;

        public DailyAttendanceRepository(IConfiguration configuration)
        {
            this.configuration = configuration;
        }


        public async Task<(bool IsSuccessfull, string Message)> SaveAttendance(DailyAttendanceModelins model)
        {
            
            
                DynamicParameters dynamicParameters = new DynamicParameters();

                dynamicParameters.Add("@fk_empId", model.employee);
                dynamicParameters.Add("@fk_monthId", model.month);
                dynamicParameters.Add("@fk_yearId", model.year);
                dynamicParameters.Add("@fk_finid", model.fk_finId);
                dynamicParameters.Add("@dated", model.Dated);
                dynamicParameters.Add("@monthdays", model.MonthDays);

                dynamicParameters.Add("@A1", model.A1);
                dynamicParameters.Add("@A2", model.A2);
                dynamicParameters.Add("@A3", model.A3);
                dynamicParameters.Add("@A4", model.A4);
                dynamicParameters.Add("@A5", model.A5);
                dynamicParameters.Add("@A6", model.A6);
                dynamicParameters.Add("@A7", model.A7);
                dynamicParameters.Add("@A8", model.A8);
                dynamicParameters.Add("@A9", model.A9);
                dynamicParameters.Add("@A10", model.A10);
                dynamicParameters.Add("@A11", model.A11);
                dynamicParameters.Add("@A12", model.A12);
                dynamicParameters.Add("@A13", model.A13);
                dynamicParameters.Add("@A14", model.A14);
                dynamicParameters.Add("@A15", model.A15);
                dynamicParameters.Add("@A16", model.A16);
                dynamicParameters.Add("@A17", model.A17);
                dynamicParameters.Add("@A18", model.A18);
                dynamicParameters.Add("@A19", model.A19);
                dynamicParameters.Add("@A20", model.A20);
                dynamicParameters.Add("@A21", model.A21);
                dynamicParameters.Add("@A22", model.A22);
                dynamicParameters.Add("@A23", model.A23);
                dynamicParameters.Add("@A24", model.A24);
                dynamicParameters.Add("@A25", model.A25);
                dynamicParameters.Add("@A26", model.A26);
                dynamicParameters.Add("@A27", model.A27);
                dynamicParameters.Add("@A28", model.A28);
                dynamicParameters.Add("@A29", model.A29);
                dynamicParameters.Add("@A30", model.A30);
                dynamicParameters.Add("@A31", model.A31);

             

                dynamicParameters.Add("@IsSuccessfull",
                    dbType: DbType.Boolean,
                    direction: ParameterDirection.Output);

                dynamicParameters.Add("@Message",
                    dbType: DbType.String,
                    size: 200,
                    direction: ParameterDirection.Output);

            DataBaseFactory.QuerySP(
"SAL_Attendance_Daily_InsUpd",
dynamicParameters,
"Daily Attendance Save");

            bool isSuccess =
                dynamicParameters.Get<bool>("@IsSuccessfull");

            string message =
                dynamicParameters.Get<string>("@Message");

            return (isSuccess, message);

        }
        

        public async Task<DailyAttendanceModel> GetAttendance(
            string empId,
            short monthId,
            short yearId,
            string finId)
        {
            
                DynamicParameters dynamicParameters = new DynamicParameters();

                dynamicParameters.Add("@fk_empId", empId);
                dynamicParameters.Add("@fk_monthId", monthId);
                dynamicParameters.Add("@fk_yearId", yearId);
                dynamicParameters.Add("@fk_finid", finId);

            dynamicParameters.Add("@IsSuccessfull",
   dbType: DbType.Boolean,
   direction: ParameterDirection.Output);

            dynamicParameters.Add("@Message",
                dbType: DbType.String,
                size: 200,
                direction: ParameterDirection.Output);

            var result = DataBaseFactory
                .QuerySP<DailyAttendanceModel>(
                    "SAL_Attendance_Daily_Get",
                    dynamicParameters,
                    "Daily Attendance Get")
                .FirstOrDefault();

            bool isSuccess = dynamicParameters.Get<bool>("@IsSuccessfull");
            string message = dynamicParameters.Get<string>("@Message");

            return result;

        }

    }
}