using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class PageRightsRepository : IPageRightsRepository
    {
        public async Task<IEnumerable<string>> GetUserLocationsAsync(string fk_userId)
        {
            try
            {
                DynamicParameters parameters = new DynamicParameters();
                parameters.Add("@fk_userId", fk_userId, DbType.String);

                var result = DataBaseFactory.QuerySP<dynamic>(
                    "UM_SP_GetUserLocations",
                    parameters,
                    "GetUserLocationsAsync"
                );

                return result?.Select(r => Convert.ToString(((IDictionary<string, object>)r)["fk_locid"]))
                   ?? Enumerable.Empty<string>();
            }
            catch (Exception ex)
            {
                Console.WriteLine("GetUserLocationsAsync Error: " + ex.Message);
                return Enumerable.Empty<string>();
            }
        }


        public async Task<IEnumerable<dynamic>> GetWebPagesOnUserModIdAsync(string fk_userId, int fk_moduleId)
        {
            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("@fk_userId", fk_userId, DbType.String);
            parameters.Add("@fk_moduleId", fk_moduleId, DbType.Int64); // tinyint → DbType.Byte

            var result = DataBaseFactory.QuerySP<dynamic>(
                "UM_SP_GetWebPagesOnUserModId",
                parameters,
                "GetWebPagesOnUserModIdAsync"
            );

            return result ?? Enumerable.Empty<dynamic>();
        }



        public async Task<bool> InsertUserPageRightsAsync(PagerightMst model)
        {
            try
            {
                DynamicParameters dynamicParameters = new DynamicParameters();

                // Wrap model's XML data
                string xmlData = XmlUtility.XmlSerializeToString(model);

                dynamicParameters.Add("@doc", xmlData, DbType.String);
                dynamicParameters.Add("@userid", model.userid, DbType.String);
                dynamicParameters.Add("@moduleid", model.moduleid, DbType.Int32);

                var result = DataBaseFactory.QuerySP("UM_SP_InsertUserPageRights", dynamicParameters);

                return result > 0;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Insert Error: " + ex.Message);
                return false;
            }
        }


        public async Task<IEnumerable<UserFullMenuModel>> GetUserFullMenuAsync(string fk_userId)
        {
            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("@fk_userId", fk_userId, DbType.String);

            var result = DataBaseFactory.QuerySP<UserFullMenuModel>(
                "UM_SP_GetUserFullMenu",
                parameters,
                "GetUserFullMenuAsync"
            );

            return result ?? Enumerable.Empty<UserFullMenuModel>();
        }

        public async Task<IEnumerable<EmployeeModuleActive>> GetActiveModulesAsync()
        {
            try
            {
                DynamicParameters parameters = new DynamicParameters();
                // no parameters needed for this SP, but pattern consistent
                var result = DataBaseFactory.QuerySP<EmployeeModuleActive>(
                    "usp_GetActiveModules_ESS",  // name of the SP we created
                    parameters,
                    "GetActiveModulesAsync"
                );

                return result ?? Enumerable.Empty<EmployeeModuleActive>();
            }
            catch (Exception ex)
            {
                Console.WriteLine("GetActiveModules Error: " + ex.Message);
                return Enumerable.Empty<EmployeeModuleActive>();
            }
        }

        public async Task<UserAccessRightsModel> GetUserAccessRightsAsync(string userId, int moduleId)
        {
            try
            {
                DynamicParameters parameters = new DynamicParameters();
                parameters.Add("@userId", userId, DbType.String);
                parameters.Add("@moduleId", moduleId, DbType.Byte);

                // RS1: access flags, RS2: assigned location IDs
                var results = DataBaseFactory.QueryMultipleSP<UserAccessFlagsDto, UserLocationDto>(
                    "UM_SP_GetUserAccessRights",
                    parameters,
                    "GetUserAccessRightsAsync"
                );

                var flags = results.Item1.FirstOrDefault();
                var locs = results.Item2.Select(l => l.fk_locid).ToList();

                return new UserAccessRightsModel
                {
                    L1_Access = (flags?.L1_Access ?? 0) == 1,
                    L2_Access = (flags?.L2_Access ?? 0) == 1,
                    L3_Access = (flags?.L3_Access ?? 0) == 1,
                    CanRaiseRequisition = (flags?.CanRaiseRequisition ?? 0) == 1,
                    CanEditManpower = (flags?.CanEditManpower ?? 0) == 1,
                    AssignedLocationIds = locs
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine("GetUserAccessRights Error: " + ex.Message);
                return new UserAccessRightsModel();
            }
        }

    }
}

