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
    public class VendorServiceRepository : IVendorServiceRepository
    {

        public async Task<IEnumerable<VendorServiceDropdownItem>> GetLocationsByVendorAsync(string vendorId, string companyId)
        {
            return await Task.Run(() =>
            {
                try
                {
                    DynamicParameters dynamicParameters = new DynamicParameters();
                    dynamicParameters.Add("@vendorId", vendorId ?? "", DbType.String);
                    dynamicParameters.Add("@fk_companyId", companyId ?? "", DbType.String);

                    var result = DataBaseFactory.QuerySP<VendorServiceDropdownItem>("USP_Vendor_Service_GetLocationsByVendor", dynamicParameters, "VendorService_GetLocationsByVendor");
                    return result?.ToList() ?? new List<VendorServiceDropdownItem>();
                }
                catch (Exception ex)
                {
                    Console.WriteLine("Error in GetLocationsByVendorAsync: " + ex.Message);
                    return new List<VendorServiceDropdownItem>();
                }
            });
        }

        public async Task<IEnumerable<VendorServiceDropdownItem>> GetClientsByLocationAsync(string locationIds, string companyId)
        {
            return await Task.Run(() =>
            {
                try
                {
                    DynamicParameters dynamicParameters = new DynamicParameters();
                    dynamicParameters.Add("@locationIds", locationIds ?? "", DbType.String);
                    dynamicParameters.Add("@fk_companyId", companyId ?? "", DbType.String);

                    var result = DataBaseFactory.QuerySP<VendorServiceDropdownItem>("USP_Vendor_Service_GetClientsByLocation", dynamicParameters, "VendorService_GetClientsByLocation");
                    return result?.ToList() ?? new List<VendorServiceDropdownItem>();
                }
                catch (Exception ex)
                {
                    Console.WriteLine("Error in GetClientsByLocationAsync: " + ex.Message);
                    return new List<VendorServiceDropdownItem>();
                }
            });
        }

        public async Task<VendorServiceUploadSummaryResult> UploadExcelAsync(IFormFile file, string companyId, string userId)
        {
            var summary = new VendorServiceUploadSummaryResult();
            if (file == null || file.Length == 0) return summary;

            return await Task.Run(async () =>
            {
                try
                {
                    using var stream = file.OpenReadStream();
                    using var workbook = new ClosedXML.Excel.XLWorkbook(stream);
                    var worksheet = workbook.Worksheets.FirstOrDefault();
                    if (worksheet == null) return summary;

                    // Fetch reference masters
                    var vendors = (await GetVendorsDropdownAsync(companyId)).ToList();
                    var locations = (await GetLocationsDropdownAsync(companyId)).ToList();
                    var clients = (await GetClientsDropdownAsync(companyId)).ToList();

                    var vendorMap = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
                    foreach (var v in vendors)
                    {
                        if (!string.IsNullOrWhiteSpace(v.Text) && !vendorMap.ContainsKey(v.Text.Trim()))
                            vendorMap[v.Text.Trim()] = v.Value;
                        if (!string.IsNullOrWhiteSpace(v.Name) && !vendorMap.ContainsKey(v.Name.Trim()))
                            vendorMap[v.Name.Trim()] = v.Value;
                        if (!string.IsNullOrWhiteSpace(v.Value) && !vendorMap.ContainsKey(v.Value.Trim()))
                            vendorMap[v.Value.Trim()] = v.Value;
                    }

                    var locationMap = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
                    foreach (var l in locations)
                    {
                        if (!string.IsNullOrWhiteSpace(l.Text) && !locationMap.ContainsKey(l.Text.Trim()))
                            locationMap[l.Text.Trim()] = l.Value;
                        if (!string.IsNullOrWhiteSpace(l.Name) && !locationMap.ContainsKey(l.Name.Trim()))
                            locationMap[l.Name.Trim()] = l.Value;
                        if (!string.IsNullOrWhiteSpace(l.Value) && !locationMap.ContainsKey(l.Value.Trim()))
                            locationMap[l.Value.Trim()] = l.Value;
                    }

                    var clientMap = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
                    foreach (var c in clients)
                    {
                        if (!string.IsNullOrWhiteSpace(c.Text) && !clientMap.ContainsKey(c.Text.Trim()))
                            clientMap[c.Text.Trim()] = c.Value;
                        if (!string.IsNullOrWhiteSpace(c.Name) && !clientMap.ContainsKey(c.Name.Trim()))
                            clientMap[c.Name.Trim()] = c.Value;
                        if (!string.IsNullOrWhiteSpace(c.Code) && !clientMap.ContainsKey(c.Code.Trim()))
                            clientMap[c.Code.Trim()] = c.Value;
                        if (!string.IsNullOrWhiteSpace(c.Value) && !clientMap.ContainsKey(c.Value.Trim()))
                            clientMap[c.Value.Trim()] = c.Value;
                    }

                    var headerRow = worksheet.Row(1);
                    var colMap = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
                    foreach (var cell in headerRow.CellsUsed())
                    {
                        string h = cell.GetValue<string>().Trim().Replace(" ", "").Replace("_", "");
                        if (!string.IsNullOrEmpty(h) && !colMap.ContainsKey(h))
                            colMap[h] = cell.Address.ColumnNumber;
                    }

                    string GetColVal(ClosedXML.Excel.IXLRow r, string[] keys, int fallbackCol = 0)
                    {
                        foreach (var k in keys)
                        {
                            if (colMap.TryGetValue(k, out int colIdx))
                                return r.Cell(colIdx).GetValue<string>().Trim();
                        }
                        if (fallbackCol > 0)
                            return r.Cell(fallbackCol).GetValue<string>().Trim();
                        return string.Empty;
                    }

                    var rows = worksheet.RowsUsed().Skip(1);
                    var validRows = new List<(int rowNum, string vendorId, string locId, string clientId, string sType, string pType, decimal charge, VendorServiceUploadRowResult resultItem)>();
                    var seenCombinations = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

                    int rIdx = 1;
                    foreach (var r in rows)
                    {
                        rIdx++;
                        string rawVendor = GetColVal(r, new[] { "VendorName", "Vendor", "VendorId", "VendorCode" }, 1);
                        string rawLoc = GetColVal(r, new[] { "LocationName", "Location", "LocationId", "LocationCode" }, 2);
                        string rawClient = GetColVal(r, new[] { "ClientName", "Client", "ClientId", "ClientCode" }, 3);
                        string rawSType = GetColVal(r, new[] { "ServiceType", "Type" }, 4);
                        string rawPType = GetColVal(r, new[] { "PercentageOf", "PercentageType", "Percentage" }, 5);
                        string rawCharge = GetColVal(r, new[] { "ServiceCharge", "Charge", "Rate", "Amount" }, 6);

                        if (string.IsNullOrWhiteSpace(rawVendor) && string.IsNullOrWhiteSpace(rawLoc) && string.IsNullOrWhiteSpace(rawClient))
                            continue;

                        var rowResult = new VendorServiceUploadRowResult
                        {
                            RowNumber = rIdx,
                            Vendor = rawVendor,
                            Location = rawLoc,
                            Client = rawClient,
                            ServiceType = rawSType,
                            PercentageType = rawPType
                        };
                        summary.Rows.Add(rowResult);

                        if (string.IsNullOrWhiteSpace(rawVendor) || !vendorMap.TryGetValue(rawVendor, out string? resolvedVendorId))
                        {
                            rowResult.IsSuccess = false;
                            rowResult.Status = "Failed";
                            rowResult.Message = string.IsNullOrWhiteSpace(rawVendor) ? "Vendor is required." : $"Vendor '{rawVendor}' not found in active master.";
                            continue;
                        }

                        if (string.IsNullOrWhiteSpace(rawLoc) || !locationMap.TryGetValue(rawLoc, out string? resolvedLocId))
                        {
                            rowResult.IsSuccess = false;
                            rowResult.Status = "Failed";
                            rowResult.Message = string.IsNullOrWhiteSpace(rawLoc) ? "Location is required." : $"Location '{rawLoc}' not found in active master.";
                            continue;
                        }

                        if (string.IsNullOrWhiteSpace(rawClient) || !clientMap.TryGetValue(rawClient, out string? resolvedClientId))
                        {
                            rowResult.IsSuccess = false;
                            rowResult.Status = "Failed";
                            rowResult.Message = string.IsNullOrWhiteSpace(rawClient) ? "Client is required." : $"Client '{rawClient}' not found in active master.";
                            continue;
                        }

                        string sTypeNorm = "Flat";
                        if (!string.IsNullOrWhiteSpace(rawSType))
                        {
                            if (rawSType.IndexOf("percent", StringComparison.OrdinalIgnoreCase) >= 0)
                                sTypeNorm = "Percentage";
                            else if (rawSType.IndexOf("flat", StringComparison.OrdinalIgnoreCase) >= 0)
                                sTypeNorm = "Flat";
                            else
                            {
                                rowResult.IsSuccess = false;
                                rowResult.Status = "Failed";
                                rowResult.Message = "Service Type must be either 'Flat' or 'Percentage'.";
                                continue;
                            }
                        }

                        string pTypeNorm = "";
                        if (sTypeNorm == "Percentage")
                        {
                            if (string.IsNullOrWhiteSpace(rawPType))
                            {
                                rowResult.IsSuccess = false;
                                rowResult.Status = "Failed";
                                rowResult.Message = "Percentage of (CTC or Gross) is required when Service Type is Percentage.";
                                continue;
                            }
                            if (rawPType.IndexOf("gross", StringComparison.OrdinalIgnoreCase) >= 0)
                                pTypeNorm = "Gross";
                            else if (rawPType.IndexOf("ctc", StringComparison.OrdinalIgnoreCase) >= 0)
                                pTypeNorm = "CTC";
                            else
                            {
                                rowResult.IsSuccess = false;
                                rowResult.Status = "Failed";
                                rowResult.Message = "Percentage of must be 'CTC' or 'Gross'.";
                                continue;
                            }
                        }

                        if (!decimal.TryParse(rawCharge, out decimal chargeVal) || chargeVal < 0)
                        {
                            rowResult.IsSuccess = false;
                            rowResult.Status = "Failed";
                            rowResult.Message = "Service Charge must be a valid non-negative number.";
                            continue;
                        }
                        rowResult.ServiceCharge = chargeVal;

                        string comboKey = $"{resolvedVendorId}_{resolvedLocId}_{resolvedClientId}";
                        if (seenCombinations.Contains(comboKey))
                        {
                            rowResult.IsSuccess = false;
                            rowResult.Status = "Failed";
                            rowResult.Message = "Duplicate record within the same upload file.";
                            continue;
                        }
                        seenCombinations.Add(comboKey);

                        validRows.Add((rIdx, resolvedVendorId, resolvedLocId, resolvedClientId, sTypeNorm, pTypeNorm, chargeVal, rowResult));
                    }

                    if (validRows.Count > 0)
                    {
                        var xmlElements = validRows.Select(v =>
                            new System.Xml.Linq.XElement("VendorService",
                                new System.Xml.Linq.XElement("RowNumber", v.rowNum),
                                new System.Xml.Linq.XElement("VendorID", v.vendorId),
                                new System.Xml.Linq.XElement("LocationID", v.locId),
                                new System.Xml.Linq.XElement("ClientID", v.clientId),
                                new System.Xml.Linq.XElement("ServiceType", v.sType),
                                new System.Xml.Linq.XElement("PercentageType", v.pType),
                                new System.Xml.Linq.XElement("ServiceCharge", v.charge)
                            )
                        );
                        var doc = new System.Xml.Linq.XDocument(new System.Xml.Linq.XElement("NewDataSet", xmlElements));

                        DynamicParameters dynamicParameters = new DynamicParameters();
                        dynamicParameters.Add("@Doc", doc.ToString(), DbType.Xml);
                        dynamicParameters.Add("@fk_companyId", companyId ?? "", DbType.String);
                        dynamicParameters.Add("@fk_userId", userId ?? "", DbType.String);

                        var dbResults = DataBaseFactory.QuerySP<dynamic>("USP_Vendor_Service_Master_BulkIns", dynamicParameters, "VendorService_BulkIns")?.ToList();

                        if (dbResults != null)
                        {
                            var dbResultDict = new Dictionary<int, (bool isSuccess, string message)>();
                            foreach (var d in dbResults)
                            {
                                IDictionary<string, object> dMap = (IDictionary<string, object>)d;
                                int rowNo = Convert.ToInt32(dMap["RowNumber"]);
                                bool isSuccess = Convert.ToBoolean(dMap["IsSuccess"]);
                                string msg = dMap.ContainsKey("Message") && dMap["Message"] != null ? dMap["Message"].ToString()! : "";
                                dbResultDict[rowNo] = (isSuccess, msg);
                            }

                            foreach (var v in validRows)
                            {
                                if (dbResultDict.TryGetValue(v.rowNum, out var dbStatus))
                                {
                                    v.resultItem.IsSuccess = dbStatus.isSuccess;
                                    v.resultItem.Status = dbStatus.isSuccess ? "Uploaded" : "Failed";
                                    v.resultItem.Message = dbStatus.message;
                                }
                                else
                                {
                                    v.resultItem.IsSuccess = true;
                                    v.resultItem.Status = "Uploaded";
                                    v.resultItem.Message = "Uploaded successfully";
                                }
                            }
                        }
                    }

                    summary.TotalCount = summary.Rows.Count;
                    summary.UploadedCount = summary.Rows.Count(r => r.IsSuccess);
                    summary.FailedCount = summary.Rows.Count(r => !r.IsSuccess);

                    return summary;
                }
                catch (Exception ex)
                {
                    Console.WriteLine("Error in UploadExcelAsync: " + ex.Message);
                    foreach (var r in summary.Rows.Where(r => string.IsNullOrEmpty(r.Status)))
                    {
                        r.IsSuccess = false;
                        r.Status = "Failed";
                        r.Message = ex.Message;
                    }
                    summary.TotalCount = summary.Rows.Count;
                    summary.UploadedCount = summary.Rows.Count(r => r.IsSuccess);
                    summary.FailedCount = summary.Rows.Count(r => !r.IsSuccess);
                    return summary;
                }
            });
        }
        public async Task<Result> InsertVendorServiceAsync(VendorServiceModel model, string userId, string locationId, string companyId)
        {
            return await Task.Run(() =>
            {
                try
                {
                    VendorServiceDataSet dataset = new VendorServiceDataSet
                    {
                        VendorService = model
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
                    dynamicParameters.Add("@fk_locId", locationId ?? "", DbType.String);

                    var result = DataBaseFactory.QuerySP<VendorServiceSpResult>("USP_Vendor_Service_Master_Ins", dynamicParameters, "VendorServiceMaster_Ins");
                    var first = result?.FirstOrDefault();

                    if (first != null && first.IsSuccess == 1)
                    {
                        return new Result { IsSuccessfull = true, Message = first.Message ?? "Vendor service master added successfully." };
                    }

                    return new Result { IsSuccessfull = false, Message = first?.Message ?? "Failed to add vendor service master." };
                }
                catch (Exception ex)
                {
                    return new Result { IsSuccessfull = false, Message = ex.Message };
                }
            });
        }

        public async Task<Result> UpdateVendorServiceAsync(VendorServiceModel model, string userId, string locationId, string companyId)
        {
            return await Task.Run(() =>
            {
                try
                {
                    VendorServiceDataSet dataset = new VendorServiceDataSet
                    {
                        VendorService = model
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
                    dynamicParameters.Add("@fk_locId", locationId ?? "", DbType.String);

                    var result = DataBaseFactory.QuerySP<VendorServiceSpResult>("USP_Vendor_Service_Master_Upd", dynamicParameters, "VendorServiceMaster_Upd");
                    var first = result?.FirstOrDefault();

                    if (first != null && first.IsSuccess == 1)
                    {
                        return new Result { IsSuccessfull = true, Message = first.Message ?? "Vendor service master updated successfully." };
                    }

                    return new Result { IsSuccessfull = false, Message = first?.Message ?? "Failed to update vendor service master." };
                }
                catch (Exception ex)
                {
                    return new Result { IsSuccessfull = false, Message = ex.Message };
                }
            });
        }

        public async Task<Result> DeleteVendorServiceAsync(long id, string userId, string companyId)
        {
            return await Task.Run(() =>
            {
                try
                {
                    DynamicParameters dynamicParameters = new DynamicParameters();
                    dynamicParameters.Add("@PK_VendorServiceID", id, DbType.Int64);
                    dynamicParameters.Add("@fk_userId", userId ?? "", DbType.String);
                    dynamicParameters.Add("@fk_companyId", companyId ?? "", DbType.String);

                    var result = DataBaseFactory.QuerySP<VendorServiceSpResult>("USP_Vendor_Service_Master_Del", dynamicParameters, "VendorServiceMaster_Del");
                    var first = result?.FirstOrDefault();

                    if (first != null && first.IsSuccess == 1)
                    {
                        return new Result { IsSuccessfull = true, Message = first.Message ?? "Vendor service master deleted successfully." };
                    }

                    return new Result { IsSuccessfull = false, Message = first?.Message ?? "Failed to delete vendor service master." };
                }
                catch (Exception ex)
                {
                    return new Result { IsSuccessfull = false, Message = ex.Message };
                }
            });
        }

        public async Task<VendorServiceModel?> GetVendorServiceByIdAsync(long id, string companyId)
        {
            return await Task.Run(() =>
            {
                try
                {
                    DynamicParameters dynamicParameters = new DynamicParameters();
                    dynamicParameters.Add("@PK_VendorServiceID", id, DbType.Int64);
                    dynamicParameters.Add("@fk_companyId", companyId ?? "", DbType.String);

                    var result = DataBaseFactory.QuerySP<VendorServiceModel>("USP_Vendor_Service_Master_GetById", dynamicParameters, "VendorServiceMaster_GetById");
                    return result?.FirstOrDefault();
                }
                catch (Exception ex)
                {
                    Console.WriteLine("Error in GetVendorServiceByIdAsync: " + ex.Message);
                    return null;
                }
            });
        }

        public async Task<(int totalCount, IEnumerable<VendorServiceModel> list)> GetVendorServiceListAsync(VendorServiceFilterDto filter, string companyId)
        {
            return await Task.Run(() =>
            {
                try
                {
                    DynamicParameters dynamicParameters = new DynamicParameters();
                    dynamicParameters.Add("@pageIndex", filter.PageIndex > 0 ? filter.PageIndex : 1, DbType.Int32);
                    dynamicParameters.Add("@pageSize", filter.PageSize > 0 ? filter.PageSize : 10, DbType.Int32);
                    dynamicParameters.Add("@searchTerm", filter.SearchTerm ?? "", DbType.String);
                    dynamicParameters.Add("@vendorId", string.IsNullOrWhiteSpace(filter.VendorID) ? null : filter.VendorID.Trim(), DbType.String);
                    dynamicParameters.Add("@locationId", string.IsNullOrWhiteSpace(filter.LocationID) ? null : filter.LocationID.Trim(), DbType.String);
                    dynamicParameters.Add("@clientId", string.IsNullOrWhiteSpace(filter.ClientID) ? null : filter.ClientID.Trim(), DbType.String);
                    dynamicParameters.Add("@fk_companyId", companyId ?? "", DbType.String);

                    var tuple = DataBaseFactory.QueryMultipleSP<dynamic, VendorServiceModel>("USP_Vendor_Service_Master_SelForGrid", dynamicParameters, "VendorServiceMaster_GetAll");

                    if (tuple == null || tuple.Item2 == null)
                        return (0, Enumerable.Empty<VendorServiceModel>());

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
                    Console.WriteLine("Error in GetVendorServiceListAsync: " + ex.Message);
                    return (0, Enumerable.Empty<VendorServiceModel>());
                }
            });
        }

        public async Task<IEnumerable<VendorServiceDropdownItem>> GetVendorsDropdownAsync(string companyId)
        {
            return await Task.Run(() =>
            {
                try
                {
                    DynamicParameters dynamicParameters = new DynamicParameters();
                    dynamicParameters.Add("@fk_companyId", companyId ?? "", DbType.String);

                    var result = DataBaseFactory.QuerySP<VendorServiceDropdownItem>("USP_Vendor_Service_GetVendors", dynamicParameters, "VendorService_GetVendors");
                    return result?.ToList() ?? new List<VendorServiceDropdownItem>();
                }
                catch (Exception ex)
                {
                    Console.WriteLine("Error in GetVendorsDropdownAsync: " + ex.Message);
                    return new List<VendorServiceDropdownItem>();
                }
            });
        }

        public async Task<IEnumerable<VendorServiceDropdownItem>> GetLocationsDropdownAsync(string companyId)
        {
            return await Task.Run(() =>
            {
                try
                {
                    DynamicParameters dynamicParameters = new DynamicParameters();
                    dynamicParameters.Add("@fk_companyId", companyId ?? "", DbType.String);

                    var result = DataBaseFactory.QuerySP<VendorServiceDropdownItem>("USP_Vendor_Service_GetLocations", dynamicParameters, "VendorService_GetLocations");
                    return result?.ToList() ?? new List<VendorServiceDropdownItem>();
                }
                catch (Exception ex)
                {
                    Console.WriteLine("Error in GetLocationsDropdownAsync: " + ex.Message);
                    return new List<VendorServiceDropdownItem>();
                }
            });
        }

        public async Task<IEnumerable<VendorServiceDropdownItem>> GetClientsDropdownAsync(string companyId)
        {
            return await Task.Run(() =>
            {
                try
                {
                    DynamicParameters dynamicParameters = new DynamicParameters();
                    dynamicParameters.Add("@fk_companyId", companyId ?? "", DbType.String);

                    var result = DataBaseFactory.QuerySP<VendorServiceDropdownItem>("USP_Vendor_Service_GetClients", dynamicParameters, "VendorService_GetClients");
                    return result?.ToList() ?? new List<VendorServiceDropdownItem>();
                }
                catch (Exception ex)
                {
                    Console.WriteLine("Error in GetClientsDropdownAsync: " + ex.Message);
                    return new List<VendorServiceDropdownItem>();
                }
            });
        }
    }
}
