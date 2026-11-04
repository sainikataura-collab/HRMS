using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class BranchRepository:IBranchRepositorycs
    {

        public async Task<(int totalCount, IEnumerable<dynamic>)> GetAllAsync(int pageIndex, int pageSize, string fk_userId, string fk_companyId)
        {
            DynamicParameters param = new DynamicParameters();

            param.Add("@pageindex", pageIndex, DbType.Int32);
            param.Add("@pagesize", pageSize, DbType.Int32);
            param.Add("@fk_userId", fk_userId, DbType.String);
            param.Add("@fk_companyId", fk_companyId, DbType.String);

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic>(
                "SAL_Branch_SelForGrid",
                param,
                "GetAll"
            );

            int totalCount = 0;

            if (tuple?.Item1 != null && tuple.Item1.Any())
            {
                var first = tuple.Item1.First() as IDictionary<string, object>;
                if (first != null)
                    totalCount = Convert.ToInt32(first.Values.First());
            }

            return (totalCount, tuple?.Item2?.ToList() ?? new List<dynamic>());
        }

        public async Task<bool> InsertBranchAsync(List<BranchMst> branchList, string fk_companyId)
        {
            DynamicParameters param = new DynamicParameters();

            BranchDataSet dataset = new BranchDataSet
            {
                SAL_Branch_Mst = branchList
            };

            string xmlData = XmlUtility.XmlSerializeToString(dataset);

            param.Add("@xmlDoc", xmlData, DbType.String);
            param.Add("@fk_companyId", fk_companyId, DbType.String);

            int result = DataBaseFactory.QuerySP(
                "SAL_Branch_Ins",
                param,
                "Branch_Insert"
            );

            return result > 0;
        }

        public async Task<bool> DeleteBranchAsync(long pk_branchId)
        {
            DynamicParameters param = new DynamicParameters();
            param.Add("@pk_branchId", pk_branchId, DbType.Int64);

            int result = DataBaseFactory.QuerySP(
                "SAL_Branch_Del",
                param,
                "Branch_Delete"
            );

            return result > 0;
        }

        public async Task<BranchMst> GetBranchByIdAsync(long pk_branchId)
        {
            DynamicParameters param = new DynamicParameters();
            param.Add("@pk_branchId", pk_branchId, DbType.Int64);

            return DataBaseFactory.QuerySP<BranchMst>(
                "SAL_Branch_SelById",
                param,
                "GetById"
            ).FirstOrDefault();
        }

        public async Task<bool> UpdateBranchAsync(List<BranchMst> branchList)
        {
            DynamicParameters param = new DynamicParameters();

            BranchDataSet dataset = new BranchDataSet
            {
                SAL_Branch_Mst = branchList
            };

            string xmlData = XmlUtility.XmlSerializeToString(dataset);

            param.Add("@xmlDoc", xmlData, DbType.String);

            int result = DataBaseFactory.QuerySP(
                "SAL_Branch_Upd",
                param,
                "Branch_Update"
            );

            return result > 0;
        }

    }
}
