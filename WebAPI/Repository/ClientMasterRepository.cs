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
    public class ClientMasterRepository : IClientMasterRepository
    {


        public async Task<Result> InsertClientMasterAsync(ClientMasterModel client, string userId, string locId)
        {
            try
            {
                client.HolidayMultiple = client.HolidayMultiple ?? 0;
                client.CommissionPercent = client.CommissionPercent ?? 0;
                client.gst_rate = client.gst_rate ?? 0;
                client.daysDivideInMonth = client.daysDivideInMonth ?? 0;
                client.PresentDaysforWeekOff = client.PresentDaysforWeekOff ?? 0;



                var dataset = new ClientMasterDataset
                {
                    ClientMaster = client,
                    ServiceTypes = client.ServiceTypeIds?.Select(id => new ServiceTypeXmlModel { ServiceTypeId = id }).ToList() ?? new List<ServiceTypeXmlModel>(),
                    ModelTypes = client.ModelTypeIds?.Select(id => new ModelTypeXmlModel { ModelTypeId = id }).ToList() ?? new List<ModelTypeXmlModel>(),
                    ExtraDayDetails = client.ExtraDayDetails,
                    HolidaySalaryHeads = client.HolidaySalaryHeadIds?.Select(id => new HolidaySalaryHeadXmlModel { HeadId = id }).ToList() ?? new List<HolidaySalaryHeadXmlModel>(),
                    ServiceMonthDaysDetails = client.ServiceMonthDaysDetails
                };

                string xml = XmlUtility.XmlSerializeToString(dataset);


                DynamicParameters dynamicParameters = new DynamicParameters();
                dynamicParameters.Add("@Doc", xml, DbType.String);
                dynamicParameters.Add("@fk_companyId", client.fk_companyId, DbType.String);
                dynamicParameters.Add("@fk_userId", userId, DbType.String);
                dynamicParameters.Add("@fk_locId", locId, DbType.String);

                var dbResult = DataBaseFactory.QuerySP<dynamic>("LSP_ClientMaster_Insert", dynamicParameters, "ClientMaster_Insert").FirstOrDefault();

                bool isSuccess = false;
                string message = "Failed to add Client Master";

                if (dbResult != null)
                {
                    var resultDict = (IDictionary<string, object>)dbResult;
                    isSuccess = Convert.ToInt32(resultDict["IsSuccess"]) == 1;
                    message = resultDict["Message"].ToString();
                }

                return new Result { IsSuccessfull = isSuccess, Message = message };
            }
            catch (Exception ex)
            {
                return new Result { IsSuccessfull = false, Message = ex.Message };
            }
        }

        public async Task<Result> UpdateClientMasterAsync(ClientMasterModel client, string userId, string locId)
        {
            try
            {
                client.HolidayMultiple = client.HolidayMultiple ?? 0;
                client.CommissionPercent = client.CommissionPercent ?? 0;
                client.gst_rate = client.gst_rate ?? 0;
                client.daysDivideInMonth = client.daysDivideInMonth ?? 0;
                client.PresentDaysforWeekOff = client.PresentDaysforWeekOff ?? 0;



                var dataset = new ClientMasterDataset
                {
                    ClientMaster = client,
                    ServiceTypes = client.ServiceTypeIds?.Select(id => new ServiceTypeXmlModel { ServiceTypeId = id }).ToList() ?? new List<ServiceTypeXmlModel>(),
                    ModelTypes = client.ModelTypeIds?.Select(id => new ModelTypeXmlModel { ModelTypeId = id }).ToList() ?? new List<ModelTypeXmlModel>(),
                    ExtraDayDetails = client.ExtraDayDetails,
                    HolidaySalaryHeads = client.HolidaySalaryHeadIds?.Select(id => new HolidaySalaryHeadXmlModel { HeadId = id }).ToList() ?? new List<HolidaySalaryHeadXmlModel>(),
                    ServiceMonthDaysDetails = client.ServiceMonthDaysDetails
                };

                string xml = XmlUtility.XmlSerializeToString(dataset);

                DynamicParameters dynamicParameters = new DynamicParameters();
                dynamicParameters.Add("@Doc", xml, DbType.String);
                dynamicParameters.Add("@fk_companyId", client.fk_companyId, DbType.String);
                dynamicParameters.Add("@fk_userId", userId, DbType.String);
                dynamicParameters.Add("@fk_locId", locId, DbType.String);

                var dbResult = DataBaseFactory.QuerySP<dynamic>("LSP_ClientMaster_Update", dynamicParameters, "ClientMaster_Update").FirstOrDefault();

                bool isSuccess = false;
                string message = "Failed to update Client Master";

                if (dbResult != null)
                {
                    var resultDict = (IDictionary<string, object>)dbResult;
                    isSuccess = Convert.ToInt32(resultDict["IsSuccess"]) == 1;
                    message = resultDict["Message"].ToString();
                }

                return new Result { IsSuccessfull = isSuccess, Message = message };
            }
            catch (Exception ex)
            {
                return new Result { IsSuccessfull = false, Message = ex.Message };
            }
        }

        public async Task<ClientMasterModel> GetClientMasterByIdAsync(long pk_cost_centre_id)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_cost_centre_id", pk_cost_centre_id, DbType.Int64);

            var tuple = DataBaseFactory.QueryMultipleSP<ClientMasterModel, dynamic, ExtraDayXmlModel, dynamic, dynamic, ServiceMonthDaysXmlModel>("LSP_ClientMaster_GetById", dynamicParameters, "ClientMaster_GetById");

            var client = tuple.Item1.FirstOrDefault();
            if (client != null)
            {
                client.ServiceTypeIds = tuple.Item2.Select(x => ((IDictionary<string, object>)x)["ServiceTypeId"].ToString()).ToList();
                client.ExtraDayDetails = tuple.Item3.ToList();
                client.ModelTypeIds = tuple.Item4.Select(x => ((IDictionary<string, object>)x)["ModelTypeId"].ToString()).ToList();
                client.HolidaySalaryHeadIds = tuple.Item5.Select(x => ((IDictionary<string, object>)x)["HeadId"].ToString()).ToList();
                client.ServiceMonthDaysDetails = tuple.Item6.ToList();
            }

            return client;
        }

        public async Task<(int totalCount, IEnumerable<ClientMasterListModel>)> GetAll(int pageIndex, int pageSize, string fk_companyId, string searchTerm)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@fk_companyId", fk_companyId, DbType.String);
            dynamicParameters.Add("@pageIndex", pageIndex, DbType.Int32);
            dynamicParameters.Add("@pageSize", pageSize, DbType.Int32);
            dynamicParameters.Add("@SearchTerm", searchTerm ?? "", DbType.String);

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, ClientMasterListModel>("LSP_ClientMaster_GetList", dynamicParameters, "ClientMaster_GetList");

            int totalCount = 0;
            if (tuple != null && tuple.Item1 != null && tuple.Item1.Any())
            {
                var countDict = (IDictionary<string, object>)tuple.Item1.First();
                totalCount = Convert.ToInt32(countDict.Values.First());
            }

            return (totalCount, tuple?.Item2 ?? new List<ClientMasterListModel>());
        }

        public async Task<Result> DeleteClientMasterAsync(long pk_cost_centre_id)
        {
            try
            {
                var dynamicParameters = new DynamicParameters();
                dynamicParameters.Add("@pk_cost_centre_id", pk_cost_centre_id, DbType.Int64);

                var dbResult = DataBaseFactory.QuerySP("SAL_Cost_Centre_Mst_Del", dynamicParameters);

                return new Result { IsSuccessfull = true, Message = "Client Master deleted successfully" };
            }
            catch (Exception ex)
            {
                return new Result { IsSuccessfull = false, Message = ex.Message };
            }
        }



        public async Task<IEnumerable<NameValue>> GetModelListByClientAsync(long fk_cost_centre_id, string fk_companyId = "")
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@fk_cost_centre_id", fk_cost_centre_id, DbType.Int64);
            dynamicParameters.Add("@fk_companyId", fk_companyId, DbType.String);

            var result = await DataBaseFactory.QuerySPAsync<NameValue>("LSP_ClientMaster_GetModelListByClient", dynamicParameters, "ClientMaster_GetModelListByClient");
            return result ?? new List<NameValue>();
        }

        public async Task<IEnumerable<NameValue>> GetEarningHeadsAsync(string fk_companyId = "")
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@fk_CompanyId", fk_companyId, DbType.String);

            var list = await DataBaseFactory.QuerySPAsync<dynamic>("Usp_Customer_RateCard_GetEarningHeads", dynamicParameters, "ClientMaster_GetEarningHeads");
            if (list == null) return new List<NameValue>();

            return list.Select(x =>
            {
                var d = (IDictionary<string, object>)x;
                return new NameValue
                {
                    Value = d["pk_headid"]?.ToString() ?? "",
                    Name = d["shortdesc"]?.ToString() ?? ""
                };
            }).ToList();
        }

        public async Task<bool> UploadClientLogoAsync(long clientId, string logoName)
        {
            try
            {
                DynamicParameters dynamicParameters = new DynamicParameters();
                dynamicParameters.Add("@ClientId", clientId, DbType.Int64);
                dynamicParameters.Add("@LogoName", logoName, DbType.String);

                var result = DataBaseFactory.QuerySP("Client_Logo_Ins", dynamicParameters);
                return result > 0 || result == -1;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Upload Client Logo Error : " + ex.Message);
                throw;
            }
        }
    }
}
