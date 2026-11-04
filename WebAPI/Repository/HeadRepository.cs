using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;
using System.Linq;

namespace HRMSWebAPI.Repository
{
    public class HeadRepository:IHeadRepository
    {
        public async Task<bool> InsertHeadAsync(HeadMst headMst, string fk_insUserID, string Fk_LocID, string fk_companyId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Wrap the model in the required dataset structure
            HeadMstDataSet dataset = new HeadMstDataSet { Head = new List<HeadMst> { headMst } };

            // Serialize to XML
            string xmlData = XmlUtility.XmlSerializeToString(dataset);

            // Add parameters
            dynamicParameters.Add("@Doc", (object)xmlData, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_userid", (object)fk_insUserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_locId", (object)Fk_LocID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            // Log XML for debugging
            Console.WriteLine("Generated XML:\n" + xmlData);

            // Execute stored procedure
            int result =  DataBaseFactory.QuerySP("SAL_Head_Ins", dynamicParameters, "Head_Insert");

            return result > 0;
        }
        //public async Task<(int totalCount, IEnumerable<HeadMst>)> GetAll(int pageIndex, int pageSize, string fk_companyId)
        //{
        //    DynamicParameters dynamicParameters = new DynamicParameters();
        //    dynamicParameters.Add("@pageindex", (object)pageIndex, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    dynamicParameters.Add("@pagesize", (object)pageSize, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    dynamicParameters.Add("@fk_companyId", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());


        //    var tuple = DataBaseFactory.QueryMultipleSP<dynamic, HeadMst>("SAL_Head_SelForGrid", dynamicParameters, "HeadMst_GetAll");
        //    if (tuple == null || tuple.Item2 == null)
        //        return (0, new List<HeadMst>());

        //    // Extract totalCount safely
        //    int totalCount = 0;
        //    if (tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any())
        //    {
        //        var firstItem = totalList.First() as IDictionary<string, object>;
        //        if (firstItem != null && firstItem.Values.Any())
        //        {
        //            totalCount = Convert.ToInt32(firstItem.Values.First());
        //        }
        //    }

        //    return (totalCount, tuple.Item2?.ToList() ?? new List<HeadMst>());
        //}
        public async Task<(int totalCount, IEnumerable<HeadMst>)> GetAll(int pageIndex, int pageSize, string fk_companyId, string searchTerm = "")
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pageindex", (object)pageIndex, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pageSize, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@SearchTerm", searchTerm ?? "", DbType.String);


            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, HeadMst>("SAL_Head_SelForGrid", dynamicParameters, "HeadMst_GetAll");
            if (tuple == null || tuple.Item2 == null) return (0, []);
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                            ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

            return (totalCount, tuple?.Item2?.ToList());
        }


        public async Task<HeadMst> GetHeadByIdAsync(string pk_headid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@Pk_headid", (object)pk_headid, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<HeadMst>("SAL_Head_Edit", (object)dynamicParameters, "Head Master - GetById").FirstOrDefault<HeadMst>();
        }
        public async Task<bool> DeleteHeadAsync(long pk_headid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@Pk_headid", (object)pk_headid, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int n = DataBaseFactory.QuerySP("SAL_Head_Del", dynamicParameters, "Head_Mst_Delete");

            return n > 0; // Return true if rows were affected
        }
        public async Task<bool> UpdateHeadAsync(HeadMst headMst,string fk_insUserID, string Fk_LocID)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Wrap the model in the required dataset structure
            HeadMstDataSet dataset = new HeadMstDataSet { Head = new List<HeadMst> { headMst } };

            // Serialize to XML
            string xmlData = XmlUtility.XmlSerializeToString(dataset);

            dynamicParameters.Add("@Pk_headid", (object)headMst.pk_headid, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Doc", (object)xmlData, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_userid", (object)fk_insUserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_locId", (object)Fk_LocID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Timestamp", (object)headMst.Timestamp, new DbType?(DbType.Binary), new ParameterDirection?(), null, new byte?(), new byte?());
            dynamicParameters.Add("@Timestamp", (object)headMst.Timestamp, new DbType?(DbType.Binary), new ParameterDirection?(), null, new byte?(), new byte?());


            // Log XML for debugging
            Console.WriteLine("Generated XML:\n" + xmlData);

            // Execute stored procedure
            int result =  DataBaseFactory.QuerySP("SAL_Head_Upd", dynamicParameters, "Head_Update");

            return result > 0;
        }
    }
}
