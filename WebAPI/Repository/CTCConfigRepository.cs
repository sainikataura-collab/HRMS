using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class CTCConfigRepository : ICTCConfigRepository
    {
        public async Task<bool> InsertCTCConfigAsync(CTCConfigSaveRequest request, string fk_insUserID, string Fk_LocID, string fk_companyId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Serialize config + components to XML
            CTCConfigDataSet dataset = new CTCConfigDataSet
            {
                Config = new List<CTCConfigMst> { request.config! },
                Components = request.components ?? new List<CTCConfigComponent>()
            };

            string xmlData = XmlUtility.XmlSerializeToString(dataset);

            dynamicParameters.Add("@Doc", (object)xmlData, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_userid", (object)fk_insUserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_locId", (object)Fk_LocID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            Console.WriteLine("Generated XML:\n" + xmlData);

            int result = DataBaseFactory.QuerySP("SAL_CTCConfig_Ins", dynamicParameters, "CTCConfig_Insert");

            return result > 0 || result == -1;
        }

        public async Task<(int totalCount, IEnumerable<CTCConfigMst>)> GetAll(int pageIndex, int pageSize, string fk_companyId, string searchTerm = "")
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pageindex", (object)pageIndex, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pageSize, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@SearchTerm", searchTerm ?? "", DbType.String);

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, CTCConfigMst>("SAL_CTCConfig_SelForGrid", dynamicParameters, "CTCConfigMst_GetAll");
            if (tuple == null || tuple.Item2 == null) return (0, []);
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                            ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

            return (totalCount, tuple?.Item2?.ToList());
        }

        public async Task<CTCConfigMst> GetCTCConfigByIdAsync(string configId, string companyId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_ctcConfigId", (object)configId, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", (object)companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            // Get config header and components together
            var tuple = DataBaseFactory.QueryMultipleSP<CTCConfigMst, CTCConfigComponent>("SAL_CTCConfig_Edit", (object)dynamicParameters, "CTCConfig_GetById");
            
            var config = tuple?.Item1?.FirstOrDefault();
            if (config != null)
            {
                config.components = tuple?.Item2?.ToList() ?? new List<CTCConfigComponent>();
            }

            return config;
        }

        public async Task<bool> UpdateCTCConfigAsync(CTCConfigSaveRequest request, string fk_insUserID, string Fk_LocID)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            CTCConfigDataSet dataset = new CTCConfigDataSet
            {
                Config = new List<CTCConfigMst> { request.config! },
                Components = request.components ?? new List<CTCConfigComponent>()
            };

            string xmlData = XmlUtility.XmlSerializeToString(dataset);

            dynamicParameters.Add("@pk_ctcConfigId", (object)request.config!.pk_ctcConfigId!, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Doc", (object)xmlData, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_userid", (object)fk_insUserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_locId", (object)Fk_LocID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Timestamp", (object)request.config!.Timestamp!, new DbType?(DbType.Binary), new ParameterDirection?(), null, new byte?(), new byte?());

            Console.WriteLine("Generated XML:\n" + xmlData);

            int result = DataBaseFactory.QuerySP("SAL_CTCConfig_Upd", dynamicParameters, "CTCConfig_Update");

            return result > 0 || result == -1;
        }

        public async Task<bool> DeleteCTCConfigAsync(long pk_ctcConfigId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_ctcConfigId", (object)pk_ctcConfigId, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int n = DataBaseFactory.QuerySP("SAL_CTCConfig_Del", dynamicParameters, "CTCConfig_Delete");

            return n > 0 || n == -1;
        }

        public async Task<IEnumerable<CTCConfigComponent>> GetHeadsByType(string fk_companyId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@fk_companyId", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            var result = DataBaseFactory.QuerySP<CTCConfigComponent>("SAL_Head_SelByType", (object)dynamicParameters, "Head_GetByType");
            return result?.ToList() ?? new List<CTCConfigComponent>();
        }
    }
}
