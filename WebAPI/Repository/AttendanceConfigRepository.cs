using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class AttendanceConfigRepository: IAttendanceConfigRepository
    {
        public async Task<bool> InsertAttendanceConfigAsync(AttendanceConfigMst attendanceConfigs, string fk_companyId)
        {
            string xmlData = XmlUtility.XmlSerializeToString(attendanceConfigs);

            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("@xmlDoc", xmlData, DbType.String);
            parameters.Add("@fk_companyId", fk_companyId, DbType.String);

            int n = DataBaseFactory.QuerySP("SAL_AttendanceConfig_Ins", parameters, "AttendanceConfig_Insert");
            return n > 0;
        }

        // ✅ Get / Edit
        public async Task<IEnumerable<SAL_LeaveConfig>> GetAttendanceConfigByCompanyAsync(string fk_companyId)
        {
            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("@fk_companyId", fk_companyId, DbType.String);

            var result = DataBaseFactory.QuerySP<SAL_LeaveConfig>("SAL_AttendanceConfig_Edit", parameters,"AttendanceConfig_GetByCompany");

            return result;
        }

        // ✅ Update
        public async Task<bool> UpdateAttendanceConfigAsync(AttendanceConfigMst attendanceConfigs, string fk_companyId)
        {
            string xmlData = XmlUtility.XmlSerializeToString(attendanceConfigs);

            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("@xmlDoc", xmlData, DbType.String);
            parameters.Add("@fk_companyId", fk_companyId, DbType.String);

            int n = DataBaseFactory.QuerySP("SAL_AttendanceConfig_Upd", parameters, "AttendanceConfig_Update");
            return n > 0;
        }




    }
}
