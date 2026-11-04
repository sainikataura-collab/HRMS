using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;
using System.Linq;

namespace HRMSWebAPI.Repository
{
    public class DeductionSlabRepository: IDeductionSlabRepository
    {
        public async Task<bool> InsertDeductionSlabAsync(DeductionSlabMst DeductionSlabMst, string fk_userid, string fk_locid,string fk_companyId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@PersonType", (object)DeductionSlabMst.PersonType, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Sno", (object)DeductionSlabMst.Sno, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@LowerLimit", (object)DeductionSlabMst.LowerLimit, new DbType?(DbType.Decimal), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@UpperLimit", (object)DeductionSlabMst.UpperLimit, new DbType?(DbType.Decimal), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@tax_percent", (object)DeductionSlabMst.Tax_Percent, new DbType?(DbType.Decimal), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_userid", (object)fk_userid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_locid", (object)fk_locid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@TaxRegime", (object)DeductionSlabMst.TaxRegime, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());



            // Execute stored procedure (no output parameters)
            int n = DataBaseFactory.QuerySP("SAL_TaxDeductionSlab_Ins", dynamicParameters, "TaxDeductionSlab_Insert");

            return n > 0; // Return true if rows were affected
        }

        public async Task<(int totalCount, IEnumerable<DeductionSlabMst>)> GetAll(int pageIndex, int pageSize, string? PersonType, string fk_companyId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pageindex", (object)pageIndex, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pageSize, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@type", (object)PersonType, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());


            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, DeductionSlabMst>("SAL_TaxDeductionSlab_SelForGrid", dynamicParameters, "SAL_TaxDeductionSlab_SelForGrid");
            if (tuple == null || tuple.Item2 == null) return (0, []);
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                            ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

            return (totalCount, tuple?.Item2?.ToList());
        }

        public async Task<DeductionSlabMst> GetDeductionSlabByIdAsync(long? pk_slabid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@Pk_Slabid", (object)pk_slabid, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<DeductionSlabMst>("SAL_TaxDeductionSlab_Edit", (object)dynamicParameters, "TaxDeductionSlab - GetById").FirstOrDefault<DeductionSlabMst>();
        }

        public async Task<bool> UpdateDeductionSlabAsync(DeductionSlabMst DeductionSlabMst, string fk_userid, string fk_locid, string fk_companyId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@Pk_Slabid", (object)DeductionSlabMst.pk_slabid, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@PersonType", (object)DeductionSlabMst.PersonType, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Sno", (object)DeductionSlabMst.Sno, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@LowerLimit", (object)DeductionSlabMst.LowerLimit, new DbType?(DbType.Decimal), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@UpperLimit", (object)DeductionSlabMst.UpperLimit, new DbType?(DbType.Decimal), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Tax_Percent", (object)DeductionSlabMst.Tax_Percent, new DbType?(DbType.Decimal), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_UserID", (object)fk_userid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_LocID", (object)fk_locid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@TaxRegime", (object)DeductionSlabMst.TaxRegime, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            dynamicParameters.Add("@Timestamp", (object)DeductionSlabMst.Timestamp, new DbType?(DbType.Binary), new ParameterDirection?(), null, new byte?(), new byte?());

            int n = DataBaseFactory.QuerySP("SAL_TaxDeductionSlab_Upd", dynamicParameters, "SAL_TaxDeductionSlab_Upd");

            return n > 0; // Return true if rows were affected
        }

        public async Task<bool> DeleteDeductionSlabAsync(long? pk_slabid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@Pk_Slabid", (object)pk_slabid, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int n = DataBaseFactory.QuerySP("SAL_TaxDeductionSlab_Del", dynamicParameters, "SAL_TaxDeductionSlab_Del");

            return n > 0; // Return true if rows were affected
        }

    }
}
