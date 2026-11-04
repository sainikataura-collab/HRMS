using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public class ShiftRosterRepository : IShiftRosterRepository
    {
        public async Task<(int totalCount, IEnumerable<ShiftRosterModel>)> GetAllAsync(int pageIndex, int pageSize, string searchTerm, string companyId)
        {
            return await Task.Run(() =>
            {
                DynamicParameters dynamicParameters = new DynamicParameters();
                dynamicParameters.Add("@fk_companyId", companyId ?? "", DbType.String);
                dynamicParameters.Add("@searchTerm", searchTerm ?? "", DbType.String);
                dynamicParameters.Add("@pageIndex", pageIndex, DbType.Int32);
                dynamicParameters.Add("@pageSize", pageSize, DbType.Int32);

                var tuple = DataBaseFactory.QueryMultipleSP<dynamic, ShiftRosterModel>(
                    "USP_ATT_Roster_Mst_SelForGrid",
                    dynamicParameters,
                    "ShiftRoster_SelForGrid"
                );

                if (tuple == null || tuple.Item2 == null)
                    return (0, Enumerable.Empty<ShiftRosterModel>());

                int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                    ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First())
                    : 0;

                return (totalCount, tuple.Item2.ToList());
            });
        }

        public async Task<ShiftRosterModel?> GetByIdAsync(long rosterId, string companyId)
        {
            return await Task.Run(() =>
            {
                DynamicParameters dynamicParameters = new DynamicParameters();
                dynamicParameters.Add("@pk_rosterId", rosterId, DbType.Int64);
                dynamicParameters.Add("@fk_companyId", companyId ?? "", DbType.String);

                var result = DataBaseFactory.QuerySP<ShiftRosterModel>(
                    "USP_ATT_Roster_Mst_GetById",
                    dynamicParameters,
                    "ShiftRoster_GetById"
                );

                return result?.FirstOrDefault();
            });
        }

        public async Task<Result> InsertAsync(ShiftRosterModel model, string companyId, string userId)
        {
            return await Task.Run(() =>
            {
                try
                {
                    DynamicParameters dynamicParameters = new DynamicParameters();
                    dynamicParameters.Add("@effectiveFrom", DateTime.Parse(model.effectiveFrom!).ToString("yyyy-MM-dd"), DbType.Date);
                    dynamicParameters.Add("@fk_empId", model.fk_empId, DbType.String);
                    dynamicParameters.Add("@fk_shiftId", model.fk_shiftId, DbType.Int64);
                    dynamicParameters.Add("@weekOffDay", model.weekOffDay, DbType.String);
                    dynamicParameters.Add("@fk_companyId", companyId ?? "", DbType.String);
                    dynamicParameters.Add("@createdBy", userId ?? "", DbType.String);

                    var result = DataBaseFactory.QuerySP<dynamic>(
                        "USP_ATT_Roster_Mst_Ins",
                        dynamicParameters,
                        "ShiftRoster_Ins"
                    );

                    var first = result?.FirstOrDefault() as IDictionary<string, object>;
                    if (first != null)
                    {
                        bool isSuccess = Convert.ToInt32(first["IsSuccess"]) == 1;
                        string message = first["Message"]?.ToString() ?? "";
                        return new Result { IsSuccessfull = isSuccess, Message = message };
                    }

                    return new Result { IsSuccessfull = false, Message = "Failed to add Shift Roster." };
                }
                catch (Exception ex)
                {
                    return new Result { IsSuccessfull = false, Message = ex.Message };
                }
            });
        }

        public async Task<Result> UpdateAsync(ShiftRosterModel model, string companyId, string userId)
        {
            return await Task.Run(() =>
            {
                try
                {
                    DynamicParameters dynamicParameters = new DynamicParameters();
                    dynamicParameters.Add("@pk_rosterId", model.pk_rosterId, DbType.Int64);
                    dynamicParameters.Add("@effectiveFrom", DateTime.Parse(model.effectiveFrom!).ToString("yyyy-MM-dd"), DbType.Date);
                    dynamicParameters.Add("@fk_empId", model.fk_empId, DbType.String);
                    dynamicParameters.Add("@fk_shiftId", model.fk_shiftId, DbType.Int64);
                    dynamicParameters.Add("@weekOffDay", model.weekOffDay, DbType.String);
                    dynamicParameters.Add("@fk_companyId", companyId ?? "", DbType.String);
                    dynamicParameters.Add("@modifiedBy", userId ?? "", DbType.String);

                    var result = DataBaseFactory.QuerySP<dynamic>(
                        "USP_ATT_Roster_Mst_Upd",
                        dynamicParameters,
                        "ShiftRoster_Upd"
                    );

                    var first = result?.FirstOrDefault() as IDictionary<string, object>;
                    if (first != null)
                    {
                        bool isSuccess = Convert.ToInt32(first["IsSuccess"]) == 1;
                        string message = first["Message"]?.ToString() ?? "";
                        return new Result { IsSuccessfull = isSuccess, Message = message };
                    }

                    return new Result { IsSuccessfull = false, Message = "Failed to update Shift Roster." };
                }
                catch (Exception ex)
                {
                    return new Result { IsSuccessfull = false, Message = ex.Message };
                }
            });
        }

        public async Task<Result> DeleteAsync(long rosterId, string companyId, string userId)
        {
            return await Task.Run(() =>
            {
                try
                {
                    DynamicParameters dynamicParameters = new DynamicParameters();
                    dynamicParameters.Add("@pk_rosterId", rosterId, DbType.Int64);
                    dynamicParameters.Add("@fk_companyId", companyId ?? "", DbType.String);
                    dynamicParameters.Add("@modifiedBy", userId ?? "", DbType.String);

                    var result = DataBaseFactory.QuerySP<dynamic>(
                        "USP_ATT_Roster_Mst_Del",
                        dynamicParameters,
                        "ShiftRoster_Del"
                    );

                    var first = result?.FirstOrDefault() as IDictionary<string, object>;
                    if (first != null)
                    {
                        bool isSuccess = Convert.ToInt32(first["IsSuccess"]) == 1;
                        string message = first["Message"]?.ToString() ?? "";
                        return new Result { IsSuccessfull = isSuccess, Message = message };
                    }

                    return new Result { IsSuccessfull = false, Message = "Failed to delete Shift Roster." };
                }
                catch (Exception ex)
                {
                    return new Result { IsSuccessfull = false, Message = ex.Message };
                }
            });
        }

        public async Task<IEnumerable<ShiftRosterBulkResultItem>> BulkValidateAndInsertAsync(List<ShiftRosterBulkItem> items, string companyId, string userId)
        {
            return await Task.Run(() =>
            {
                try
                {
                    ShiftRosterBulkDataSet dataset = new ShiftRosterBulkDataSet
                    {
                        RosterItems = items
                    };

                    string xmlData = XmlUtility.XmlSerializeToString(dataset);
                    if (xmlData.StartsWith("<?xml"))
                    {
                        int idx = xmlData.IndexOf("?>");
                        if (idx != -1)
                            xmlData = xmlData.Substring(idx + 2).Trim();
                    }

                    DynamicParameters dynamicParameters = new DynamicParameters();
                    dynamicParameters.Add("@Doc", xmlData, DbType.Xml);
                    dynamicParameters.Add("@fk_companyId", companyId ?? "", DbType.String);
                    dynamicParameters.Add("@fk_userId", userId ?? "", DbType.String);

                    var result = DataBaseFactory.QuerySP<ShiftRosterBulkResultItem>(
                        "USP_ATT_Roster_Mst_BulkValidateAndInsert",
                        dynamicParameters,
                        "ShiftRoster_BulkValidateAndInsert"
                    );

                    return result?.ToList() ?? new List<ShiftRosterBulkResultItem>();
                }
                catch (Exception ex)
                {
                    return new List<ShiftRosterBulkResultItem>
                    {
                        new ShiftRosterBulkResultItem
                        {
                            rowIndex = 1,
                            isValid = false,
                            remarks = ex.Message
                        }
                    };
                }
            });
        }

        public async Task<IEnumerable<NameValue>> GetEmployeesByCompanyAsync(string companyId)
        {
            return await Task.Run(() =>
            {
                DynamicParameters dynamicParameters = new DynamicParameters();
                dynamicParameters.Add("@fk_companyId", companyId ?? "", DbType.String);

                var result = DataBaseFactory.QuerySP<NameValue>(
                    "USP_ATT_Roster_GetEmployees_Ddl",
                    dynamicParameters,
                    "ShiftRoster_GetEmployees_Ddl"
                );

                return result?.ToList() ?? new List<NameValue>();
            });
        }
    }
}
