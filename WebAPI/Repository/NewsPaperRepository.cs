using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class NewsPaperRepository : INewsPaperRepository
    {
        public async Task<bool> InsertNewsPaperMst(NewsPaperMst newsPaperMst)
        {
            // Create DynamicParameters for the stored procedure
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@NewspaperName", newsPaperMst.newspaperName, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Contactperson1", newsPaperMst.contactperson1, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Contactno1", newsPaperMst.contactno1, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Contactperson2", newsPaperMst.contactperson2, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Contactno2", newsPaperMst.contactno2, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_UserID", newsPaperMst.fk_insUserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_LocID", newsPaperMst.fk_insDateID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", newsPaperMst.fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            // Execute the stored procedure
            int rowsAffected = DataBaseFactory.QuerySP("REC_NewsPaper_Ins", dynamicParameters, "NewsPaper_Insert");
            // Return true if rows were affected
            return rowsAffected > 0;
        }

        public async Task<(int totalCount, IEnumerable<NewsPaperMst>)> GetAll(int pageIndex, int pageSize, string fkCompanyId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pageindex", pageIndex, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", pageSize, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", fkCompanyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, NewsPaperMst>("REC_NewsPaper_SelForGrid", dynamicParameters, "NewsPaperMst_GetAll");

            if (tuple == null || tuple.Item2 == null) return (0, new List<NewsPaperMst>());

            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First())
                : 0;

            return (totalCount, tuple?.Item2?.ToList());
        }

        public async Task<NewsPaperMst> GetNewsPaperById(string newspaperId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@Pk_NewspaperId", newspaperId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<NewsPaperMst>("REC_NewsPaper_Edit", dynamicParameters, "NewsPaper_Edit").FirstOrDefault();
        }

        public async Task<bool> UpdateNewsPaper(NewsPaperMst newsPaper)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@Pk_NewspaperId", newsPaper.pk_newspaperId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@NewspaperName", newsPaper.newspaperName, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Contactperson1", newsPaper.contactperson1, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Contactno1", newsPaper.contactno1, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Contactperson2", newsPaper.contactperson2, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Contactno2", newsPaper.contactno2, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_UserID", newsPaper.fk_updUserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_LocID", newsPaper.fk_updDateID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Timestamp", newsPaper.Timestamp, new DbType?(DbType.Binary), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            // Execute stored procedure for update
            int rowsAffected = DataBaseFactory.QuerySP("REC_NewsPaper_Upd", dynamicParameters, "NewsPaper_Update");
            return rowsAffected > 0; // Return true if rows were affected
        }

        public async Task<bool> DeleteNewsPaper(string newspaperId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@Pk_NewspaperId", newspaperId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            int rowsAffected = DataBaseFactory.QuerySP("REC_NewsPaper_Del", dynamicParameters, "NewsPaper_Delete");
            return rowsAffected > 0; // Return true if rows were affected
        }

    }
}
