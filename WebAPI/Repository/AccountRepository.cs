using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using iTextSharp.text.pdf.qrcode;
using System.Data;
using System.Linq;
namespace HRMSWebAPI.Repository
{
    public class AccountRepository : IAccountRepository
    {
        

        public async Task<bool> InsertAccountMaster(AccountMst AccountMaster)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@code", (object)AccountMaster.code, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@name", (object)AccountMaster.name, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            // Execute stored procedure (no output parameters)
            int n = DataBaseFactory.QuerySP("SAL_Account_Mst_Ins", dynamicParameters, "Insert AccountMaster Details");
            return n > 0; // Return true if rows were affected
        }







        public async Task<(int totalCount, IEnumerable<AccountMst>)> GetAll(int pageIndex, int pageSize)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pageindex", (object)pageIndex, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pageSize, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, AccountMst>("SAL_Account_Mst_SelForGrid", dynamicParameters, "AccountMaster - GetAll");
            if (tuple == null || tuple.Item2 == null) return (0, []);
            // Convert TotalCount
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First())
                : 0;
            return (totalCount, tuple?.Item2?.ToList());
        }







        public async Task<AccountMst> GetById(string pk_account_id)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_account_id", (object)pk_account_id, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<AccountMst>("SAL_Account_Mst_Edit", (object)dynamicParameters, "Get Account Master By ID").FirstOrDefault<AccountMst>();
        }



        public async Task<bool> UpdateMasterAccount(AccountMst AccountMaster)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_account_id", (object)AccountMaster.pk_account_id, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@code", (object)AccountMaster.code, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@name", (object)AccountMaster.name, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            // Execute stored procedure for update
            int n = DataBaseFactory.QuerySP("SAL_Account_Mst_Upd", dynamicParameters, "Account_Mst_Update");

            return n > 0; // Return true if rows were affected
        }


        public async Task<bool> DeleteAccountMaster(string pk_account_id)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_account_id", (object)pk_account_id, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            int n = DataBaseFactory.QuerySP("SAL_Account_Mst_Del", dynamicParameters, "Account_Mst_Delete");
            return n > 0; // Return true if rows were affected
        }




    }
}
