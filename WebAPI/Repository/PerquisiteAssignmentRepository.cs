using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class PerquisiteAssignmentRepository : IPerquisiteAssignmentRepository
    {

        //for get all
        public async Task<(int totalCount, IEnumerable<PerquisiteAssignment>)> GetAll(int pageIndex, int pageSize, string fk_empid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@pageindex", (object)pageIndex, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pageSize, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_empid", (object)fk_empid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, PerquisiteAssignment>("SAL_Employee_PerquisiteTrn_SelForGrid", dynamicParameters, "PerquisticesAssignment_GetAll");
            if (tuple == null || tuple.Item2 == null) return (0, []);
            //Convert Total Count
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

            return (totalCount, tuple?.Item2?.ToList());
        }
        public async Task<PerquisiteAssignment> GetperquisiteAssignmentByIdAsync(string pk_perktrnId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_perktrnId", (object)pk_perktrnId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<PerquisiteAssignment>("SAL_Employee_PerquisiteTrn_Edit", (object)dynamicParameters, "perquisite assignment Master - GetById").FirstOrDefault<PerquisiteAssignment>();

        }
        //delete
        public async Task<bool>DeleteperquisiteAssignmentAsync(string pk_perktrnId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_perktrnId", (object)pk_perktrnId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int n = DataBaseFactory.QuerySP("SAL_Employee_PerquisiteTrn_Del", dynamicParameters, "perquisiteAssignment_mst_Delete");

            return n > 0; // Return true if rows were affected
        }
        //for insert
        public async Task<bool> InsertperquisiteAssignmentAsync(PerquisiteAssignment perquisite, string fk_locId, string fk_userId, string fk_empid, string fk_perkId)

        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@trndate", (object)perquisite.trndate, new DbType?(DbType.DateTime), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@totvalue", (object)perquisite.totvalue, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@amtreceived", (object)perquisite.amtreceived, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@taxableamt", (object)perquisite.taxableamt, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_LocID", (object)fk_locId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_UserID", (object)fk_userId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_empid", (object)fk_empid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_perkId", (object)fk_perkId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());


            int result = DataBaseFactory.QuerySP("SAL_Employee_PerquisiteTrn_Ins", dynamicParameters, "perquisteAssignment_Insert");

            return result > 0;
        }

        //for update
        public async Task<bool> UpdatePerquisiteAssignmentAsync(PerquisiteAssignment PerquisiteAssignmentMst, string fk_locId, string fk_userId, string fk_empid, string fk_perkId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("pk_perktrnId", (object)PerquisiteAssignmentMst.pk_perktrnId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@trndate", (object)PerquisiteAssignmentMst.trndate, new DbType?(DbType.DateTime), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@totvalue", (object)PerquisiteAssignmentMst.totvalue, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@amtreceived", (object)PerquisiteAssignmentMst.amtreceived, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@taxableamt", (object)PerquisiteAssignmentMst.taxableamt, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_LocID", (object)fk_locId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_UserID", (object)fk_userId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Timestamp", (object)PerquisiteAssignmentMst.Timestamp, new DbType?(DbType.Binary), new ParameterDirection?(), null, new byte?(), new byte?());
            dynamicParameters.Add("@fk_empid", (object)fk_empid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_perkId", (object)fk_perkId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());


            // Execute stored procedure for update
            int n = DataBaseFactory.QuerySP("SAL_Employee_PerquisiteTrn_Upd", dynamicParameters, "perquiste_Mst_Update");

            return n > 0; // Return true if rows were affected
        }


    }
}

  



