using Dapper;
using Microsoft.Extensions.Configuration;
using System;
using System.Data;
using System.Threading.Tasks;

namespace HRMSWebAPI.Helper
{
    public class EmailGatewayService
    {
        private readonly string _currentDbName;

        public EmailGatewayService(IConfiguration configuration)
        {
            // Extract DB name from main connection string
            var mainConn = configuration.GetConnectionString("WebApplication1DBConnection") ?? "";
            var builder = new System.Data.SqlClient.SqlConnectionStringBuilder(mainConn);
            _currentDbName = builder.InitialCatalog;
        }

        /// <summary>
        /// Inserts email details into Empower_EmailServer..SAL_Email_Log 
        /// via SP in HRBook DB (cross-database insert).
        /// Returns true if INSERT succeeded, false if it failed.
        /// </summary>
        public async Task<(bool success, string errorMessage)> InsertToEmailQueueAsync(
            string toAddress,
            string subject,
            string htmlBody,
            string companyId)
        {
            try
            {
                var p = new DynamicParameters();
                p.Add("@TOAddress",    toAddress,      DbType.String);
                p.Add("@TOSubject",    subject,        DbType.String);
                p.Add("@MailBody",     htmlBody,       DbType.String);
                p.Add("@fk_companyId", companyId,      DbType.String);
                p.Add("@dbName",       _currentDbName, DbType.String);

                var result = await DataBaseFactory.QuerySPAsync("SAL_EmailGateway_Ins", p);

                return (true, string.Empty);
            }
            catch (Exception ex)
            {
                return (false, $"Email gateway INSERT failed: {ex.Message}");
            }
        }
    }
}
