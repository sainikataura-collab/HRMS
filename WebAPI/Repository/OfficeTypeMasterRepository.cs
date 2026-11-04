using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;
using System.Linq;
namespace HRMSWebAPI.Repository

{
    public class OfficeTypeMasterRepository : IOfficeTypeMasterRepository
    {
        public async Task<bool> InsertOfficeTypeMasterMstAsync(OfficeTypeMasterMst OfficeTypeMasterMst)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@code", (object)OfficeTypeMasterMst.code, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@description", (object)OfficeTypeMasterMst.description, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@emailhod", (object)OfficeTypeMasterMst.emailhod, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@emailhr", (object)OfficeTypeMasterMst.emailhr, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
           dynamicParameters.Add("@fk_companyId", (object)OfficeTypeMasterMst.fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            // Execute stored procedure (no output parameters)
            int n = DataBaseFactory.QuerySP("Comm_OfficeType_Ins", dynamicParameters, "OfficeTypeMasterMst_Insert");
            return n > 0; // Return true if rows were affected
        }


        public async Task<(int totalCount, IEnumerable<OfficeTypeMasterMst>)> GetAll(int pageIndex, int pageSize, string fk_companyId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();


            dynamicParameters.Add("@pageIndex", (object)pageIndex, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pageSize", (object)pageSize, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());


            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, OfficeTypeMasterMst>("Comm_OfficeType_SelForGrid", dynamicParameters, "Office Type Master_GetAll");
            if (tuple == null || tuple.Item2 == null) return (0, []);
            //Convert Total Count
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

            return (totalCount, tuple?.Item2?.ToList());
        }


        public async Task<bool>UpdateOfficeTypeMasterMstAsync(OfficeTypeMasterMst OfficeTypeMasterMst)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@pk_offtypeid", (object)OfficeTypeMasterMst.pk_offtypeid, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@code", (object)OfficeTypeMasterMst.code, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@description", (object)OfficeTypeMasterMst.description, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@emailhod", (object)OfficeTypeMasterMst.emailhod, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@emailhr", (object)OfficeTypeMasterMst.emailhr, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@timestamp", (object)OfficeTypeMasterMst.timestamp, new DbType?(DbType.Binary), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            // Execute stored procedure (no output parameters)
            int n = DataBaseFactory.QuerySP("Comm_OfficeType_Upd", dynamicParameters, "OfficeTypeMasterMst_Update");
            return n > 0; // Return true if rows were affected
        }
        public async Task<OfficeTypeMasterMst>GetOfficeTypeMasterByIdAsync(string pk_offtypeid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_offtypeid", (object)pk_offtypeid, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<OfficeTypeMasterMst>("Comm_OfficeType_Edit", (object)dynamicParameters, "GetById").FirstOrDefault<OfficeTypeMasterMst>();
        }

        //for delete

        public async Task<bool>DeleteOfficeTypeMasterAsync(int pk_offtypeid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_offtypeid", (object)pk_offtypeid, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int n = DataBaseFactory.QuerySP("Comm_OfficeType_Del", dynamicParameters, "Delete");

            return n > 0; // Return true if rows were affected
        }
    }
}
