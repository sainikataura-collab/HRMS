using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class CardAppreciatorRepository:ICardAppreciatorRepository
    {

        public async Task<(int totalCount, IEnumerable<CardAppreciatorMst>)> GetAll(int pageIndex, int pageSize, string fk_companyId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pageindex", (object)pageIndex, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pageSize, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("fk_companyId", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, CardAppreciatorMst>("CRD_IssueAuthority_Mst_SelForGrid", dynamicParameters, "GetAll");
            if (tuple == null || tuple.Item2 == null) return (0, []);
            //Convert Total Count
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

            return (totalCount, tuple?.Item2?.ToList());
        }

        public async Task<CardAppreciatorMst> GetByIdAsync(int pk_crdauthId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_crdauthId", (object)pk_crdauthId, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<CardAppreciatorMst>("CRD_IssueAuthority_Mst_Edit", (object)dynamicParameters, "GetById").FirstOrDefault<CardAppreciatorMst>();
        }

        public async Task<bool> DeleteAsync(int pk_crdauthId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_crdauthId", (object)pk_crdauthId, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int n = DataBaseFactory.QuerySP("CRD_IssueAuthority_Mst_Del", dynamicParameters, "Delete");

            return n > 0; // Return true if rows were affected
        }

        public async Task<bool> InsertAsync(CardAppreciatorMst CardAppreciatorMst)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@fk_empid", (object)CardAppreciatorMst.fk_empid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());
             dynamicParameters.Add("@isABCD", (object)CardAppreciatorMst.isABCD, new DbType?(DbType.Boolean), new ParameterDirection?(), new int?(), new byte?());
             dynamicParameters.Add("@isShabash", (object)CardAppreciatorMst.isShabash, new DbType?(DbType.Boolean), new ParameterDirection?(), new int?(), new byte?());
             dynamicParameters.Add("@isWelldone", (object)CardAppreciatorMst.isWelldone, new DbType?(DbType.Boolean), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@Fk_UserID", (object)CardAppreciatorMst.Fk_UserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@fk_companyId", (object)CardAppreciatorMst.fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@Fk_LocID", (object)CardAppreciatorMst.Fk_LocID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());


            // Execute stored procedure (no output parameters)
            int n = DataBaseFactory.QuerySP("CRD_IssueAuthority_Mst_Ins", dynamicParameters, "Insert");

            return n > 0; // Return true if rows were affected

        }


        public async Task<bool> UpdateAsync(CardAppreciatorMst CardAppreciatorMst)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_crdauthId", (object)CardAppreciatorMst.pk_crdauthId, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@fk_empid", (object)CardAppreciatorMst.fk_empid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@isABCD", (object)CardAppreciatorMst.isABCD, new DbType?(DbType.Boolean), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@isShabash", (object)CardAppreciatorMst.isShabash, new DbType?(DbType.Boolean), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@isWelldone", (object)CardAppreciatorMst.isWelldone, new DbType?(DbType.Boolean), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@Fk_UserID", (object)CardAppreciatorMst.Fk_UserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@fk_companyId", (object)CardAppreciatorMst.fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@Fk_LocID", (object)CardAppreciatorMst.Fk_LocID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());


            // Execute stored procedure (no output parameters)
            int n = DataBaseFactory.QuerySP("CRD_IssueAuthority_Mst_Upd", dynamicParameters, "Insert");

            return n > 0; // Return true if rows were affected

        }

    }
}
