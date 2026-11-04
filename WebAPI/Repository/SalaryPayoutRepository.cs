using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class SalaryPayoutRepository : ISalaryPayoutRepository
    {
        CommonFunction commonFunction = new CommonFunction();

        // ═══════════════════════════════════════════════════════════════════
        // GET — Pending + PaidOut lists + Batch dropdown list
        // SP returns 5 result-sets:
        //   1. pendingCount  2. pendingList
        //   3. paidOutCount  4. paidOutList
        //   5. batchList  (all batches for this month/year)
        // ═══════════════════════════════════════════════════════════════════
        public async Task<(
            int pendingCount,
            int paidOutCount,
            List<dynamic> pendingList,
            List<dynamic> paidOutList,
            List<dynamic> batchList)>
        GetSalaryPayoutListAsync(
            string empCode, string empCodeManual, string empName,
            List<string> selectedDepartments, string selectedDesignation,
            List<string> selectedLocations, string selectedNature,
            string selectedCity, string sortBy,
            string fkMonthId, string fkYearId, string fkCostCentreId,
            string? filterBatchKey = null,
            int pendingPageIndex = 0, int pendingPageSize = 10,
            int paidOutPageIndex = 0, int paidOutPageSize = 10,
            string pendingSearchTerm = "", string paidOutSearchTerm = "")
        {
            DynamicParameters p = new DynamicParameters();
            var combinedXml = commonFunction.GetRecords(selectedLocations, selectedDepartments);

            p.Add("@empcode",          empCode);
            p.Add("@empcodemanual",    empCodeManual);
            p.Add("@empname",          empName);
            p.Add("@xmlDoc",           combinedXml);
            p.Add("@fk_designationid", selectedDesignation);
            p.Add("@fk_nature",        selectedNature);
            p.Add("@fk_cityid",        selectedCity);
            p.Add("@shortby",          sortBy);
            p.Add("@fk_monthId",       fkMonthId);
            p.Add("@fk_yearId",        fkYearId);
            p.Add("@fk_costcentreid",  fkCostCentreId);
            p.Add("@filterBatchKey",   filterBatchKey);   // null = show all paid-out
            p.Add("@pendingPageIndex", pendingPageIndex);
            p.Add("@pendingPageSize",  pendingPageSize);
            p.Add("@paidOutPageIndex", paidOutPageIndex);
            p.Add("@paidOutPageSize",  paidOutPageSize);
            p.Add("@pendingSearchTerm", pendingSearchTerm);
            p.Add("@paidOutSearchTerm", paidOutSearchTerm);

            // 5 result-sets
            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic, dynamic, dynamic, dynamic>(
                "SAL_Salary_Payout_SelForGrid", p, "GetAll");

            int pendingCount = tuple.Item1 is IEnumerable<dynamic> c1 && c1.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)c1.First()).Values.First()) : 0;

            int paidOutCount = tuple.Item3 is IEnumerable<dynamic> c3 && c3.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)c3.First()).Values.First()) : 0;

            var pendingList = tuple.Item2?.ToList() ?? new List<dynamic>();
            var paidOutList = tuple.Item4?.ToList() ?? new List<dynamic>();
            var batchList   = tuple.Item5?.ToList() ?? new List<dynamic>();

            return (pendingCount, paidOutCount, pendingList, paidOutList, batchList);
        }


        // ═══════════════════════════════════════════════════════════════════
        // PROCESS — Mark selected employees paid out; return BatchKey
        // SP returns 1 row: { AffectedRows, BatchKey }
        // ═══════════════════════════════════════════════════════════════════
        public async Task<(bool success, string batchKey, int affectedRows, int batchId)>
        ProcessSalaryPayoutAsync(
            string fkInsUserId, string fkLocId, string fkCompanyId,
            SalaryPayoutRequest request)
        {
            try
            {
                DynamicParameters p = new DynamicParameters();
                var combinedXml = commonFunction.GetRecords(request.SelectedLocations, request.SelectedDepartments);

                // Build XML for selected employee IDs
                var empXml = "<EmpList>" +
                    string.Join("", request.SelectedEmpIds.Select(id =>
                        $"<Emp><pk_empid>{id}</pk_empid></Emp>")) +
                    "</EmpList>";

                p.Add("@fk_monthId", request.fk_monthId);
                p.Add("@fk_yearId", request.fk_yearId);
                p.Add("@empcode", request.EmpCode);
                p.Add("@empcodemanual", request.EmpCodeManual);
                p.Add("@empname", request.EmpName);
                p.Add("@xmlDoc", combinedXml);
                p.Add("@empXmlDoc", empXml);
                p.Add("@fk_designationid", request.SelectedDesignation);
                p.Add("@fk_nature", request.SelectedNature);
                p.Add("@fk_cityid", request.SelectedCity);
                p.Add("@fk_costcentreid", request.fk_costcentreid);
                p.Add("@fk_companyId", fkCompanyId);
                p.Add("@fk_userID", fkInsUserId);
                p.Add("@fk_locid", fkLocId);
                p.Add("@isSelectAll", request.IsSelectAll);
                p.Add("@BankId", request.BankId);
                p.Add("@BankRefNo", request.BankRefNo);
                p.Add("@PayoutRemark", request.PayoutRemark);

                // SP returns: SELECT @AffectedCount AS AffectedRows, @BatchKey AS BatchKey, @BatchId AS batchId
                var results = DataBaseFactory.QuerySP<dynamic>("SAL_Salary_Payout", p);
                var row = results?.FirstOrDefault() as IDictionary<string, object>;

                int affected = row != null && row.ContainsKey("AffectedRows") ? Convert.ToInt32(row["AffectedRows"]) : 0;
                string key = row != null && row.ContainsKey("BatchKey") ? row["BatchKey"]?.ToString() ?? "" : "";
                int batchId = row != null && row.ContainsKey("batchId") ? Convert.ToInt32(row["batchId"]) : 0;

                return (affected > 0, key, affected, batchId);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Payout error: " + ex.Message);
                return (false, "", 0, 0);
            }
        }



        public async Task<(bool success, int affectedRows)> ProcessSalaryUnPayoutAsync(string fkInsUserId, SalaryUnPayoutRequest request)
        {
            try
            {
                DynamicParameters p = new DynamicParameters();

                // Build XML for selected employee IDs and remarks
                var empXml = "<EmpList>" +
                    string.Join("", request.Employees.Select(e =>
                        $"<Emp><pk_empid>{System.Security.SecurityElement.Escape(e.pk_empid)}</pk_empid><remark>{System.Security.SecurityElement.Escape(e.remark)}</remark></Emp>")) +
                    "</EmpList>";

                p.Add("@fk_monthId", request.fk_monthId);
                p.Add("@fk_yearId", request.fk_yearId);
                p.Add("@empXmlDoc", empXml);
                p.Add("@fk_userID", fkInsUserId);

                // SP returns: SELECT @AffectedCount AS AffectedRows
                var results = DataBaseFactory.QuerySP<dynamic>("SAL_Salary_UnPayout", p);
                var row = results?.FirstOrDefault() as IDictionary<string, object>;

                int affected = row != null && row.ContainsKey("AffectedRows") ? Convert.ToInt32(row["AffectedRows"]) : 0;

                return (affected > 0, affected);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Un-Payout error: " + ex.Message);
                return (false, 0);
            }
        }
    }
}
