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
    public class CommonRateCardRepository : ICommonRateCardRepository
    {
        public async Task<Result> InsertRateCardAsync(CommonRateCardModel model, string userId, string companyId)
        {
            try
            {
                DynamicParameters parameters = new DynamicParameters();
                parameters.Add("@ClientID", model.ClientID, DbType.Int64);
                parameters.Add("@ModelID", model.ModelID, DbType.Int32);
                parameters.Add("@FHRID", model.FHRID, DbType.String);
                parameters.Add("@LocationID", model.LocationID, DbType.String);
                parameters.Add("@EffectiveFrom", model.EffectiveFrom, DbType.Date);

                parameters.Add("@Normal_Rate", model.Normal_Rate, DbType.Decimal);
                parameters.Add("@Normal_RateType", model.Normal_RateType, DbType.String);
                parameters.Add("@Normal_SlabExpr", model.Normal_SlabExpr, DbType.String);

                parameters.Add("@Pickup_Rate", model.Pickup_Rate, DbType.Decimal);
                parameters.Add("@Pickup_RateType", model.Pickup_RateType, DbType.String);
                parameters.Add("@Pickup_SlabExpr", model.Pickup_SlabExpr, DbType.String);

                parameters.Add("@Rto_Rate", model.Rto_Rate, DbType.Decimal);
                parameters.Add("@Rto_RateType", model.Rto_RateType, DbType.String);
                parameters.Add("@Rto_SlabExpr", model.Rto_SlabExpr, DbType.String);

                parameters.Add("@Dto_Rate", model.Dto_Rate, DbType.Decimal);
                parameters.Add("@Dto_RateType", model.Dto_RateType, DbType.String);
                parameters.Add("@Dto_SlabExpr", model.Dto_SlabExpr, DbType.String);

                parameters.Add("@Fm_Rate", model.Fm_Rate, DbType.Decimal);
                parameters.Add("@Fm_RateType", model.Fm_RateType, DbType.String);
                parameters.Add("@Fm_SlabExpr", model.Fm_SlabExpr, DbType.String);

                parameters.Add("@MFN_Rate", model.MFN_Rate, DbType.Decimal);
                parameters.Add("@MFN_RateType", model.MFN_RateType, DbType.String);
                parameters.Add("@MFN_SlabExpr", model.MFN_SlabExpr, DbType.String);

                parameters.Add("@Incentive_Rate", model.Incentive_Rate, DbType.Decimal);
                parameters.Add("@Incentive_RateType", model.Incentive_RateType, DbType.String);
                parameters.Add("@Incentive_SlabExpr", model.Incentive_SlabExpr, DbType.String);

                parameters.Add("@Van_Rate", model.Van_Rate, DbType.Decimal);
                parameters.Add("@Van_RateType", model.Van_RateType, DbType.String);
                parameters.Add("@Van_SlabExpr", model.Van_SlabExpr, DbType.String);

                parameters.Add("@Shopsy_Deduction_Rate", model.Shopsy_Deduction_Rate, DbType.Decimal);
                parameters.Add("@Shopsy_RateType", model.Shopsy_RateType, DbType.String);
                parameters.Add("@Shopsy_SlabExpr", model.Shopsy_SlabExpr, DbType.String);

                parameters.Add("@U2S_Rate", model.U2S_Rate, DbType.Decimal);
                parameters.Add("@U2S_RateType", model.U2S_RateType, DbType.String);
                parameters.Add("@U2S_SlabExpr", model.U2S_SlabExpr, DbType.String);

                parameters.Add("@Prexo_Rate", model.Prexo_Rate, DbType.Decimal);
                parameters.Add("@Prexo_RateType", model.Prexo_RateType, DbType.String);
                parameters.Add("@Prexo_SlabExpr", model.Prexo_SlabExpr, DbType.String);

                parameters.Add("@Grocery_Rate", model.Grocery_Rate, DbType.Decimal);
                parameters.Add("@Grocery_RateType", model.Grocery_RateType, DbType.String);
                parameters.Add("@Grocery_SlabExpr", model.Grocery_SlabExpr, DbType.String);

                parameters.Add("@Large_VehicleTypeID", model.Large_VehicleTypeID, DbType.Int32);
                parameters.Add("@Large_VehicleTypeName", model.Large_VehicleTypeName, DbType.String);

                parameters.Add("@AmazonEdsp_VehicleTypeID", model.AmazonEdsp_VehicleTypeID, DbType.Int32);
                parameters.Add("@AmazonEdsp_VehicleTypeName", model.AmazonEdsp_VehicleTypeName, DbType.String);

                parameters.Add("@fk_CompanyID", companyId, DbType.String);
                parameters.Add("@fk_InsUserID", userId, DbType.String);

                var list = await DataBaseFactory.QuerySPAsync<dynamic>("Vendor_CommonRateCard_Ins", parameters, "CommonRateCard_Insert");
                var row = list?.FirstOrDefault();

                if (row != null)
                {
                    var dict = (IDictionary<string, object>)row;
                    bool isSuccess = false;
                    string msg = "";

                    if (dict.ContainsKey("IsSuccessfull"))
                        isSuccess = Convert.ToBoolean(dict["IsSuccessfull"]);
                    else if (dict.ContainsKey("isSuccessfull"))
                        isSuccess = Convert.ToBoolean(dict["isSuccessfull"]);

                    if (dict.ContainsKey("Message"))
                        msg = dict["Message"]?.ToString() ?? "";
                    else if (dict.ContainsKey("message"))
                        msg = dict["message"]?.ToString() ?? "";

                    return new Result
                    {
                        IsSuccessfull = isSuccess,
                        Message = msg
                    };
                }

                return new Result
                {
                    IsSuccessfull = false,
                    Message = "No response from database."
                };
            }
            catch (Exception ex)
            {
                return new Result
                {
                    IsSuccessfull = false,
                    Message = ex.Message
                };
            }
        }

        public async Task<Result> UpdateRateCardAsync(CommonRateCardModel model, string userId, string companyId)
        {
            try
            {
                DynamicParameters parameters = new DynamicParameters();
                parameters.Add("@pk_RateCardID", model.pk_RateCardID, DbType.Int64);
                parameters.Add("@ClientID", model.ClientID, DbType.Int64);
                parameters.Add("@ModelID", model.ModelID, DbType.Int32);
                parameters.Add("@FHRID", model.FHRID?.Trim(), DbType.String);
                parameters.Add("@LocationID", model.LocationID, DbType.String);
                parameters.Add("@EffectiveFrom", model.EffectiveFrom, DbType.Date);

                parameters.Add("@Normal_Rate", model.Normal_Rate, DbType.Decimal);
                parameters.Add("@Normal_RateType", model.Normal_RateType, DbType.String);
                parameters.Add("@Normal_SlabExpr", model.Normal_SlabExpr, DbType.String);

                parameters.Add("@Pickup_Rate", model.Pickup_Rate, DbType.Decimal);
                parameters.Add("@Pickup_RateType", model.Pickup_RateType, DbType.String);
                parameters.Add("@Pickup_SlabExpr", model.Pickup_SlabExpr, DbType.String);

                parameters.Add("@Rto_Rate", model.Rto_Rate, DbType.Decimal);
                parameters.Add("@Rto_RateType", model.Rto_RateType, DbType.String);
                parameters.Add("@Rto_SlabExpr", model.Rto_SlabExpr, DbType.String);

                parameters.Add("@Dto_Rate", model.Dto_Rate, DbType.Decimal);
                parameters.Add("@Dto_RateType", model.Dto_RateType, DbType.String);
                parameters.Add("@Dto_SlabExpr", model.Dto_SlabExpr, DbType.String);

                parameters.Add("@Fm_Rate", model.Fm_Rate, DbType.Decimal);
                parameters.Add("@Fm_RateType", model.Fm_RateType, DbType.String);
                parameters.Add("@Fm_SlabExpr", model.Fm_SlabExpr, DbType.String);

                parameters.Add("@MFN_Rate", model.MFN_Rate, DbType.Decimal);
                parameters.Add("@MFN_RateType", model.MFN_RateType, DbType.String);
                parameters.Add("@MFN_SlabExpr", model.MFN_SlabExpr, DbType.String);

                parameters.Add("@Incentive_Rate", model.Incentive_Rate, DbType.Decimal);
                parameters.Add("@Incentive_RateType", model.Incentive_RateType, DbType.String);
                parameters.Add("@Incentive_SlabExpr", model.Incentive_SlabExpr, DbType.String);

                parameters.Add("@Van_Rate", model.Van_Rate, DbType.Decimal);
                parameters.Add("@Van_RateType", model.Van_RateType, DbType.String);
                parameters.Add("@Van_SlabExpr", model.Van_SlabExpr, DbType.String);

                parameters.Add("@Shopsy_Deduction_Rate", model.Shopsy_Deduction_Rate, DbType.Decimal);
                parameters.Add("@Shopsy_RateType", model.Shopsy_RateType, DbType.String);
                parameters.Add("@Shopsy_SlabExpr", model.Shopsy_SlabExpr, DbType.String);

                parameters.Add("@U2S_Rate", model.U2S_Rate, DbType.Decimal);
                parameters.Add("@U2S_RateType", model.U2S_RateType, DbType.String);
                parameters.Add("@U2S_SlabExpr", model.U2S_SlabExpr, DbType.String);

                parameters.Add("@Prexo_Rate", model.Prexo_Rate, DbType.Decimal);
                parameters.Add("@Prexo_RateType", model.Prexo_RateType, DbType.String);
                parameters.Add("@Prexo_SlabExpr", model.Prexo_SlabExpr, DbType.String);

                parameters.Add("@Grocery_Rate", model.Grocery_Rate, DbType.Decimal);
                parameters.Add("@Grocery_RateType", model.Grocery_RateType, DbType.String);
                parameters.Add("@Grocery_SlabExpr", model.Grocery_SlabExpr, DbType.String);

                parameters.Add("@Large_VehicleTypeID", model.Large_VehicleTypeID, DbType.Int32);
                parameters.Add("@Large_VehicleTypeName", model.Large_VehicleTypeName, DbType.String);

                parameters.Add("@AmazonEdsp_VehicleTypeID", model.AmazonEdsp_VehicleTypeID, DbType.Int32);
                parameters.Add("@AmazonEdsp_VehicleTypeName", model.AmazonEdsp_VehicleTypeName, DbType.String);

                parameters.Add("@fk_CompanyID", companyId, DbType.String);
                parameters.Add("@fk_UpdUserID", userId, DbType.String);

                var list = await DataBaseFactory.QuerySPAsync<dynamic>("Vendor_CommonRateCard_Upd", parameters, "CommonRateCard_Update");
                var row = list?.FirstOrDefault();

                if (row != null)
                {
                    var dict = (IDictionary<string, object>)row;
                    bool isSuccess = false;
                    string msg = "";

                    if (dict.ContainsKey("IsSuccessfull"))
                        isSuccess = Convert.ToBoolean(dict["IsSuccessfull"]);
                    else if (dict.ContainsKey("isSuccessfull"))
                        isSuccess = Convert.ToBoolean(dict["isSuccessfull"]);

                    if (dict.ContainsKey("Message"))
                        msg = dict["Message"]?.ToString() ?? "";
                    else if (dict.ContainsKey("message"))
                        msg = dict["message"]?.ToString() ?? "";

                    return new Result
                    {
                        IsSuccessfull = isSuccess,
                        Message = msg
                    };
                }

                return new Result
                {
                    IsSuccessfull = false,
                    Message = "No response from database."
                };
            }
            catch (Exception ex)
            {
                return new Result
                {
                    IsSuccessfull = false,
                    Message = ex.Message
                };
            }
        }



        public async Task<Result> DeleteRateCardAsync(long pk_RateCardID, string companyId)
        {
            try
            {
                DynamicParameters parameters = new DynamicParameters();
                parameters.Add("@pk_RateCardID", pk_RateCardID, DbType.Int64);
                parameters.Add("@fk_CompanyID", companyId, DbType.String);

                int result = DataBaseFactory.QuerySP("Vendor_CommonRateCard_Del", parameters, "CommonRateCard_Delete");
                bool isSuccess = result > 0 || result == -1;

                return new Result
                {
                    IsSuccessfull = isSuccess,
                    Message = isSuccess ? "Rate card deleted successfully." : "Rate card not found."
                };
            }
            catch (Exception ex)
            {
                return new Result
                {
                    IsSuccessfull = false,
                    Message = $"Error deleting rate card: {ex.Message}"
                };
            }
        }

        public async Task<CommonRateCardModel?> GetRateCardByIdAsync(long pk_RateCardID, string companyId)
        {
            try
            {
                DynamicParameters parameters = new DynamicParameters();
                parameters.Add("@pk_RateCardID", pk_RateCardID, DbType.Int64);
                parameters.Add("@fk_CompanyID", companyId, DbType.String);

                var list = DataBaseFactory.QuerySP<CommonRateCardModel>("Vendor_CommonRateCard_GetById", parameters, "CommonRateCard_GetById");
                return list?.FirstOrDefault();
            }
            catch (Exception)
            {
                return null;
            }
        }

        public async Task<(int totalCount, IEnumerable<dynamic> list)> GetAllRateCardsAsync(
            int pageIndex,
            int pageSize,
            string companyId,
            string? searchTerm = "",string? userId = "")
        {
            try
            {
                DynamicParameters parameters = new DynamicParameters();
                parameters.Add("@pageIndex", pageIndex, DbType.Int32);
                parameters.Add("@pageSize", pageSize > 0 ? pageSize : 10, DbType.Int32);
                parameters.Add("@fk_CompanyID", companyId, DbType.String);
                parameters.Add("@SearchTerm", searchTerm ?? "", DbType.String);
                parameters.Add("@fk_UserID", userId ?? "", DbType.String);

                var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic>("Vendor_CommonRateCard_GetAll", parameters, "CommonRateCard_GetAll");

                if (tuple == null || tuple.Item2 == null)
                {
                    return (0, Enumerable.Empty<dynamic>());
                }

                int totalCount = 0;
                if (tuple.Item1 is IEnumerable<dynamic> countList && countList.Any())
                {
                    var firstRow = (IDictionary<string, object>)countList.First();
                    totalCount = Convert.ToInt32(firstRow.Values.First());
                }

                return (totalCount, tuple.Item2.ToList());
            }
            catch (Exception)
            {
                return (0, Enumerable.Empty<dynamic>());
            }
        }



        public async Task<(bool recordExists, IEnumerable<dynamic> list)> CheckRateCardExistsAsync(long clientId, int modelId, string locationId, DateTime effectiveFrom, string fhrId, string companyId, int? largeVehicleTypeId = null, int? amazonEdspVehicleTypeId = null)
        {
            try
            {
                DynamicParameters parameters = new DynamicParameters();
                parameters.Add("@ClientID", clientId, DbType.Int64);
                parameters.Add("@ModelID", modelId, DbType.Int32);
                parameters.Add("@LocationID", locationId, DbType.String);
                parameters.Add("@EffectiveFrom", effectiveFrom, DbType.Date);
                parameters.Add("@FHRID", fhrId.Trim(), DbType.String);
                parameters.Add("@fk_CompanyID", companyId, DbType.String);
                parameters.Add("@Large_VehicleTypeID", largeVehicleTypeId, DbType.Int32);
                parameters.Add("@AmazonEdsp_VehicleTypeID", amazonEdspVehicleTypeId, DbType.Int32);

                var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic>("Vendor_CommonRateCard_Detail", parameters, "CommonRateCard_Detail");

                bool recordExists = false;
                if (tuple?.Item1 is IEnumerable<dynamic> existsList && existsList.Any())
                {
                    var firstRow = (IDictionary<string, object>)existsList.First();
                    recordExists = Convert.ToBoolean(firstRow.Values.First());
                }

                var list = tuple?.Item2?.ToList() ?? new List<dynamic>();
                return (recordExists, list);
            }
            catch (Exception)
            {
                return (false, Enumerable.Empty<dynamic>());
            }
        }




    }
}
