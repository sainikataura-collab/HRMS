using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class ManpowerRepository : IManpowerRepository
    {
        public async Task<bool> InsertManpowerAsync(ManpowerMstDataSet manpowerMstDataSet, string fk_empid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            // XML serialize the ManpowerMstDataSet object
            string xmlData = XmlUtility.XmlSerializeToString(manpowerMstDataSet);
            dynamicParameters.Add("@xmlDoc", xmlData, DbType.String);
            dynamicParameters.Add("@fk_empid", fk_empid, DbType.String);
            // Call the stored procedure
            int result = DataBaseFactory.QuerySP("REC_JobRequisition_Ins", dynamicParameters, "JobRequisition_Ins");
            return result > 0;
        }

        public async Task<(int totalCount, IEnumerable<ManpowerRequisitionGridModel>)> GetAllManpowerRequestsAsync(int pageIndex, int pageSize, string fk_empid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pageindex", (object)pageIndex, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pageSize, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_empid", (object)fk_empid, new DbType?(DbType.String), new ParameterDirection?(), new int?(15), new byte?(), new byte?());

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, ManpowerRequisitionGridModel>(
                "REC_JobRequisition_SelForGrid", dynamicParameters, "Job Requisition - GetAll");

            if (tuple == null || tuple.Item2 == null)
                return (0, new List<ManpowerRequisitionGridModel>());

            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First())
                : 0;

            return (totalCount, tuple.Item2?.ToList());
        }

        public async Task<ManpowerMstDataSet?> GetManpowerByIdAsync(long pk_reqid, string fk_empid)
        {
            DynamicParameters p = new DynamicParameters();
            p.Add("@pk_reqid", pk_reqid, DbType.Int64);
            p.Add("@fk_empid", fk_empid, DbType.String, size: 15);

            var tuple = DataBaseFactory.QueryMultipleSP<ManpowerMst, ManpowerQualification, ManpowerSpecialization>(
                "REC_JobRequisition_Edit", p, "Get Manpower By ID"
            );

            if (tuple == null || tuple.Item1 == null) return null;

            var result = new ManpowerMstDataSet
            {
                ManpowerMst = tuple.Item1.FirstOrDefault(),
                ManpowerQualification = tuple.Item2?.ToList() ?? new List<ManpowerQualification>(),
                ManpowerSpecialization = tuple.Item3?.ToList() ?? new List<ManpowerSpecialization>()
            };

            return result;
        }


        public async Task<bool> UpdateManpowerAsync(long pk_reqid, ManpowerMstDataSet manpowerMstDataSet, string fk_empid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            string xmlData = XmlUtility.XmlSerializeToString(manpowerMstDataSet);

            dynamicParameters.Add("@pk_reqid", (object)pk_reqid, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@xmlDoc", (object)xmlData, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_empid", (object)fk_empid, new DbType?(DbType.String), new ParameterDirection?(), new int?(15), new byte?(), new byte?());

            int result = DataBaseFactory.QuerySP("REC_JobRequisition_Upd", dynamicParameters, "JobRequisition_Upd");
            return result > 0;
        }




        public async Task<bool> DeleteManpowerAsync(long pk_reqid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_reqid", (object)pk_reqid, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int result = DataBaseFactory.QuerySP("REC_JobRequisition_Del", dynamicParameters, "Delete Job Requisition");
            return result > 0;
        }




    }
}
