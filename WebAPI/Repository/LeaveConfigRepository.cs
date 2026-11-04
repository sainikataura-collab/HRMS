using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class LeaveConfigRepository : ILeaveConfigRepository
    {
        public async Task<bool> InsertLeaveConfigAsync(List<LeaveConfigMst> leaveConfigList, string fk_companyId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            LeaveConfigMstDataSet dataset = new LeaveConfigMstDataSet { LeaveConfigMst = leaveConfigList };
            string xmlData = XmlUtility.XmlSerializeToString(dataset);

            dynamicParameters.Add("@xmlDoc", (object)xmlData, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            Console.WriteLine("Generated XML (Insert):\n" + xmlData);

            int result = DataBaseFactory.QuerySP("SAL_LeaveConfig_Ins", dynamicParameters, "LeaveConfig_Insert");
            return result > 0;
        }

        public async Task<LeaveConfigMst> GetLeaveConfigByCompanyIdAsync(string fk_companyId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@fk_companyId", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            var result = DataBaseFactory.QuerySP<LeaveConfigMst>("SAL_LeaveConfig_Edit",dynamicParameters,"LeaveConfig_GetByCompanyId");

            return result.FirstOrDefault();
        }

        public async Task<bool> UpdateLeaveConfigAsync(List<LeaveConfigMst> leaveConfigList, string fk_companyId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            LeaveConfigMstDataSet dataset = new LeaveConfigMstDataSet { LeaveConfigMst = leaveConfigList };
            string xmlData = XmlUtility.XmlSerializeToString(dataset);

            dynamicParameters.Add("@xmlDoc", (object)xmlData, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            Console.WriteLine("Generated XML (Update):\n" + xmlData);
            int result = DataBaseFactory.QuerySP("SAL_LeaveConfig_Upd", dynamicParameters, "LeaveConfig_Update");
            return result > 0;
        }

    }
}
