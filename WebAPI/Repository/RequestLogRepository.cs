using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System;
using System.Data;
using System.Threading.Tasks;

namespace HRMSWebAPI.Repository
{
    public class RequestLogRepository : IRequestLogRepository
    {
        public async Task LogRequestAsync(RequestLog requestLog)
        {
            try
            {
                DynamicParameters dynamicParameters = new DynamicParameters();
                dynamicParameters.Add("@UserId", (object)requestLog.UserId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@IpAddress", (object)requestLog.IpAddress, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@DeviceType", (object)requestLog.DeviceType, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@DeviceBrand", (object)requestLog.DeviceBrand, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@DeviceModel", (object)requestLog.DeviceModel, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@OS", (object)requestLog.OS, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@OSVersion", (object)requestLog.OSVersion, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@Browser", (object)requestLog.Browser, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@BrowserVersion", (object)requestLog.BrowserVersion, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@Platform", (object)requestLog.Platform, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@IsBot", (object)requestLog.IsBot, new DbType?(DbType.Boolean), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@UserAgent", (object)requestLog.UserAgent, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@RequestMethod", (object)requestLog.RequestMethod, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@RequestPath", (object)requestLog.RequestPath, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@QueryString", (object)requestLog.QueryString, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@RequestBody", (object)requestLog.RequestBody, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@ResponseBody", (object)requestLog.ResponseBody, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@ResponseStatusCode", (object)requestLog.ResponseStatusCode, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@ResponseTime", (object)requestLog.ResponseTime, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@CompanyId", (object)requestLog.CompanyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@LocationId", (object)requestLog.LocationId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@RoleId", (object)requestLog.RoleId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@RequestTimestamp", (object)requestLog.RequestTimestamp, new DbType?(DbType.DateTime), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@ExceptionMessage", (object)requestLog.ExceptionMessage, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@IsSuccessful", (object)requestLog.IsSuccessful, new DbType?(DbType.Boolean), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@CorrelationId", (object)requestLog.CorrelationId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

                int n = DataBaseFactory.QuerySP("Usp_InsertRequestLog", dynamicParameters, "Insert");
            }
            catch (Exception ex)
            {
                // Don't throw - logging should never crash the app
                Console.WriteLine($"Failed to log request: {ex.Message}");
            }
            
            await Task.CompletedTask;
        }
    }
}
