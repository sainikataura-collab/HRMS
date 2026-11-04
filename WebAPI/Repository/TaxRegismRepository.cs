using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class TaxRegismRepository:ITaxRegismRepository
    {

        public async Task<bool> UpdateRegismMstAsync(string pk_empid, string TaxRegime)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@EmpId", (object)pk_empid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@TaxRegime", (object)TaxRegime, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            int n = DataBaseFactory.QuerySP("[SAL_UpdateEmployeeTaxRegime]", dynamicParameters, "TaxRegime_Mst_Update");
            return n > 0; // Return true if rows were affected
        }



    }
}
