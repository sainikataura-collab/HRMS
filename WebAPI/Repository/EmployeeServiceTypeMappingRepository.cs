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
    public class EmployeeServiceTypeMappingRepository : IEmployeeServiceTypeMappingRepository
    {
        public async Task<Result> InsertAsync(EmployeeServiceTypeMappingModel model, string userId, string companyId)
        {
            return await Task.Run(() =>
            {
                try
                {
                    EmployeeServiceTypeMappingDataSet dataset = new EmployeeServiceTypeMappingDataSet
                    {
                        ServiceTypeMapping = model
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

                    var result = DataBaseFactory.QuerySP<ServiceTypeMappingSpResult>(
                        "USP_Emp_Employee_ServiceType_Mapping_Ins",
                        dynamicParameters,
                        "EmployeeServiceTypeMapping_Ins"
                    );
                    var first = result?.FirstOrDefault();

                    if (first != null && first.IsSuccess == 1)
                    {
                        return new Result
                        {
                            IsSuccessfull = true,
                            Message = first.Message ?? "Employee Service Type mapping created successfully."
                        };
                    }

                    return new Result
                    {
                        IsSuccessfull = false,
                        Message = first?.Message ?? "Failed to create employee service type mapping."
                    };
                }
                catch (Exception ex)
                {
                    return new Result { IsSuccessfull = false, Message = ex.Message };
                }
            });
        }

        public async Task<Result> UpdateAsync(EmployeeServiceTypeMappingModel model, string userId, string companyId)
        {
            return await Task.Run(() =>
            {
                try
                {
                    EmployeeServiceTypeMappingDataSet dataset = new EmployeeServiceTypeMappingDataSet
                    {
                        ServiceTypeMapping = model
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

                    var result = DataBaseFactory.QuerySP<ServiceTypeMappingSpResult>(
                        "USP_Emp_Employee_ServiceType_Mapping_Upd",
                        dynamicParameters,
                        "EmployeeServiceTypeMapping_Upd"
                    );
                    var first = result?.FirstOrDefault();

                    if (first != null && first.IsSuccess == 1)
                    {
                        return new Result
                        {
                            IsSuccessfull = true,
                            Message = first.Message ?? "Employee Service Type mapping updated successfully."
                        };
                    }

                    return new Result
                    {
                        IsSuccessfull = false,
                        Message = first?.Message ?? "Failed to update employee service type mapping."
                    };
                }
                catch (Exception ex)
                {
                    return new Result { IsSuccessfull = false, Message = ex.Message };
                }
            });
        }

        public async Task<EmployeeServiceTypeMappingModel?> GetByIdAsync(long id, string companyId)
        {
            return await Task.Run(() =>
            {
                try
                {
                    DynamicParameters dynamicParameters = new DynamicParameters();
                    dynamicParameters.Add("@pk_servicetypeid", id, DbType.Int64);
                    dynamicParameters.Add("@fk_companyId", companyId ?? "", DbType.String);

                    var result = DataBaseFactory.QuerySP<EmployeeServiceTypeMappingModel>(
                        "USP_Emp_Employee_ServiceType_Mapping_GetById",
                        dynamicParameters,
                        "EmployeeServiceTypeMapping_GetById"
                    );
                    return result?.FirstOrDefault();
                }
                catch (Exception ex)
                {
                    Console.WriteLine("Error in GetByIdAsync: " + ex.Message);
                    return null;
                }
            });
        }

        public async Task<(int totalCount, IEnumerable<EmployeeServiceTypeMappingModel> list)> GetListAsync(ServiceTypeMappingFilterDto filter, string companyId)
        {
            return await Task.Run(() =>
            {
                try
                {
                    DynamicParameters dynamicParameters = new DynamicParameters();
                    dynamicParameters.Add("@pageIndex", filter.PageIndex > 0 ? filter.PageIndex : 1, DbType.Int32);
                    dynamicParameters.Add("@pageSize", filter.PageSize > 0 ? filter.PageSize : 10, DbType.Int32);
                    dynamicParameters.Add("@searchTerm", filter.SearchTerm ?? "", DbType.String);
                    dynamicParameters.Add("@fk_companyId", companyId ?? "", DbType.String);

                    var tuple = DataBaseFactory.QueryMultipleSP<dynamic, EmployeeServiceTypeMappingModel>(
                        "USP_Emp_Employee_ServiceType_Mapping_SelForGrid",
                        dynamicParameters,
                        "EmployeeServiceTypeMapping_GetAll"
                    );

                    if (tuple == null || tuple.Item2 == null)
                        return (0, Enumerable.Empty<EmployeeServiceTypeMappingModel>());

                    int totalCount = 0;
                    if (tuple.Item1 is IEnumerable<dynamic> countList && countList.Any())
                    {
                        var firstRow = (IDictionary<string, object>)countList.First();
                        if (firstRow.ContainsKey("TotalCount"))
                            totalCount = Convert.ToInt32(firstRow["TotalCount"]);
                        else if (firstRow.Values.Any())
                            totalCount = Convert.ToInt32(firstRow.Values.First());
                    }

                    var list = tuple.Item2.ToList();
                    return (totalCount > 0 ? totalCount : list.Count, list);
                }
                catch (Exception ex)
                {
                    Console.WriteLine("Error in GetListAsync: " + ex.Message);
                    return (0, Enumerable.Empty<EmployeeServiceTypeMappingModel>());
                }
            });
        }
    }
}
