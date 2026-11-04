using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class EmailConfigRepository : IEmailConfigRepository
    {
        public async Task<bool> InsertEmailConfigAsync(EmailConfigMst config)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@host", (object)config.host, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@port", (object)config.port, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@userName", (object)config.userName, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@password", (object)config.password, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fromEmailAddress", (object)config.fromEmailAddress, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Tdsemail", (object)config.Tdsemail, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@sslEnabled", (object)config.sslEnabled, new DbType?(DbType.Boolean), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            Console.WriteLine("Insert EmailConfig Params:\n" + System.Text.Json.JsonSerializer.Serialize(config));

            int result = DataBaseFactory.QuerySP("Comm_EmailConfig_Ins", dynamicParameters, "EmailConfig_Insert");
            return result > 0;
        }

        public async Task<EmailConfigMst> GetEmailConfigAsync()
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            var result = DataBaseFactory.QuerySP<EmailConfigMst>(
                "Comm_EmailConfig_Edit",
                dynamicParameters,
                "EmailConfig_Get");

            return result.FirstOrDefault();
        }

        public async Task<bool> UpdateEmailConfigAsync(EmailConfigMst config)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@host", (object)config.host, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@port", (object)config.port, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@userName", (object)config.userName, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@password", (object)config.password, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fromEmailAddress", (object)config.fromEmailAddress, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Tdsemail", (object)config.Tdsemail, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@sslEnabled", (object)config.sslEnabled, new DbType?(DbType.Boolean), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            Console.WriteLine("Update EmailConfig Params:\n" + System.Text.Json.JsonSerializer.Serialize(config));

            int result = DataBaseFactory.QuerySP("Comm_EmailConfig_Upd", dynamicParameters, "EmailConfig_Update");
            return result > 0;
        }



    }
}
