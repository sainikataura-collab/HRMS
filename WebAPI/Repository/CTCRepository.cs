using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class CTCRepository : ICTCRepository
    {
        CommonFunction commonFunction = new CommonFunction();
        public async Task<(List<CTCMst>, List<CTCMstGross>)> GetEmployeeCTCDetailAsync(string empId, string companyId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@fk_empid", empId, DbType.String);
            dynamicParameters.Add("@fk_companyId", companyId, DbType.String);
            var tuple = DataBaseFactory.QueryMultipleSP<CTCMst, CTCMstGross>("SAL_EmployeeFlexiHead_SelforGrid_New",dynamicParameters,"GetAll");
            var ctcList = tuple?.Item1?.ToList() ?? new List<CTCMst>();
            var ctcGross = tuple?.Item2?.ToList() ?? new List<CTCMstGross>();

            return (ctcList, ctcGross);
        }

        public async Task<(int totalCount, List<dynamic>, List<dynamic>)> GetAllEmployeeCTCDetailAsync(string empCode, string empCodeManual,
string empName, List<string> selectedDepartments, string selectedDesignation,
List<string> selectedLocations, string selectedNature, string selectedCity,
string sortBy, string userId, string empStatus, string fk_costcentreid, string companyId,
int pageIndex = 0, int pageSize = 10)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            // Combine both into one XML structure
            var combinedXml = commonFunction.GetRecords(selectedLocations, selectedDepartments);
            dynamicParameters.Add("@filempcode", (object)empCode, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@empcodemanual", (object)empCodeManual, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@filempname", (object)empName, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@xmlDoc", (object)combinedXml, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_designationid", (object)selectedDesignation, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_nature", (object)selectedNature, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_cityid", (object)selectedCity, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@shortby", (object)sortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_userid", (object)userId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@EmpStatus", (object)empStatus, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_costcenterid", (object)fk_costcentreid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            dynamicParameters.Add("@fk_companyId", companyId, DbType.String);
            dynamicParameters.Add("@pageindex", (object)pageIndex, DbType.Int32);
            dynamicParameters.Add("@pagesize", (object)pageSize, DbType.Int32);

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic>("SAL_EmployeeFlexiHead_SelforGrid_New_All", dynamicParameters, "GetAll");
            var ctcList = tuple?.Item1?.ToList() ?? new List<dynamic>();
            var ctcGross = tuple?.Item2?.ToList() ?? new List<dynamic>();

            int totalCount = 0;
            if (ctcGross.Any())
            {
                var first = ctcGross.First() as IDictionary<string, object>;
                if (first != null && first.ContainsKey("TotalCount") && first["TotalCount"] != null)
                {
                    totalCount = Convert.ToInt32(first["TotalCount"]);
                }
                else
                {
                    totalCount = ctcGross.Count;
                }
            }

            return (totalCount, ctcList, ctcGross);
        }



    }
}
