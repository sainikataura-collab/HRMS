using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class ScreeningCommitteeRepository:IScreeningCommitteeRepository
    {

        public async Task<bool> Insert(ScreeningCommitteeXmlModel dataMst, string Fk_UserID, string Fk_LocID)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            string xmlData = XmlUtility.XmlSerializeToString(dataMst);
            // Add parameters
            dynamicParameters.Add("@Doc", (object)xmlData, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_UserID", (object)Fk_UserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_LocID", (object)Fk_LocID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
           
           

            // Execute stored procedure
            int result = DataBaseFactory.QuerySP("REC_Screening_Committee_Members_Ins", dynamicParameters, "Ins");

            return result > 0;
        }


        public async Task<bool> Update(ScreeningCommitteeXmlModel dataMst, string Pk_Screening_CommitteeId, string Fk_UserID, string Fk_LocID)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            string xmlData = XmlUtility.XmlSerializeToString(dataMst);
            // Add parameters
            dynamicParameters.Add("@Pk_Screening_CommitteeId", (object)Pk_Screening_CommitteeId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Doc", (object)xmlData, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_UserID", (object)Fk_UserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_LocID", (object)Fk_LocID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Timestamp", (object)dataMst.ScreeningCommittee.Timestamp, new DbType?(DbType.Binary), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            // Log XML for debugging
            Console.WriteLine("Generated XML:\n" + xmlData);

            // Execute stored procedure
            int result = DataBaseFactory.QuerySP("REC_Screening_Committee_Members_Upd", dynamicParameters, "Ins");

            return result > 0;
        }

        public async Task<(int totalCount, IEnumerable<ScreeningCommittee>)> GetAll(int pageindex, int pagesize)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pageindex", (object)pageindex, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pagesize, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            
            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, ScreeningCommittee>("REC_Screening_Committee_Members_SelForGrid", dynamicParameters, "GetAll");
            if (tuple == null || tuple.Item2 == null) return (0, []);
            //Convert Total Count
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

            return (totalCount, tuple?.Item2?.ToList());
        }


        public async Task<ScreeningCommitteeMst> GetById(string Pk_Screening_CommitteeId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@Pk_Screening_CommitteeId", Pk_Screening_CommitteeId, DbType.String);

            var tuple = DataBaseFactory.QueryMultipleSP<ScreeningCommittee, ScreeningCommitteeMember>("REC_Screening_Committee_Members_Edit", dynamicParameters, "GetAll");

            var result = new ScreeningCommitteeMst();
            if (tuple != null && tuple?.Item1 != null)
            {
                result.ScreeningCommittee = tuple.Item1.FirstOrDefault();
            }
            if (tuple != null && tuple?.Item2 != null)
            {
                result.ScreeningCommitteeMember = tuple.Item2.ToList();
            }
           

            return result;
        }

        public async Task<bool> DeleteAsync(string Pk_Screening_CommitteeId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@Pk_Screening_CommitteeId", (object)Pk_Screening_CommitteeId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int n = DataBaseFactory.QuerySP("REC_Screening_Committee_Members_Del", dynamicParameters, "Delete");

            return n > 0; // Return true if rows were affected
        }

    }
}
