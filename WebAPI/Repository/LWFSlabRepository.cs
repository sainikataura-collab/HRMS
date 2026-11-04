using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;
using System.Linq;

namespace HRMSWebAPI.Repository
{
    public class LWFSlabRepository:ILWFSlabRepository
    {




        public async Task<(int totalCount, IEnumerable<LWF_SlabMst>)> GetAll(int pageIndex, int pageSize, string fk_companyId, short? fk_stateid, string searchTerm = "")
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@pageindex", (object)pageIndex, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pageSize, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_stateid", (object)fk_stateid, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@searchTerm", (object)searchTerm, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, LWF_SlabMst>("SAL_LWFSlab_SelForGrid", dynamicParameters, "LWF_GetAll");
            if (tuple == null || tuple.Item2 == null) return (0, []);
            //Convert Total Count
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

            return (totalCount, tuple?.Item2?.ToList());
        }

        public async Task<LWF_SlabMst> GetById(long pk_slabid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_slabid", (object)pk_slabid, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<LWF_SlabMst>("SAL_LWFSlab_Edit", (object)dynamicParameters, "Get Account Master By ID").FirstOrDefault<LWF_SlabMst>();
        }


        public async Task<bool> InsertLWFSlabAsync(LWF_SlabMst lwfSlab)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@fk_cityid", (object)lwfSlab.fk_cityid, new DbType?(DbType.Int16), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@sno", (object)lwfSlab.sno, new DbType?(DbType.Int16), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@effecttype", (object)lwfSlab.effecttype, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@effectivefrom", (object)lwfSlab.effectivefrom, new DbType?(DbType.DateTime), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Amt", (object)lwfSlab.Amt, new DbType?(DbType.Decimal), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@emrmultiple", (object)lwfSlab.emrmultiple, new DbType?(DbType.Decimal), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@SlabPercent", (object)lwfSlab.SlabPercent, new DbType?(DbType.Decimal), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_userid", (object)lwfSlab.fk_insUserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_locid", (object)lwfSlab.fk_locId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int result = DataBaseFactory.QuerySP("SAL_LWFSlab_Ins", dynamicParameters, "LWFSlab_Insert");

            return result > 0;
        }


        public async Task<bool> UpdateLWFSlabAsync(LWF_SlabMst lwfSlab)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@pk_slabid", (object)lwfSlab.pk_slabid, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_cityid", (object)lwfSlab.fk_cityid, new DbType?(DbType.Int16), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@sno", (object)lwfSlab.sno, new DbType?(DbType.Int16), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@effecttype", (object)lwfSlab.effecttype, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@effectivefrom", (object)lwfSlab.effectivefrom, new DbType?(DbType.DateTime), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Amt", (object)lwfSlab.Amt, new DbType?(DbType.Decimal), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@emrmultiple", (object)lwfSlab.emrmultiple, new DbType?(DbType.Decimal), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@SlabPercent", (object)lwfSlab.SlabPercent, new DbType?(DbType.Decimal), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_userid", (object)lwfSlab.fk_insUserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_locid", (object)lwfSlab.fk_locId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Timestamp", (object)lwfSlab.Timestamp, new DbType?(DbType.Binary), new ParameterDirection?(), new int?(), new byte?(), new byte?());


            int result = DataBaseFactory.QuerySP("SAL_LWFSlab_Upd", dynamicParameters, "LWFSlab_Insert");

            return result > 0;
        }
        public async Task<bool> Delete(long pk_slabid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_slabid", (object)pk_slabid, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int n = DataBaseFactory.QuerySP("SAL_LWFSlab_Del", dynamicParameters, "LWF Sbab");

            return n > 0; // Return true if rows were affected
        }
    }
}
