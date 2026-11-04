using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class ManPowerApproveRepository : IManPowerApproveRepository
    {

        public async Task<bool> InsertJobRequisitionApprovalAsync(ManPowerApproveMstApprovalDataSet approvalDataSet)
        {
            DynamicParameters parameters = new DynamicParameters();

            // Convert object to XML string
            string xmlData = XmlUtility.XmlSerializeToString(approvalDataSet);
            parameters.Add("@Doc", xmlData, DbType.String);
            // Execute the stored procedure
            int result = DataBaseFactory.QuerySP("REC_JobRequisition_Mst_Approval_Ins", parameters, "Insert Job Requisition Approval");
            return result > 0;
        }

        public async Task<ManPowerApproveMstDataSet?> GetAllManpowerApprovalAsync(string fk_empid)
        {
            DynamicParameters p = new DynamicParameters();
            p.Add("@fk_empid", fk_empid, DbType.String, size: 15);

            var tuple = DataBaseFactory.QueryMultipleSP<ManPowerApproveMstFrist, ManPowerApproveMstFristSecond>(
                "REC_JobRequisition_Mst_Approval_Selforgrid", p, "Get All Manpower Approval Grid"
            );
            if (tuple == null || tuple.Item1 == null) return null;
            var result = new ManPowerApproveMstDataSet
            {
                ManPowerApproveMstFrist = tuple.Item1?.ToList() ?? new List<ManPowerApproveMstFrist>(),
                ManPowerApproveMstFristSecond = tuple.Item2?.ToList() ?? new List<ManPowerApproveMstFristSecond>()
            };
            return result;
        }

    }
}
