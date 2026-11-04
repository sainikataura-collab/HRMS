using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;
using static Dapper.SqlMapper;

namespace HRMSWebAPI.Repository
{
    public class CompOffRequestRepository : ICompOffRequestRepository
    {
        public async Task<dynamic> ApproveOrRejectCompOffAsync(long pk_applycompoffId, int approvalOrder)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_applycompoffId", pk_applycompoffId, DbType.Int64);
            dynamicParameters.Add("@approvalOrder", approvalOrder, DbType.Int32);

            var result = DataBaseFactory.QuerySP<dynamic>(
                "SAL_ApplyCompOff_Approve",
                dynamicParameters,
                "CompOff_Approve"
            ).FirstOrDefault();

            return result ?? new { IsSuccess = 0, Message = "No response from stored procedure." };
        }

        public async Task<(bool isSuccess, string message)> DeleteCompOffLeaveAsync(string pk_applycompoffId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_applycompoffId", pk_applycompoffId, DbType.String);

            var result = await DataBaseFactory.QuerySPAsync<dynamic>(
                "SAL_ApplyCompOff_Leave_Mst_Del",
                dynamicParameters,
                "Leave_Delete"   // category/logging key
            );

            var row = result.FirstOrDefault();
            if (row != null)
            {
                return (row.IsSuccess == 1, row.Message);
            }

            return (false, "Unexpected error occurred.");
        }
        public async Task<ModelResponse> InsertCompOffRequestAsync(CompOffRequestMstDataSet data)
        {
            string xmlData = XmlUtility.XmlSerializeToString(data);
            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("@Doc", xmlData, DbType.String);
            // Step 3: Execute Stored Procedure
            return DataBaseFactory.QuerySP<ModelResponse>("SAL_ApplyCompOff_Leave_Mst_Ins", (object)parameters, "SAL_ApplyCompOff_Leave_Mst_Ins").FirstOrDefault<ModelResponse>();
        }

        public async Task<IEnumerable<CompOffRequestSelforGrid>> GetAllCompOffByEmpAllAsync(string fk_empid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@fk_empid", (object)fk_empid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            var result = DataBaseFactory.QuerySP<CompOffRequestSelforGrid>("SAL_ApplyCompOff_Leave_Mst_Selforgrid", dynamicParameters, "Get_CompOffList");
            return result ?? new List<CompOffRequestSelforGrid>();
        }
        public async Task<IEnumerable<CompOffRequestSelforGrid>> GetCompOffByEmpAllAsync(string fk_empid, string dated)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@fk_empid", (object)fk_empid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@dated", (object)dated, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            var result = DataBaseFactory.QuerySP<CompOffRequestSelforGrid>("SAL_ApplyCompOff_Attendance", dynamicParameters, "ApplyCompOff_Attendance");
            return result ?? new List<CompOffRequestSelforGrid>();
        }

        public async Task<IEnumerable<CompOffRequestSelforGrid>> GetAllCompOffByEmpIdAsync(string pk_applycompoffId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_applycompoffId", (object)pk_applycompoffId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            var result = DataBaseFactory.QuerySP<CompOffRequestSelforGrid>("SAL_ApplyCompOff_Leave_Mst_Edit", dynamicParameters, "Get_CompOffGetByid");
            return result ?? new List<CompOffRequestSelforGrid>();
        }



    }
}