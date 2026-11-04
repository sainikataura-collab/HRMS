using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.ComponentModel.Design;
using System.Data;
using System.Linq;

namespace HRMSWebAPI.Repository
{


    public class BankRepository : IBankRepository
    {

        public async Task<bool> InsertBankMstAsync(BankMst BankMst)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@Bankname", (object)BankMst.BankName, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@AccountNo", (object)BankMst.AccountNo, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@MICRCode", (object)BankMst.MICRCode, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Address", (object)BankMst.Address, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Contactperson1", (object)BankMst.ContactPerson1, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Contactno1", (object)BankMst.ContactNo1, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Contactperson2", (object)BankMst.ContactPerson2, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Contactno2", (object)BankMst.ContactNo2, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Remarks", (object)BankMst.Remarks, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_UserID", (object)BankMst.Fk_UserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_LocID", (object)BankMst.Fk_LocID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", (object)BankMst.Fk_CompanyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            dynamicParameters.Add("@BankAccount_Min", (object)BankMst.BankAccount_Min, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@BankAccount_Max", (object)BankMst.BankAccount_Max, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@IFSC_Prefix", (object)BankMst.IFSC_Prefix, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());



            // Execute stored procedure (no output parameters)
            int n = DataBaseFactory.QuerySP("SAL_Bank_Ins", dynamicParameters, "BankMst_Insert");

            return n > 0; // Return true if rows were affected
        }
       
        public async Task<(int totalCount, IEnumerable<BankMst>)> GetAll(int pageIndex, int pageSize,string fk_companyId, string searchTerm = "")
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pageindex", (object)pageIndex, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pageSize, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@SearchTerm", searchTerm ?? "", DbType.String);

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, BankMst>("SAL_Bank_SelForGrid", dynamicParameters, "BankMst_GetAll");
            if (tuple == null || tuple.Item2 == null) return (0, []);
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                            ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

            return (totalCount, tuple?.Item2?.ToList());
        }

        public async Task<BankMst> GetBankByIdAsync(string bankId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@Pk_Bankid", (object)bankId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<BankMst>("SAL_Bank_Edit", (object)dynamicParameters, "Bank Master - GetById").FirstOrDefault<BankMst>();
        }

        public async Task<bool> UpdateBankMstAsync(BankMst BankMst)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@Pk_Bankid", (object)BankMst.Pk_BankId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Bankname", (object)BankMst.BankName, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@AccountNo", (object)BankMst.AccountNo, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@MICRCode", (object)BankMst.MICRCode, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Address", (object)BankMst.Address, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Contactperson1", (object)BankMst.ContactPerson1, new DbType?(DbType.String), new ParameterDirection?(), new int?(100), new byte?(), new byte?());
            dynamicParameters.Add("@Contactno1", (object)BankMst.ContactNo1, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Contactperson2", (object)BankMst.ContactPerson2, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Contactno2", (object)BankMst.ContactNo2, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Remarks", (object)BankMst.Remarks, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_UserID", (object)BankMst.Fk_UserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_LocID", (object)BankMst.Fk_LocID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Timestamp", (object)BankMst.Timestamp, new DbType?(DbType.Binary), new ParameterDirection?(), null, new byte?(), new byte?());
            dynamicParameters.Add("@BankAccount_Min", (object)BankMst.BankAccount_Min, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@BankAccount_Max", (object)BankMst.BankAccount_Max, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@IFSC_Prefix", (object)BankMst.IFSC_Prefix, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());


            // Execute stored procedure for update
            int n = DataBaseFactory.QuerySP("SAL_Bank_Upd", dynamicParameters, "Bank_Mst_Update");

            return n > 0; // Return true if rows were affected
        }

        public async Task<bool> DeleteBankMstAsync(string bankId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@Pk_Bankid", (object)bankId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int n = DataBaseFactory.QuerySP("SAL_Bank_Del", dynamicParameters, "Bank_Mst_Delete");

            return n > 0; // Return true if rows were affected
        }

       
        
    }
}
