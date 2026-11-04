using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;
using System.Linq;
using static HRMSWebAPI.Models.ExitFormAuthorityMst;

namespace HRMSWebAPI.Repository
{
    public class ExitFormAuthorityRepository : IExitFormAuthorityRepository
    {



        public async Task<bool> CreateAsync(ExitInterviewApprovalDetailWrapper model)
        {

            string xmlData = XmlUtility.XmlSerializeToString(model);

            DynamicParameters dynamicParameters = new DynamicParameters();
            // dynamicParameters.Add("@pk_classTvlId", (object)model.TravelMasterMst.pk_classTvlId, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Doc", (object)xmlData, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            // Call the stored procedure
            int n = DataBaseFactory.QuerySP("FFS_ExitInterview_Approvedby_Detail_Ins", dynamicParameters, "FFS_ExitInterview_Approvedby_Detail_Insert");

            return n > 0;
        }







        public async Task<EmployeeApprovalDetail> GetById(string pk_Empid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_Empid", (object)pk_Empid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<EmployeeApprovalDetail>("FFS_ExitInterview_Approvedby_Detail_Edit", (object)dynamicParameters,
                "GetById").FirstOrDefault<EmployeeApprovalDetail>();
        }
    }
}
