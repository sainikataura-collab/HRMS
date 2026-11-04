using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class HRComplaintRepository : IHRComplaintRepository
    {
        public async Task<bool> InsertEmployeeComplaint(HRComplaintMst complaint)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@EmpCode", (object)complaint.EmpCode, new DbType?(DbType.String), new ParameterDirection?(), new int?(15), new byte?(), new byte?());
            dynamicParameters.Add("@ComplaintDate", (object)complaint.ComplaintDate, new DbType?(DbType.String), new ParameterDirection?(), new int?(50), new byte?(), new byte?());
            dynamicParameters.Add("@detailsInc", (object)complaint.detailsInc, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@raisdComp", (object)complaint.raisdComp, new DbType?(DbType.String), new ParameterDirection?(), new int?(50), new byte?(), new byte?());
            dynamicParameters.Add("@CommPersion", (object)complaint.CommPersion, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@CommPersonRaised", (object)complaint.CommPersonRaised, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@CommfirstReport", (object)complaint.CommfirstReport, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@CommSecoundReport", (object)complaint.CommSecoundReport, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@CommHOD", (object)complaint.CommHOD, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@CommManager", (object)complaint.CommManager, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@CommGMHR", (object)complaint.CommGMHR, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@CommManagemant", (object)complaint.CommManagemant, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@FinalDesion", (object)complaint.FinalDesion, new DbType?(DbType.String), new ParameterDirection?(), new int?(50), new byte?(), new byte?());
            dynamicParameters.Add("@fk_userId", (object)complaint.fk_userId, new DbType?(DbType.String), new ParameterDirection?(), new int?(50), new byte?(), new byte?());
            dynamicParameters.Add("@fk_locId", (object)complaint.fk_locId, new DbType?(DbType.String), new ParameterDirection?(), new int?(50), new byte?(), new byte?());

            // Execute stored procedure
            int n = DataBaseFactory.QuerySP("HR_Employe_Complaint_Ins", dynamicParameters, "Insert Employee Complaint");
            return n > 0; // Return true if rows were affected
        }

        public async Task<(int totalCount, IEnumerable<HRComplaintMst>)> GetAll(int pageIndex, int pageSize)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pageindex", (object)pageIndex, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pageSize, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, HRComplaintMst>(
                "HR_Employee_Complaint_SelForGrid", dynamicParameters, "Employee Complaint - GetAll");

            if (tuple == null || tuple.Item2 == null)
                return (0, new List<HRComplaintMst>());

            // Convert TotalCount
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First())
                : 0;

            return (totalCount, tuple.Item2?.ToList());
        }

        public async Task<HRComplaintMst> GetById(long pk_complaintId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_complaintId", (object)pk_complaintId, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<HRComplaintMst>("HR_Employee_Complaint_Edit", dynamicParameters, "Get Employee Complaint By ID").FirstOrDefault<HRComplaintMst>();
        }

        public async Task<bool> UpdateEmployeeComplaint(HRComplaintMst complaint)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_complaintId", (object)complaint.pk_complaintId, new DbType?(DbType.String), new ParameterDirection?(), new int?(15), new byte?(), new byte?());
            dynamicParameters.Add("@EmpCode", (object)complaint.EmpCode, new DbType?(DbType.String), new ParameterDirection?(), new int?(15), new byte?(), new byte?());
            dynamicParameters.Add("@ComplaintDate", (object)complaint.ComplaintDate, new DbType?(DbType.String), new ParameterDirection?(), new int?(50), new byte?(), new byte?());
            dynamicParameters.Add("@detailsInc", (object)complaint.detailsInc, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@raisdComp", (object)complaint.raisdComp, new DbType?(DbType.String), new ParameterDirection?(), new int?(50), new byte?(), new byte?());
            dynamicParameters.Add("@CommPersion", (object)complaint.CommPersion, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@CommPersonRaised", (object)complaint.CommPersonRaised, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@CommfirstReport", (object)complaint.CommfirstReport, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@CommSecoundReport", (object)complaint.CommSecoundReport, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@CommHOD", (object)complaint.CommHOD, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@CommManager", (object)complaint.CommManager, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@CommGMHR", (object)complaint.CommGMHR, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@CommManagemant", (object)complaint.CommManagemant, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@FinalDesion", (object)complaint.FinalDesion, new DbType?(DbType.String), new ParameterDirection?(), new int?(50), new byte?(), new byte?());
            dynamicParameters.Add("@fk_userId", (object)complaint.fk_userId, new DbType?(DbType.String), new ParameterDirection?(), new int?(50), new byte?(), new byte?());
            dynamicParameters.Add("@fk_locId", (object)complaint.fk_locId, new DbType?(DbType.String), new ParameterDirection?(), new int?(50), new byte?(), new byte?());

            // Execute stored procedure for update
            int n = DataBaseFactory.QuerySP("HR_Employe_Complaint_upd", dynamicParameters, "Update Employee Complaint");
            return n > 0; // Return true if rows were affected
        }

        public async Task<bool> DeleteEmployeeComplaint(string pk_complaintId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_complaintId", (object)pk_complaintId, new DbType?(DbType.String), new ParameterDirection?(), new int?(15), new byte?(), new byte?());

            // Execute stored procedure for delete
            int n = DataBaseFactory.QuerySP("HR_Employee_Complaint_Mst_Delete", dynamicParameters, "Delete Employee Complaint");
            return n > 0; // Return true if rows were affected
        }

    }

}
