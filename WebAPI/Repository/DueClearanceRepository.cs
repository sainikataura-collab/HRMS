using Dapper;
using HRMSWebAPI.Models;
using HRMSWebAPI.Helper;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class DueClearanceRepository : IDueClearanceRepository
    {
      
        // Alternative Method: Manual Connection Handling
        public async Task<(int totalCount, dynamic result)> GetAll(int pageIndex, int pageSize, string companyId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pageindex", pageIndex, DbType.Int32);
            dynamicParameters.Add("@pagesize", pageSize, DbType.Int32);
            dynamicParameters.Add("@fk_companyId", companyId, DbType.String);

            using (var connection = DataBaseFactory.ConnString())
            {
                await connection.OpenAsync();

                using (var multi = await connection.QueryMultipleAsync(
                    "FFS_ClearanceDepartment_Mst_SelForGrid",
                    dynamicParameters,
                    commandType: CommandType.StoredProcedure))
                {
                    // First result set - Total count
                    var totalCount = (await multi.ReadAsync<int>()).FirstOrDefault();

                    // Second result set - Data
                    var dataList = (await multi.ReadAsync<dynamic>()).ToList();

                    return (totalCount, dataList);
                }
            }
        }

        public async Task<bool> CreateAsync(ClearanceDepartmentModel model, string Fk_UserID, string Fk_LocID)
        {
            string xmlData = XmlUtility.XmlSerializeToString<ClearanceDepartmentModel>(model);

            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@xmlDoc", xmlData, DbType.String);
            dynamicParameters.Add("@Fk_UserID", Fk_UserID, DbType.String);
            dynamicParameters.Add("@Fk_LocID", Fk_LocID, DbType.String);

            // SP uses SET NOCOUNT ON with its own transaction — Dapper Execute() returns 0
            // even on success. The SP uses RAISERROR in CATCH, so exceptions propagate on failure.
            DataBaseFactory.QuerySP(
                "[dbo].[FFS_ClearanceDepartment_Mst_Ins]",
                dynamicParameters,
                "FFS_ClearanceDepartment_Mst_Ins_Insert"
            );

            return true;
        }
        public async Task<bool> UpdateClearanceMstAsync(ClearanceDepartmentModel model, long pk_clsdeptId, string Fk_UserID, string Fk_LocID)
        {
            string xmlData = XmlUtility.XmlSerializeToString<ClearanceDepartmentModel>(model);

            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@pk_clsdeptId", (object)pk_clsdeptId, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@xmlDoc", (object)xmlData, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_UserID", (object)Fk_UserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_LocID", (object)Fk_LocID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());


            // SP uses SET NOCOUNT ON with its own transaction — Dapper Execute() returns 0
            // even on success. The SP uses RAISERROR in CATCH, so exceptions propagate on failure.
            DataBaseFactory.QuerySP("FFS_ClearanceDepartment_Mst_Upd", dynamicParameters, "FFS_ClearanceDepartment_Mst_Upd");

            return true;
        }

        public async Task<bool> Delete(long pk_clsdeptId)
        {
            try
            {
                DynamicParameters dynamicParameters = new DynamicParameters();
                dynamicParameters.Add("@pk_clsdeptId", pk_clsdeptId, DbType.Int64);

                var result = DataBaseFactory.QuerySP(
                    "FFS_ClearanceDepartment_Mst_Del",
                    dynamicParameters,
                    "FFS_ClearanceDepartment_Mst_Del");

                return await Task.FromResult(result > 0);
            }
            catch
            {
                return false;
            }
        }


     

        public async Task<ClearanceDepartmentModel> GetByIdAsync(long pk_clsdeptId)
        {
            using (var connection = DataBaseFactory.ConnString())
            {
                var dynamicParameters = new DynamicParameters();
                dynamicParameters.Add("@pk_clsdeptId", pk_clsdeptId, DbType.Int64);

                using (var multi = await connection.QueryMultipleAsync(
                    "[FFS_ClearanceDepartment_Mst_Edit]",
                    dynamicParameters,
                    commandType: CommandType.StoredProcedure))
                {
                    // First result set → ClearanceDepartmentUser (single row)
                    var user = await multi.ReadFirstOrDefaultAsync<ClearanceDepartmentMst>();

                    // Second result set → Transactions (list)
                    var transactions = (await multi.ReadAsync<ClearanceDepartmentTrn>()).ToList();

                    return new ClearanceDepartmentModel
                    {
                        ClearanceDepartment = user,
                        Transactions = transactions
                    };
                }
            }
        }

        public async Task<dynamic> GetParamsByDept(string fk_deptid, string fk_companyId)
        {
            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("@fk_deptid", fk_deptid, DbType.String);
            parameters.Add("@fk_companyId", fk_companyId, DbType.String);

            using (var connection = DataBaseFactory.ConnString())
            {
                var result = await connection.QueryAsync<dynamic>(
                    "FFS_ClearanceDepartment_GetParamsByDept",
                    parameters,
                    commandType: CommandType.StoredProcedure
                );

                return result.ToList();
            }
        }

        public async Task<bool> CreateUserClearanceAsync( ClearanceDepartmentUserModel model, string Fk_UserID, string Fk_LocID)
        {
            string xmlData = XmlUtility.XmlSerializeToString(model);

            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("@xmlDoc", xmlData, DbType.Xml);
            parameters.Add("@Fk_UserID", Fk_UserID, DbType.String);
            parameters.Add("@Fk_LocID", Fk_LocID, DbType.String);

            int n = DataBaseFactory.QuerySP(
                "FFS_ClearanceDepartment_User_Mst_Ins",
                parameters,
                "FFS_ClearanceDepartment_User_Mst_Ins"
            );

            if (n > 0 && model.ClearanceDepartmentUser != null)
            {
                try
                {
                    using (var connection = DataBaseFactory.ConnString())
                    {
                        var ids = await connection.QueryAsync<long>(
                            "SELECT pk_deptUserId FROM FFS_ClearanceDepartment_User_Mst WHERE fk_empid = @fk_empid AND isActive = 1",
                            new { fk_empid = model.ClearanceDepartmentUser.fk_empid });
                        foreach (var id in ids)
                        {
                            await connection.ExecuteAsync("dbo.FFS_DueClearance_Submitted_Email", new { pk_deptUserId = id }, commandType: CommandType.StoredProcedure);
                        }
                    }
                }
                catch (Exception)
                {
                }
            }

            return await Task.FromResult(n > 0);
        }

        public async Task<ClearanceDepartmentUserModel> GetUserClearanceByIdAsync(long pk_deptUserId)
        {
            using (var connection = DataBaseFactory.ConnString())
            {
                DynamicParameters parameters = new DynamicParameters();
                parameters.Add("@pk_deptUserId", pk_deptUserId, DbType.Int64);

                using (var multi = await connection.QueryMultipleAsync(
                    "FFS_ClearanceDepartment_User_Mst_Edit",
                    parameters,
                    commandType: CommandType.StoredProcedure))
                {
                    var mst = await multi.ReadFirstOrDefaultAsync<DueClearanceUserMst>();
                    var trn = (await multi.ReadAsync<ClearanceDepartmentUserTrn>()).ToList();

                    return new ClearanceDepartmentUserModel
                    {
                        ClearanceDepartmentUser = mst,
                        Transactions = trn
                    };
                }
            }
        }

        public async Task<(int totalCount, dynamic result)> GetUserClearanceList( int pageIndex, int pageSize, string fk_deptid, string fk_companyId)
        {
            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("@pageindex", pageIndex, DbType.Int32);
            parameters.Add("@pagesize", pageSize, DbType.Int32);
            parameters.Add("@fk_deptid", fk_deptid, DbType.String);
            parameters.Add("@fk_companyId", fk_companyId, DbType.String);

            using (var connection = DataBaseFactory.ConnString())
            {
                await connection.OpenAsync();

                using (var multi = await connection.QueryMultipleAsync(
                    "FFS_ClearanceDepartment_User_Mst_SelForGrid",
                    parameters,
                    commandType: CommandType.StoredProcedure))
                {
                    var totalCount = (await multi.ReadAsync<int>()).FirstOrDefault();
                    var dataList = (await multi.ReadAsync<dynamic>()).ToList();

                    return (totalCount, dataList);
                }
            }
        }
        public async Task<bool> UpdateUserClearanceAsync( ClearanceDepartmentUserModel model, long pk_deptUserId, string Fk_UserID, string Fk_LocID)
        {
            string xmlData = XmlUtility.XmlSerializeToString(model);

            DynamicParameters parameters = new DynamicParameters();

            parameters.Add("@pk_deptUserId", pk_deptUserId, DbType.Int64);
            parameters.Add("@xmlDoc", xmlData, DbType.Xml);
            parameters.Add("@Fk_UserID", Fk_UserID, DbType.String);
            parameters.Add("@Fk_LocID", Fk_LocID, DbType.String);

            int n = DataBaseFactory.QuerySP(
                "FFS_ClearanceDepartment_User_Mst_Upd",
                parameters,
                "FFS_ClearanceDepartment_User_Mst_Upd"
            );

            return await Task.FromResult(n > 0);
        }

        public async Task<(int totalCount, dynamic result)> GetHODClearanceList( int pageIndex, int pageSize, string fk_companyId, string fk_userId)
        {
            DynamicParameters parameters = new DynamicParameters();

            parameters.Add("@pageindex", pageIndex, DbType.Int32);
            parameters.Add("@pagesize", pageSize, DbType.Int32);
            parameters.Add("@fk_companyId", fk_companyId, DbType.String);
            parameters.Add("@fk_userId", fk_userId, DbType.String);

            using (var connection = DataBaseFactory.ConnString())
            {
                await connection.OpenAsync();

                using (var multi = await connection.QueryMultipleAsync(
                    "FFS_ClearanceDepartment_HOD_SelForGrid",
                    parameters,
                    commandType: CommandType.StoredProcedure))
                {
                    var totalCount = (await multi.ReadAsync<int>()).FirstOrDefault();
                    var dataList = (await multi.ReadAsync<dynamic>()).ToList();

                    return (totalCount, dataList);
                }
            }
        }

        public async Task<ClearanceDepartmentUserModel> GetHODClearanceByEmpIdAsync( string fk_empid, string Fk_UserID, string fk_companyId)
        {
            using (var connection = DataBaseFactory.ConnString())
            {
                DynamicParameters parameters = new DynamicParameters();

                parameters.Add("@fk_empid", fk_empid, DbType.String);
                parameters.Add("@Fk_UserID", Fk_UserID, DbType.String);
                parameters.Add("@fk_companyId", fk_companyId, DbType.String);

                using (var multi = await connection.QueryMultipleAsync(
                    "FFS_ClearanceDepartment_HOD_Edit",
                    parameters,
                    commandType: CommandType.StoredProcedure))
                {
                    var mst = await multi.ReadFirstOrDefaultAsync<DueClearanceUserMst>();
                    var trn = (await multi.ReadAsync<ClearanceDepartmentUserTrn>()).ToList();

                    return new ClearanceDepartmentUserModel
                    {
                        ClearanceDepartmentUser = mst,
                        Transactions = trn
                    };
                }
            }
        }

        public async Task<bool> UpdateHODClearanceAsync( ClearanceDepartmentUserModel model, string Fk_UserID, string Fk_LocID)
        {
            string xmlData = XmlUtility.XmlSerializeToString(model);

            DynamicParameters parameters = new DynamicParameters();

            parameters.Add("@xmlDoc", xmlData, DbType.String);
            parameters.Add("@Fk_UserID", Fk_UserID, DbType.String);
            parameters.Add("@Fk_LocID", Fk_LocID, DbType.String);

            DataBaseFactory.QuerySP(
                "FFS_ClearanceDepartment_HOD_Upd",
                parameters,
                "FFS_ClearanceDepartment_HOD_Upd"
            );

            if (model.ClearanceDepartmentUser != null && model.ClearanceDepartmentUser.pk_deptUserId > 0)
            {
                try
                {
                    using (var connection = DataBaseFactory.ConnString())
                    {
                        await connection.ExecuteAsync("dbo.FFS_DueClearance_Reviewed_Email", new { pk_deptUserId = model.ClearanceDepartmentUser.pk_deptUserId }, commandType: CommandType.StoredProcedure);
                    }
                }
                catch (Exception)
                {
                }
            }

            return await Task.FromResult(true);
        }
        public async Task<(int totalCount, dynamic result)> GetMyClearanceStatus( int pageIndex, int pageSize, string fk_companyId, string fk_empid)
        {
            DynamicParameters parameters = new DynamicParameters();

            parameters.Add("@pageindex", pageIndex, DbType.Int32);
            parameters.Add("@pagesize", pageSize, DbType.Int32);
            parameters.Add("@fk_companyId", fk_companyId, DbType.String);
            parameters.Add("@fk_empid", fk_empid, DbType.String);

            using (var connection = DataBaseFactory.ConnString())
            {
                await connection.OpenAsync();

                using (var multi = await connection.QueryMultipleAsync(
                    "FFS_ClearanceDepartment_Employee_SelForGrid",
                    parameters,
                    commandType: CommandType.StoredProcedure))
                {
                    var totalCount =
                        (await multi.ReadAsync<int>()).FirstOrDefault();

                    var data =
                        (await multi.ReadAsync<dynamic>()).ToList();

                    return (totalCount, data);
                }
            }
        }
        public async Task<ClearanceDepartmentUserModel> GetMyClearanceByEmpIdAsync( string fk_empid, string fk_companyId)
        {
            using (var connection = DataBaseFactory.ConnString())
            {
                DynamicParameters parameters = new DynamicParameters();

                parameters.Add("@fk_empid", fk_empid, DbType.String);
                parameters.Add("@fk_companyId", fk_companyId, DbType.String);

                using (var multi = await connection.QueryMultipleAsync(
                    "FFS_ClearanceDepartment_Employee_Edit",
                    parameters,
                    commandType: CommandType.StoredProcedure))
                {
                    var mst =
                        await multi.ReadFirstOrDefaultAsync<DueClearanceUserMst>();

                    var trn =
                        (await multi.ReadAsync<ClearanceDepartmentUserTrn>())
                        .ToList();

                    return new ClearanceDepartmentUserModel
                    {
                        ClearanceDepartmentUser = mst,
                        Transactions = trn
                    };
                }
            }
        }

        public async Task<(int totalCount, dynamic result)> GetAdminClearanceStatusList( int pageIndex, int pageSize, string fk_companyId, string fk_userId)
        {
            DynamicParameters parameters = new DynamicParameters();

            parameters.Add("@pageindex", pageIndex, DbType.Int32);
            parameters.Add("@pagesize", pageSize, DbType.Int32);
            parameters.Add("@fk_companyId", fk_companyId, DbType.String);
            parameters.Add("@fk_userId", fk_userId, DbType.String);

            using (var connection = DataBaseFactory.ConnString())
            {
                await connection.OpenAsync();

                using (var multi = await connection.QueryMultipleAsync(
                    "FFS_ClearanceDepartment_Admin_SelForGrid",
                    parameters,
                    commandType: CommandType.StoredProcedure))
                {
                    var totalCount =
                        (await multi.ReadAsync<int>()).FirstOrDefault();

                    var data =
                        (await multi.ReadAsync<dynamic>()).ToList();

                    return (totalCount, data);
                }
            }
        }

        public async Task<bool> SkipClearanceAsync(long pk_seprequestId, string Fk_UserID)
        {
            using (var connection = DataBaseFactory.ConnString())
            {
                await connection.OpenAsync();
                
                // Directly execute update query on FFS_Separation_Request_Mst to skip clearance
                var query = @"UPDATE FFS_Separation_Request_Mst 
                             SET isClearanceClosed = 1
                             WHERE pk_seprequestId = @pk_seprequestId";

                var parameters = new DynamicParameters();
                parameters.Add("@pk_seprequestId", pk_seprequestId, DbType.Int64);

                int rowsAffected = await connection.ExecuteAsync(query, parameters);
                return rowsAffected > 0;
            }
        }
    }
}