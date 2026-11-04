using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class VendorLiteRepository : IVendorLiteRepository
    {
        // ── INSERT ──────────────────────────────────────────────────────────────
        public async Task<VendorLiteResponseModel> InsertVendorLiteAsync(
            VendorLiteModel model, string userId, string companyId, string locationId)
        {
            try
            {
                SanitizeModel(model);
                string xmlData = XmlUtility.XmlSerializeToString(model);

                var p = new DynamicParameters();
                p.Add("@xmlDoc",       xmlData,    DbType.Xml);
                p.Add("@fk_companyId", companyId,  DbType.String);
                p.Add("@fk_userId",    userId,     DbType.String);
                p.Add("@fk_locId",     locationId, DbType.String);

                var result = DataBaseFactory.QuerySP<VendorLiteResponseModel>(
                    "VendorLite_Ins", p, "VendorLite_Ins").FirstOrDefault();

                return result ?? new VendorLiteResponseModel
                {
                    IsSuccessfully = false,
                    IsMessage = "Failed to insert vendor."
                };
            }
            catch (Exception ex)
            {
                return new VendorLiteResponseModel { IsSuccessfully = false, IsMessage = ex.Message };
            }
        }

        // ── UPDATE ──────────────────────────────────────────────────────────────
        public async Task<VendorLiteResponseModel> UpdateVendorLiteAsync(
            VendorLiteModel model, string userId, string companyId)
        {
            try
            {
                SanitizeModel(model);
                string xmlData = XmlUtility.XmlSerializeToString(model);

                var p = new DynamicParameters();
                p.Add("@xmlDoc",       xmlData,   DbType.Xml);
                p.Add("@fk_companyId", companyId, DbType.String);
                p.Add("@fk_userId",    userId,    DbType.String);

                var result = DataBaseFactory.QuerySP<VendorLiteResponseModel>(
                    "VendorLite_Upd", p, "VendorLite_Upd").FirstOrDefault();

                return result ?? new VendorLiteResponseModel
                {
                    IsSuccessfully = false,
                    IsMessage = "Failed to update vendor."
                };
            }
            catch (Exception ex)
            {
                return new VendorLiteResponseModel { IsSuccessfully = false, IsMessage = ex.Message };
            }
        }

        private void SanitizeModel(VendorLiteModel m)
        {
            if (m == null) return;
            m.Vendor_Name = string.IsNullOrWhiteSpace(m.Vendor_Name) ? null : m.Vendor_Name.Trim();
            m.Vendor_ContactNo = string.IsNullOrWhiteSpace(m.Vendor_ContactNo) ? null : m.Vendor_ContactNo.Trim();
            m.Vendor_Address = string.IsNullOrWhiteSpace(m.Vendor_Address) ? null : m.Vendor_Address.Trim();
            m.Vendor_FKStateId = string.IsNullOrWhiteSpace(m.Vendor_FKStateId) ? null : m.Vendor_FKStateId.Trim();
            m.Vendor_FKCityId = string.IsNullOrWhiteSpace(m.Vendor_FKCityId) ? null : m.Vendor_FKCityId.Trim();
            m.Vendor_PermanentAddress = string.IsNullOrWhiteSpace(m.Vendor_PermanentAddress) ? null : m.Vendor_PermanentAddress.Trim();
            m.Vendor_FKPermStateId = string.IsNullOrWhiteSpace(m.Vendor_FKPermStateId) ? null : m.Vendor_FKPermStateId.Trim();
            m.Vendor_FKPermCityId = string.IsNullOrWhiteSpace(m.Vendor_FKPermCityId) ? null : m.Vendor_FKPermCityId.Trim();
            m.Vendor_FKBankId = string.IsNullOrWhiteSpace(m.Vendor_FKBankId) ? null : m.Vendor_FKBankId.Trim();
            m.Vendor_AccountNo = string.IsNullOrWhiteSpace(m.Vendor_AccountNo) ? null : m.Vendor_AccountNo.Trim();
            m.Vendor_IFSCCode = string.IsNullOrWhiteSpace(m.Vendor_IFSCCode) ? null : m.Vendor_IFSCCode.Trim();
            m.Vendor_PanNo = string.IsNullOrWhiteSpace(m.Vendor_PanNo) ? null : m.Vendor_PanNo.Trim();
            m.Vendor_AaddharNo = string.IsNullOrWhiteSpace(m.Vendor_AaddharNo) ? null : m.Vendor_AaddharNo.Trim();
            m.Vendor_GSTNo = string.IsNullOrWhiteSpace(m.Vendor_GSTNo) ? null : m.Vendor_GSTNo.Trim();
            m.Vendor_Location = string.IsNullOrWhiteSpace(m.Vendor_Location) ? null : m.Vendor_Location.Trim();
            m.Vendor_Services = string.IsNullOrWhiteSpace(m.Vendor_Services) ? null : m.Vendor_Services.Trim();
            m.Vendor_ContractStartDate = string.IsNullOrWhiteSpace(m.Vendor_ContractStartDate) ? null : m.Vendor_ContractStartDate.Trim();
            m.Vendor_ContractEndDate = string.IsNullOrWhiteSpace(m.Vendor_ContractEndDate) ? null : m.Vendor_ContractEndDate.Trim();
            m.Vendor_ServiceType = string.IsNullOrWhiteSpace(m.Vendor_ServiceType) ? null : m.Vendor_ServiceType.Trim();
        }

        // ── GET BY ID ────────────────────────────────────────────────────────────
        public async Task<VendorLiteModel?> GetVendorLiteByIdAsync(string pk_recId)
        {
            try
            {
                var p = new DynamicParameters();
                p.Add("@pk_recId", pk_recId, DbType.String);

                return DataBaseFactory.QuerySP<VendorLiteModel>(
                    "VendorLite_GetById", p, "VendorLite_GetById").FirstOrDefault();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error in GetVendorLiteByIdAsync: " + ex.Message);
                return null;
            }
        }

        // ── GET ALL (GRID) ───────────────────────────────────────────────────────
        public async Task<(int totalCount, IEnumerable<VendorLiteModel> vendors)> GetAllVendorLiteAsync(
            int pageIndex, int pageSize, string companyId, string searchTerm)
        {
            try
            {
                var p = new DynamicParameters();
                p.Add("@pageIndex",    pageIndex,  DbType.Int32);
                p.Add("@pageSize",     pageSize,   DbType.Int32);
                p.Add("@fk_companyId", companyId,  DbType.String);
                p.Add("@searchTerm",   searchTerm, DbType.String);

                var tuple = DataBaseFactory.QueryMultipleSP<dynamic, VendorLiteModel>(
                    "VendorLite_SelForGrid", p, "VendorLite_SelForGrid");

                if (tuple == null || tuple.Item2 == null)
                    return (0, Enumerable.Empty<VendorLiteModel>());

                int totalCount = 0;
                if (tuple.Item1 is IEnumerable<dynamic> countList && countList.Any())
                {
                    var firstRow = (IDictionary<string, object>)countList.First();
                    if (firstRow.ContainsKey("TotalCount"))
                        totalCount = Convert.ToInt32(firstRow["TotalCount"]);
                }

                return (totalCount, tuple.Item2.ToList());
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error in GetAllVendorLiteAsync: " + ex.Message);
                return (0, Enumerable.Empty<VendorLiteModel>());
            }
        }

        // ── SAVE DOCUMENT ────────────────────────────────────────────────────────
        public async Task<VendorLiteResponseModel> SaveVendorDocumentAsync(
            VendorDocumentModel doc, string userId, string companyId)
        {
            try
            {
                string xmlData = XmlUtility.XmlSerializeToString(doc);

                var p = new DynamicParameters();
                p.Add("@xmlDoc",       xmlData,   DbType.Xml);
                p.Add("@fk_companyId", companyId, DbType.String);
                p.Add("@fk_userId",    userId,    DbType.String);

                var result = DataBaseFactory.QuerySP<VendorLiteResponseModel>(
                    "VendorDocument_Ins", p, "VendorDocument_Ins").FirstOrDefault();

                return result ?? new VendorLiteResponseModel
                {
                    IsSuccessfully = false,
                    IsMessage = "Document save failed."
                };
            }
            catch (Exception ex)
            {
                return new VendorLiteResponseModel { IsSuccessfully = false, IsMessage = ex.Message };
            }
        }

        // ── GET DOCUMENTS BY VENDOR ID ───────────────────────────────────────────
        public async Task<IEnumerable<VendorDocumentModel>> GetVendorDocumentsByVendorIdAsync(
            string vendorId)
        {
            try
            {
                var p = new DynamicParameters();
                p.Add("@fk_vendorId", vendorId, DbType.String);

                return DataBaseFactory.QuerySP<VendorDocumentModel>(
                    "VendorDocument_GetByVendorId", p, "VendorDocument_GetByVendorId")
                    ?? Enumerable.Empty<VendorDocumentModel>();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error in GetVendorDocumentsByVendorIdAsync: " + ex.Message);
                return Enumerable.Empty<VendorDocumentModel>();
            }
        }

        // ── DELETE DOCUMENT (soft) ───────────────────────────────────────────────
        public async Task<VendorLiteResponseModel> DeleteVendorDocumentAsync(
            long pk_docId, string userId)
        {
            try
            {
                var p = new DynamicParameters();
                p.Add("@pk_docId",  pk_docId, DbType.Int64);
                p.Add("@fk_userId", userId,   DbType.String);

                var result = DataBaseFactory.QuerySP<VendorLiteResponseModel>(
                    "VendorDocument_Del", p, "VendorDocument_Del").FirstOrDefault();

                return result ?? new VendorLiteResponseModel
                {
                    IsSuccessfully = false,
                    IsMessage = "Delete failed."
                };
            }
            catch (Exception ex)
            {
                return new VendorLiteResponseModel { IsSuccessfully = false, IsMessage = ex.Message };
            }
        }

        // ── GET DOCUMENT BY ID ───────────────────────────────────────────────────
        public async Task<VendorDocumentModel?> GetVendorDocumentByIdAsync(long pk_docId)
        {
            try
            {
                using var conn = DataBaseFactory.ConnString();
                var sql = "SELECT * FROM Vendor_Document WHERE pk_docId = @pk_docId AND IsActive = 1";
                return conn.QueryFirstOrDefault<VendorDocumentModel>(sql, new { pk_docId });
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error in GetVendorDocumentByIdAsync: " + ex.Message);
                return null;
            }
        }

        // ── UPLOAD VENDOR LOGO ───────────────────────────────────────────────────
        public async Task<bool> UploadVendorLogoAsync(string vendorId, string logoName)
        {
            try
            {
                DynamicParameters dynamicParameters = new DynamicParameters();
                dynamicParameters.Add("@VendorId", vendorId, DbType.String);
                dynamicParameters.Add("@LogoName", logoName, DbType.String);

                var result = DataBaseFactory.QuerySP("Vendor_Logo_Ins", dynamicParameters);
                return result > 0 || result == -1;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Upload Vendor Logo Error : " + ex.Message);
                throw;
            }
        }
    }
}
