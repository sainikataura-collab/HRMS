using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;
using System.Linq;


namespace HRMSWebAPI.Repository


{
    public class ShiftRepository:IShiftRepository
    {
       
        

        public async Task<bool> InsertShiftMstAsync(ShiftMst shifts)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Wrap the data in the required dataset structure
            ShiftMstInsertDataSet dataset = new ShiftMstInsertDataSet { Shifts = shifts };

            // Serialize to XML
            string xmlData = XmlUtility.XmlSerializeToString(dataset);

            // Add XML parameter
            dynamicParameters.Add("@Doc", xmlData, DbType.String);

            // Execute stored procedure
            int result = await DataBaseFactory.QuerySPAsync("SAL_Shift_Mst_Ins", dynamicParameters, "Shift_Insert");

            return result > 0;
        }

        public async Task<ShiftMst> GetShiftByIdAsync(string shiftId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_shiftId", (object)shiftId, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<ShiftMst>("SAL_Shift_Mst_Edit", (object)dynamicParameters, "Shift Master - GetById").FirstOrDefault<ShiftMst>();
        }


        public async Task<bool> UpdateShiftMstAsync(ShiftMst shiftmst)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Wrap the single shift in a dataset for XML serialization
            ShiftMstUpdateDataSet dataset = new ShiftMstUpdateDataSet { Shifts = shiftmst };

            // Serialize to XML
            string xmlData = XmlUtility.XmlSerializeToString(dataset);

            // Add parameters
            dynamicParameters.Add("@pk_shiftId", (object)shiftmst.pk_shiftId, new DbType?(DbType.Int64), new ParameterDirection?(),new int?(),new byte?(),new byte?());

            dynamicParameters.Add("@Doc",(object)xmlData, new DbType?(DbType.String), new ParameterDirection?(),new int?(),new byte?(), new byte?());

            // Execute stored procedure
            int result =  DataBaseFactory.QuerySP("SAL_Shift_Mst_Upd", dynamicParameters, "Shift_Update");

            return result > 0;
        }


        public async Task<(int totalCount, IEnumerable<ShiftMst>)> GetAll(int pageIndex, int pageSize, string fk_companyId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@pageindex", (object)pageIndex, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pageSize, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, ShiftMst>("SAL_Shift_Mst_SelForGrid", dynamicParameters, "Shift-getALL");
            if (tuple == null || tuple.Item2 == null) return (0, []);
            //Convert Total Count
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

            return (totalCount, tuple?.Item2?.ToList());
        }

        public async Task<bool> DeleteZoneMstAsync(long pk_shiftId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_shiftId", (object)pk_shiftId, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int n = DataBaseFactory.QuerySP("SAL_Shift_Mst_Del", dynamicParameters, "Shift_Mst_Delete");

            return n > 0; // Return true if rows were affected
        }











    }
}
