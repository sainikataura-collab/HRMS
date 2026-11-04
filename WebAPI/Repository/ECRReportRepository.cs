using System.Data;
using System.Data.SqlClient;
using System.Threading.Tasks;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public class ECRReportRepository : IECRReportRepository
    {
        public async Task<(DataTable Header, DataTable Details)> GetECRReportDataAsync(ReportModelRequest request)
        {
            var headerTable = new DataTable("Header");
            var detailsTable = new DataTable("Details");

            using (var connection = DataBaseFactory.ConnString())
            {
                using (var command = connection.CreateCommand())
                {
                    command.CommandText = "SAL_ECR_Report_Sel";
                    command.CommandType = CommandType.StoredProcedure;

                    // Add parameters if required
                    command.Parameters.Add(new SqlParameter("@fk_monthId", string.IsNullOrEmpty(request.fk_monthId) ? (object)System.DBNull.Value : request.fk_monthId));
                    command.Parameters.Add(new SqlParameter("@fk_yearId", string.IsNullOrEmpty(request.fk_yearId) ? (object)System.DBNull.Value : request.fk_yearId));
                    command.Parameters.Add(new SqlParameter("@fk_companyId", string.IsNullOrEmpty(request.fk_companyid) ? (object)System.DBNull.Value : request.fk_companyid));
                    command.Parameters.Add(new SqlParameter("@fk_costcentreid", string.IsNullOrEmpty(request.fk_costcentreid) ? (object)System.DBNull.Value : request.fk_costcentreid));

                    using (var adapter = new SqlDataAdapter((SqlCommand)command))
                    {
                        var dataSet = new DataSet();
                        adapter.Fill(dataSet);

                        if (dataSet.Tables.Count > 0)
                            headerTable = dataSet.Tables[0];
                        if (dataSet.Tables.Count > 1)
                            detailsTable = dataSet.Tables[1];
                    }
                }
            }

            return (headerTable, detailsTable);
        }
    }
}
