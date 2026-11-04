using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class DealerOutletRepository:IDealerOutletRepository
    {

        public async Task<(int totalCount, IEnumerable<dynamic>)> GetAllAsync(int pageIndex, int pageSize, string fk_userId, string fk_companyId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Add parameters matching the stored procedure
            dynamicParameters.Add("@pageindex", (object)pageIndex, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pageSize, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_userId", (object)fk_userId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            // Execute stored procedure using QueryMultipleSP
            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic>("DealerOutlet_SelForGrid", dynamicParameters, "GetAll");

            if (tuple == null || tuple.Item2 == null)
                return (0, new List<dynamic>());

            // Extract totalCount safely
            int totalCount = 0;
            if (tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any())
            {
                var firstItem = totalList.First() as IDictionary<string, object>;
                if (firstItem != null && firstItem.Values.Any())
                {
                    totalCount = Convert.ToInt32(firstItem.Values.First());
                }
            }
            return (totalCount, tuple.Item2?.ToList() ?? new List<dynamic>());
        }



        public async Task<bool> InsertDealerOutletAsync(List<DealerOutletMst> outletList,string fk_companyId
)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Dataset wrapper
            DealerOutletDataSet dataset = new DealerOutletDataSet
            {
                DealerOutlet_Mst = outletList
            };

            // Convert to XML
            string xmlData = XmlUtility.XmlSerializeToString(dataset);

            // Parameters
            dynamicParameters.Add("@xmlDoc", xmlData, DbType.String);
            dynamicParameters.Add("@fk_companyId", fk_companyId, DbType.String);

            // Debug
           // Console.WriteLine("Generated XML:\n" + xmlData);

            // Execute SP
            int result =  DataBaseFactory.QuerySP(
                "DealerOutlet_Ins",
                dynamicParameters,
                "DealerOutlet_Insert"
            );

            return result > 0;
        }


        public async Task<bool> DeleteDealerOutletAsync(int pk_dealerOutletId)
        {
            DynamicParameters param = new DynamicParameters();

            param.Add("@pk_dealerOutletId", pk_dealerOutletId, DbType.Int32);

            int result =  DataBaseFactory.QuerySP(
                "DealerOutlet_Del",
                param,
                "DealerOutlet_Delete"
            );

            return result > 0;
        }

        public async Task<DealerOutletMst> GetDealerOutletByIdAsync(int pk_dealerOutletId)
        {
            DynamicParameters param = new DynamicParameters();
            param.Add("@pk_dealerOutletId", pk_dealerOutletId, DbType.Int32);

            return DataBaseFactory.QuerySP<DealerOutletMst>("DealerOutlet_SelById", (object)param, "GetById").FirstOrDefault<DealerOutletMst>();

        }


        public async Task<bool> UpdateDealerOutletAsync(List<DealerOutletMst> outletList)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Dataset wrapper (same as insert)
            DealerOutletDataSet dataset = new DealerOutletDataSet
            {
                DealerOutlet_Mst = outletList
            };

            // Convert to XML
            string xmlData = XmlUtility.XmlSerializeToString(dataset);

            // Parameter
            dynamicParameters.Add("@xmlDoc", xmlData, DbType.String);

            // Debug (optional)
            // Console.WriteLine("Generated XML:\n" + xmlData);

            // Execute SP
            int result = DataBaseFactory.QuerySP(
                "DealerOutlet_Upd",   // your update SP
                dynamicParameters,
                "DealerOutlet_Update"
            );

            return result > 0;
        }
    }
}
