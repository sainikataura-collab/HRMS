using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using static Dapper.SqlMapper;

namespace HRMSWebAPI.Repository
{
    public class CustomerRateCardRepository : ICustomerRateCardRepository
    {
        private readonly IConfiguration _configuration;

        public CustomerRateCardRepository(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<Result> InsertRateCardAsync(CustomerRateCardMasterDTO model, string userId, string companyId)
        {
            try
            {
                model.fk_CompanyId = companyId;
                model.EntryBy = userId;

                string xmlData = XmlUtility.XmlSerializeToString(model);

                DynamicParameters parameters = new DynamicParameters();
                parameters.Add("@xmlDoc", xmlData, DbType.String);
                parameters.Add("@NewRateCardId", dbType: DbType.Int32, direction: ParameterDirection.Output);

                await DataBaseFactory.QuerySPAsync<dynamic>("Usp_Customer_RateCard_Insert", parameters, "CustomerRateCard_Insert");

                int newRateCardId = parameters.Get<int>("@NewRateCardId");

                return new Result
                {
                    IsSuccessfull = newRateCardId > 0,
                    Message = newRateCardId > 0 ? "Rate card created successfully." : "Failed to create rate card."
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

        public async Task<Result> UpdateRateCardAsync(CustomerRateCardMasterDTO model, string userId, string companyId)
        {
            try
            {
                model.fk_CompanyId = companyId;
                model.UpdateBy = userId;

                string xmlData = XmlUtility.XmlSerializeToString(model);

                DynamicParameters parameters = new DynamicParameters();
                parameters.Add("@xmlDoc", xmlData, DbType.String);

                await DataBaseFactory.QuerySPAsync<dynamic>("Usp_Customer_RateCard_Update", parameters, "CustomerRateCard_Update");

                return new Result
                {
                    IsSuccessfull = true,
                    Message = "Rate card updated successfully."
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

        public async Task<CustomerRateCardMasterDTO?> GetRateCardByIdAsync(int rateCardId, string companyId)
        {
            try
            {
                DynamicParameters parameters = new DynamicParameters();
                parameters.Add("@RateCardId", rateCardId, DbType.Int32);
                parameters.Add("@fk_CompanyId", companyId, DbType.String);

                var tuple = DataBaseFactory.QueryMultipleSP<CustomerRateCardMasterDTO, CustomerRateCardDetailsDTO>(
                    "Usp_Customer_RateCard_GetById", parameters, "CustomerRateCard_GetById");

                var master = tuple?.Item1?.FirstOrDefault();
                if (master != null)
                {
                    master.Details = tuple?.Item2?.ToList() ?? new List<CustomerRateCardDetailsDTO>();
                }

                return master;
            }
            catch (Exception)
            {
                return null;
            }
        }

        public async Task<(int totalCount, IEnumerable<dynamic> list)> GetAllRateCardsAsync(int pageIndex, int pageSize, string companyId, string? searchTerm = "")
        {
            try
            {
                DynamicParameters parameters = new DynamicParameters();
                parameters.Add("@pageindex", pageIndex, DbType.Int32);
                parameters.Add("@pagesize", pageSize, DbType.Int32);
                parameters.Add("@fk_CompanyId", companyId, DbType.String);
                parameters.Add("@searchTerm", searchTerm ?? "", DbType.String);

                //var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic>(
                //    "Usp_Customer_RateCard_GetList", parameters, "CustomerRateCard_GetList");

        
                //int totalCount = tuple?.Item1?.FirstOrDefault();
                //var list = tuple?.Item2?.ToList();
                //return (totalCount, list);



                var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic>("Usp_Customer_RateCard_GetList", parameters, "Usp_Customer_RateCard_GetList");
                if (tuple == null || tuple.Item2 == null) return (0, []);
                //Convert Total Count
                int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                    ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

                return (totalCount, tuple?.Item2?.ToList());




            }
            catch (Exception)
            {
                return (0, Enumerable.Empty<dynamic>());
            }
        }

        public async Task<Result> DeleteRateCardAsync(int rateCardId, string companyId, string deleteBy)
        {
            try
            {
                DynamicParameters parameters = new DynamicParameters();
                parameters.Add("@RateCardId", rateCardId, DbType.Int32);
                parameters.Add("@fk_CompanyId", companyId, DbType.String);
                parameters.Add("@DeleteBy", deleteBy, DbType.String);

                await DataBaseFactory.QuerySPAsync<dynamic>("Usp_Customer_RateCard_Delete", parameters, "CustomerRateCard_Delete");

                return new Result
                {
                    IsSuccessfull = true,
                    Message = "Rate card deleted successfully."
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

        public async Task<IEnumerable<dynamic>> GetEarningHeadsAsync(string companyId)
        {
            try
            {
                DynamicParameters parameters = new DynamicParameters();
                parameters.Add("@fk_CompanyId", companyId, DbType.String);
                var result = await DataBaseFactory.QuerySPAsync<dynamic>("Usp_Customer_RateCard_GetEarningHeads", parameters, "CustomerRateCard_GetEarningHeads");
                return result;
            }
            catch (Exception)
            {
                return Enumerable.Empty<dynamic>();
            }
        }

        public async Task<List<Dictionary<string, object>>> UploadCustomerRateCardExcelAsync(IFormFile file, string companyId, string userId)
        {
            var resultList = new List<Dictionary<string, object>>();
            if (file == null || file.Length == 0) return resultList;

            try
            {
                using var stream = file.OpenReadStream();
                using var workbook = new ClosedXML.Excel.XLWorkbook(stream);
                var worksheet = workbook.Worksheets.FirstOrDefault();
                if (worksheet == null) return resultList;

                var headerRow = worksheet.Row(1);
                var colMap = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
                var originalHeaders = new Dictionary<int, string>();
                
                foreach (var cell in headerRow.CellsUsed())
                {
                    string headerText = cell.GetValue<string>().Trim();
                    if (!string.IsNullOrEmpty(headerText))
                    {
                        colMap[headerText.Replace(" ", "").ToLowerInvariant()] = cell.Address.ColumnNumber;
                        originalHeaders[cell.Address.ColumnNumber] = headerText;
                    }
                }

                var masterCols = new[] { "customername", "locationname", "categoryname", "servicetypename", "workdurationname" };
                var headCols = colMap.Where(kvp => !masterCols.Contains(kvp.Key)).ToDictionary(kvp => kvp.Key, kvp => kvp.Value);

                var rows = worksheet.RowsUsed().Skip(1); // Skip Header

                var xmlBuilder = new System.Text.StringBuilder();
                xmlBuilder.Append("<Uploads>");

                int rowIndex = 1;
                foreach (var row in rows)
                {
                    bool hasData = false;
                    var rowDict = new Dictionary<string, object>();
                    rowDict["RowIndex"] = rowIndex;

                    foreach(var header in originalHeaders)
                    {
                        string val = row.Cell(header.Key).GetValue<string>()?.Trim() ?? "";
                        rowDict[header.Value] = val;
                        if (!string.IsNullOrEmpty(val)) hasData = true;
                    }

                    if (!hasData) continue; // Skip empty rows

                    string customerName = rowDict.ContainsKey("CustomerName") ? rowDict["CustomerName"]?.ToString() ?? "" : "";
                    string locationName = rowDict.ContainsKey("LocationName") ? rowDict["LocationName"]?.ToString() ?? "" : "";
                    string categoryName = rowDict.ContainsKey("CategoryName") ? rowDict["CategoryName"]?.ToString() ?? "" : "";
                    string serviceTypeName = rowDict.ContainsKey("ServiceTypeName") ? rowDict["ServiceTypeName"]?.ToString() ?? "" : "";
                    string workDurationName = rowDict.ContainsKey("WorkDurationName") ? rowDict["WorkDurationName"]?.ToString() ?? "" : "";

                    xmlBuilder.Append($"<Row>");
                    xmlBuilder.Append($"<RowIndex>{rowIndex}</RowIndex>");
                    xmlBuilder.Append($"<CustomerName>{System.Security.SecurityElement.Escape(customerName)}</CustomerName>");
                    xmlBuilder.Append($"<LocationName>{System.Security.SecurityElement.Escape(locationName)}</LocationName>");
                    xmlBuilder.Append($"<CategoryName>{System.Security.SecurityElement.Escape(categoryName)}</CategoryName>");
                    xmlBuilder.Append($"<ServiceTypeName>{System.Security.SecurityElement.Escape(serviceTypeName)}</ServiceTypeName>");
                    xmlBuilder.Append($"<WorkDurationName>{System.Security.SecurityElement.Escape(workDurationName)}</WorkDurationName>");

                    bool hasInvalidAmount = false;
                    xmlBuilder.Append("<Heads>");
                    foreach(var headCol in headCols)
                    {
                        string headName = originalHeaders[headCol.Value];
                        string amtStr = rowDict.ContainsKey(headName) ? rowDict[headName]?.ToString() ?? "" : "";
                        if (!string.IsNullOrEmpty(amtStr) && amtStr != "0")
                        {
                            if (decimal.TryParse(amtStr, out decimal parsedAmt))
                            {
                                xmlBuilder.Append($"<Head><HeadName>{System.Security.SecurityElement.Escape(headName)}</HeadName><Amount>{parsedAmt}</Amount></Head>");
                            }
                            else
                            {
                                hasInvalidAmount = true;
                                break;
                            }
                        }
                    }
                    xmlBuilder.Append("</Heads>");
                    xmlBuilder.Append($"</Row>");

                    if (hasInvalidAmount)
                    {
                        rowDict["IsSuccess"] = false;
                        rowDict["Status"] = "Failed";
                        rowDict["Message"] = "Invalid numerical amount provided for one of the earning heads.";
                    }

                    resultList.Add(rowDict);
                    rowIndex++;
                }
                xmlBuilder.Append("</Uploads>");

                // Only call SP if there are rows without early validation errors
                if (resultList.Any(r => !r.ContainsKey("IsSuccess")))
                {
                    DynamicParameters parameters = new DynamicParameters();
                    parameters.Add("@xmlDoc", xmlBuilder.ToString(), DbType.String);
                    parameters.Add("@CompanyId", companyId, DbType.String);
                    parameters.Add("@EntryBy", userId, DbType.String);

                    var spResults = await DataBaseFactory.QuerySPAsync<dynamic>("Usp_Customer_RateCard_Upload_XML", parameters, "CustomerRateCard_Upload");

                    // Map SP results back to resultList
                    foreach (var spRes in spResults)
                    {
                        int rIdx = spRes.RowIndex;
                        var matchingRow = resultList.FirstOrDefault(r => (int)r["RowIndex"] == rIdx);
                        if (matchingRow != null && !matchingRow.ContainsKey("IsSuccess"))
                        {
                            matchingRow["IsSuccess"] = (bool)spRes.IsSuccess;
                            matchingRow["Status"] = (bool)spRes.IsSuccess ? "Uploaded" : "Failed";
                            matchingRow["Message"] = spRes.Message?.ToString() ?? "";
                        }
                    }
                }

                // Append Results Sheet and Save
                var resultSheet = workbook.Worksheets.Add("Results");
                int rRow = 1;
                int rCol = 1;
                resultSheet.Cell(rRow, rCol++).Value = "Status";
                resultSheet.Cell(rRow, rCol++).Value = "Message";
                foreach(var h in originalHeaders.Values)
                {
                    resultSheet.Cell(rRow, rCol++).Value = h;
                }

                rRow++;
                foreach (var rowDict in resultList)
                {
                    rCol = 1;
                    resultSheet.Cell(rRow, rCol++).Value = rowDict.ContainsKey("Status") ? rowDict["Status"].ToString() : "";
                    resultSheet.Cell(rRow, rCol++).Value = rowDict.ContainsKey("Message") ? rowDict["Message"].ToString() : "";
                    foreach (var h in originalHeaders.Values)
                    {
                        resultSheet.Cell(rRow, rCol++).Value = rowDict.ContainsKey(h) ? rowDict[h].ToString() : "";
                    }
                    rRow++;
                }

                // Create physical path
                var uploadsFolder = _configuration["AppSettings:CustomerRateCardUploads"];
                if (string.IsNullOrEmpty(uploadsFolder))
                {
                    uploadsFolder = System.IO.Path.Combine(System.IO.Directory.GetCurrentDirectory(), "CustomerRateCardUploads");
                }
                if (!System.IO.Directory.Exists(uploadsFolder)) System.IO.Directory.CreateDirectory(uploadsFolder);
                var fileNameWithoutExt = System.IO.Path.GetFileNameWithoutExtension(file.FileName);
                var savedFileName = $"{fileNameWithoutExt}_{DateTime.Now:ddMMyyyy_HHmmss}.xlsx";
                var physicalPath = System.IO.Path.Combine(uploadsFolder, savedFileName);

                workbook.SaveAs(physicalPath);
            }
            catch (Exception ex)
            {
                throw new Exception($"Error processing Excel file: {ex.Message}");
            }

            return resultList;
        }

        public async Task<MinimumWageResponseDTO?> GetMinimumWageByLocationAndCategoryAsync(string locationId, string categoryId, string companyId)
        {
            try
            {
                DynamicParameters parameters = new DynamicParameters();
                parameters.Add("@locationId", locationId, DbType.String);
                parameters.Add("@categoryId", categoryId, DbType.String);
                parameters.Add("@fk_companyId", companyId, DbType.String);

                var tuple = DataBaseFactory.QueryMultipleSP<MinimumWageResponseDTO, MinimumWageHeadDTO>(
                    "Usp_Customer_RateCard_GetMinimumWage", parameters, "CustomerRateCard_GetMinimumWage");

                var response = tuple?.Item1?.FirstOrDefault() ?? new MinimumWageResponseDTO
                {
                    CategoryId = categoryId,
                    MinimumWages = 0,
                    Heads = new List<MinimumWageHeadDTO>()
                };

                response.Heads = tuple?.Item2?.ToList() ?? new List<MinimumWageHeadDTO>();
                return response;
            }
            catch (Exception)
            {
                return null;
            }
        }

        public async Task<List<NameValue>> GetLocationsByCustomerAsync(long customerId, string companyId)
        {
            try
            {
                DynamicParameters parameters = new DynamicParameters();
                parameters.Add("@CustomerId", customerId, DbType.Int64);
                parameters.Add("@CompanyId", companyId, DbType.String);

                var result = await DataBaseFactory.QuerySPAsync<NameValue>(
                    "Usp_Customer_RateCard_GetLocationsByCustomer", parameters, "CustomerRateCard_GetLocationsByCustomer");

                return result?.ToList() ?? new List<NameValue>();
            }
            catch (Exception)
            {
                return new List<NameValue>();
            }
        }
    }
}
