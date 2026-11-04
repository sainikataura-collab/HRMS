using ClosedXML.Excel;
using Dapper;
using DocumentFormat.OpenXml.Spreadsheet;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;

namespace HRMSWebAPI.Repository
{
    public class VendorRepository : IVendorRepository
    {
        private readonly IConfiguration? _configuration;
        public VendorRepository(IConfiguration? configuration = null)
        {
            _configuration = configuration;
        }

        private static Dictionary<string, object> ToDict(dynamic row)
        {
            var d = (IDictionary<string, object>)row;
            return d.ToDictionary(k => k.Key, v => v.Value);
        }

        public async Task<dynamic> GetHIDashboardSummaryAsync(string companyId, string userId)
        {
            var result = new Dictionary<string, object>();

            try
            {
                DynamicParameters p = new DynamicParameters();
                p.Add("@fk_companyId", companyId ?? "", DbType.AnsiString, size: 50);
                p.Add("@fk_UserID", userId ?? "", DbType.AnsiString, size: 15);

                using var con = new SqlConnection(
                    _configuration.GetConnectionString("DefaultConnection")
                    ?? _configuration.GetConnectionString("WebApplication1DBConnection"));
                await con.OpenAsync();

                using var multi = await con.QueryMultipleAsync(
                    "HI_Dashboard_GetVendorSummary",
                    p,
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: 120);

                // 1st grid: summary (ya error: IsSuccessfully / IsMessage)
                var firstGrid = (await multi.ReadAsync<dynamic>()).ToList();

                if (firstGrid.Count > 0)
                {
                    var firstRow = (IDictionary<string, object>)firstGrid[0];
                    if (firstRow.ContainsKey("IsSuccessfully"))
                    {
                        result["isSuccess"] = false;
                        result["message"] = firstRow.ContainsKey("IsMessage")
                            ? firstRow["IsMessage"]?.ToString()
                            : "Failed to load HI dashboard.";
                        return result;
                    }
                }

                var summary = firstGrid.Count > 0 ? ToDict(firstGrid[0]) : null;

                // 2nd grid: status summary
                var statusSummary = (await multi.ReadAsync<dynamic>()).Select(r => ToDict(r)).ToList();

                // 3rd grid: pending work overview
                var pendingWork = (await multi.ReadAsync<dynamic>()).Select(r => ToDict(r)).FirstOrDefault();

                // 4th grid: top 5 vendors
                var topVendors = (await multi.ReadAsync<dynamic>()).Select(r => ToDict(r)).ToList();

                result["isSuccess"] = true;
                result["message"] = "OK";
                result["summary"] = summary;
                result["statusSummary"] = statusSummary;
                result["pendingWork"] = pendingWork;
                result["topVendors"] = topVendors;
                return result;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error in GetHIDashboardSummaryAsync: " + ex.Message);
                result["isSuccess"] = false;
                result["message"] = ex.Message;
                return result;
            }
        }


        public async Task<IEnumerable<dynamic>> UploadRateCardAsync(
    VendorRateCardUploadRequest request, string userId, string companyId, string locationId, string filePath = null)
        {
            var p = new DynamicParameters();

            string xmlData = XmlUtility.XmlSerializeToString(request);
            if (xmlData.StartsWith("<?xml"))
            {
                int idx = xmlData.IndexOf("?>");
                if (idx != -1)
                    xmlData = xmlData.Substring(idx + 2).Trim();
            }

            p.Add("@Doc", xmlData, DbType.Xml);
            p.Add("@fk_companyId", companyId ?? "", DbType.String);
            p.Add("@fk_userId", userId ?? "", DbType.String);
            p.Add("@fk_locId", locationId ?? "", DbType.String);
            p.Add("@FilePath", filePath ?? "", DbType.String);
            p.Add("@FileName", filePath ?? "", DbType.String);
            // Use dynamic so ALL SP columns come through (Model-wise: ODH/XRM/LARGE)
            var dbResult = DataBaseFactory.QuerySP<dynamic>(
                "RateCardExcel_Upload", p, "RateCardExcel_Upload");

            return dbResult ?? Enumerable.Empty<dynamic>();
        }

        public async Task<(int totalCount, VendorDashboardCounts counts, IEnumerable<VendorModel> vendors)> GetAllVendorsAsync(int pageIndex, int pageSize, string companyId, string searchTerm = "", string locationId = "", string agentCode = "", string status = "", string fhridMappingStatus = "", string? userId = "")
        {
            try
            {
                DynamicParameters dynamicParameters = new DynamicParameters();
                dynamicParameters.Add("@pageindex", pageIndex, DbType.Int32);
                dynamicParameters.Add("@pagesize", pageSize, DbType.Int32);
                dynamicParameters.Add("@searchTerm", searchTerm, DbType.String);
                dynamicParameters.Add("@fk_companyId", companyId, DbType.String);
                dynamicParameters.Add("@locationId", locationId, DbType.String);
                dynamicParameters.Add("@agentCode", agentCode, DbType.String);
                dynamicParameters.Add("@status", status, DbType.String);
                dynamicParameters.Add("@fhridMappingStatus", fhridMappingStatus, DbType.String);
                dynamicParameters.Add("@fk_UserID", userId ?? "", DbType.String);


                var tuple = DataBaseFactory.QueryMultipleSP<dynamic, VendorModel>("Vendor_SelForGrid", dynamicParameters, "Vendor_SelForGrid");
                if (tuple == null || tuple.Item2 == null) return (0, new VendorDashboardCounts(), Enumerable.Empty<VendorModel>());

                int totalCount = 0;
                VendorDashboardCounts counts = new VendorDashboardCounts();
                if (tuple.Item1 is IEnumerable<dynamic> countList && countList.Any())
                {
                    var firstRow = (IDictionary<string, object>)countList.First();
                    if (firstRow.ContainsKey("TotalCount"))
                    {
                        totalCount = Convert.ToInt32(firstRow["TotalCount"]);
                    }
                    if (firstRow.ContainsKey("TotalNotInitiated"))
                    {
                        counts.NotInitiated = Convert.ToInt32(firstRow["TotalNotInitiated"]);
                    }
                    if (firstRow.ContainsKey("TotalInitiated"))
                    {
                        counts.Initiated = Convert.ToInt32(firstRow["TotalInitiated"]);
                    }
                    if (firstRow.ContainsKey("TotalSubmitted"))
                    {
                        counts.Submitted = Convert.ToInt32(firstRow["TotalSubmitted"]);
                    }
                    if (firstRow.ContainsKey("TotalVerified"))
                    {
                        counts.Verified = Convert.ToInt32(firstRow["TotalVerified"]);
                    }
                    if (firstRow.ContainsKey("TotalReInitiated"))
                    {
                        counts.ReInitiated = Convert.ToInt32(firstRow["TotalReInitiated"]);
                    }
                    if (firstRow.ContainsKey("TotalAgents"))
                    {
                        counts.TotalAgents = Convert.ToInt32(firstRow["TotalAgents"]);
                    }
                    counts.TotalVendors = totalCount;
                }

                return (totalCount, counts, tuple.Item2.ToList());
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error in GetAllVendorsAsync: " + ex.Message);
                return (0, new VendorDashboardCounts(), Enumerable.Empty<VendorModel>());
            }
        }


        public async Task<(int totalCount, IEnumerable<VendorRateCardModel> list)> GetVendorListAsync(int pageIndex, int pageSize, string companyId, string searchTerm)
        {
            try
            {
                DynamicParameters dynamicParameters = new DynamicParameters();
                dynamicParameters.Add("@fk_companyId", companyId ?? "", DbType.String);
                dynamicParameters.Add("@pageIndex", pageIndex, DbType.Int32);
                dynamicParameters.Add("@pageSize", pageSize, DbType.Int32);
                dynamicParameters.Add("@SearchTerm", searchTerm ?? "", DbType.String);

                var dbResult = DataBaseFactory.QuerySP<VendorRateCardModel>("LSP_VendorRateCard_GetList", dynamicParameters, "VendorRateCard_GetList");

                var list = dbResult?.ToList() ?? new List<VendorRateCardModel>();
                return (list.Count, list);
            }
            catch (Exception)
            {
                return (0, new List<VendorRateCardModel>());
            }
        }




        public async Task<VendorResponseModel> InsertVendorAsync(VendorModel model, string userId, string companyId, string locationId)

        {
            try
            {

                // Wrap the candidate object in the dataset wrapper
                VendorModelDataset dataset = new VendorModelDataset
                {
                    Vendor = model
                };

                string xmlData = XmlUtility.XmlSerializeToString(dataset);
                DynamicParameters dynamicParameters = new DynamicParameters();
                dynamicParameters.Add("@XmlVendor", xmlData, DbType.String);
                dynamicParameters.Add("@fk_companyId", companyId ?? "", DbType.String);
                dynamicParameters.Add("@fk_userId", userId ?? "", DbType.String);
                dynamicParameters.Add("@fk_locId", locationId ?? "", DbType.String);
                dynamicParameters.Add("@pk_recId", dbType: DbType.String, size: 15, direction: ParameterDirection.Output);
                dynamicParameters.Add("@IsSuccessfull", dbType: DbType.Boolean, direction: ParameterDirection.Output);
                dynamicParameters.Add("@Message", dbType: DbType.String, size: 255, direction: ParameterDirection.Output);

                var result = DataBaseFactory.QuerySP("Vendor_Ins", dynamicParameters);
                return new VendorResponseModel
                {
                    pk_recId = dynamicParameters.Get<string>("@pk_recId"),
                    IsSuccessfully = dynamicParameters.Get<bool>("@IsSuccessfull"),
                    IsMessage = dynamicParameters.Get<string>("@Message")
                };
            }
            catch (Exception ex)
            {
                return new VendorResponseModel { IsSuccessfully = false, IsMessage = ex.Message };
            }
        }


        public async Task<(int totalCount, IEnumerable<VendorFHRIDHistoryModel> list)> GetVendorFHRIDHistoryAsync(string pk_recId, int pageIndex, int pageSize)
        {
            try
            {
                DynamicParameters dynamicParameters = new DynamicParameters();
                dynamicParameters.Add("@pk_recId", pk_recId ?? "", DbType.String);
                dynamicParameters.Add("@pageIndex", pageIndex, DbType.Int32);
                dynamicParameters.Add("@pageSize", pageSize, DbType.Int32);

                var dbResult = DataBaseFactory.QuerySP<VendorFHRIDHistoryModel>("USP_Vendor_GetFHRIDHistory", dynamicParameters, "USP_Vendor_GetFHRIDHistory");

                var list = dbResult?.ToList() ?? new List<VendorFHRIDHistoryModel>();
                int totalCount = list.FirstOrDefault()?.TotalCount ?? 0;

                return (totalCount, list);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error in GetVendorFHRIDHistoryAsync: " + ex.Message);
                return (0, Enumerable.Empty<VendorFHRIDHistoryModel>());
            }
        }



        public async Task<IEnumerable<dynamic>> GetFHRIDsAsync(string clientId, string modelId, string companyId)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@ClientId", clientId);
                param.Add("@ModelId", modelId);
                param.Add("@CompanyId", companyId);

