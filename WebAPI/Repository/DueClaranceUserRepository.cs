using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;
using System.Linq;

namespace HRMSWebAPI.Repository
{
    public class DueClaranceUserRepository : IDueClaranceUserRepository
    {


        public async Task<bool> CreateAsync(ClearanceDepartmentUserModel model, string Fk_LocID, string Fk_UserID)
        {

            string xmlData = XmlUtility.XmlSerializeToString(model);

            DynamicParameters dynamicParameters = new DynamicParameters();
            // dynamicParameters.Add("@pk_classTvlId", (object)model.TravelMasterMst.pk_classTvlId, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Doc", (object)xmlData, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_UserID", (object)Fk_UserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_LocID", (object)Fk_LocID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            // Call the stored procedure
            int n = DataBaseFactory.QuerySP("[FFS_ClearanceDepartment_User_Mst_Ins]", dynamicParameters, "FFS_ClearanceDepartment_User_Mst_Ins_Insert");

            return n > 0;
        }





        //Get All code
        public async Task<(int totalCount, IEnumerable<ClearanceDepartmentUserView>)> GetAll(int pageIndex, int pageSize, string fk_companyId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pageindex", (object)pageIndex, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pageSize, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            //           dynamicParameters.Add("@Fk_LocID", (object)Fk_LocID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(),

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, ClearanceDepartmentUserView>("FFS_ClearanceDepartment_User_Mst_SelforGrid", dynamicParameters, "ClearanceDepartment_User_Mst_SelForGrid");
            if (tuple == null || tuple.Item2 == null) return (0, []);
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                            ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

            return (totalCount, tuple?.Item2?.ToList());
        }


        ////GetById
        //public async Task<ClearanceDepartmentUserModel> GetBehavioralByIdAsync(long pk_deptUserId)
        //{
        //    DynamicParameters dynamicParameters = new DynamicParameters();
        //    dynamicParameters.Add("@pk_deptUserId", (object)pk_deptUserId, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    return DataBaseFactory.QuerySP<ClearanceDepartmentUserModel>("[FFS_ClearanceDepartment_User_Mst_Edit]",
        //        (object)dynamicParameters, "ClearanceDepartment_User_Mst_Edit").FirstOrDefault<ClearanceDepartmentUserModel>();
        //}

        public async Task<ClearanceDepartmentUserModel_previous> GetByIdAsync(long pk_deptUserId)
        {
            using (var connection = DataBaseFactory.ConnString())
            {
                var dynamicParameters = new DynamicParameters();
                dynamicParameters.Add("@pk_deptUserId", pk_deptUserId, DbType.Int64);

                using (var multi = await connection.QueryMultipleAsync(
                    "[FFS_ClearanceDepartment_User_Mst_Edit]",
                    dynamicParameters,
                    commandType: CommandType.StoredProcedure))
                {
                    // First result set → ClearanceDepartmentUser (single row)
                    var user = await multi.ReadFirstOrDefaultAsync<DueClaranceUserMst_previous>();

                    // Second result set → Transactions (list)
                    var transactions = (await multi.ReadAsync<ClearanceDepartmentUserTrn_previous>()).ToList();

                    return new ClearanceDepartmentUserModel_previous
                    {
                        ClearanceDepartmentUser = user,
                        Transactions = transactions
                    };
                }
            }
        }




        //Delete Code Code
        public async Task<bool> DeleteAsync(long pk_deptUserId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_deptUserId", (object)pk_deptUserId, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int n = DataBaseFactory.QuerySP("FFS_ClearanceDepartment_User_Mst_Del", dynamicParameters, "FFS_ClearanceDepartment_User_Mst_Del_Del");

            return n > 0; // Return true if rows were affected
        }






        public async Task<bool> UpdateTravelMstAsync(ClearanceDepartmentUserModel model, long pk_deptUserId, string Fk_LocID, string Fk_UserID)
        {
            string xmlData = XmlUtility.XmlSerializeToString(model);

            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@pk_deptUserId", (object)pk_deptUserId, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Doc", (object)xmlData, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_UserID", (object)Fk_UserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_LocID", (object)Fk_LocID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());


            // Execute stored procedure for update
            int n = DataBaseFactory.QuerySP("FFS_ClearanceDepartment_User_Mst_Upd", dynamicParameters, "Functional_Mst_Update");

            return n > 0; // Return true if rows were affected
        }


    }
}
