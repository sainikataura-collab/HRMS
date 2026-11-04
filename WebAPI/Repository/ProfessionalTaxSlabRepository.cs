using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;
using System.Linq;

namespace HRMSWebAPI.Repository
{
    public class ProfessionalTaxSlabRepository : IProfessionalTaxSlabRepository
    {

        public async Task<(int totalCount, IEnumerable<ProfessionalTaxSlabMst>)> GetAll(int pageIndex, int pageSize, short? fk_stateid, string searchTerm = "", string fk_companyId = "")
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pageindex", (object)pageIndex, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pageSize, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_stateid", (object)fk_stateid, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@searchTerm", (object)searchTerm, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());


            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, ProfessionalTaxSlabMst>("SAL_ProfTaxSlab_SelForGrid", dynamicParameters, "ProfTaxSlab_GetAll");
            if (tuple == null || tuple.Item2 == null) return (0, []);
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                            ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

            return (totalCount, tuple?.Item2?.ToList());
        }

        public async Task<ProfessionalTaxSlabMst> GetProfessionalByIdAsync(long? pk_slabid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_slabid", (object)pk_slabid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<ProfessionalTaxSlabMst>("SAL_ProfTaxSlab_Edit", (object)dynamicParameters, "ProfTaxSlab - GetById").FirstOrDefault<ProfessionalTaxSlabMst>();
        }

        // replace this professional tax slap repo

        public async Task<bool> InsertProfessionalAsync(ProfessionalTaxSlabMst ProfessionalTaxSlabMst, string fk_userid, string fk_locid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@fk_stateid", (object)ProfessionalTaxSlabMst.fk_stateid, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@sno", (object)ProfessionalTaxSlabMst.sno, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@lowerlimit", (object)ProfessionalTaxSlabMst.lowerlimit, new DbType?(DbType.Decimal), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@upperlimit", (object)ProfessionalTaxSlabMst.upperlimit, new DbType?(DbType.Decimal), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@tax_percent", (object)ProfessionalTaxSlabMst.tax_percent, new DbType?(DbType.Decimal), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@gender", (object)ProfessionalTaxSlabMst.gender, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Jan_Amt", (object)ProfessionalTaxSlabMst.Jan_Amt, new DbType?(DbType.Decimal), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Feb_Amt", (object)ProfessionalTaxSlabMst.Feb_Amt, new DbType?(DbType.Decimal), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Mar_Amt", (object)ProfessionalTaxSlabMst.Mar_Amt, new DbType?(DbType.Decimal), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Apr_Amt", (object)ProfessionalTaxSlabMst.Apr_Amt, new DbType?(DbType.Decimal), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@May_Amt", (object)ProfessionalTaxSlabMst.May_Amt, new DbType?(DbType.Decimal), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Jun_Amt", (object)ProfessionalTaxSlabMst.Jun_Amt, new DbType?(DbType.Decimal), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Jul_Amt", (object)ProfessionalTaxSlabMst.Jul_Amt, new DbType?(DbType.Decimal), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Aug_Amt", (object)ProfessionalTaxSlabMst.Aug_Amt, new DbType?(DbType.Decimal), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Sep_Amt", (object)ProfessionalTaxSlabMst.Sep_Amt, new DbType?(DbType.Decimal), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Oct_Amt", (object)ProfessionalTaxSlabMst.Oct_Amt, new DbType?(DbType.Decimal), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Nov_Amt", (object)ProfessionalTaxSlabMst.Nov_Amt, new DbType?(DbType.Decimal), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Dec_Amt", (object)ProfessionalTaxSlabMst.Dec_Amt, new DbType?(DbType.Decimal), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_userid", (object)fk_userid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_locid", (object)fk_locid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());


            // Execute stored procedure (no output parameters)
            int n = DataBaseFactory.QuerySP("SAL_ProfTaxSlab_Ins", dynamicParameters, "ProfTaxSlab_Insert");

            return n > 0; // Return true if rows were affected
        }



        public async Task<bool> UpdateProfessionalAsync(ProfessionalTaxSlabMst ProfessionalTaxSlabMst, string fk_userid, string fk_locid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_slabid", (object)ProfessionalTaxSlabMst.pk_slabid, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_stateid", (object)ProfessionalTaxSlabMst.fk_stateid, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@sno", (object)ProfessionalTaxSlabMst.sno, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@lowerlimit", (object)ProfessionalTaxSlabMst.lowerlimit, new DbType?(DbType.Decimal), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@upperlimit", (object)ProfessionalTaxSlabMst.upperlimit, new DbType?(DbType.Decimal), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@tax_percent", (object)ProfessionalTaxSlabMst.tax_percent, new DbType?(DbType.Decimal), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@gender", (object)ProfessionalTaxSlabMst.gender, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Jan_Amt", (object)ProfessionalTaxSlabMst.Jan_Amt, new DbType?(DbType.Decimal), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Feb_Amt", (object)ProfessionalTaxSlabMst.Feb_Amt, new DbType?(DbType.Decimal), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Mar_Amt", (object)ProfessionalTaxSlabMst.Mar_Amt, new DbType?(DbType.Decimal), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Apr_Amt", (object)ProfessionalTaxSlabMst.Apr_Amt, new DbType?(DbType.Decimal), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@May_Amt", (object)ProfessionalTaxSlabMst.May_Amt, new DbType?(DbType.Decimal), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Jun_Amt", (object)ProfessionalTaxSlabMst.Jun_Amt, new DbType?(DbType.Decimal), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Jul_Amt", (object)ProfessionalTaxSlabMst.Jul_Amt, new DbType?(DbType.Decimal), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Aug_Amt", (object)ProfessionalTaxSlabMst.Aug_Amt, new DbType?(DbType.Decimal), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Sep_Amt", (object)ProfessionalTaxSlabMst.Sep_Amt, new DbType?(DbType.Decimal), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Oct_Amt", (object)ProfessionalTaxSlabMst.Oct_Amt, new DbType?(DbType.Decimal), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Nov_Amt", (object)ProfessionalTaxSlabMst.Nov_Amt, new DbType?(DbType.Decimal), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Dec_Amt", (object)ProfessionalTaxSlabMst.Dec_Amt, new DbType?(DbType.Decimal), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            dynamicParameters.Add("@fk_userid", (object)fk_userid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_locid", (object)fk_locid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            dynamicParameters.Add("@Timestamp", (object)ProfessionalTaxSlabMst.Timestamp, new DbType?(DbType.Binary), new ParameterDirection?(), null, new byte?(), new byte?());


            int n = DataBaseFactory.QuerySP("SAL_ProfTaxSlab_Upd", dynamicParameters, "ProfTaxSlab_Mst_Update");

            return n > 0; // Return true if rows were affected
        }



        public async Task<bool> DeleteProfessionalAsync(long? pk_slabid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_slabid", (object)pk_slabid, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int n = DataBaseFactory.QuerySP("SAL_ProfTaxSlab_Del", dynamicParameters, "SAL_ProfTaxSlab_Del");

            return n > 0; // Return true if rows were affected
        }


    }
}