                var result = await DataBaseFactory.QuerySPAsync<dynamic>("USP_VendorRateCard_GetLinkedFHRIDs", param, "VendorRateCard - GetLinkedFHRIDs");
                return result;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error in GetFHRIDsAsync: " + ex.Message);
                return Enumerable.Empty<dynamic>();
            }
        }

        public async Task<VendorResponseModel> UpdateVendorAsync(VendorModel model, string userId, string companyId)
        {
            try
            {
                // Wrap the candidate object in the dataset wrapper
                VendorModelDataset dataset = new VendorModelDataset
                {
                    Vendor = model
                };

                string xmlData = XmlUtility.XmlSerializeToString(dataset);
                DynamicParameters dynamicParameters = new DynamicParameters();
                dynamicParameters.Add("@XmlVendor", xmlData, DbType.String);
                dynamicParameters.Add("@pk_recId", model.pk_recId, DbType.String);
                dynamicParameters.Add("@fk_companyId", companyId ?? "", DbType.String);
                dynamicParameters.Add("@fk_userId", userId ?? "", DbType.String);

                var result = DataBaseFactory.QuerySP<VendorResponseModel>("Vendor_Upd", dynamicParameters, "Vendor_Upd").FirstOrDefault();

                return result ?? new VendorResponseModel { IsSuccessfully = false, IsMessage = "Failed to update vendor." };
            }
            catch (Exception ex)
            {
                return new VendorResponseModel { IsSuccessfully = false, IsMessage = ex.Message };
            }
        }



        public async Task<VendorResponseModel> DeleteVendorAsync(string pk_recId)
        {
            try
            {
                DynamicParameters dynamicParameters = new DynamicParameters();
                dynamicParameters.Add("@pk_recId", pk_recId, DbType.String);

                var result = DataBaseFactory.QuerySP<VendorResponseModel>("Vendor_Del", dynamicParameters, "Vendor_Del").FirstOrDefault();
                return result ?? new VendorResponseModel { IsSuccessfully = false, IsMessage = "Failed to delete vendor." };
            }
            catch (Exception ex)
            {
                return new VendorResponseModel { IsSuccessfully = false, IsMessage = ex.Message };
            }
        }


        public async Task<VendorModel?> GetVendorByIdAsync(string pk_recId)
        {
            try
            {
                using var conn = DataBaseFactory.ConnString();

                // Ek hi SP call se dono result sets fetch karna
                using var multi = await conn.QueryMultipleAsync("Vendor_GetById", new { pk_recId = pk_recId },
                    commandType: CommandType.StoredProcedure
                );

                // First SELECT se Vendor data read karna
                var vendor = multi.Read<VendorModel>().FirstOrDefault();

                if (vendor != null)
                {
                    // Second SELECT se Rate Cards read karna
                    var rateCards = multi.Read<VendorRateCardItemModel>().ToList();
                    vendor.RateCards = rateCards;

                    if (rateCards.Count > 0)
                    {
                        var first = rateCards[0];

                        // Handle mappings if SP returns Vendor_FKClientId instead of fk_cost_centre_id
                        var allClients = rateCards
                            .Select(r => r.fk_cost_centre_id != 0 ? r.fk_cost_centre_id.ToString() : (r.Vendor_FKClientId ?? ""))
                            .Where(id => !string.IsNullOrWhiteSpace(id))
                            .Distinct();
                        vendor.Vendor_FKClientId = string.Join(",", allClients);

                        var allModels = rateCards
                            .Select(r => {
                                string cId = r.fk_cost_centre_id != 0 ? r.fk_cost_centre_id.ToString() : (r.Vendor_FKClientId ?? "");
                                string mId = !string.IsNullOrEmpty(r.fk_modelId) ? r.fk_modelId : (r.Vendor_FK_ModelId ?? "");
                                return $"{cId}_{mId}";
                            })
                            .Where(id => !string.IsNullOrWhiteSpace(id) && id != "_")
                            .Distinct();
                        vendor.Vendor_FK_ModelId = string.Join(",", allModels);

                        // Combine multiple FHRIDs into a comma-separated string of composite IDs
                        var allHfrids = rateCards
                            .Where(r => !string.IsNullOrEmpty(r.Vendor_FHRID))
                            .Select(r => {
                                string cId = r.fk_cost_centre_id != 0 ? r.fk_cost_centre_id.ToString() : (r.Vendor_FKClientId ?? "");
                                string mId = !string.IsNullOrEmpty(r.fk_modelId) ? r.fk_modelId : (r.Vendor_FK_ModelId ?? "");
                                return $"{cId}_{mId}_{r.Vendor_FHRID}";
                            })
                            .Distinct();
                        vendor.Vendor_HFRID = string.Join(",", allHfrids);

                        vendor.Vendor_RateType = first.Vendor_RateType;
                        vendor.Vendor_Type = first.Vendor_Type;
                        vendor.Vendor_CategoryID = first.Vendor_CategoryID;
                        vendor.Vendor_Rate = first.Vendor_Rate;
                        vendor.Vendor_RateDeduction = first.Vendor_RateDeduction;
                        vendor.Vendor_DeliveryRate = first.Vendor_DeliveryRate ?? vendor.Vendor_DeliveryRate;
                        vendor.Vendor_PickupRate = first.Vendor_PickupRate ?? vendor.Vendor_PickupRate;
                        vendor.Vendor_TDSPercentage = vendor.Vendor_TDSPercentage ?? first.Vendor_TDSPercentage;
                        vendor.Vendor_MFNRate = first.Vendor_MFNRate ?? vendor.Vendor_MFNRate;
                    }
                }
                return vendor;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error in GetVendorByIdAsync: " + ex.Message);
                return null;
            }
        }


        public async Task SaveVendorRateCardsAsync(string pk_recId, List<VendorRateCardItemModel>? rateCards, VendorModel fallbackModel)
        {
            if (string.IsNullOrEmpty(pk_recId)) return;

            try
            {
                using var conn = DataBaseFactory.ConnString();
                if (conn.State != ConnectionState.Open) await conn.OpenAsync();

                using var trans = conn.BeginTransaction();
                try
                {
                    var rawItems = rateCards != null && rateCards.Count > 0
                        ? rateCards
                        : new List<VendorRateCardItemModel>();

                    if (rawItems.Count == 0 && !string.IsNullOrEmpty(fallbackModel.Vendor_FKClientId) && !string.IsNullOrEmpty(fallbackModel.Vendor_FK_ModelId))
                    {
                        if (long.TryParse(fallbackModel.Vendor_FKClientId, out long clientId))
                        {
                            rawItems.Add(new VendorRateCardItemModel
                            {
                                fk_cost_centre_id = clientId,
                                fk_modelId = fallbackModel.Vendor_FK_ModelId,
                                Vendor_HFRID = fallbackModel.Vendor_HFRID,
                                Vendor_RateType = fallbackModel.Vendor_RateType,
                                Vendor_Type = fallbackModel.Vendor_Type,
                                Vendor_CategoryID = fallbackModel.Vendor_CategoryID,
                                Vendor_Rate = fallbackModel.Vendor_Rate,
                                Vendor_RateDeduction = fallbackModel.Vendor_RateDeduction,
                                Vendor_DeliveryRate = fallbackModel.Vendor_DeliveryRate,
                                Vendor_PickupRate = fallbackModel.Vendor_PickupRate,
                                Vendor_TDSPercentage = fallbackModel.Vendor_TDSPercentage,
                                Vendor_MFNRate = fallbackModel.Vendor_MFNRate,
                                EffectiveFrom = fallbackModel.EffectiveFrom ?? DateTime.Today
                            });
                        }
                    }

                    // Deduplicate items to ensure only 1 rate card per Client, Model, and Category is processed
                    var itemsToInsert = rawItems
                        .GroupBy(x => new {
                            ClientId = x.fk_cost_centre_id > 0 ? x.fk_cost_centre_id : (long.TryParse(x.Vendor_FKClientId, out long cid) ? cid : 0),
                            ModelId = !string.IsNullOrEmpty(x.fk_modelId) ? x.fk_modelId : x.Vendor_FK_ModelId ?? "",
                            CatId = x.Vendor_CategoryID ?? 0
                        })
                        .Where(g => g.Key.ClientId > 0 && !string.IsNullOrEmpty(g.Key.ModelId))
                        .Select(g => g.Last())
                        .ToList();

                    foreach (var rc in itemsToInsert)
                    {
                        long clientId = rc.fk_cost_centre_id;
                        if (clientId == 0 && !string.IsNullOrEmpty(rc.Vendor_FKClientId) && long.TryParse(rc.Vendor_FKClientId, out long parsedId))
                        {
                            clientId = parsedId;
                        }
                        string modelId = !string.IsNullOrEmpty(rc.fk_modelId) ? rc.fk_modelId : rc.Vendor_FK_ModelId ?? "";

                        if (clientId > 0 && !string.IsNullOrEmpty(modelId))
                        {
                            DateTime effFromDate = rc.EffectiveFrom ?? fallbackModel.EffectiveFrom ?? DateTime.Today;
                            string effFromFormatted = effFromDate.ToString("yyyy-MM-dd");
                            int catId = rc.Vendor_CategoryID ?? 0;

                            var param = new DynamicParameters();
                            param.Add("@fk_recId", pk_recId);
                            param.Add("@fk_cost_centre_id", clientId);
                            param.Add("@fk_modelId", modelId);
                            param.Add("@Vendor_HFRID", rc.Vendor_HFRID);
                            param.Add("@Vendor_RateType", rc.Vendor_RateType);
                            param.Add("@Vendor_Type", rc.Vendor_Type);
                            param.Add("@Vendor_CategoryID", catId);
                            param.Add("@Vendor_Rate", rc.Vendor_Rate);
                            param.Add("@Vendor_RateDeduction", rc.Vendor_RateDeduction);
                            param.Add("@Vendor_DeliveryRate", rc.Vendor_DeliveryRate);
                            param.Add("@Vendor_PickupRate", rc.Vendor_PickupRate);
                            param.Add("@Vendor_TDSPercentage", rc.Vendor_TDSPercentage);
                            param.Add("@Vendor_MFNRate", rc.Vendor_MFNRate);
                            param.Add("@EffectiveFrom", effFromFormatted, DbType.String);

                            await conn.ExecuteAsync("LSP_VendorRateCard_InsertSingle", param, trans, commandType: CommandType.StoredProcedure);
                        }
                    }

                    trans.Commit();
                }
                catch (Exception ex)
                {
                    trans.Rollback();
                    Console.WriteLine("Error saving rate cards: " + ex.Message);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error in SaveVendorRateCardsAsync: " + ex.Message);
            }
        }
        public async Task<(int totalCount, IEnumerable<VendorModel> vendors)> GetAllVendorsAsync(int pageIndex, int pageSize, string companyId, string searchTerm = "")
        {
            try
            {
                DynamicParameters dynamicParameters = new DynamicParameters();
                dynamicParameters.Add("@pageindex", pageIndex, DbType.Int32);
                dynamicParameters.Add("@pagesize", pageSize, DbType.Int32);
                dynamicParameters.Add("@searchTerm", searchTerm, DbType.String);
                dynamicParameters.Add("@fk_companyId", companyId, DbType.String);

                var tuple = DataBaseFactory.QueryMultipleSP<dynamic, VendorModel>("Vendor_SelForGrid", dynamicParameters, "Vendor_SelForGrid");
                if (tuple == null || tuple.Item2 == null) return (0, Enumerable.Empty<VendorModel>());

                int totalCount = 0;
                if (tuple.Item1 is IEnumerable<dynamic> countList && countList.Any())
                {
                    var firstRow = (IDictionary<string, object>)countList.First();
                    if (firstRow.ContainsKey("TotalCount"))
                    {
                        totalCount = Convert.ToInt32(firstRow["TotalCount"]);
                    }
                }

                return (totalCount, tuple.Item2.ToList());
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error in GetAllVendorsAsync: " + ex.Message);
                return (0, Enumerable.Empty<VendorModel>());
            }
        }

        public async Task<List<VendorUploadRowModel>> UploadVendorExcelAsync(IFormFile file, string? companyId = null, string? userId = null)
        {
            var resultList = new List<VendorUploadRowModel>();
            if (file == null || file.Length == 0) return resultList;

            try
            {
                // 1. Physical file saving with timestamped naming convention
                string uploadFolder = _configuration?["AppSettings:VendorMasterUploads"]!;
                if (string.IsNullOrEmpty(uploadFolder))
                {
                    uploadFolder = Path.Combine(Directory.GetCurrentDirectory(), "VendorMasterUploads");
                }
                if (!Directory.Exists(uploadFolder)) Directory.CreateDirectory(uploadFolder);

                string fileNameWithoutExt = Path.GetFileNameWithoutExtension(file.FileName);
                string ext = Path.GetExtension(file.FileName);
                string savedFileName = $"{fileNameWithoutExt}_{DateTime.Now:ddMMyy_HHmmss}{ext}";
                string savedFilePath = Path.Combine(uploadFolder, savedFileName);

                using (var fs = new FileStream(savedFilePath, FileMode.Create))
                {
                    await file.CopyToAsync(fs);
                }

                // 2. Read Excel rows and build XML Request
                using var workbook = new XLWorkbook(savedFilePath);
                var worksheet = workbook.Worksheets.FirstOrDefault();
                if (worksheet == null) return resultList;

                var headerRow = worksheet.Row(1);
                var colMap = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
                foreach (var cell in headerRow.CellsUsed())
                {
                    string headerText = cell.GetValue<string>().Trim().Replace(" ", "").Replace("_", "").Replace("*", "").Replace("%", "");
                    if (!string.IsNullOrEmpty(headerText) && !colMap.ContainsKey(headerText))
                    {
                        colMap[headerText] = cell.Address.ColumnNumber;
                    }
                }

                string GetVal(IXLRow r, string[] keys, int fallbackCol)
                {
                    foreach (var k in keys)
                    {
                        if (colMap.TryGetValue(k, out int colIdx))
                        {
                            var cell = r.Cell(colIdx);
                            if (cell != null && !cell.IsEmpty())
                            {
                                return cell.GetFormattedString()?.Trim() ?? cell.Value.ToString().Trim();
                            }
                        }
                    }

                    if (fallbackCol > 0)
                    {
                        var cell = r.Cell(fallbackCol);
                        if (cell != null && !cell.IsEmpty())
                        {
                            return cell.GetFormattedString()?.Trim() ?? cell.Value.ToString().Trim();
                        }
                    }

                    return string.Empty;
                }

                int lastRowNumber = worksheet.LastRowUsed()?.RowNumber() ?? 0;
                var xmlRequest = new VendorXmlUploadRequest();

                for (int rowNumber = 2; rowNumber <= lastRowNumber; rowNumber++)
                {
                    var row = worksheet.Row(rowNumber);
                    string vendorName = GetVal(row, new[] { "VENDORNAME", "VENDOR", "NAME" }, 1);
                    string fatherName = GetVal(row, new[] { "FATHERNAME" }, 2);
                    string contactNo = GetVal(row, new[] { "CONTACTNO", "CONTACT" }, 3);
                    string gender = GetVal(row, new[] { "GENDER", "SEX" }, 4);
                    string dobStr = GetVal(row, new[] { "DOB", "DATEOFBIRTH" }, 5);
                    string address = GetVal(row, new[] { "ADDRESS" }, 6);
                    string state = GetVal(row, new[] { "STATE", "STATENAME" }, 7);
                    string city = GetVal(row, new[] { "CITY", "CITYNAME" }, 8);
                    string bankName = GetVal(row, new[] { "BANKNAME", "BANK" }, 9);
                    string accountNo = GetVal(row, new[] { "ACCOUNTNO", "ACCOUNTNUMBER", "ACNO", "ACCNO" }, 10);
                    string ifscCode = GetVal(row, new[] { "IFSCCODE", "IFSC" }, 11);
                    string panNo = GetVal(row, new[] { "PANNO", "PAN" }, 12);
                    string aadhaarNo = GetVal(row, new[] { "AADHAARNO", "AADHARNO", "AADHAAR" }, 13);
                    string gstNo = GetVal(row, new[] { "GSTNO", "GST" }, 14);
                    string gstPercentage = GetVal(row, new[] { "GSTPERCENTAGE", "GSTPERCENT" }, 15);
                    string tdsPercentage = GetVal(row, new[] { "TDSPERCENTAGE", "TDS", "TDSPERCENT" }, 16);
                    string status = GetVal(row, new[] { "STATUS" }, 17);

                    string agentName = GetVal(row, new[] { "AGENTCODE", "AGENTNAME", "AGENT" }, 17);
                    string legalName = GetVal(row, new[] { "LEGALNAME" }, 18);
                    string emergencyContactNo = GetVal(row, new[] { "EMERGENCYCONTACTNO" }, 19);
                    string emailID = GetVal(row, new[] { "EMAILID", "EMAIL" }, 20);
                    string eShramCardNo = GetVal(row, new[] { "ESHRAMCARDNO" }, 21);
                    string ayushmanCardNo = GetVal(row, new[] { "AYUSHMANCARDNO" }, 22);
                    string accountHolderName = GetVal(row, new[] { "ACCOUNTHOLDERNAME", "ACCOUNTHOLDER", "HOLDERNAME" }, 23);
                    string permanentPinCode = GetVal(row, new[] { "PERMANENTPINCODE" }, 24);
                    string currentPinCode = GetVal(row, new[] { "CURRENTPINCODE" }, 25);
                    string ayushmanCard = !string.IsNullOrWhiteSpace(ayushmanCardNo) ? "Yes" : "No";

                    // Skip completely empty rows
                    if (string.IsNullOrWhiteSpace(vendorName) && string.IsNullOrWhiteSpace(contactNo) && string.IsNullOrWhiteSpace(accountNo) && string.IsNullOrWhiteSpace(bankName))
                    {
                        continue;
                    }

                    xmlRequest.Rows.Add(new VendorXmlUploadItem
                    {
                        Vendor_Name = vendorName,
                        Vendor_FatherName = fatherName,
                        Vendor_ContactNo = contactNo,
                        Vendor_Gender = gender,
                        Vendor_DOB = dobStr,
                        Vendor_Address = address,
                        Vendor_State = state,
                        Vendor_City = city,
                        Vendor_BankName = bankName,
                        Vendor_AccountNo = accountNo,
                        Vendor_IFSCCode = ifscCode,
                        Vendor_PanNo = panNo,
                        Vendor_AaddharNo = aadhaarNo,
                        Vendor_GSTNo = gstNo,
                        GstPercentage = gstPercentage,
                        TdsPercentage = tdsPercentage,
                        Vendor_Status = status,
                        AgentName = agentName,
                        LegalName = legalName,
                        EmergencyContactNo = emergencyContactNo,
                        EmailID = emailID,
                        EShramCardNo = eShramCardNo,
                        AyushmanCard = ayushmanCard,
                        AyushmanCardNo = ayushmanCardNo,
                        AccountHolderName = accountHolderName,
                        PermanentPinCode = permanentPinCode,
                        CurrentPinCode = currentPinCode
                    });
                }

                if (xmlRequest.Rows.Count == 0)
                {
                    resultList.Add(new VendorUploadRowModel
                    {
                        Status = "Failed",
                        Message = "No valid data rows found in Excel file.",
                        IsSuccess = false
                    });
                    return resultList;
                }

                // 3. Serialize to XML
                string xmlData = XmlUtility.XmlSerializeToString(xmlRequest);
                if (xmlData.StartsWith("<?xml"))
                {
                    int idx = xmlData.IndexOf("?>");
                    if (idx != -1)
                    {
                        xmlData = xmlData.Substring(idx + 2).Trim();
                    }
                }

                // 4. Call Single Stored Procedure
                var p = new DynamicParameters();
                p.Add("@Doc", xmlData, DbType.Xml);
                p.Add("@FileName", savedFileName, DbType.String);
                p.Add("@FilePath", savedFilePath, DbType.String);
                p.Add("@fk_companyId", companyId ?? "", DbType.String);
                p.Add("@fk_userId", userId ?? "", DbType.String);

                var dbResult = DataBaseFactory.QuerySP<VendorUploadRowModel>(
                    "Vendor_upload",
                    p,
                    "Vendor_upload"
                );

                if (dbResult != null && dbResult.Any())
                {
                    resultList = dbResult.ToList();
                }
                else
                {
                    resultList.Add(new VendorUploadRowModel
                    {
                        Status = "Uploaded",
                        Message = "Vendor records processed successfully.",
                        IsSuccess = true
                    });
                }

                // 5. Multi-Tab Excel: Append 'Upload Summary & Status' worksheet in background task
                if (resultList.Any())
                {
                    var resultsForExcel = resultList.ToList();
                    _ = Task.Run(() =>
                    {
                        try
                        {
                            if (File.Exists(savedFilePath))
                            {
                                using (var wb = new XLWorkbook(savedFilePath))
                                {
                                    string summarySheetName = "Upload Summary & Status";
                                    var existingSummary = wb.Worksheets.FirstOrDefault(w => w.Name.Equals(summarySheetName, StringComparison.OrdinalIgnoreCase));
                                    if (existingSummary != null)
                                    {
                                        wb.Worksheets.Delete(existingSummary.Name);
                                    }

                                    var summaryWs = wb.Worksheets.Add(summarySheetName);

                                    int totalRecords = resultsForExcel.Count;
                                    int successCount = resultsForExcel.Count(r => r.IsSuccess || r.Status == "Uploaded" || r.Status == "Success" || r.Status == "Inserted" || r.Status == "Updated");
                                    int failedCount = totalRecords - successCount;

                                    // Top Summary Metrics Header
                                    summaryWs.Cell(1, 1).Value = "Total Records";
                                    summaryWs.Cell(1, 1).Style.Font.Bold = true;
                                    summaryWs.Cell(1, 1).Style.Fill.BackgroundColor = XLColor.FromArgb(13, 110, 253);
                                    summaryWs.Cell(1, 1).Style.Font.FontColor = XLColor.White;
                                    summaryWs.Cell(1, 1).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

                                    summaryWs.Cell(1, 2).Value = "Success / Uploaded";
                                    summaryWs.Cell(1, 2).Style.Font.Bold = true;
                                    summaryWs.Cell(1, 2).Style.Fill.BackgroundColor = XLColor.FromArgb(25, 135, 84);
                                    summaryWs.Cell(1, 2).Style.Font.FontColor = XLColor.White;
                                    summaryWs.Cell(1, 2).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

                                    summaryWs.Cell(1, 3).Value = "Failed / Not Uploaded";
                                    summaryWs.Cell(1, 3).Style.Font.Bold = true;
                                    summaryWs.Cell(1, 3).Style.Fill.BackgroundColor = XLColor.FromArgb(220, 53, 69);
                                    summaryWs.Cell(1, 3).Style.Font.FontColor = XLColor.White;
                                    summaryWs.Cell(1, 3).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

                                    // Top Summary Metrics Values
                                    summaryWs.Cell(2, 1).Value = totalRecords;
                                    summaryWs.Cell(2, 1).Style.Font.Bold = true;
                                    summaryWs.Cell(2, 1).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

                                    summaryWs.Cell(2, 2).Value = successCount;
                                    summaryWs.Cell(2, 2).Style.Font.Bold = true;
                                    summaryWs.Cell(2, 2).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

                                    summaryWs.Cell(2, 3).Value = failedCount;
                                    summaryWs.Cell(2, 3).Style.Font.Bold = true;
                                    summaryWs.Cell(2, 3).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

                                    // Detailed Rows Header
                                    int summaryHeaderRow = 4;
                                    string[] headers = new string[] {
                                   "Sr. No", "Status", "Vendor Name", "Father Name", "Contact No",
                                   "Gender", "DOB", "Address", "State", "City",
                                   "Bank Name", "Account No", "IFSC Code", "PAN No", "Aadhaar No",
                                   "GST No", "GST %", "TDS %", "Agent Code", "Legal Name", "Emergency Contact", "Email ID", "E-Shram Card", "Ayushman Card", "Ayushman Card No", "Account Holder Name", "Permanent Pin", "Current Pin"
                               };
                                    for (int i = 0; i < headers.Length; i++)
                                    {
                                        var cell = summaryWs.Cell(summaryHeaderRow, i + 1);
                                        cell.Value = headers[i];
                                        cell.Style.Font.Bold = true;
                                        cell.Style.Fill.BackgroundColor = XLColor.FromArgb(52, 58, 64);
                                        cell.Style.Font.FontColor = XLColor.White;
                                    }

                                    // Detailed Rows Data
                                    int currRow = 5;
                                    for (int i = 0; i < resultsForExcel.Count; i++)
                                    {
                                        var item = resultsForExcel[i];
                                        bool isRowUploaded = item.IsSuccess || item.Status == "Uploaded" || item.Status == "Updated" || item.Status == "Success" || item.Status == "Inserted";
                                        string rowStatus = isRowUploaded
                                            ? "Uploaded"
                                            : (!string.IsNullOrEmpty(item.Message) ? item.Message : (!string.IsNullOrEmpty(item.Status) ? item.Status : "Failed"));

                                        summaryWs.Cell(currRow, 1).Value = i + 1;
                                        summaryWs.Cell(currRow, 2).Value = rowStatus;
                                        summaryWs.Cell(currRow, 3).Value = item.Vendor_Name ?? "";
                                        summaryWs.Cell(currRow, 4).Value = item.Vendor_FatherName ?? "";
                                        summaryWs.Cell(currRow, 5).Value = item.Vendor_ContactNo ?? "";
                                        summaryWs.Cell(currRow, 6).Value = item.Vendor_Gender ?? "";
                                        summaryWs.Cell(currRow, 7).Value = item.Vendor_DOB ?? "";
                                        summaryWs.Cell(currRow, 8).Value = item.Vendor_Address ?? "";
                                        summaryWs.Cell(currRow, 9).Value = item.Vendor_State ?? "";
                                        summaryWs.Cell(currRow, 10).Value = item.Vendor_City ?? "";
                                        summaryWs.Cell(currRow, 11).Value = item.Vendor_BankName ?? "";
                                        summaryWs.Cell(currRow, 12).Value = item.Vendor_AccountNo ?? "";
                                        summaryWs.Cell(currRow, 13).Value = item.Vendor_IFSCCode ?? "";
                                        summaryWs.Cell(currRow, 14).Value = item.Vendor_PanNo ?? "";
                                        summaryWs.Cell(currRow, 15).Value = item.Vendor_AaddharNo ?? "";
                                        summaryWs.Cell(currRow, 16).Value = item.Vendor_GSTNo ?? "";
                                        summaryWs.Cell(currRow, 17).Value = item.Vendor_GstPercentage ?? "";
                                        summaryWs.Cell(currRow, 18).Value = item.Vendor_TdsPercentage ?? "";
                                        summaryWs.Cell(currRow, 19).Value = item.AgentName ?? "";
                                        summaryWs.Cell(currRow, 20).Value = item.LegalName ?? "";
                                        summaryWs.Cell(currRow, 21).Value = item.EmergencyContactNo ?? "";
                                        summaryWs.Cell(currRow, 22).Value = item.EmailID ?? "";
                                        summaryWs.Cell(currRow, 23).Value = item.EShramCardNo ?? "";
                                        summaryWs.Cell(currRow, 24).Value = item.AyushmanCard ?? "";
                                        summaryWs.Cell(currRow, 25).Value = item.AyushmanCardNo ?? "";
                                        summaryWs.Cell(currRow, 26).Value = item.AccountHolderName ?? "";
                                        summaryWs.Cell(currRow, 27).Value = item.PermanentPinCode ?? "";
                                        summaryWs.Cell(currRow, 28).Value = item.CurrentPinCode ?? "";

                                        if (isRowUploaded)
                                        {
                                            summaryWs.Cell(currRow, 2).Style.Font.FontColor = XLColor.Green;
                                            summaryWs.Cell(currRow, 2).Style.Font.Bold = true;
                                        }
                                        else
                                        {
                                            summaryWs.Cell(currRow, 2).Style.Font.FontColor = XLColor.Red;
                                            summaryWs.Cell(currRow, 2).Style.Font.Bold = true;
                                        }

                                        currRow++;
                                    }

                                    summaryWs.Columns().AdjustToContents();
                                    wb.Save();
                                }
                            }
                        }
                        catch (Exception exWb)
                        {
                            Console.WriteLine("Could not append summary sheet to Excel: " + exWb.Message);
                        }
                    });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error in UploadVendorExcelAsync: " + ex.Message);
                resultList.Add(new VendorUploadRowModel
                {
                    Status = "Failed",
                    Message = "File parsing/database error: " + ex.Message,
                    IsSuccess = false
                });
            }

            return resultList;
        }

        //public async Task<List<VendorUploadRowModel>> UploadVendorExcelAsync(IFormFile file, string? companyId = null, string? userId = null)
        //{
        //    var resultList = new List<VendorUploadRowModel>();
        //    if (file == null || file.Length == 0) return resultList;

        //    try
        //    {
        //        // 1. Physical file saving with timestamped naming convention
        //        string uploadFolder = _configuration?["AppSettings:VendorMasterUploads"]!;
        //        if (string.IsNullOrEmpty(uploadFolder))
        //        {
        //            uploadFolder = Path.Combine(Directory.GetCurrentDirectory(), "VendorMasterUploads");
        //        }
        //        if (!Directory.Exists(uploadFolder)) Directory.CreateDirectory(uploadFolder);

        //        string fileNameWithoutExt = Path.GetFileNameWithoutExtension(file.FileName);
        //        string ext = Path.GetExtension(file.FileName);
        //        string savedFileName = $"{fileNameWithoutExt}_{DateTime.Now:ddMMyy_HHmmss}{ext}";
        //        string savedFilePath = Path.Combine(uploadFolder, savedFileName);

        //        using (var fs = new FileStream(savedFilePath, FileMode.Create))
        //        {
        //            await file.CopyToAsync(fs);
        //        }

        //        // 2. Read Excel rows and build XML Request
        //        using var workbook = new XLWorkbook(savedFilePath);
        //        var worksheet = workbook.Worksheets.FirstOrDefault();
        //        if (worksheet == null) return resultList;

        //        var headerRow = worksheet.Row(1);
        //        var colMap = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
        //        foreach (var cell in headerRow.CellsUsed())
        //        {
        //            string headerText = cell.GetValue<string>().Trim().Replace(" ", "").Replace("_", "");
        //            if (!string.IsNullOrEmpty(headerText) && !colMap.ContainsKey(headerText))
        //            {
        //                colMap[headerText] = cell.Address.ColumnNumber;
        //            }
        //        }

        //        string GetVal(IXLRow r, string key, int fallbackCol)
        //        {
        //            if (colMap.TryGetValue(key, out int colIdx))
        //            {
        //                return r.Cell(colIdx).GetValue<string>().Trim();
        //            }

        //            if (fallbackCol > 0)
        //            {
        //                return r.Cell(fallbackCol).GetValue<string>().Trim();
        //            }

        //            return string.Empty;
        //        }

        //        int lastRowNumber = worksheet.LastRowUsed()?.RowNumber() ?? 0;
        //        var xmlRequest = new VendorXmlUploadRequest();

        //        for (int rowNumber = 2; rowNumber <= lastRowNumber; rowNumber++)
        //        {
        //            var row = worksheet.Row(rowNumber);
        //            string vendorName = GetVal(row, "VENDORNAME", 1);
        //            string fatherName = GetVal(row, "FATHERNAME", 2);
        //            string contactNo = GetVal(row, "CONTACTNO", 3);
        //            string gender = GetVal(row, "GENDER", 4);
        //            string dobStr = GetVal(row, "DOB", 5);
        //            string address = GetVal(row, "ADDRESS", 6);
        //            string state = GetVal(row, "STATE", 7);
        //            string city = GetVal(row, "CITY", 8);
        //            string bankName = GetVal(row, "BANKNAME", 9);
        //            string accountNo = GetVal(row, "ACCOUNTNO", 10);
        //            string ifscCode = GetVal(row, "IFSCCODE", 11);
        //            string panNo = GetVal(row, "PANNO", 12);
        //            string aadhaarNo = GetVal(row, "AADHAARNO", 13);
        //            string gstNo = GetVal(row, "GSTNO", 14);
        //            string gstPercentage = GetVal(row, "GSTPERCENTAGE", 15);
        //            string tdsPercentage = GetVal(row, "TDSPERCENTAGE", 16);
        //            string status = GetVal(row, "STATUS", 17);

        //            string agentName = GetVal(row, "AGENTNAME", 17);
        //            string legalName = GetVal(row, "LEGALNAME", 18);
        //            string emergencyContactNo = GetVal(row, "EMERGENCYCONTACTNO", 19);
        //            string emailID = GetVal(row, "EMAILID", 20);
        //            string eShramCardNo = GetVal(row, "ESHRAMCARDNO", 21);
        //            string ayushmanCardNo = GetVal(row, "AYUSHMANCARDNO", 22);
        //            string accountHolderName = GetVal(row, "ACCOUNTHOLDERNAME", 23);
        //            string permanentPinCode = GetVal(row, "PERMANENTPINCODE", 24);
        //            string currentPinCode = GetVal(row, "CURRENTPINCODE", 25);
        //            string ayushmanCard = !string.IsNullOrWhiteSpace(ayushmanCardNo) ? "Yes" : "No";

        //            // Skip completely empty rows
        //            if (string.IsNullOrWhiteSpace(vendorName) && string.IsNullOrWhiteSpace(contactNo))
        //            {
        //                continue;
        //            }

        //            xmlRequest.Rows.Add(new VendorXmlUploadItem
        //            {
        //                Vendor_Name = vendorName,
        //                Vendor_FatherName = fatherName,
        //                Vendor_ContactNo = contactNo,
        //                Vendor_Gender = gender,
        //                Vendor_DOB = dobStr,
        //                Vendor_Address = address,
        //                Vendor_State = state,
        //                Vendor_City = city,
        //                Vendor_BankName = bankName,
        //                Vendor_AccountNo = accountNo,
        //                Vendor_IFSCCode = ifscCode,
        //                Vendor_PanNo = panNo,
        //                Vendor_AaddharNo = aadhaarNo,
        //                Vendor_GSTNo = gstNo,
        //                GstPercentage = gstPercentage,
        //                TdsPercentage = tdsPercentage,
        //                Vendor_Status = status,
        //                AgentName = agentName,
        //                LegalName = legalName,
        //                EmergencyContactNo = emergencyContactNo,
        //                EmailID = emailID,
        //                EShramCardNo = eShramCardNo,
        //                AyushmanCard = ayushmanCard,
        //                AyushmanCardNo = ayushmanCardNo,
        //                AccountHolderName = accountHolderName,
        //                PermanentPinCode = permanentPinCode,
        //                CurrentPinCode = currentPinCode
        //            });
        //        }

        //        if (xmlRequest.Rows.Count == 0)
        //        {
        //            resultList.Add(new VendorUploadRowModel
        //            {
        //                Status = "Failed",
        //                Message = "No valid data rows found in Excel file.",
        //                IsSuccess = false
        //            });
        //            return resultList;
        //        }

        //        // 3. Serialize to XML
        //        string xmlData = XmlUtility.XmlSerializeToString(xmlRequest);
        //        if (xmlData.StartsWith("<?xml"))
        //        {
        //            int idx = xmlData.IndexOf("?>");
        //            if (idx != -1)
        //            {
        //                xmlData = xmlData.Substring(idx + 2).Trim();
        //            }
        //        }

        //        // 4. Call Single Stored Procedure
        //        var p = new DynamicParameters();
        //        p.Add("@Doc", xmlData, DbType.Xml);
        //        p.Add("@FileName", savedFileName, DbType.String);
        //        p.Add("@FilePath", savedFilePath, DbType.String);
        //        p.Add("@fk_companyId", companyId ?? "", DbType.String);
        //        p.Add("@fk_userId", userId ?? "", DbType.String);

        //        var dbResult = DataBaseFactory.QuerySP<VendorUploadRowModel>(
        //            "Vendor_upload",
        //            p,
        //            "Vendor_upload"
        //        );

        //        if (dbResult != null && dbResult.Any())
        //        {
        //            resultList = dbResult.ToList();
        //        }
        //        else
        //        {
        //            resultList.Add(new VendorUploadRowModel
        //            {
        //                Status = "Uploaded",
        //                Message = "Vendor records processed successfully.",
        //                IsSuccess = true
        //            });
        //        }

        //        // 5. Multi-Tab Excel: Append 'Upload Summary & Status' worksheet in background task
        //        if (resultList.Any())
        //        {
        //            var resultsForExcel = resultList.ToList();
        //            _ = Task.Run(() =>
        //            {
        //                try
        //                {
        //                    if (File.Exists(savedFilePath))
        //                    {
        //                        using (var wb = new XLWorkbook(savedFilePath))
        //                        {
        //                            string summarySheetName = "Upload Summary & Status";
        //                            var existingSummary = wb.Worksheets.FirstOrDefault(w => w.Name.Equals(summarySheetName, StringComparison.OrdinalIgnoreCase));
        //                            if (existingSummary != null)
        //                            {
        //                                wb.Worksheets.Delete(existingSummary.Name);
        //                            }

        //                            var summaryWs = wb.Worksheets.Add(summarySheetName);

        //                            int totalRecords = resultsForExcel.Count;
        //                            int successCount = resultsForExcel.Count(r => r.IsSuccess || r.Status == "Uploaded" || r.Status == "Success" || r.Status == "Inserted" || r.Status == "Updated");
        //                            int failedCount = totalRecords - successCount;

        //                            // Top Summary Metrics Header
        //                            summaryWs.Cell(1, 1).Value = "Total Records";
        //                            summaryWs.Cell(1, 1).Style.Font.Bold = true;
        //                            summaryWs.Cell(1, 1).Style.Fill.BackgroundColor = XLColor.FromArgb(13, 110, 253);
        //                            summaryWs.Cell(1, 1).Style.Font.FontColor = XLColor.White;
        //                            summaryWs.Cell(1, 1).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

        //                            summaryWs.Cell(1, 2).Value = "Success / Uploaded";
        //                            summaryWs.Cell(1, 2).Style.Font.Bold = true;
        //                            summaryWs.Cell(1, 2).Style.Fill.BackgroundColor = XLColor.FromArgb(25, 135, 84);
        //                            summaryWs.Cell(1, 2).Style.Font.FontColor = XLColor.White;
        //                            summaryWs.Cell(1, 2).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

        //                            summaryWs.Cell(1, 3).Value = "Failed / Not Uploaded";
        //                            summaryWs.Cell(1, 3).Style.Font.Bold = true;
        //                            summaryWs.Cell(1, 3).Style.Fill.BackgroundColor = XLColor.FromArgb(220, 53, 69);
        //                            summaryWs.Cell(1, 3).Style.Font.FontColor = XLColor.White;
        //                            summaryWs.Cell(1, 3).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

        //                            // Top Summary Metrics Values
        //                            summaryWs.Cell(2, 1).Value = totalRecords;
        //                            summaryWs.Cell(2, 1).Style.Font.Bold = true;
        //                            summaryWs.Cell(2, 1).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

        //                            summaryWs.Cell(2, 2).Value = successCount;
        //                            summaryWs.Cell(2, 2).Style.Font.Bold = true;
        //                            summaryWs.Cell(2, 2).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

        //                            summaryWs.Cell(2, 3).Value = failedCount;
        //                            summaryWs.Cell(2, 3).Style.Font.Bold = true;
        //                            summaryWs.Cell(2, 3).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

        //                            // Detailed Rows Header
        //                            int summaryHeaderRow = 4;
        //                            string[] headers = new string[] {
        //                           "Sr. No", "Status", "Vendor Name", "Father Name", "Contact No",
        //                           "Gender", "DOB", "Address", "State", "City",
        //                           "Bank Name", "Account No", "IFSC Code", "PAN No", "Aadhaar No",
        //                           "GST No", "GST %", "TDS %", "Agent Name", "Legal Name", "Emergency Contact", "Email ID", "E-Shram Card", "Ayushman Card", "Ayushman Card No", "Account Holder Name", "Permanent Pin", "Current Pin"
        //                       };
        //                            for (int i = 0; i < headers.Length; i++)
        //                            {
        //                                var cell = summaryWs.Cell(summaryHeaderRow, i + 1);
        //                                cell.Value = headers[i];
        //                                cell.Style.Font.Bold = true;
        //                                cell.Style.Fill.BackgroundColor = XLColor.FromArgb(52, 58, 64);
        //                                cell.Style.Font.FontColor = XLColor.White;
        //                            }

        //                            // Detailed Rows Data
        //                            int currRow = 5;
        //                            for (int i = 0; i < resultsForExcel.Count; i++)
        //                            {
        //                                var item = resultsForExcel[i];
        //                                bool isRowUploaded = item.IsSuccess || item.Status == "Uploaded" || item.Status == "Updated" || item.Status == "Success" || item.Status == "Inserted";
        //                                string rowStatus = isRowUploaded
        //                                    ? "Uploaded"
        //                                    : (!string.IsNullOrEmpty(item.Message) ? item.Message : (!string.IsNullOrEmpty(item.Status) ? item.Status : "Failed"));

        //                                summaryWs.Cell(currRow, 1).Value = i + 1;
        //                                summaryWs.Cell(currRow, 2).Value = rowStatus;
        //                                summaryWs.Cell(currRow, 3).Value = item.Vendor_Name ?? "";
        //                                summaryWs.Cell(currRow, 4).Value = item.Vendor_FatherName ?? "";
        //                                summaryWs.Cell(currRow, 5).Value = item.Vendor_ContactNo ?? "";
        //                                summaryWs.Cell(currRow, 6).Value = item.Vendor_Gender ?? "";
        //                                summaryWs.Cell(currRow, 7).Value = item.Vendor_DOB ?? "";
        //                                summaryWs.Cell(currRow, 8).Value = item.Vendor_Address ?? "";
        //                                summaryWs.Cell(currRow, 9).Value = item.Vendor_State ?? "";
        //                                summaryWs.Cell(currRow, 10).Value = item.Vendor_City ?? "";
        //                                summaryWs.Cell(currRow, 11).Value = item.Vendor_BankName ?? "";
        //                                summaryWs.Cell(currRow, 12).Value = item.Vendor_AccountNo ?? "";
        //                                summaryWs.Cell(currRow, 13).Value = item.Vendor_IFSCCode ?? "";
        //                                summaryWs.Cell(currRow, 14).Value = item.Vendor_PanNo ?? "";
        //                                summaryWs.Cell(currRow, 15).Value = item.Vendor_AaddharNo ?? "";
        //                                summaryWs.Cell(currRow, 16).Value = item.Vendor_GSTNo ?? "";
        //                                summaryWs.Cell(currRow, 17).Value = item.Vendor_GstPercentage ?? "";
        //                                summaryWs.Cell(currRow, 18).Value = item.Vendor_TdsPercentage ?? "";
        //                                summaryWs.Cell(currRow, 19).Value = item.AgentName ?? "";
        //                                summaryWs.Cell(currRow, 20).Value = item.LegalName ?? "";
        //                                summaryWs.Cell(currRow, 21).Value = item.EmergencyContactNo ?? "";
        //                                summaryWs.Cell(currRow, 22).Value = item.EmailID ?? "";
        //                                summaryWs.Cell(currRow, 23).Value = item.EShramCardNo ?? "";
        //                                summaryWs.Cell(currRow, 24).Value = item.AyushmanCard ?? "";
        //                                summaryWs.Cell(currRow, 25).Value = item.AyushmanCardNo ?? "";
        //                                summaryWs.Cell(currRow, 26).Value = item.AccountHolderName ?? "";
        //                                summaryWs.Cell(currRow, 27).Value = item.PermanentPinCode ?? "";
        //                                summaryWs.Cell(currRow, 28).Value = item.CurrentPinCode ?? "";

        //                                if (isRowUploaded)
        //                                {
        //                                    summaryWs.Cell(currRow, 2).Style.Font.FontColor = XLColor.Green;
        //                                    summaryWs.Cell(currRow, 2).Style.Font.Bold = true;
        //                                }
        //                                else
        //                                {
        //                                    summaryWs.Cell(currRow, 2).Style.Font.FontColor = XLColor.Red;
        //                                    summaryWs.Cell(currRow, 2).Style.Font.Bold = true;
        //                                }

        //                                currRow++;
        //                            }

        //                            summaryWs.Columns().AdjustToContents();
        //                            wb.Save();
        //                        }
        //                    }
        //                }
        //                catch (Exception exWb)
        //                {
        //                    Console.WriteLine("Could not append summary sheet to Excel: " + exWb.Message);
        //                }
        //            });
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        Console.WriteLine("Error in UploadVendorExcelAsync: " + ex.Message);
        //        resultList.Add(new VendorUploadRowModel
        //        {
        //            Status = "Failed",
        //            Message = "File parsing/database error: " + ex.Message,
        //            IsSuccess = false
        //        });
        //    }

        //    return resultList;
        //}



        public async Task<IEnumerable<dynamic>> GetVendorAuditLogsAsync(string pk_recId)
        {
            try
            {
                DynamicParameters dynamicParameters = new DynamicParameters();
                dynamicParameters.Add("@pk_recId", pk_recId, DbType.String);

                return DataBaseFactory.QuerySP<dynamic>("Vendor_GetAuditLogById", dynamicParameters, "Vendor_GetAuditLogById").ToList();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error in GetVendorAuditLogsAsync: " + ex.Message);
                return Enumerable.Empty<dynamic>();
            }
        }

        public async Task<dynamic> GetVendorDashboardSummaryAsync(string companyId, string monthId, string yearId)
        {
            try
            {
                DynamicParameters dynamicParameters = new DynamicParameters();
                dynamicParameters.Add("@fk_companyId", companyId ?? "", DbType.String);
                dynamicParameters.Add("@monthId", monthId ?? "", DbType.String);
                dynamicParameters.Add("@yearId", yearId ?? "", DbType.String);

                var result = DataBaseFactory.QuerySP<dynamic>("LSP_VendorDashboard_GetSummary", dynamicParameters, "VendorDashboard_GetSummary");
                return result?.FirstOrDefault();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error in GetVendorDashboardSummaryAsync: " + ex.Message);
                return null;
            }
        }

        public async Task<VendorResponseModel> SaveVendorExcelUploadAsync(VendorExcelUploadSaveRequest request, string originalFileName, string savedFileName, string savedFilePath, long fileSize, string? companyId, string? userId)
        {
            try
            {
                DynamicParameters p = new DynamicParameters();
                p.Add("@fk_clientId", request.fk_clientId, DbType.Int64);
                p.Add("@clientName", request.clientName ?? "", DbType.String);
                p.Add("@modelId", request.modelId ?? "", DbType.String);
                p.Add("@modelName", request.modelName ?? "", DbType.String);
                p.Add("@fromDate", string.IsNullOrEmpty(request.fromDate) ? null : request.fromDate, DbType.Date);
                p.Add("@toDate", string.IsNullOrEmpty(request.toDate) ? null : request.toDate, DbType.Date);
                p.Add("@originalFileName", originalFileName ?? "", DbType.String);
                p.Add("@savedFileName", savedFileName ?? "", DbType.String);
                p.Add("@savedFilePath", savedFilePath ?? "", DbType.String);
                p.Add("@fileSize", fileSize, DbType.Int64);
                p.Add("@fk_companyId", companyId ?? "", DbType.String);
                p.Add("@fk_userId", userId ?? "", DbType.String);

                var result = DataBaseFactory.QuerySP<VendorResponseModel>("sp_VendorExcelUpload_Save", p, "sp_VendorExcelUpload_Save").FirstOrDefault();
                return result ?? new VendorResponseModel { IsSuccessfully = false, IsMessage = "Failed to save file upload details." };
            }
            catch (Exception ex)
            {
                return new VendorResponseModel { IsSuccessfully = false, IsMessage = ex.Message };
            }
        }

        public async Task<(int totalCount, IEnumerable<VendorExcelUploadFileModel> list)> GetVendorExcelUploadListAsync(string? companyId, string? searchTerm, int pageIndex = 1, int pageSize = 10)
        {
            try
            {
                DynamicParameters p = new DynamicParameters();
                p.Add("@fk_companyId", companyId ?? "", DbType.String);
                p.Add("@searchTerm", searchTerm ?? "", DbType.String);
                p.Add("@pageIndex", pageIndex, DbType.Int32);
                p.Add("@pageSize", pageSize, DbType.Int32);

                var list = DataBaseFactory.QuerySP<VendorExcelUploadFileModel>("Vendor_Upload_GetFileList", p, "Vendor_Upload_GetFileList")?.ToList() ?? new List<VendorExcelUploadFileModel>();
                int totalCount = list.FirstOrDefault()?.TotalCount ?? list.Count;
                return (totalCount, list);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error in Vendor_Upload_GetFileList, trying fallback: " + ex.Message);
                try
                {
                    DynamicParameters pFallback = new DynamicParameters();
                    pFallback.Add("@fk_companyId", companyId ?? "", DbType.String);
                    pFallback.Add("@searchTerm", searchTerm ?? "", DbType.String);
                    pFallback.Add("@pageIndex", pageIndex, DbType.Int32);
                    pFallback.Add("@pageSize", pageSize, DbType.Int32);

                    var allList = DataBaseFactory.QuerySP<VendorExcelUploadFileModel>("sp_VendorExcelUpload_GetAll", pFallback, "sp_VendorExcelUpload_GetAll")?.ToList() ?? new List<VendorExcelUploadFileModel>();
                    int totalCount = allList.FirstOrDefault()?.TotalCount ?? allList.Count;
                    return (totalCount, allList);
                }
                catch (Exception ex2)
                {
                    Console.WriteLine("Error in GetVendorExcelUploadListAsync: " + ex2.Message);
                    return (0, Enumerable.Empty<VendorExcelUploadFileModel>());
                }
            }
        }

        public async Task<VendorExcelUploadFileModel?> GetVendorExcelUploadByIdAsync(long id)
        {
            try
            {
                DynamicParameters p = new DynamicParameters();
                p.Add("@File_Id", (int)id, DbType.Int32);

                var result = DataBaseFactory.QuerySP<VendorExcelUploadFileModel>("Vendor_Upload_GetFileById", p, "Vendor_Upload_GetFileById")?.FirstOrDefault();
                if (result == null)
                {
                    DynamicParameters p2 = new DynamicParameters();
                    p2.Add("@pk_id", id, DbType.Int64);
                    result = DataBaseFactory.QuerySP<VendorExcelUploadFileModel>("sp_VendorExcelUpload_GetById", p2, "sp_VendorExcelUpload_GetById")?.FirstOrDefault();
                }
                return result;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error in GetVendorExcelUploadByIdAsync: " + ex.Message);
                return null;
            }
        }
        public async Task<IEnumerable<VendorRateCardAuditItemModel>> GetVendorRateCardAuditHistoryAsync(string pk_recId)
        {
            try
            {
                DynamicParameters dynamicParameters = new DynamicParameters();
                dynamicParameters.Add("@fk_recId", pk_recId ?? "", DbType.String);

                var list = DataBaseFactory.QuerySP<VendorRateCardAuditItemModel>("LSP_VendorRateCard_GetAuditByVendorId", dynamicParameters, "LSP_VendorRateCard_GetAuditByVendorId");
                return list ?? Enumerable.Empty<VendorRateCardAuditItemModel>();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error in GetVendorRateCardAuditHistoryAsync: " + ex.Message);
                return Enumerable.Empty<VendorRateCardAuditItemModel>();
            }
        }
        public async Task<IEnumerable<VendorRateCardAuditItemModel>> GetVendorRateCardsAsync(string pk_recId)
        {
            try
            {
                DynamicParameters dynamicParameters = new DynamicParameters();
                dynamicParameters.Add("@fk_recId", pk_recId ?? "", DbType.String);

                var list = DataBaseFactory.QuerySP<VendorRateCardAuditItemModel>("LSP_VendorRateCard_GetByVendorId", dynamicParameters, "LSP_VendorRateCard_GetByVendorId");
                return list ?? Enumerable.Empty<VendorRateCardAuditItemModel>();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error in GetVendorRateCardsAsync: " + ex.Message);
                return Enumerable.Empty<VendorRateCardAuditItemModel>();
            }
        }


        public async Task<IEnumerable<AuditLogDocumentNameItem>> GetAuditLogDocumentNamesAsync(string companyId)
        {
            try
            {
                var parameters = new DynamicParameters();
                parameters.Add("@fk_companyId", companyId);
                var list = DataBaseFactory.QuerySP<AuditLogDocumentNameItem>(
                    "Usp_UpdateAuditLog_GetDocumentNameList",
                    parameters,
                    "Usp_UpdateAuditLog_GetDocumentNameList"
                );
                return list ?? Enumerable.Empty<AuditLogDocumentNameItem>();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error in GetAuditLogDocumentNamesAsync: " + ex.Message);
                return Enumerable.Empty<AuditLogDocumentNameItem>();
            }
        }

        public async Task<IEnumerable<AuditLogItemModel>> GetAuditLogsAsync(AuditLogFilterRequest filter,string companyId)
        {
            try
            {
                              

                string xmlData = XmlUtility.XmlSerializeToString(filter);
                DynamicParameters dynamicParameters = new DynamicParameters();
                dynamicParameters.Add("@xmlDoc", xmlData, DbType.Xml);
                dynamicParameters.Add("@fk_companyId", companyId);


                var list = DataBaseFactory.QuerySP<AuditLogItemModel>(
                    "Usp_UpdateAuditLog_GetAll",
                    dynamicParameters,
                    "Usp_UpdateAuditLog_GetAll"
                );
                return list ?? Enumerable.Empty<AuditLogItemModel>();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error in GetAuditLogsAsync: " + ex.Message);
                return Enumerable.Empty<AuditLogItemModel>();
            }
        }


        public async Task<IEnumerable<dynamic>> UploadTransactionsAsync(string clientId, string modelId, DateTime fromDate, DateTime toDate, string xmlData, string fileName, string userId, string companyId)
        {
            var p = new DynamicParameters();

            p.Add("@ClientID", clientId, DbType.String);
            p.Add("@ModelID", modelId, DbType.String);
            p.Add("@FromDate", fromDate, DbType.Date);
            p.Add("@ToDate", toDate, DbType.Date);
            p.Add("@UploadXML", xmlData, DbType.Xml);
            p.Add("@FileName", fileName ?? "", DbType.String);
            p.Add("@UserId", userId ?? "", DbType.String);
            p.Add("@CompanyId", companyId ?? "", DbType.String);

            var dbResult = DataBaseFactory.QuerySP<dynamic>(
                "USP_ProcessVendorTransactions_Upload", p, "USP_ProcessVendorTransactions_Upload");

            return dbResult ?? Enumerable.Empty<dynamic>();
        }

        //added code 31 Aug 2026 starts

        public async Task<List<VendorFHRIDMappingRow>> UploadVendorFHRIDMappingExcelAsync(IFormFile file, string? companyId = null, string? userId = null)
        {
            var resultList = new List<VendorFHRIDMappingRow>();
            if (file == null || file.Length == 0) return resultList;

            try
            {
                // 1. Physical file saving with filename_date_time naming convention
                string uploadFolder = _configuration?["AppSettings:VendorFHRIDUploads"];
                if (string.IsNullOrEmpty(uploadFolder))
                {
                    uploadFolder = "C:/Candidate/VendorFHRIDUploads";
                }

                if (!Directory.Exists(uploadFolder))
                {
                    Directory.CreateDirectory(uploadFolder);
                }

                string origFileName = Path.GetFileName(file.FileName);
                string fileNameWithoutExt = Path.GetFileNameWithoutExtension(origFileName);
                string ext = Path.GetExtension(origFileName);
                string timestampedFileName = $"{fileNameWithoutExt}_{DateTime.Now:ddMMyyyy_HHmmss}{ext}";
                string physicalPath = Path.Combine(uploadFolder, timestampedFileName);

                using (var fileStream = new FileStream(physicalPath, FileMode.Create))
                {
                    await file.CopyToAsync(fileStream);
                }

                // 2. Read Excel contents and construct XML request
                using var stream = file.OpenReadStream();
                using var workbook = new XLWorkbook(stream);
                var worksheet = workbook.Worksheets.FirstOrDefault();
                if (worksheet == null) return resultList;

                var headerRow = worksheet.Row(1);
                var colMap = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
                foreach (var cell in headerRow.CellsUsed())
                {
                    string headerText = cell.GetValue<string>().Trim().Replace(" ", "").Replace("_", "");
                    if (!string.IsNullOrEmpty(headerText) && !colMap.ContainsKey(headerText))
                    {
                        colMap[headerText] = cell.Address.ColumnNumber;
                    }
                }

                // Check mandatory 4 columns
                bool hasVendor = colMap.ContainsKey("VENDORCODE") || colMap.ContainsKey("CODE") || colMap.ContainsKey("PKRECID") || colMap.ContainsKey("VENDOR");
                bool hasClient = colMap.ContainsKey("CLIENT") || colMap.ContainsKey("CLIENTID") || colMap.ContainsKey("FKCLIENTID") || colMap.ContainsKey("VENDORFKCLIENTID") || colMap.ContainsKey("COSTCENTRE");
                bool hasModel = colMap.ContainsKey("MODEL") || colMap.ContainsKey("MODELID") || colMap.ContainsKey("FKMODELID") || colMap.ContainsKey("VENDORFKMODELID");
                bool hasFhr = colMap.ContainsKey("FHRID") || colMap.ContainsKey("VENDORFHRID") || colMap.ContainsKey("VENDORHFRID") || colMap.ContainsKey("HFRID");

                if (!hasVendor || !hasClient || !hasModel || !hasFhr)
                {
                    var missing = new List<string>();
                    if (!hasVendor) missing.Add("Vendor Code");
                    if (!hasClient) missing.Add("Client");
                    if (!hasModel) missing.Add("Model");
                    if (!hasFhr) missing.Add("FHR ID");

                    resultList.Add(new VendorFHRIDMappingRow
                    {
                        Status = "Failed",
                        Message = $"Invalid Excel Template. Missing required column(s): {string.Join(", ", missing)}"
                    });
                    return resultList;
                }

                string GetVal(IXLRow r, string[] keys, int fallbackCol)
                {
                    try
                    {
                        foreach (var k in keys)
                        {
                            if (colMap.TryGetValue(k, out int colIdx))
                            {
                                var cell = r.Cell(colIdx);
                                if (cell == null || cell.IsEmpty()) continue;
                                string val = cell.GetFormattedString()?.Trim() ?? cell.Value.ToString().Trim();
                                if (!string.IsNullOrEmpty(val)) return val;
                            }
                        }
                        if (fallbackCol > 0)
                        {
                            var cell = r.Cell(fallbackCol);
                            if (cell != null && !cell.IsEmpty())
                            {
                                return cell.GetFormattedString()?.Trim() ?? cell.Value.ToString().Trim();
                            }
                        }
                    }
                    catch
                    {
                        // fallback
                    }
                    return string.Empty;
                }

                int lastRowNumber = worksheet.LastRowUsed()?.RowNumber() ?? 0;
                var xmlRequest = new VendorFHRIDMappingXmlRequest();

                for (int rowNumber = 2; rowNumber <= lastRowNumber; rowNumber++)
                {
                    var row = worksheet.Row(rowNumber);
                    string vendorCode = GetVal(row, new[] { "VENDORCODE", "CODE", "PKRECID", "VENDOR" }, 1);
                    string client = GetVal(row, new[] { "CLIENT", "CLIENTID", "FKCLIENTID", "VENDORFKCLIENTID", "COSTCENTRE" }, 2);
                    string model = GetVal(row, new[] { "MODEL", "MODELID", "FKMODELID", "VENDORFKMODELID" }, 3);
                    string fhrId = GetVal(row, new[] { "FHRID", "VENDORFHRID", "VENDORHFRID", "HFRID" }, 4);

                    // Skip completely empty rows
                    if (string.IsNullOrWhiteSpace(vendorCode) && string.IsNullOrWhiteSpace(client) && string.IsNullOrWhiteSpace(model) && string.IsNullOrWhiteSpace(fhrId))
                    {
                        continue;
                    }

                    xmlRequest.Rows.Add(new VendorFHRIDMappingXmlItem
                    {
                        VendorCode = vendorCode,
                        Client = client,
                        Model = model,
                        FHRID = fhrId
                    });
                }

                if (xmlRequest.Rows.Count == 0)
                {
                    resultList.Add(new VendorFHRIDMappingRow
                    {
                        Status = "Failed",
                        Message = "No valid data rows found in Excel file."
                    });
                    return resultList;
                }

                // 3. Serialize to XML
                string xmlData = XmlUtility.XmlSerializeToString(xmlRequest);
                if (xmlData.StartsWith("<?xml"))
                {
                    int idx = xmlData.IndexOf("?>");
                    if (idx != -1)
                    {
                        xmlData = xmlData.Substring(idx + 2).Trim();
                    }
                }

                // 4. Call Stored Procedure
                var p = new DynamicParameters();
                p.Add("@Doc", xmlData, DbType.Xml);
                p.Add("@FileName", timestampedFileName, DbType.String);
                p.Add("@FilePath", physicalPath, DbType.String);
                p.Add("@fk_companyId", companyId ?? "", DbType.String);
                p.Add("@fk_userId", userId ?? "", DbType.String);

                var dbResult = DataBaseFactory.QuerySP<VendorFHRIDMappingRow>(
                    "USP_Vendor_UploadFHRIDMapping",
                    p,
                    "USP_Vendor_UploadFHRIDMapping"
                );

                if (dbResult != null && dbResult.Any())
                {
                    resultList = dbResult.ToList();
                }
                else
                {
                    resultList.Add(new VendorFHRIDMappingRow
                    {
                        Status = "Uploaded",
                        Message = "Vendor FHR ID mapping records processed successfully."
                    });
                }

                // 5. Multi-Tab Excel: Background Task so that 8,000+ rows return instantly to the UI
                var resultsForExcel = resultList.ToList();
                _ = Task.Run(() =>
                {
                    try
                    {
                        using (var wb = new XLWorkbook(physicalPath))
                        {
                            string summarySheetName = "Upload Summary & Status";
                            var existingSummary = wb.Worksheets.FirstOrDefault(w => w.Name.Equals(summarySheetName, StringComparison.OrdinalIgnoreCase));
                            if (existingSummary != null)
                            {
                                wb.Worksheets.Delete(existingSummary.Name);
                            }

                            var summaryWs = wb.Worksheets.Add(summarySheetName);

                            int totalCount = resultsForExcel.Count;
                            int successCount = resultsForExcel.Count(r => r.Status == "Inserted" || r.Status == "Updated" || r.Status == "Already Exists" || r.Status == "Uploaded" || r.Status == "Success");
                            int failedCount = resultsForExcel.Count(r => r.Status == "Failed");

                            // Top Summary Metrics
                            summaryWs.Cell(1, 1).Value = "Total Records";
                            summaryWs.Cell(1, 1).Style.Font.Bold = true;
                            summaryWs.Cell(1, 1).Style.Fill.BackgroundColor = XLColor.FromArgb(13, 110, 253);
                            summaryWs.Cell(1, 1).Style.Font.FontColor = XLColor.White;
                            summaryWs.Cell(1, 1).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

                            summaryWs.Cell(1, 2).Value = "Success / Uploaded";
                            summaryWs.Cell(1, 2).Style.Font.Bold = true;
                            summaryWs.Cell(1, 2).Style.Fill.BackgroundColor = XLColor.FromArgb(25, 135, 84);
                            summaryWs.Cell(1, 2).Style.Font.FontColor = XLColor.White;
                            summaryWs.Cell(1, 2).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

                            summaryWs.Cell(1, 3).Value = "Failed / Not Uploaded";
                            summaryWs.Cell(1, 3).Style.Font.Bold = true;
                            summaryWs.Cell(1, 3).Style.Fill.BackgroundColor = XLColor.FromArgb(220, 53, 69);
                            summaryWs.Cell(1, 3).Style.Font.FontColor = XLColor.White;
                            summaryWs.Cell(1, 3).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

                            summaryWs.Cell(2, 1).Value = totalCount;
                            summaryWs.Cell(2, 1).Style.Font.Bold = true;
                            summaryWs.Cell(2, 1).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

                            summaryWs.Cell(2, 2).Value = successCount;
                            summaryWs.Cell(2, 2).Style.Font.Bold = true;
                            summaryWs.Cell(2, 2).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

                            summaryWs.Cell(2, 3).Value = failedCount;
                            summaryWs.Cell(2, 3).Style.Font.Bold = true;
                            summaryWs.Cell(2, 3).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

                            // Tab 2 Detailed Header (Sr. No + Status / Remarks + All original Tab 1 columns)
                            var sourceWs = wb.Worksheets.FirstOrDefault(w => !w.Name.Equals("Upload Summary & Status", StringComparison.OrdinalIgnoreCase))
                                           ?? wb.Worksheet(1);

                            int summaryHeaderRow = 4;
                            summaryWs.Cell(summaryHeaderRow, 1).Value = "Sr. No";
                            summaryWs.Cell(summaryHeaderRow, 1).Style.Font.Bold = true;
                            summaryWs.Cell(summaryHeaderRow, 1).Style.Fill.BackgroundColor = XLColor.FromArgb(52, 58, 64);
                            summaryWs.Cell(summaryHeaderRow, 1).Style.Font.FontColor = XLColor.White;

                            summaryWs.Cell(summaryHeaderRow, 2).Value = "Status / Remarks";
                            summaryWs.Cell(summaryHeaderRow, 2).Style.Font.Bold = true;
                            summaryWs.Cell(summaryHeaderRow, 2).Style.Fill.BackgroundColor = XLColor.FromArgb(52, 58, 64);
                            summaryWs.Cell(summaryHeaderRow, 2).Style.Font.FontColor = XLColor.White;

                            var firstRow = sourceWs.FirstRowUsed();
                            int sourceColCount = firstRow != null ? firstRow.LastCellUsed()?.Address.ColumnNumber ?? 0 : 0;
                            if (sourceColCount == 0 && sourceWs.LastColumnUsed() != null)
                            {
                                sourceColCount = sourceWs.LastColumnUsed().ColumnNumber();
                            }

                            for (int col = 1; col <= sourceColCount; col++)
                            {
                                var cell = summaryWs.Cell(summaryHeaderRow, col + 2);
                                cell.Value = sourceWs.Cell(1, col).Value;
                                cell.Style.Font.Bold = true;
                                cell.Style.Fill.BackgroundColor = XLColor.FromArgb(52, 58, 64);
                                cell.Style.Font.FontColor = XLColor.White;
                            }

                            // Detailed Rows Data
                            int sourceLastRow = sourceWs.LastRowUsed()?.RowNumber() ?? 1;
                            int currRow = 5;

                            for (int r = 2; r <= sourceLastRow; r++)
                            {
                                int dataIdx = r - 2;
                                summaryWs.Cell(currRow, 1).Value = dataIdx + 1;

                                if (dataIdx < resultsForExcel.Count)
                                {
                                    var item = resultsForExcel[dataIdx];
                                    string statusDisplay = "Uploaded";
                                    if (item.Status == "Failed" || item.Status == "Error")
                                    {
                                        statusDisplay = $"Failed - {(string.IsNullOrEmpty(item.Message) ? "Validation error" : item.Message)}";
                                        summaryWs.Cell(currRow, 2).Value = statusDisplay;
                                        summaryWs.Cell(currRow, 2).Style.Font.FontColor = XLColor.Red;
                                        summaryWs.Cell(currRow, 2).Style.Font.Bold = true;
                                    }
                                    else if (item.Status == "Already Exists" || item.Status == "Skipped")
                                    {
                                        statusDisplay = "Already Exists";
                                        summaryWs.Cell(currRow, 2).Value = statusDisplay;
                                        summaryWs.Cell(currRow, 2).Style.Font.FontColor = XLColor.FromArgb(217, 119, 6);
                                        summaryWs.Cell(currRow, 2).Style.Font.Bold = true;
                                    }
                                    else
                                    {
                                        statusDisplay = "Uploaded";
                                        summaryWs.Cell(currRow, 2).Value = statusDisplay;
                                        summaryWs.Cell(currRow, 2).Style.Font.FontColor = XLColor.Green;
                                        summaryWs.Cell(currRow, 2).Style.Font.Bold = true;
                                    }
                                }
                                else
                                {
                                    summaryWs.Cell(currRow, 2).Value = "Uploaded";
                                    summaryWs.Cell(currRow, 2).Style.Font.FontColor = XLColor.Green;
                                    summaryWs.Cell(currRow, 2).Style.Font.Bold = true;
                                }

                                for (int col = 1; col <= sourceColCount; col++)
                                {
                                    summaryWs.Cell(currRow, col + 2).Value = sourceWs.Cell(r, col).Value;
                                }

                                currRow++;
                            }

                            summaryWs.Columns().AdjustToContents();
                            wb.Save();
                        }
                    }
                    catch (Exception exWb)
                    {
                        Console.WriteLine("Could not append summary sheet to Excel: " + exWb.Message);
                    }
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error in UploadVendorFHRIDMappingExcelAsync: " + ex.Message);
                resultList.Add(new VendorFHRIDMappingRow
                {
                    Status = "Failed",
                    Message = "File parsing/database error: " + ex.Message
                });
            }

            return resultList;
        }

        public async Task<IEnumerable<VendorFHRIDFileModel>> GetVendorFHRIDFilesAsync(string? companyId)
        {
            try
            {
                var p = new DynamicParameters();
                p.Add("@fk_companyId", companyId ?? "", DbType.String);

                var files = DataBaseFactory.QuerySP<VendorFHRIDFileModel>(
                    "USP_Vendor_GetFHRIDUploadedFiles",
                    p,
                    "USP_Vendor_GetFHRIDUploadedFiles"
                );

                return files ?? Enumerable.Empty<VendorFHRIDFileModel>();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error in GetVendorFHRIDFilesAsync: " + ex.Message);
                return Enumerable.Empty<VendorFHRIDFileModel>();
            }
        }

        public async Task<VendorFHRIDFileModel?> GetVendorFHRIDFileByIdAsync(int id)
        {
            try
            {
                var p = new DynamicParameters();
                p.Add("@File_Id", id, DbType.Int32);
                p.Add("@Id", id, DbType.Int32);

                var files = DataBaseFactory.QuerySP<VendorFHRIDFileModel>(
                    "USP_Vendor_GetFHRIDFileById",
                    p,
                    "USP_Vendor_GetFHRIDFileById"
                );

                return files?.FirstOrDefault();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error in GetVendorFHRIDFileByIdAsync: " + ex.Message);
                return null;
            }
        }

        public async Task<IEnumerable<VendorRateCardFileModel>> GetRateCardUploadedFilesAsync(string? companyId)
        {
            try
            {
                var p = new DynamicParameters();
                p.Add("@fk_companyId", companyId ?? "", DbType.String);

                var files = DataBaseFactory.QuerySP<VendorRateCardFileModel>(
                    "USP_Vendor_GetRateCardUploadedFiles",
                    p,
                    "USP_Vendor_GetRateCardUploadedFiles"
                );

                return files ?? Enumerable.Empty<VendorRateCardFileModel>();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error in GetRateCardUploadedFilesAsync: " + ex.Message);
                return Enumerable.Empty<VendorRateCardFileModel>();
            }
        }

        public async Task<VendorRateCardFileModel?> GetRateCardFileByIdAsync(int id)
        {
            try
            {
                var p = new DynamicParameters();
                p.Add("@File_Id", id, DbType.Int32);
                p.Add("@Id", id, DbType.Int32);

                var files = DataBaseFactory.QuerySP<VendorRateCardFileModel>(
                    "USP_Vendor_GetRateCardFileById",
                    p,
                    "USP_Vendor_GetRateCardFileById"
                );

                return files?.FirstOrDefault();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error in GetRateCardFileByIdAsync: " + ex.Message);
                return null;
            }
        }
        public async Task<dynamic> GetTransactionFileByIdAsync(int id)
        {
            try
            {
                var p = new DynamicParameters();
                p.Add("@File_Id", id, DbType.Int32);

                var result = DataBaseFactory.QuerySP<dynamic>("USP_Vendor_GetTransactionFileById", p, "USP_Vendor_GetTransactionFileById");
                return result?.FirstOrDefault();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error in GetTransactionFileByIdAsync: " + ex.Message);
                return null;
            }
        }

        public async Task<IEnumerable<dynamic>> GetTransactionUploadedFilesAsync(string companyId)
        {
            try
            {
                var p = new DynamicParameters();
                p.Add("@fk_companyId", companyId ?? "", DbType.String);

                var files = DataBaseFactory.QuerySP<dynamic>(
                    "USP_Vendor_GetTransactionUploadedFiles",
                    p,
                    "USP_Vendor_GetTransactionUploadedFiles"
                );

                return files ?? Enumerable.Empty<dynamic>();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error in GetTransactionUploadedFilesAsync: " + ex.Message);
                return Enumerable.Empty<dynamic>();
            }
        }
        //added code 31 Aug 2026 ends
        public async Task<IEnumerable<dynamic>> GetVendorTransactionRangesAsync(int clientId, int modelId)
        {
            var parameters = new DynamicParameters();
            parameters.Add("@ClientID", clientId);
            parameters.Add("@ModelID", modelId);
            return await DataBaseFactory.QuerySPAsync<dynamic>("USP_GetVendorTransactionRanges", parameters, "Vendor - GetVendorTransactionRanges");
        }

        public async Task<IEnumerable<dynamic>> GetTransactionTemplateDataAsync(int clientId, int modelId)
        {
            var parameters = new DynamicParameters();
            parameters.Add("@ClientID", clientId);
            parameters.Add("@ModelID", modelId);
            return await DataBaseFactory.QuerySPAsync<dynamic>("USP_GetVendorTransactionTemplateData", parameters, "Vendor - GetTransactionTemplateData");
        }
        public async Task<IEnumerable<dynamic>> SearchVendorsAsync(string searchTerm)
        {
            var parameters = new DynamicParameters();
            parameters.Add("@SearchTerm", searchTerm);
            return await DataBaseFactory.QuerySPAsync<dynamic>("USP_SearchVendors", parameters, "Vendor - SearchVendors");
        }

        public async Task<(int totalCount, IEnumerable<dynamic> transactions)> GetVendorPaymentTransactionsListAsync(int clientId, int modelId, string? locationId, string? transactionRange, string? vendorCode, string? searchTerm, int pageIndex, int pageSize)
        {
            var parameters = new DynamicParameters();
            parameters.Add("@ClientID", clientId);
            parameters.Add("@ModelID", modelId);
            parameters.Add("@LocationID", locationId);
            parameters.Add("@TransactionRange", transactionRange);
            parameters.Add("@VendorCode", vendorCode);
            parameters.Add("@SearchTerm", searchTerm);
            parameters.Add("@PageIndex", pageIndex);
            parameters.Add("@PageSize", pageSize);

            var transactions = await DataBaseFactory.QuerySPAsync<dynamic>("USP_GetVendorPaymentTransactions_List", parameters, "Vendor - GetVendorPaymentTransactions_List");
            int totalCount = transactions.FirstOrDefault()?.TotalRecords ?? 0;
            return (totalCount, transactions);
        }

        public async Task<dynamic> GetVendorFHRIDMappingStatsAsync(string companyId)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@fk_companyId", companyId);

                var result = await DataBaseFactory.QuerySPAsync<dynamic>(
                    "Vendor_GetFHRIDMappingStats",
                    param,
                    "VendorRateCard - GetFHRIDMappingStats"
                );

                var stats = result?.FirstOrDefault();

                if (stats == null)
                {
                    return new
                    {
                        Vendor_TotalCount = 0,
                        Vendor_MappedFHRID = 0,
                        Vendor_UnmappedFHRID = 0
                    };
                }

                return stats;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error in GetVendorFHRIDMappingStatsAsync: " + ex.Message);
                return new
                {
                    Vendor_TotalCount = 0,
                    Vendor_MappedFHRID = 0,
                    Vendor_UnmappedFHRID = 0
                };
            }
        }

        public async Task<IEnumerable<VendorListModel>> GetVendorMappedUnmappedListAsync(string companyId, bool isMapped)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@fk_companyId", companyId);
                param.Add("@IsMapped", isMapped ? 1 : 0);

                var list = await DataBaseFactory.QuerySPAsync<VendorListModel>(
                    "Vendor_GetFHRIDMappedUnmappedList",
                    param,
                    "VendorRateCard - GetVendorMappedUnmappedList"
                );
                return list ?? Enumerable.Empty<VendorListModel>();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error in GetVendorMappedUnmappedListAsync: " + ex.Message);
                return Enumerable.Empty<VendorListModel>();
            }
        }

        public async Task<IEnumerable<NameValue>> GetVendorAgentDropdownAsync(string companyId)
        {
            try
            {
                DynamicParameters dynamicParameters = new DynamicParameters();
                dynamicParameters.Add("@fk_companyId", companyId, DbType.String);

                var list = DataBaseFactory.QuerySP<NameValue>("Vendor_GetAgentDropdown", dynamicParameters, "Vendor_GetAgentDropdown");
                return list ?? new List<NameValue>();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error in GetVendorAgentDropdownAsync: " + ex.Message);
                return new List<NameValue>();
            }
        }
        public async Task<dynamic> UpdateVendorStatusAsync(string pkRecId, int statusId, string? approvedByName = null, string? approvedBySignature = null, string? approverRemarks = null)
        {
            try
            {
                var dynamicParameters = new DynamicParameters();
                dynamicParameters.Add("@pk_recId", pkRecId);
                dynamicParameters.Add("@OnboardFormStatusId", statusId);
                dynamicParameters.Add("@ApprovedByName", approvedByName);
                dynamicParameters.Add("@ApprovedBySignature", approvedBySignature);
                dynamicParameters.Add("@ApproverRemarks", approverRemarks);


                var result = DataBaseFactory.QuerySP<dynamic>("Vendor_UpdateStatus", dynamicParameters, "Vendor_UpdateStatus");
                return result;
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        public async Task<IEnumerable<dynamic>> GetVendorTemplateConfigAsync(int clientId, int modelId)
        {
            var p = new DynamicParameters();
            p.Add("@ClientID", clientId, DbType.Int32);
            p.Add("@ModelID", modelId, DbType.Int32);
            var result = DataBaseFactory.QuerySP<dynamic>("USP_GetVendorTemplateConfig", p, "USP_GetVendorTemplateConfig");
            return await Task.FromResult(result ?? Enumerable.Empty<dynamic>());
        }

        public async Task<string> GetClientNameAsync(int clientId)
        {
            var p = new DynamicParameters();
            p.Add("@ClientID", clientId, DbType.Int32);
            var result = DataBaseFactory.QuerySP<dynamic>("USP_GetClientName", p, "USP_GetClientName")?.FirstOrDefault();
            if (result != null && ((IDictionary<string, object>)result).ContainsKey("ClientName"))
            {
                return Convert.ToString(((IDictionary<string, object>)result)["ClientName"]) ?? "";
            }
            return "";
        }

        public async Task<string> GetModelNameAsync(int modelId)
        {
            var p = new DynamicParameters();
            p.Add("@ModelID", modelId, DbType.Int32);
            var result = DataBaseFactory.QuerySP<dynamic>("USP_GetModelName", p, "USP_GetModelName")?.FirstOrDefault();
            if (result != null && ((IDictionary<string, object>)result).ContainsKey("Name"))
            {
                return Convert.ToString(((IDictionary<string, object>)result)["Name"]) ?? "";
            }
            return "";
        }

        public async Task<(int totalCount, IEnumerable<VendorVerificationListModel> vendors)> DownloadVendorVerificationListAsync(int pageIndex, int pageSize, string companyId, string userId, string searchTerm, string locationId)
        {
            try
            {
                DynamicParameters dynamicParameters = new DynamicParameters();
                dynamicParameters.Add("@pageindex", pageIndex, DbType.Int32);
                dynamicParameters.Add("@pagesize", pageSize, DbType.Int32);
                dynamicParameters.Add("@searchTerm", searchTerm ?? "", DbType.String);
                dynamicParameters.Add("@fk_companyId", companyId, DbType.String);
                dynamicParameters.Add("@fk_userId", userId, DbType.String);
                dynamicParameters.Add("@locationId", locationId ?? "", DbType.String);

                var tuple = DataBaseFactory.QueryMultipleSP<dynamic, VendorVerificationListModel>("Vendor_DownloadVerificationList", dynamicParameters, "Vendor_GetVerificationList");
                if (tuple == null || tuple.Item2 == null)
                    return (0, Enumerable.Empty<VendorVerificationListModel>());

                int totalCount = 0;
                if (tuple.Item1 is IEnumerable<dynamic> countList && countList.Any())
                {
                    var firstRow = (IDictionary<string, object>)countList.First();
                    if (firstRow.ContainsKey("TotalCount"))
                    {
                        totalCount = Convert.ToInt32(firstRow["TotalCount"]);
                    }
                }

                return (totalCount, tuple.Item2.ToList());
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error in GetVendorDownloadListAsync: " + ex.Message);
                return (0, Enumerable.Empty<VendorVerificationListModel>());
            }
        }


        public async Task<(int totalCount, IEnumerable<VendorVerificationListModel> vendors)> GetVendorDownloadVerificationListAsync(int pageIndex, int pageSize, string companyId, string userId, string searchTerm)
        {
            try
            {
                DynamicParameters dynamicParameters = new DynamicParameters();
                dynamicParameters.Add("@pageindex", pageIndex, DbType.Int32);
                dynamicParameters.Add("@pagesize", pageSize, DbType.Int32);
                dynamicParameters.Add("@searchTerm", searchTerm ?? "", DbType.String);
                dynamicParameters.Add("@fk_companyId", companyId, DbType.String);
                dynamicParameters.Add("@fk_userId", userId, DbType.String);
               

                var tuple = DataBaseFactory.QueryMultipleSP<dynamic, VendorVerificationListModel>("Vendor_GetVerificationList", dynamicParameters, "Vendor_GetVerificationList");
                if (tuple == null || tuple.Item2 == null)
                    return (0, Enumerable.Empty<VendorVerificationListModel>());

                int totalCount = 0;
                if (tuple.Item1 is IEnumerable<dynamic> countList && countList.Any())
                {
                    var firstRow = (IDictionary<string, object>)countList.First();
                    if (firstRow.ContainsKey("TotalCount"))
                    {
                        totalCount = Convert.ToInt32(firstRow["TotalCount"]);
                    }
                }

                return (totalCount, tuple.Item2.ToList());
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error in GetVendorDownloadListAsync: " + ex.Message);
                return (0, Enumerable.Empty<VendorVerificationListModel>());
            }
        }


        // ── Transaction Approval Workflow ────────────────────────────────────────

        public async Task<(int totalVendors, int approvedCount, int pendingCount, int totalRows, IEnumerable<dynamic> rows)> GetVendorTransactionForApprovalAsync(
            int clientId, int modelId, string transactionRange, string searchTerm, int pageIndex, int pageSize)
        {
            try
            {
                var p = new DynamicParameters();
                p.Add("@ClientID", clientId, DbType.Int32);
                p.Add("@ModelID", modelId, DbType.Int32);
                p.Add("@TransactionRange", transactionRange, DbType.String);
                p.Add("@SearchTerm", searchTerm ?? "", DbType.String);
                p.Add("@PageIndex", pageIndex, DbType.Int32);
                p.Add("@PageSize", pageSize, DbType.Int32);

                var rows = await DataBaseFactory.QuerySPAsync<dynamic>(
                    "USP_GetVendorTransactionForApproval", p,
                    "Vendor - GetVendorTransactionForApproval");

                var list = rows?.ToList() ?? new List<dynamic>();
                int totalVendors = 0, approvedCount = 0, pendingCount = 0, totalRows = 0;

                if (list.Any())
                {
                    var first = (IDictionary<string, object>)list[0];
                    totalVendors = first.ContainsKey("TotalVendors") ? Convert.ToInt32(first["TotalVendors"]) : 0;
                    approvedCount = first.ContainsKey("ApprovedCount") ? Convert.ToInt32(first["ApprovedCount"]) : 0;
                    pendingCount = first.ContainsKey("PendingCount") ? Convert.ToInt32(first["PendingCount"]) : 0;
                    totalRows = first.ContainsKey("TotalRows") ? Convert.ToInt32(first["TotalRows"]) : list.Count;
                }

                return (totalVendors, approvedCount, pendingCount, totalRows, list);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error in GetVendorTransactionForApprovalAsync: " + ex.Message);
                return (0, 0, 0, 0, Enumerable.Empty<dynamic>());
            }
        }

        public async Task<dynamic> ApproveVendorTransactionAsync(
            string transactionIds, bool approveAll, int clientId, int modelId,
            string transactionRange, string approvedBy, string approvedByName, string approverRemarks)
        {
            try
            {
                var p = new DynamicParameters();
                p.Add("@TransactionIDs", transactionIds ?? "", DbType.String);
                p.Add("@ApproveAll", approveAll ? 1 : 0, DbType.Int32);
                p.Add("@ClientID", clientId, DbType.Int32);
                p.Add("@ModelID", modelId, DbType.Int32);
                p.Add("@TransactionRange", transactionRange, DbType.String);
                p.Add("@ApprovedBy", approvedBy ?? "", DbType.String);
                p.Add("@ApprovedByName", approvedByName ?? "", DbType.String);
                p.Add("@ApproverRemarks", approverRemarks ?? "", DbType.String);

                var result = await DataBaseFactory.QuerySPAsync<dynamic>(
                    "USP_ApproveVendorTransaction", p,
                    "Vendor - ApproveVendorTransaction");

                return result?.FirstOrDefault();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error in ApproveVendorTransactionAsync: " + ex.Message);
                return null;
            }
        }

        public async Task<(int totalRows, IEnumerable<dynamic> logs)> GetVendorTransactionAuditLogAsync(
            int clientId, int modelId, string transactionRange, int? transactionId,
            string searchTerm, int pageIndex, int pageSize)
        {
            try
            {
                var p = new DynamicParameters();
                p.Add("@TransactionRange", transactionRange ?? "", DbType.String);
                p.Add("@TransactionID", transactionId, DbType.Int32);
                p.Add("@SearchTerm", searchTerm ?? "", DbType.String);
                p.Add("@PageIndex", pageIndex, DbType.Int32);
                p.Add("@PageSize", pageSize, DbType.Int32);

                // Calls USP_GetVendorTransactionAuditLog_CL which queries CL_UpdateAudit_Log
                // where DocumentName = 'Vendor Transaction' (written by the trigger)
                var logs = await DataBaseFactory.QuerySPAsync<dynamic>(
                    "USP_GetVendorTransactionAuditLog_CL", p,
                    "Vendor - GetVendorTransactionAuditLog");

                var list = logs?.ToList() ?? new List<dynamic>();
                int totalRows = list.Any()
                    ? (((IDictionary<string, object>)list[0]).ContainsKey("TotalRows")
                        ? Convert.ToInt32(((IDictionary<string, object>)list[0])["TotalRows"])
                        : list.Count)
                    : 0;

                return (totalRows, list);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error in GetVendorTransactionAuditLogAsync: " + ex.Message);
                return (0, Enumerable.Empty<dynamic>());
            }
        }

        // =========================================================================
        // Dynamic Deduction Entry, Fact Box, Sync & Recovery MIS Implementations
        // =========================================================================

        public async Task<IEnumerable<dynamic>> GetLinkedLocationsAsync(long clientId, int modelId, string companyId)
        {
            try
            {
                var p = new DynamicParameters();
                p.Add("@ClientID", clientId);
                p.Add("@ModelID", modelId);
                p.Add("@CompanyId", string.IsNullOrWhiteSpace(companyId) ? null : companyId);

                var list = await DataBaseFactory.QuerySPAsync<dynamic>("USP_Vendor_GetLinkedLocations", p, "Vendor - GetLinkedLocations");
                return list ?? Enumerable.Empty<dynamic>();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetLinkedLocationsAsync: {ex.Message}");
                return Enumerable.Empty<dynamic>();
            }
        }

        public async Task<IEnumerable<VendorLinkedVendorDto>> GetLinkedVendorsAsync(long clientId, int modelId, string? locationId, string companyId)
        {
            try
            {
                var p = new DynamicParameters();
                p.Add("@ClientID", clientId);
                p.Add("@ModelID", modelId);
                p.Add("@LocationID", string.IsNullOrWhiteSpace(locationId) ? null : locationId);
                p.Add("@CompanyId", companyId);

                var list = await DataBaseFactory.QuerySPAsync<VendorLinkedVendorDto>("USP_Vendor_GetLinkedVendors", p, "Vendor - GetLinkedVendors");
                return list ?? Enumerable.Empty<VendorLinkedVendorDto>();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetLinkedVendorsAsync: {ex.Message}");
                return Enumerable.Empty<VendorLinkedVendorDto>();
            }
        }

        public async Task<(bool isSuccess, string message)> SaveDeductionEntriesAsync(SaveDeductionEntryRequest request, string userId, string companyId)
        {
            try
            {
                if (request == null || request.Items == null || !request.Items.Any())
                {
                    return (false, "No deduction line items provided.");
                }

                var sb = new System.Text.StringBuilder();
                sb.Append("<Deductions>");
                foreach (var item in request.Items)
                {
                    bool isShipment = (!string.IsNullOrWhiteSpace(item.StandardDbColumn) && item.StandardDbColumn.Equals("Ded_Shipment", StringComparison.OrdinalIgnoreCase))
                        || (!string.IsNullOrWhiteSpace(item.DeductionType) && (item.DeductionType.Contains("Shipment", StringComparison.OrdinalIgnoreCase) || item.DeductionType.Equals("Deduction", StringComparison.OrdinalIgnoreCase)));

                    if (isShipment && string.IsNullOrWhiteSpace(item.ShipmentId))
                    {
                        return (false, $"Shipment / Waybill ID is mandatory for shipment deduction '{item.DeductionType}'.");
                    }

                    string safeType = EscapeXml(item.DeductionType);
                    string safeCol = EscapeXml(item.StandardDbColumn);
                    string safeShipId = EscapeXml(item.ShipmentId);
                    string safeRemarks = EscapeXml(item.Remarks);
                    long entryId = item.pk_DeductionEntryId ?? item.DeductionEntryId ?? 0;
                    sb.Append($"<Row pk_DeductionEntryId=\"{entryId}\" DeductionType=\"{safeType}\" StandardDbColumn=\"{safeCol}\" ShipmentID=\"{safeShipId}\" Amount=\"{item.Amount}\" Remarks=\"{safeRemarks}\" />");
                }
                sb.Append("</Deductions>");

                var p = new DynamicParameters();
                p.Add("@ClientID", request.ClientId);
                p.Add("@ModelID", request.ModelId);
                p.Add("@LocationID", request.LocationId);
                p.Add("@FHRID", request.FHRID);
                p.Add("@Cycle_FromDate", request.FromDate);
                p.Add("@Cycle_ToDate", request.ToDate);
                p.Add("@Vehicle_Type", string.IsNullOrWhiteSpace(request.VehicleType) ? null : request.VehicleType);
                p.Add("@Route", string.IsNullOrWhiteSpace(request.Route) ? null : request.Route);
                p.Add("@DeductionsXML", sb.ToString());
                p.Add("@UserId", userId);
                p.Add("@CompanyId", companyId);

                var result = await DataBaseFactory.QuerySPAsync<dynamic>("USP_Vendor_SaveDeductionEntry", p, "Vendor - SaveDeductionEntry");
                return (true, "Deductions saved successfully.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in SaveDeductionEntriesAsync: {ex.Message}");
                return (false, ex.Message);
            }
        }

        public async Task<(bool isSuccess, string message, int insertedCount)> SaveMultiVendorDeductionBatchAsync(SaveMultiVendorDeductionBatchRequest request, string userId, string companyId)
        {
            try
            {
                if (request == null || request.Items == null || !request.Items.Any())
                {
                    return (false, "No deduction line items provided.", 0);
                }

                // Check if any vendor in the batch has already been synced to Payment Transactions for this transaction range
                try
                {
                    var firstItem = request.Items.First();
                    if (firstItem.Cycle_FromDate > DateTime.MinValue && firstItem.Cycle_ToDate > DateTime.MinValue && request.ClientId > 0 && request.ModelId > 0)
                    {
                        string rangeStr = $"{firstItem.Cycle_FromDate:dd-MMM-yyyy} to {firstItem.Cycle_ToDate:dd-MMM-yyyy}";
                        var (_, _, _, _, _, syncRows) = await GetVendorTransactionForSyncAsync(
                            (int)request.ClientId, request.ModelId, null, rangeStr, null, "", 1, 99999);

                    if (syncRows != null && syncRows.Any())
                    {
                        var syncedFhrids = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
                        var syncedCodes = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
                        foreach (var sr in syncRows)
                        {
                            var dict = (IDictionary<string, object>)sr;
                            bool isSyn = false;
                            if (dict.TryGetValue("IsDeductionsSynced", out var sVal) && sVal != null)
                            {
                                isSyn = sVal is bool b ? b : (sVal.ToString() == "1" || sVal.ToString().Equals("true", StringComparison.OrdinalIgnoreCase));
                            }
                            if (isSyn)
                            {
                                if (dict.TryGetValue("FHRID", out var fVal) && fVal != null) syncedFhrids.Add(fVal.ToString()!.Trim());
                                if (dict.TryGetValue("VendorCode", out var cVal) && cVal != null) syncedCodes.Add(cVal.ToString()!.Trim());
                            }
                        }

                        var lockedVendors = request.Items.Where(it => 
                            (!string.IsNullOrWhiteSpace(it.FHRID) && syncedFhrids.Contains(it.FHRID.Trim())) ||
                            (!string.IsNullOrWhiteSpace(it.VendorCode) && syncedCodes.Contains(it.VendorCode.Trim()))
                        ).ToList();

                        if (lockedVendors.Any())
                        {
                            var lockedList = string.Join(", ", lockedVendors.Select(v => $"{v.VendorCode} ({v.FHRID})").Distinct());
                            return (false, $"Cannot save deductions: The following vendor(s) are already synchronized to Payment Transactions and locked for this cycle: {lockedList}.", 0);
                        }
                    }
                    }
                }
                catch (Exception syncCheckEx)
                {
                    Console.WriteLine($"Sync check error in SaveMultiVendorDeductionBatchAsync (non-fatal): {syncCheckEx.Message}");
                }

                var sb = new System.Text.StringBuilder();
                sb.Append("<Deductions>");
                foreach (var item in request.Items)
                {
                    bool isShipment = (!string.IsNullOrWhiteSpace(item.StandardDbColumn) && item.StandardDbColumn.Equals("Ded_Shipment", StringComparison.OrdinalIgnoreCase))
                        || (!string.IsNullOrWhiteSpace(item.DeductionType) && (item.DeductionType.Contains("Shipment", StringComparison.OrdinalIgnoreCase) || item.DeductionType.Equals("Deduction", StringComparison.OrdinalIgnoreCase)));

                    if (isShipment && string.IsNullOrWhiteSpace(item.ShipmentId))
                    {
                        return (false, $"Shipment / Waybill ID is mandatory for shipment deduction '{item.DeductionType}'.", 0);
                    }

                    string safeFhrid = EscapeXml(item.FHRID);
                    string safeVendorCode = EscapeXml(item.VendorCode);
                    string safeLocationId = EscapeXml(item.LocationId);
                    string safeType = EscapeXml(item.DeductionType);
                    string safeCol = EscapeXml(item.StandardDbColumn);
                    string safeShipId = EscapeXml(item.ShipmentId);
                    string safeRemarks = EscapeXml(item.Remarks);
                    string safeVehicle = EscapeXml(item.Vehicle_Type);
                    string safeRoute = EscapeXml(item.Route);
                    string safeClientName = EscapeXml(item.ClientName ?? request.ClientName);
                    string safeModelName = EscapeXml(item.ModelName ?? request.ModelName);
                    string safeLocationName = EscapeXml(item.LocationName ?? request.LocationName);
                    string safeSplitGroupId = EscapeXml(item.SplitGroupId);
                    string safeUploadBatchId = EscapeXml(item.UploadBatchId);
                    int isSplit = item.IsSplitShipment ? 1 : 0;
                    decimal origAmount = item.OriginalShipmentAmount ?? item.Amount;
                    int shareCount = item.SplitShareCount > 0 ? item.SplitShareCount : 1;
                    string fromDateStr = item.Cycle_FromDate.ToString("yyyy-MM-dd");
                    string toDateStr = item.Cycle_ToDate.ToString("yyyy-MM-dd");

                    sb.Append($"<Row ClientID=\"{request.ClientId}\" ModelID=\"{request.ModelId}\" ClientName=\"{safeClientName}\" ModelName=\"{safeModelName}\" LocationID=\"{safeLocationId}\" LocationName=\"{safeLocationName}\" FHRID=\"{safeFhrid}\" VendorCode=\"{safeVendorCode}\" Cycle_FromDate=\"{fromDateStr}\" Cycle_ToDate=\"{toDateStr}\" Vehicle_Type=\"{safeVehicle}\" Route=\"{safeRoute}\" DeductionType=\"{safeType}\" StandardDbColumn=\"{safeCol}\" ShipmentID=\"{safeShipId}\" Amount=\"{item.Amount}\" Remarks=\"{safeRemarks}\" IsSplitShipment=\"{isSplit}\" OriginalShipmentAmount=\"{origAmount}\" SplitShareCount=\"{shareCount}\" SplitGroupId=\"{safeSplitGroupId}\" UploadBatchId=\"{safeUploadBatchId}\" />");
                }
                sb.Append("</Deductions>");

                var p = new DynamicParameters();
                p.Add("@ClientID", request.ClientId);
                p.Add("@ModelID", request.ModelId);
                p.Add("@DeductionsXML", sb.ToString());
                p.Add("@UserId", userId);
                p.Add("@CompanyId", companyId);

                var result = await DataBaseFactory.QuerySPAsync<dynamic>("USP_Vendor_SaveMultiVendorDeductionBatch", p, "Vendor - SaveMultiVendorDeductionBatch");
                int insertedCount = 0;
                var first = result?.FirstOrDefault();
                if (first != null)
                {
                    var dict = (IDictionary<string, object>)first;
                    if (dict.ContainsKey("InsertedCount") && dict["InsertedCount"] != null)
                    {
                        int.TryParse(dict["InsertedCount"].ToString(), out insertedCount);
                    }
                }
                return (true, "Deductions saved successfully.", insertedCount > 0 ? insertedCount : request.Items.Count);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in SaveMultiVendorDeductionBatchAsync: {ex.Message}");
                return (false, ex.Message, 0);
            }
        }

        public async Task<IEnumerable<ShipmentRecoverySummaryDto>> GetShipmentRecoverySummaryAsync(string shipmentId, long? clientId, int? modelId)
        {
            try
            {
                var p = new DynamicParameters();
                p.Add("@ShipmentID", shipmentId);
                p.Add("@ClientID", clientId);
                p.Add("@ModelID", modelId);

                var result = await DataBaseFactory.QuerySPAsync<ShipmentRecoverySummaryDto>("USP_Vendor_GetShipmentRecoverySummary", p, "Vendor - GetShipmentRecoverySummary");
                return result ?? Enumerable.Empty<ShipmentRecoverySummaryDto>();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetShipmentRecoverySummaryAsync: {ex.Message}");
                return Enumerable.Empty<ShipmentRecoverySummaryDto>();
            }
        }

        public async Task<(bool isSuccess, string message)> DeleteDeductionEntryAsync(long entryId, string userId)
        {
            try
            {
                var p = new DynamicParameters();
                p.Add("@pk_DeductionEntryId", entryId);
                p.Add("@UserId", userId);

                await DataBaseFactory.QuerySPAsync<dynamic>("USP_Vendor_DeleteDeductionEntry", p, "Vendor - DeleteDeductionEntry");
                return (true, "Deduction entry deleted successfully.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in DeleteDeductionEntryAsync: {ex.Message}");
                return (false, ex.Message);
            }
        }

        public async Task<FactBoxDeductionSummaryDto> GetFactBoxDeductionSummaryAsync(long clientId, int modelId, string? locationId, string fhrid, DateTime fromDate, DateTime toDate, string companyId, string? vehicleType = null, string? route = null)
        {
            try
            {
                var p = new DynamicParameters();
                p.Add("@ClientID", clientId);
                p.Add("@ModelID", modelId);
                p.Add("@LocationID", string.IsNullOrWhiteSpace(locationId) ? null : locationId);
                p.Add("@FHRID", fhrid);
                p.Add("@Cycle_FromDate", fromDate);
                p.Add("@Cycle_ToDate", toDate);
                p.Add("@Vehicle_Type", string.IsNullOrWhiteSpace(vehicleType) ? null : vehicleType);
                p.Add("@Route", string.IsNullOrWhiteSpace(route) ? null : route);
                p.Add("@CompanyId", companyId);

                var tuple = DataBaseFactory.QueryMultipleSP<FactBoxDeductionSummaryDto, FactBoxDeductionItemDto>(
                    "USP_Vendor_GetFactBoxSummary", p, "Vendor - FactBoxSummary");

                var summary = tuple?.Item1?.FirstOrDefault() ?? new FactBoxDeductionSummaryDto();
                summary.RecentEntries = tuple?.Item2?.ToList() ?? new List<FactBoxDeductionItemDto>();
                return summary;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetFactBoxDeductionSummaryAsync: {ex.Message}");
                return new FactBoxDeductionSummaryDto();
            }
        }

        public async Task<(bool isSuccess, string message)> SyncVendorDeductionsAsync(SyncDeductionsRequest request, string userId, string companyId)
        {
            try
            {
                var p = new DynamicParameters();
                p.Add("@ClientID", request.ClientId);
                p.Add("@ModelID", request.ModelId);
                p.Add("@FromDate", request.FromDate);
                p.Add("@ToDate", request.ToDate);
                p.Add("@LocationID", string.IsNullOrWhiteSpace(request.LocationId) ? null : request.LocationId);
                p.Add("@UserId", userId);
                p.Add("@CompanyId", companyId);

                var result = await DataBaseFactory.QuerySPAsync<dynamic>("USP_SyncVendorDeductions_ToPaymentTransactions", p, "Vendor - SyncDeductions");
                return (true, "Deductions synchronized successfully and Net Payables recalculated.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in SyncVendorDeductionsAsync: {ex.Message}");
                return (false, ex.Message);
            }
        }

        public async Task<IEnumerable<dynamic>> GetDeductionBreakdownAsync(long transactionId, string? standardDbColumn = null)
        {
            try
            {
                var p = new DynamicParameters();
                p.Add("@TransactionID", transactionId);
                p.Add("@StandardDbColumn", string.IsNullOrWhiteSpace(standardDbColumn) ? null : standardDbColumn);

                var list = await DataBaseFactory.QuerySPAsync<dynamic>("USP_Vendor_GetDeductionBreakdown", p, "Vendor - GetDeductionBreakdown");
                return list ?? Enumerable.Empty<dynamic>();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetDeductionBreakdownAsync: {ex.Message}");
                return Enumerable.Empty<dynamic>();
            }
        }

        public async Task<(int totalVendors, int syncedCount, int pendingCount, decimal totalNetPayable, int totalRows, IEnumerable<dynamic> rows)> GetVendorTransactionForSyncAsync(
            int clientId, int modelId, string? locationId, string transactionRange, string? vendorCode, string? searchTerm, int pageIndex, int pageSize)
        {
            try
            {
                var p = new DynamicParameters();
                p.Add("@ClientID", clientId, DbType.Int64);
                p.Add("@ModelID", modelId, DbType.Int32);
                p.Add("@LocationID", string.IsNullOrWhiteSpace(locationId) ? null : locationId, DbType.String);
                p.Add("@TransactionRange", transactionRange ?? "", DbType.String);
                p.Add("@VendorCode", string.IsNullOrWhiteSpace(vendorCode) ? null : vendorCode, DbType.String);
                p.Add("@SearchTerm", searchTerm ?? "", DbType.String);
                p.Add("@PageIndex", pageIndex, DbType.Int32);
                p.Add("@PageSize", pageSize, DbType.Int32);

                var rows = await DataBaseFactory.QuerySPAsync<dynamic>(
                    "USP_GetVendorTransactionForSync", p,
                    "Vendor - GetVendorTransactionForSync");

                var list = rows?.ToList() ?? new List<dynamic>();
                int totalVendors = 0, syncedCount = 0, pendingCount = 0, totalRows = 0;
                decimal totalNetPayable = 0.00m;

                if (list.Any())
                {
                    var first = (IDictionary<string, object>)list[0];
                    totalVendors = first.ContainsKey("TotalVendors") ? Convert.ToInt32(first["TotalVendors"]) : 0;
                    syncedCount = first.ContainsKey("SyncedCount") ? Convert.ToInt32(first["SyncedCount"]) : 0;
                    pendingCount = first.ContainsKey("PendingCount") ? Convert.ToInt32(first["PendingCount"]) : 0;
                    totalNetPayable = first.ContainsKey("TotalNetPayable") ? Convert.ToDecimal(first["TotalNetPayable"]) : 0.00m;
                    totalRows = first.ContainsKey("TotalRows") ? Convert.ToInt32(first["TotalRows"]) : list.Count;
                }

                return (totalVendors, syncedCount, pendingCount, totalNetPayable, totalRows, list);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error in GetVendorTransactionForSyncAsync: " + ex.Message);
                return (0, 0, 0, 0.00m, 0, Enumerable.Empty<dynamic>());
            }
        }

        public async Task<(bool isSuccess, string message, int updatedCount)> SyncVendorTransactionsAsync(
            SyncTransactionsRequest request, string userId, string userName, string companyId)
        {
            try
            {
                DateTime? fromDate = null;
                DateTime? toDate = null;

                if (request.FromDate.HasValue && request.ToDate.HasValue && request.FromDate.Value.Year > 1900)
                {
                    fromDate = request.FromDate.Value;
                    toDate = request.ToDate.Value;
                }
                else if (!string.IsNullOrWhiteSpace(request.TransactionRange))
                {
                    string[] parts = null;
                    if (request.TransactionRange.Contains("to", StringComparison.OrdinalIgnoreCase))
                    {
                        parts = System.Text.RegularExpressions.Regex.Split(request.TransactionRange, "to", System.Text.RegularExpressions.RegexOptions.IgnoreCase);
                    }
                    else if (request.TransactionRange.Contains("-"))
                    {
                        parts = request.TransactionRange.Split('-');
                    }

                    if (parts != null && parts.Length >= 2)
                    {
                        if (DateTime.TryParse(parts[0].Trim(), out DateTime f) && f.Year > 1900) fromDate = f;
                        if (DateTime.TryParse(parts[1].Trim(), out DateTime t) && t.Year > 1900) toDate = t;
                    }
                }

                var p = new DynamicParameters();
                p.Add("@ClientID", request.ClientId, DbType.Int64);
                p.Add("@ModelID", request.ModelId, DbType.Int32);
                p.Add("@FromDate", (fromDate.HasValue && fromDate.Value.Year > 1900) ? (object)fromDate.Value.Date : DBNull.Value, DbType.Date);
                p.Add("@ToDate", (toDate.HasValue && toDate.Value.Year > 1900) ? (object)toDate.Value.Date : DBNull.Value, DbType.Date);
                p.Add("@LocationID", string.IsNullOrWhiteSpace(request.LocationId) ? null : request.LocationId, DbType.String);
                p.Add("@TransactionIDs", string.IsNullOrWhiteSpace(request.TransactionIds) ? null : request.TransactionIds, DbType.String);
                p.Add("@SyncAll", request.SyncAll ? 1 : 0, DbType.Int32);

                if (request.SyncItems != null && request.SyncItems.Any())
                {
                    var sb = new System.Text.StringBuilder();
                    sb.Append("<SyncItems>");
                    foreach (var item in request.SyncItems)
                    {
                        decimal pct = item.RecoveryPercent > 0 ? item.RecoveryPercent : 100.00m;
                        sb.Append($"<Row TransactionID=\"{item.TransactionId}\" RecoveryPercent=\"{pct}\" />");
                    }
                    sb.Append("</SyncItems>");
                    p.Add("@SyncItemsXML", sb.ToString(), DbType.String);
                }

                p.Add("@UserId", userId ?? "", DbType.String);
                p.Add("@UserName", userName ?? userId ?? "", DbType.String);
                p.Add("@Remarks", request.Remarks ?? "", DbType.String);
                p.Add("@CompanyId", companyId, DbType.String);

                var result = await DataBaseFactory.QuerySPAsync<dynamic>(
                    "USP_SyncVendorDeductions_ToPaymentTransactions", p, "Vendor - SyncTransactions");

                int updated = 0;
                var first = result?.FirstOrDefault();
                if (first != null)
                {
                    var dict = (IDictionary<string, object>)first;
                    if (dict.ContainsKey("UpdatedCount"))
                        updated = Convert.ToInt32(dict["UpdatedCount"]);
                }

                return (true, $"{updated} vendor transaction(s) synchronized successfully and Net Payables recalculated.", updated);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in SyncVendorTransactionsAsync: {ex.Message}");
                return (false, ex.Message, 0);
            }
        }

        public async Task<(bool isSuccess, string message)> UpdateTransactionRecoveryPercentAsync(long transactionId, decimal recoveryPercent, string userId)
        {
            try
            {
                if (recoveryPercent < 1.00m) recoveryPercent = 1.00m;
                if (recoveryPercent > 100.00m) recoveryPercent = 100.00m;

                var p = new DynamicParameters();
                p.Add("@TransactionID", transactionId, DbType.Int64);
                p.Add("@RecoveryPercent", recoveryPercent, DbType.Decimal);
                p.Add("@UserId", string.IsNullOrWhiteSpace(userId) ? "System" : userId, DbType.String);

                await DataBaseFactory.QuerySPAsync<dynamic>("USP_Vendor_UpdateTransactionRecoveryPercent", p, "Vendor - UpdateRecoveryCap");
                return (true, "Recovery Cap % updated successfully in table.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in UpdateTransactionRecoveryPercentAsync: {ex.Message}");
                return (false, ex.Message);
            }
        }


        public async Task<IEnumerable<DeductionRecoveryMISDto>> GetDeductionRecoveryMISReportAsync(long? clientId, int? modelId, string? locationId, DateTime fromDate, DateTime toDate, string recoveryStatus, string companyId)
        {
            try
            {
                var p = new DynamicParameters();
                p.Add("@ClientID", clientId.HasValue && clientId > 0 ? (long?)clientId.Value : null, DbType.Int64);
                p.Add("@ModelID", modelId.HasValue && modelId > 0 ? (int?)modelId.Value : null, DbType.Int32);
                p.Add("@LocationID", string.IsNullOrWhiteSpace(locationId) ? null : locationId, DbType.String);
                p.Add("@FromDate", fromDate, DbType.DateTime);
                p.Add("@ToDate", toDate, DbType.DateTime);
                p.Add("@RecoveryStatus", string.IsNullOrWhiteSpace(recoveryStatus) ? "ALL" : recoveryStatus, DbType.String);
                p.Add("@CompanyId", companyId, DbType.String);

                var list = await DataBaseFactory.QuerySPAsync<DeductionRecoveryMISDto>("USP_Vendor_GetDeductionRecovery_MISReport", p, "Vendor - MISReport");
                return list ?? Enumerable.Empty<DeductionRecoveryMISDto>();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetDeductionRecoveryMISReportAsync: {ex.Message}");
                return Enumerable.Empty<DeductionRecoveryMISDto>();
            }
        }

        private static string EscapeXml(string? input)
        {
            if (string.IsNullOrEmpty(input)) return string.Empty;
            return input.Replace("&", "&amp;").Replace("<", "&lt;").Replace(">", "&gt;").Replace("\"", "&quot;").Replace("'", "&apos;");
        }

        public async Task<VendorRecoveryPolicyDto?> GetDeductionRecoveryPolicyAsync(long? clientId, int? modelId, string companyId)
        {
            try
            {
                var p = new DynamicParameters();
                p.Add("@ClientID", clientId.HasValue && clientId.Value > 0 ? (long?)clientId.Value : null, DbType.Int64);
                p.Add("@ModelID", modelId.HasValue && modelId.Value > 0 ? (int?)modelId.Value : null, DbType.Int32);
                p.Add("@CompanyId", companyId, DbType.String);

                var list = await DataBaseFactory.QuerySPAsync<VendorRecoveryPolicyDto>("USP_Vendor_GetDeductionRecoveryPolicy", p, "Vendor - GetRecoveryPolicy");
                return list?.FirstOrDefault();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetDeductionRecoveryPolicyAsync: {ex.Message}");
                return null;
            }
        }

        public async Task<(bool isSuccess, string message)> SaveDeductionRecoveryPolicyAsync(SaveRecoveryPolicyRequest request, string userId, string companyId)
        {
            try
            {
                var p = new DynamicParameters();
                p.Add("@ClientID", request.ClientId.HasValue && request.ClientId.Value > 0 ? (long?)request.ClientId.Value : null, DbType.Int64);
                p.Add("@ModelID", request.ModelId.HasValue && request.ModelId.Value > 0 ? (int?)request.ModelId.Value : null, DbType.Int32);
                p.Add("@Strategy", request.Strategy ?? "FIFO", DbType.String);
                p.Add("@PriorityOrder", request.PriorityOrder, DbType.String);
                p.Add("@MaxRecoveryPercent", request.MaxRecoveryPercent > 0 ? request.MaxRecoveryPercent : 100.00m, DbType.Decimal);
                p.Add("@UserId", userId, DbType.String);
                p.Add("@CompanyId", companyId, DbType.String);

                var res = await DataBaseFactory.QuerySPAsync<dynamic>("USP_Vendor_SaveDeductionRecoveryPolicy", p, "Vendor - SaveRecoveryPolicy");
                var first = res?.FirstOrDefault();
                string msg = first?.Message != null ? (string)first.Message : "Policy saved successfully.";
                return (true, msg);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in SaveDeductionRecoveryPolicyAsync: {ex.Message}");
                return (false, ex.Message);
            }
        }

        public async Task<IEnumerable<RecoveryPolicyAuditLogDto>> GetDeductionRecoveryPolicyAuditLogAsync(long? clientId, int? modelId)
        {
            try
            {
                var p = new DynamicParameters();
                p.Add("@ClientID", clientId.HasValue && clientId.Value > 0 ? (long?)clientId.Value : null, DbType.Int64);
                p.Add("@ModelID", modelId.HasValue && modelId.Value > 0 ? (int?)modelId.Value : null, DbType.Int32);

                var list = await DataBaseFactory.QuerySPAsync<RecoveryPolicyAuditLogDto>("USP_Vendor_GetDeductionRecoveryPolicyAuditLog", p, "Vendor - GetRecoveryPolicyAuditLog");
                return list ?? Enumerable.Empty<RecoveryPolicyAuditLogDto>();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetDeductionRecoveryPolicyAuditLogAsync: {ex.Message}");
                return Enumerable.Empty<RecoveryPolicyAuditLogDto>();
            }
        }

        public async Task<(bool isSuccess, string message)> SaveOpeningDeficitAsync(SaveOpeningDeficitRequest request, string userId, string companyId)
        {
            try
            {
                if (request == null || request.DeficitAmount <= 0)
                {
                    return (false, "Opening deficit amount must be greater than zero.");
                }

                var p = new DynamicParameters();
                p.Add("@ClientID", request.ClientId, DbType.Int64);
                p.Add("@ModelID", request.ModelId, DbType.Int32);
                p.Add("@LocationID", request.LocationId ?? "", DbType.String);
                p.Add("@FHRID", request.FHRID ?? "", DbType.String);
                p.Add("@VendorCode", request.VendorCode, DbType.String);
                p.Add("@DeficitAmount", request.DeficitAmount, DbType.Decimal);
                p.Add("@CutoffDate", request.CutoffDate.HasValue ? (object)request.CutoffDate.Value.Date : DBNull.Value, DbType.Date);
                p.Add("@Remarks", request.Remarks ?? "Opening Deficit Balance from Legacy System", DbType.String);
                p.Add("@UserId", userId, DbType.String);
                p.Add("@CompanyId", companyId, DbType.String);

                var res = await DataBaseFactory.QuerySPAsync<dynamic>("USP_Vendor_SaveOpeningDeficit", p, "Vendor - SaveOpeningDeficit");
                var first = res?.FirstOrDefault();
                string msg = first?.Message != null ? (string)first.Message : "Opening deficit recorded successfully.";
                return (true, msg);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in SaveOpeningDeficitAsync: {ex.Message}");
                return (false, ex.Message);
            }
        }

        public async Task<(bool isSuccess, string message, int insertedCount)> BulkSaveOpeningDeficitsAsync(IEnumerable<BulkOpeningDeficitItemDto> items, string userId, string companyId)
        {
            try
            {
                if (items == null || !items.Any())
                {
                    return (false, "No valid opening deficit items found in upload.", 0);
                }

                var sb = new System.Text.StringBuilder();
                sb.Append("<Deficits>");
                foreach (var item in items)
                {
                    string safeFhrid = EscapeXml(item.FHRID);
                    string safeVendorCode = EscapeXml(item.VendorCode);
                    string safeLoc = EscapeXml(item.LocationId);
                    string safeRemarks = EscapeXml(item.Remarks);
                    string dateStr = item.CutoffDate.HasValue ? item.CutoffDate.Value.ToString("yyyy-MM-dd") : "";
                    sb.Append($"<Row ClientID=\"{item.ClientId}\" ModelID=\"{item.ModelId}\" LocationID=\"{safeLoc}\" FHRID=\"{safeFhrid}\" VendorCode=\"{safeVendorCode}\" DeficitAmount=\"{item.DeficitAmount}\" CutoffDate=\"{dateStr}\" Remarks=\"{safeRemarks}\" />");
                }
                sb.Append("</Deficits>");

                var p = new DynamicParameters();
                p.Add("@DeficitsXML", sb.ToString(), DbType.String);
                p.Add("@UserId", userId, DbType.String);
                p.Add("@CompanyId", companyId, DbType.String);

                var res = await DataBaseFactory.QuerySPAsync<dynamic>("USP_Vendor_BulkSaveOpeningDeficits", p, "Vendor - BulkSaveOpeningDeficits");
                var first = res?.FirstOrDefault();
                int count = 0;
                if (first != null)
                {
                    var dict = (IDictionary<string, object>)first;
                    if (dict.ContainsKey("InsertedCount")) count = Convert.ToInt32(dict["InsertedCount"]);
                }

                return (true, $"{count} opening deficit record(s) uploaded successfully.", count);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in BulkSaveOpeningDeficitsAsync: {ex.Message}");
                return (false, ex.Message, 0);
            }
        }

        public async Task<IEnumerable<OpeningDeficitListItemDto>> GetOpeningDeficitsListAsync(long? clientId, int? modelId, string? locationId, string? searchTerm, string companyId)
        {
            try
            {
                var p = new DynamicParameters();
                p.Add("@ClientID", clientId.HasValue && clientId > 0 ? (long?)clientId.Value : null, DbType.Int64);
                p.Add("@ModelID", modelId.HasValue && modelId > 0 ? (int?)modelId.Value : null, DbType.Int32);
                p.Add("@LocationID", string.IsNullOrWhiteSpace(locationId) ? null : locationId.Trim(), DbType.String);
                p.Add("@SearchTerm", string.IsNullOrWhiteSpace(searchTerm) ? null : searchTerm.Trim(), DbType.String);
                p.Add("@CompanyId", companyId, DbType.String);

                var list = await DataBaseFactory.QuerySPAsync<OpeningDeficitListItemDto>("USP_Vendor_GetOpeningDeficitsList", p, "Vendor - GetOpeningDeficitsList");
                return list ?? Enumerable.Empty<OpeningDeficitListItemDto>();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetOpeningDeficitsListAsync: {ex.Message}");
                return Enumerable.Empty<OpeningDeficitListItemDto>();
            }
        }

        public async Task<(bool isSuccess, string message)> DeleteOpeningDeficitAsync(long carryForwardId, string userId)
        {
            try
            {
                var p = new DynamicParameters();
                p.Add("@CarryForwardId", carryForwardId, DbType.Int64);
                p.Add("@UserId", userId, DbType.String);

                var res = await DataBaseFactory.QuerySPAsync<dynamic>("USP_Vendor_DeleteOpeningDeficit", p, "Vendor - DeleteOpeningDeficit");
                var first = res?.FirstOrDefault();
                string msg = "Opening deficit deleted successfully.";
                if (first != null)
                {
                    var dict = (IDictionary<string, object>)first;
                    if (dict.ContainsKey("Message")) msg = dict["Message"]?.ToString() ?? msg;
                }
                return (true, msg);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in DeleteOpeningDeficitAsync: {ex.Message}");
                return (false, ex.Message);
            }
        }

        public async Task<(int totalRecords, int kpiTotalCount, int kpiPendingCount, int kpiPaidCount, decimal kpiTotalPendingAmount, decimal kpiTotalPaidAmount, int kpiSyncedCount, int kpiUnsyncedCount, IEnumerable<dynamic> rows)> GetPaymentSettlementListAsync(
            int clientId, int modelId, string? locationId, string transactionRange, string? vendorCode, string? paymentStatus, int? isDeductionsSynced, string? searchTerm, int pageIndex, int pageSize)
        {
            try
            {
                var p = new DynamicParameters();
                p.Add("@ClientID", clientId, DbType.Int64);
                p.Add("@ModelID", modelId, DbType.Int32);
                p.Add("@LocationID", string.IsNullOrWhiteSpace(locationId) ? null : locationId, DbType.String);
                p.Add("@TransactionRange", transactionRange ?? "", DbType.String);
                p.Add("@VendorCode", string.IsNullOrWhiteSpace(vendorCode) ? null : vendorCode, DbType.String);
                p.Add("@PaymentStatus", string.IsNullOrWhiteSpace(paymentStatus) ? "Pending" : paymentStatus, DbType.String);
                p.Add("@IsDeductionsSynced", isDeductionsSynced, DbType.Int32);
                p.Add("@SearchTerm", searchTerm ?? "", DbType.String);
                p.Add("@PageIndex", pageIndex, DbType.Int32);
                p.Add("@PageSize", pageSize, DbType.Int32);

                var rows = await DataBaseFactory.QuerySPAsync<dynamic>(
                    "USP_Vendor_GetPaymentSettlementList", p,
                    "Vendor - GetPaymentSettlementList");

                var list = rows?.ToList() ?? new List<dynamic>();
                int totalRecords = 0, kpiTotalCount = 0, kpiPendingCount = 0, kpiPaidCount = 0, kpiSyncedCount = 0, kpiUnsyncedCount = 0;
                decimal kpiTotalPendingAmount = 0.00m, kpiTotalPaidAmount = 0.00m;

                if (list.Any())
                {
                    var first = (IDictionary<string, object>)list[0];
                    totalRecords = first.ContainsKey("TotalRecords") ? Convert.ToInt32(first["TotalRecords"]) : list.Count;
                    kpiTotalCount = first.ContainsKey("KpiTotalCount") ? Convert.ToInt32(first["KpiTotalCount"]) : 0;
                    kpiPendingCount = first.ContainsKey("KpiPendingCount") ? Convert.ToInt32(first["KpiPendingCount"]) : 0;
                    kpiPaidCount = first.ContainsKey("KpiPaidCount") ? Convert.ToInt32(first["KpiPaidCount"]) : 0;
                    kpiTotalPendingAmount = first.ContainsKey("KpiTotalPendingAmount") ? Convert.ToDecimal(first["KpiTotalPendingAmount"]) : 0.00m;
                    kpiTotalPaidAmount = first.ContainsKey("KpiTotalPaidAmount") ? Convert.ToDecimal(first["KpiTotalPaidAmount"]) : 0.00m;
                    kpiSyncedCount = first.ContainsKey("KpiSyncedCount") ? Convert.ToInt32(first["KpiSyncedCount"]) : 0;
                    kpiUnsyncedCount = first.ContainsKey("KpiUnsyncedCount") ? Convert.ToInt32(first["KpiUnsyncedCount"]) : 0;
                }

                return (totalRecords, kpiTotalCount, kpiPendingCount, kpiPaidCount, kpiTotalPendingAmount, kpiTotalPaidAmount, kpiSyncedCount, kpiUnsyncedCount, list);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error in GetPaymentSettlementListAsync: " + ex.Message);
                return (0, 0, 0, 0, 0.00m, 0.00m, 0, 0, Enumerable.Empty<dynamic>());
            }
        }

        public async Task<(bool isSuccess, string message, int updatedCount, string batchNo)> RecordPaymentAsync(
            RecordPaymentRequest request, string userId, string userName)
        {
            try
            {
                if (request == null || (!request.IsSelectAllCycle && (request.TransactionIds == null || !request.TransactionIds.Any())))
                {
                    return (false, "Please select at least one transaction to settle payment.", 0, "");
                }

                if (string.IsNullOrWhiteSpace(request.PaymentTransactionNo))
                {
                    return (false, "Bank Transaction ID / UTR No is required.", 0, "");
                }

                var p = new DynamicParameters();
                p.Add("@TransactionIDs", request.TransactionIds != null && request.TransactionIds.Any() ? string.Join(",", request.TransactionIds) : null, DbType.String);
                p.Add("@PaymentDate", request.PaymentDate.Date, DbType.Date);
                p.Add("@PaymentTransactionNo", request.PaymentTransactionNo.Trim(), DbType.String);
                p.Add("@PaymentBankName", string.IsNullOrWhiteSpace(request.PaymentBankName) ? null : request.PaymentBankName.Trim(), DbType.String);
                p.Add("@PaymentAccountNo", string.IsNullOrWhiteSpace(request.PaymentAccountNo) ? null : request.PaymentAccountNo.Trim(), DbType.String);
                p.Add("@PaymentMode", string.IsNullOrWhiteSpace(request.PaymentMode) ? "NEFT" : request.PaymentMode.Trim(), DbType.String);
                p.Add("@PaymentRemarks", string.IsNullOrWhiteSpace(request.PaymentRemarks) ? null : request.PaymentRemarks.Trim(), DbType.String);
                p.Add("@UserId", userId, DbType.String);
                p.Add("@UserName", userName, DbType.String);
                p.Add("@IsSelectAllCycle", request.IsSelectAllCycle, DbType.Boolean);
                p.Add("@ClientID", request.ClientId, DbType.Int64);
                p.Add("@ModelID", request.ModelId, DbType.Int32);
                p.Add("@TransactionRange", string.IsNullOrWhiteSpace(request.TransactionRange) ? null : request.TransactionRange.Trim(), DbType.String);
                p.Add("@LocationID", string.IsNullOrWhiteSpace(request.LocationId) ? null : request.LocationId.Trim(), DbType.String);
                p.Add("@IsDeductionsSynced", request.DeductionsSyncedFilter, DbType.Int32);

                var result = await DataBaseFactory.QuerySPAsync<dynamic>(
                    "USP_Vendor_RecordPayment", p,
                    "Vendor - RecordPayment");

                var row = result?.FirstOrDefault() as IDictionary<string, object>;
                int updatedCount = row != null && row.ContainsKey("UpdatedCount") ? Convert.ToInt32(row["UpdatedCount"]) : (request.TransactionIds?.Count ?? 0);
                string batchNo = row != null && row.ContainsKey("BatchNo") ? row["BatchNo"]?.ToString() ?? "" : "";
                string message = row != null && row.ContainsKey("Message") ? row["Message"]?.ToString() ?? "Payment recorded successfully." : "Payment recorded successfully.";

                return (true, message, updatedCount, batchNo);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error in RecordPaymentAsync: " + ex.Message);
                return (false, ex.Message, 0, "");
            }
        }

        public async Task<(bool isSuccess, string message)> RevertPaymentAsync(
            long transactionId, string? remarks, string userId, string userName)
        {
            try
            {
                var p = new DynamicParameters();
                p.Add("@TransactionID", transactionId, DbType.Int64);
                p.Add("@UserId", userId, DbType.String);
                p.Add("@UserName", userName, DbType.String);
                p.Add("@Remarks", string.IsNullOrWhiteSpace(remarks) ? null : remarks.Trim(), DbType.String);

                var result = await DataBaseFactory.QuerySPAsync<dynamic>(
                    "USP_Vendor_RevertPayment", p,
                    "Vendor - RevertPayment");

                var row = result?.FirstOrDefault() as IDictionary<string, object>;
                string message = row != null && row.ContainsKey("Message") ? row["Message"]?.ToString() ?? "Payment reverted successfully." : "Payment reverted successfully.";

                return (true, message);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error in RevertPaymentAsync: " + ex.Message);
                return (false, ex.Message);
            }
        }
    }
}

