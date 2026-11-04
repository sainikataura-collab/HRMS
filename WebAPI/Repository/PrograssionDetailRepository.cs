using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using Org.BouncyCastle.Ocsp;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class PrograssionDetailRepository : IPrograssionDetailRepository
    {
        public async Task<IEnumerable<dynamic>> GetAllPrograssionDetailMst(string fk_empid)
        {
            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("@fk_empid", fk_empid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            var result = await Task.Run(() => DataBaseFactory.QuerySP<dynamic>("SAL_Employee_Salary_Increment_View", parameters, "Get_RegulariseAttendanceList"));
            return result ?? new List<dynamic>();
        }


        //COMPENSATION > Rent Details

        public async Task<List<EmployeeRentModel>> RentDetailsList(string EmpId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@fk_empid", (object)EmpId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            var result = DataBaseFactory.QuerySP<EmployeeRentModel>("SAL_Employee_Rent_ESS_SelForGrid_New", dynamicParameters, "EMP_Attendance Details").ToList();
            return result;

        }



        public async Task<(int totalCount, IEnumerable<EmployeeRentModel>)> GetAll(int pageIndex, int pageSize, string? EmpId, string? searchTerm)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pageindex", pageIndex, DbType.Int32);
            dynamicParameters.Add("@pagesize", pageSize, DbType.Int32);
            dynamicParameters.Add("@fk_empid", (object)EmpId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@searchTerm", (object)searchTerm, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, EmployeeRentModel>("SAL_Employee_Rent_ESS_SelForGrid_New", dynamicParameters, "SAL_Rolewise_Report");
            if (tuple == null || tuple.Item2 == null) return (0, []);
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
               ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;
            return (totalCount, tuple?.Item2?.ToList());
        }



        public async Task<bool> Insert_rentDetailsAsync(ModelRentDetails model)
        {

            DynamicParameters dynamicParameters = new DynamicParameters();
            string xmlData = XmlUtility.XmlSerializeToString(model);
            dynamicParameters.Add("@XmlDoc", (object)xmlData, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            int result = DataBaseFactory.QuerySP("SAL_Employee_ESS_Rent_Ins_New", dynamicParameters, "shortLeaveApply_Ins");
            return result > 0;

        }



        public async Task<RentDetailsResponse> GetRentDetailsByIdAsync( string fk_empid, string fk_finid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@fk_empid", fk_empid, DbType.String);
            dynamicParameters.Add("@fk_finid", fk_finid, DbType.String);

            // Call the stored procedure that returns multiple result sets
            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic, dynamic>(
                "SAL_Employee_Rent_ESS_Edit",
                dynamicParameters,
                "RentDetails_GetById"
            );

            if (tuple == null)
            {
                return new RentDetailsResponse
                {
                    MasterData = null,
                    MonthlyRentData = new List<dynamic>(),
                    LandlordData = null
                };
            }

            return new RentDetailsResponse
            {
                MasterData = tuple.Item1?.FirstOrDefault(),
                MonthlyRentData = tuple.Item2?.ToList() ?? new List<dynamic>(),
                LandlordData = tuple.Item3?.FirstOrDefault()
            };

        }




        public async Task<bool> UpdateRentDetailsAsync(ModelRentDetails model)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            string xmlData = XmlUtility.XmlSerializeToString(model);
            dynamicParameters.Add("@XmlDoc", xmlData, DbType.String);

            // Execute update stored procedure
            int result = DataBaseFactory.QuerySP("SAL_Employee_ESS_Rent_Upd_New", dynamicParameters, "RentDetails_Update");
            return result > 0;
        }





        public async Task<List<dynamic>> Getfinancalyearmonth(string fk_finid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@fk_finid", (object)fk_finid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            var result = DataBaseFactory.QuerySP<dynamic>("SAL_Financial_Year_Month", dynamicParameters, "SAL_Financial_Year_Month").ToList();
            return result;

        }

        public class RentDetailsResponse
        {
            public dynamic MasterData { get; set; }
            public List<dynamic> MonthlyRentData { get; set; }
            public dynamic LandlordData { get; set; }
        }








        public async Task<dynamic> FinAvailableAsync(string fk_empid, string fk_finid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@fk_empid", fk_empid, DbType.String);
            dynamicParameters.Add("@fk_finid", fk_finid, DbType.String);

            // Call the stored procedure that returns multiple result sets
            var result = DataBaseFactory.QueryMultipleSP<dynamic>("SAL_Employee_Rent_ESS_Edit",dynamicParameters,"RentDetails_GetById");



            return result;

        }



    }
}
