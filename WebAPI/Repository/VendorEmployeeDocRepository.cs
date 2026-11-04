using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class VendorEmployeeDocRepository : IVendorEmployeeDocRepository
    {
        public async Task<(int totalCount, IEnumerable<VendorEmpDocSummaryModel> list)> GetVendorEmpDocListForVendorAsync(
            string vendorId, string companyId, string searchTerm, int pageIndex, int pageSize)
        {
            var p = new DynamicParameters();
            p.Add("@fk_vendorId",  vendorId,    DbType.String);
            p.Add("@fk_companyId", companyId,   DbType.String);
            p.Add("@searchTerm",   searchTerm,  DbType.String);
            p.Add("@pageIndex",    pageIndex,   DbType.Int32);
            p.Add("@pageSize",     pageSize,    DbType.Int32);

            var rows = (await DataBaseFactory.QuerySPAsync<VendorEmpDocSummaryModel>(
                "USP_Vendor_Emp_Doc_GetList_ForVendor", p, "GetVendorEmpDocListForVendor")).ToList();

            int totalCount = rows.FirstOrDefault()?.TotalCount ?? 0;
            return (totalCount, rows);
        }

        public async Task<(int totalCount, IEnumerable<VendorEmpDocSummaryModel> list)> GetVendorEmpDocListForHRAsync(
            string companyId, string vendorId, string locationId, string status, string searchTerm, int pageIndex, int pageSize)
        {
            var p = new DynamicParameters();
            p.Add("@fk_companyId", companyId,  DbType.String);
            p.Add("@fk_vendorId",  vendorId,   DbType.String);
            p.Add("@locationId",   locationId, DbType.String);
            p.Add("@status",       status,     DbType.String);
            p.Add("@searchTerm",   searchTerm, DbType.String);
            p.Add("@pageIndex",    pageIndex,  DbType.Int32);
            p.Add("@pageSize",     pageSize,   DbType.Int32);

            var rows = (await DataBaseFactory.QuerySPAsync<VendorEmpDocSummaryModel>(
                "USP_Vendor_Emp_Doc_GetList_ForHR", p, "GetVendorEmpDocListForHR")).ToList();

            int totalCount = rows.FirstOrDefault()?.TotalCount ?? 0;
            return (totalCount, rows);
        }

        public async Task<IEnumerable<VendorEmpDocSummaryModel>> ExportVendorEmpDocListForHRAsync(
            string companyId, string vendorId, string locationId, string status, string searchTerm)
        {
            try
            {
                var p = new DynamicParameters();
                p.Add("@fk_companyId", companyId,  DbType.String);
                p.Add("@fk_vendorId",  vendorId,   DbType.String);
                p.Add("@locationId",   locationId, DbType.String);
                p.Add("@status",       status,     DbType.String);
                p.Add("@searchTerm",   searchTerm, DbType.String);

                var rows = await DataBaseFactory.QuerySPAsync<VendorEmpDocSummaryModel>(
                    "USP_Vendor_Emp_Doc_ExportList_ForHR", p, "ExportVendorEmpDocListForHR");

                if (rows != null && rows.Any()) return rows;
            }
            catch (Exception ex)
            {
                Console.WriteLine("USP_Vendor_Emp_Doc_ExportList_ForHR fallback triggered: " + ex.Message);
            }

            // Safe fallback to GetVendorEmpDocListForHR with large page size
            var (_, fallbackRows) = await GetVendorEmpDocListForHRAsync(
                companyId, vendorId, locationId, status, searchTerm, 0, 100000);
            return fallbackRows ?? Enumerable.Empty<VendorEmpDocSummaryModel>();
        }

        public async Task<IEnumerable<VendorEmployeeDocModel>> GetDocsByEmpAndVendorAsync(string vendorId, string empId)
        {
            var p = new DynamicParameters();
            p.Add("@fk_vendorId", vendorId, DbType.String);
            p.Add("@fk_empId",    empId,    DbType.String);

            var rows = await DataBaseFactory.QuerySPAsync<VendorEmployeeDocModel>(
                "USP_Vendor_Emp_Doc_GetByEmpAndVendor", p, "GetDocsByEmpAndVendor");

            return rows;
        }

        public async Task<VendorEmpDocSaveResponse> SaveVendorEmployeeDocumentAsync(VendorEmployeeDocModel model, string userId, string companyId)
        {
            string xmlDoc = XmlUtility.XmlSerializeToString(model);
            var p = new DynamicParameters();
            p.Add("@xmlDoc",       xmlDoc,    DbType.Xml);
            p.Add("@fk_companyId", companyId, DbType.String);
            p.Add("@fk_userId",    userId,    DbType.String);

            var result = (await DataBaseFactory.QuerySPAsync<VendorEmpDocSaveResponse>(
                "USP_Vendor_Emp_Doc_Save", p, "SaveVendorEmployeeDocument")).FirstOrDefault();

            return result ?? new VendorEmpDocSaveResponse { IsSuccessfully = false, IsMessage = "Failed to save document." };
        }

        public async Task<VendorEmpDocSaveResponse> UpdateDocStatusAsync(long pk_docId, string status, string? remarks, string userId)
        {
            var p = new DynamicParameters();
            p.Add("@pk_docId",         pk_docId, DbType.Int64);
            p.Add("@status",           status,   DbType.String);
            p.Add("@rejectionRemarks", remarks,  DbType.String);
            p.Add("@fk_userId",        userId,   DbType.String);

            var result = (await DataBaseFactory.QuerySPAsync<VendorEmpDocSaveResponse>(
                "USP_Vendor_Emp_Doc_UpdateStatus", p, "UpdateDocStatus")).FirstOrDefault();

            return result ?? new VendorEmpDocSaveResponse { IsSuccessfully = false, IsMessage = "Failed to update document status." };
        }

        public async Task<VendorEmpDocSaveResponse> DeleteDocAsync(long pk_docId, string userId)
        {
            var p = new DynamicParameters();
            p.Add("@pk_docId",  pk_docId, DbType.Int64);
            p.Add("@fk_userId", userId,   DbType.String);

            var result = (await DataBaseFactory.QuerySPAsync<VendorEmpDocSaveResponse>(
                "USP_Vendor_Emp_Doc_Delete", p, "DeleteDoc")).FirstOrDefault();

            return result ?? new VendorEmpDocSaveResponse { IsSuccessfully = false, IsMessage = "Failed to remove document." };
        }

        public async Task<VendorEmployeeDocModel?> GetDocByIdAsync(long pk_docId)
        {
            var p = new DynamicParameters();
            p.Add("@pk_docId", pk_docId, DbType.Int64);

            var result = (await DataBaseFactory.QuerySPAsync<VendorEmployeeDocModel>(
                "USP_Vendor_Emp_Doc_GetById", p, "GetDocById")).FirstOrDefault();

            return result;
        }

        public async Task<string?> GetVendorIdByUserIdAsync(string userId, string companyId)
        {
            using var conn = DataBaseFactory.ConnString();
            var p = new DynamicParameters();
            p.Add("@userId",    userId,    DbType.String);
            p.Add("@companyId", companyId, DbType.String);

            string query = "SELECT ISNULL(fk_vendorId, '') FROM UM_Users_Mst WHERE pk_userId = @userId AND (fk_companyId = @companyId OR @companyId = '')";
            var result = await conn.QueryFirstOrDefaultAsync<string>(query, p);
            return result;
        }

        public async Task<string?> GetVendorIdByEmpIdAsync(string empId)
        {
            using var conn = DataBaseFactory.ConnString();
            var p = new DynamicParameters();
            p.Add("@empId", empId, DbType.String);

            string query = "SELECT TOP 1 ISNULL(vendorId, '') FROM SAL_Employee_Mst WHERE pk_empId = @empId OR empcode = @empId";
            var result = await conn.QueryFirstOrDefaultAsync<string>(query, p);
            return result;
        }

        public async Task<bool> IsUserVendorAsync(string userId, string companyId)
        {
            using var conn = DataBaseFactory.ConnString();
            var p = new DynamicParameters();
            p.Add("@userId",    userId,    DbType.String);
            p.Add("@companyId", companyId, DbType.String);

            string query = @"SELECT TOP 1 CAST(CASE 
                                WHEN ISNULL(isVendor, 0) = 1 OR ISNULL(fk_vendorId, '') <> '' THEN 1 
                                ELSE 0 END AS BIT) 
                             FROM UM_Users_Mst 
                             WHERE (pk_userId = @userId OR loginname = @userId) 
                               AND (fk_companyId = @companyId OR @companyId = '')";
            var isVendor = await conn.QueryFirstOrDefaultAsync<bool>(query, p);
            return isVendor;
        }

        public async Task<IEnumerable<NameValue>> GetEmployeesByVendorAsync(string companyId, string? vendorId, string? searchTerm)
        {
            var p = new DynamicParameters();
            p.Add("@fk_companyId", companyId,  DbType.String);
            p.Add("@fk_vendorId",  vendorId,   DbType.String);
            p.Add("@searchTerm",   searchTerm, DbType.String);

            var list = await DataBaseFactory.QuerySPAsync<NameValue>(
                "USP_Vendor_Emp_Doc_GetEmployeesByVendor", p, "USP_Vendor_Emp_Doc_GetEmployeesByVendor");
            return list;
        }

        public async Task<bool> MarkDocAsViewedAsync(long pk_docId)
        {
            try
            {
                var p = new DynamicParameters();
                p.Add("@pk_docId", pk_docId, DbType.Int64);

                var result = await DataBaseFactory.QuerySPAsync<VendorEmpDocSaveResponse>(
                    "USP_Vendor_Emp_Doc_MarkViewed", p, "MarkDocAsViewed");
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine("MarkDocAsViewedAsync error: " + ex.Message);
                return false;
            }
        }
    }
}
