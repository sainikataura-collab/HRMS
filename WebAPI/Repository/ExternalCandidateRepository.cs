using Dapper;
using HRMSWebAPI.Models;
using System.Data.SqlClient;

namespace HRMSWebAPI.Repository
{
    public interface IExternalCandidateRepository
    {
        Task<bool> AddExternalCandidateAsync(ExternalCandidate candidate);
        Task<List<ExternalCandidate>> GetExternalCandidatesByJobIdAsync(string jobId);
        Task<ExternalRecruitmentStats> GetDashboardStatsAsync();
    }

    public class ExternalCandidateRepository : IExternalCandidateRepository
    {
        private readonly string _connectionString;

        public ExternalCandidateRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("WebApplication1DBConnection");
        }

        public async Task<bool> AddExternalCandidateAsync(ExternalCandidate candidate)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.ExecuteAsync(
                    "sp_AddExternalCandidate", 
                    candidate, 
                    commandType: System.Data.CommandType.StoredProcedure);
                return true;
            }
        }

        public async Task<List<ExternalCandidate>> GetExternalCandidatesByJobIdAsync(string jobId)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                var result = await connection.QueryAsync<ExternalCandidate>(
                    "sp_GetExternalCandidatesByJobId", 
                    new { JobId = jobId },
                    commandType: System.Data.CommandType.StoredProcedure);
                return result.ToList();
            }
        }

        public async Task<ExternalRecruitmentStats> GetDashboardStatsAsync()
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                var result = await connection.QueryFirstOrDefaultAsync<ExternalRecruitmentStats>(
                    "sp_GetExternalRecruitmentStats",
                    commandType: System.Data.CommandType.StoredProcedure);
                
                return result ?? new ExternalRecruitmentStats();
            }
        }
    }
}
