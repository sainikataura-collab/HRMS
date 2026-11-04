using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;
using System.Linq;

namespace HRMSWebAPI.Repository
{
    public class CompOffApprovalRepository : ICompOffApprovalRepository
    {
        public async Task<bool> Insert_ApprovalApplyCompOffReqMstAsync(LeaveModuleMst model)
        {

            DynamicParameters dynamicParameters = new DynamicParameters();
            string xmlData = XmlUtility.XmlSerializeToString(model);
            dynamicParameters.Add("@XmlLeave", (object)xmlData, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            int result = DataBaseFactory.QuerySP("SAL_ApplyCompOff_Leave_Mst_Approval_InsNew", dynamicParameters, "CompOff_Leave_Mst_Approval_Ins");
            return result > 0;

        }

        public async Task<IEnumerable<CompOffApprovalMst>> GetAll_ApprovalApplyCompOffAsync(string EmpId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@fk_empid", (object)EmpId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            var result = DataBaseFactory.QuerySP<CompOffApprovalMst>("SAL_ApplyCompOff_Leave_Mst_Approval_SelforgridNew", dynamicParameters, "CompOff_Leave_Mst_Approval Details").ToList();
            return result;
        }

        public async Task<CompOffRequestSelforGrid> GetAllCompOffByEmpIdAsync(string pk_applycompoffId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_applycompoffId", (object)pk_applycompoffId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<CompOffRequestSelforGrid>("SAL_ApplyCompOff_Leave_Mst_Edit", dynamicParameters, "Get_CompOffGetByid").FirstOrDefault<CompOffRequestSelforGrid>();

        }


    }
}