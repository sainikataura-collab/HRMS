using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class EmployeeProfileRepository : IEmployeeProfileRepository
    {
        public async Task<EmployeeFullProfileResponse> GetEmployeeFullProfileByIdAsync(string empId)
        {
            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("@pk_empid", empId, DbType.String);

            var tuple = DataBaseFactory.QueryMultipleSP<
                EmployeeProfileMst,        // ResultSet 1
                EmployeeQualification,     // ResultSet 2
                EmployeePreviousJob,       // ResultSet 3
                EmployeeLetter,            // ResultSet 4
                ReportingInfo1,            // ResultSet 5
                ReportingInfo2             // ResultSet 6
            >("SAL_Employee_GetByID", parameters, "GetAll");

            var result = new EmployeeFullProfileResponse();

            if (tuple != null)
            {
                result.EmployeeProfileMst = tuple.Item1?.FirstOrDefault();
                result.EmployeeQualification = tuple.Item2?.ToList() ?? new List<EmployeeQualification>();
                result.EmployeePreviousJob = tuple.Item3?.ToList() ?? new List<EmployeePreviousJob>();
                result.EmployeeLetter = tuple.Item4?.ToList() ?? new List<EmployeeLetter>();
                result.ReportingInfo1 = tuple.Item5?.ToList() ?? new List<ReportingInfo1>();
                result.ReportingInfo2 = tuple.Item6?.ToList() ?? new List<ReportingInfo2>();
            }

            return result;
        }

    }
}
