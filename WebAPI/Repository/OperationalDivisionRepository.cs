using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.ComponentModel.Design;
using System.Data;
using System.Linq;

namespace HRMSWebAPI.Repository
{
    public class OperationalDivisionRepository : IOperationalDivisionRepository
    {
        public async Task<bool> InsertOperationalMst(OperationalDivisionMst OperationalDivisionMst)
        {
            // Create DynamicParameters for the stored procedure
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@OperationalCode", OperationalDivisionMst.OperationalCode, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@OperationalDescription", OperationalDivisionMst.OperationalDescription, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@@fk_InsuserId", OperationalDivisionMst.FkInsuserId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_LocID", OperationalDivisionMst.FkLocId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_CompanyId", OperationalDivisionMst.FkCompanyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            // Execute the stored procedure
            int rowsAffected = await DataBaseFactory.QuerySPAsync("SAL_OperationalDivision_Mst_Ins", dynamicParameters, "Operational_Insert");
            // Return true if rows were affected
            return rowsAffected > 0;
        }

        public async Task<(int totalCount, IEnumerable<OperationalDivisionMst>)> GetAll(int pageIndex, int pageSize, string fkCompanyId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pageindex", pageIndex, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", pageSize, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", fkCompanyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, OperationalDivisionMst>("SAL_OperationalDivision_Mst_selforgrid", dynamicParameters, "OperationalDivisionMst_GetAll");
            if (tuple == null || tuple.Item2 == null) return (0, new List<OperationalDivisionMst>());
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First())
                : 0;
            return (totalCount, tuple?.Item2?.ToList());
        }

        public async Task<OperationalDivisionMst> GetOperationalDivisionById(string OperationalId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_OperationalId", (object)OperationalId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<OperationalDivisionMst>("SAL_OperationalDivision_Mst_Edit", dynamicParameters, "SAL_OperationalDivision_Mst_Edit").FirstOrDefault();
        }

        public async Task<bool> UpdateOperationalDivision(OperationalDivisionMst operationalDivision)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@Pk_OperationalId", (object)operationalDivision.pk_OperationalId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@OperationalCode", (object)operationalDivision.OperationalCode, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@OperationalDescription", (object)operationalDivision.OperationalDescription, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_InsUserId", (object)operationalDivision.FkInsuserId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_LocId", (object)operationalDivision.FkLocId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            // Execute stored procedure for update
            int n = DataBaseFactory.QuerySP("SAL_OperationalDivision_Mst_Upd", dynamicParameters, "OperationalDivision_Update");
            return n > 0; // Return true if rows were affected
        }


        public async Task<bool> DeleteOperationalDivision(string OperationalId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_OperationalId", (object)OperationalId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            int n = DataBaseFactory.QuerySP("SAL_OperationalDivision_Mst_Del", dynamicParameters, "OperationalDivision_Delete");
            return n > 0; // Return true if rows were affected
        }



    }
}
