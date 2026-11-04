using System.Collections.Generic;
using System.Threading.Tasks;
using HRMSWebAPI.Models;
using System;
using Microsoft.AspNetCore.Http;

namespace HRMSWebAPI.Repository
{
    public interface IVendorRepository
    {
        Task<dynamic> GetHIDashboardSummaryAsync(string companyId, string userId);
        Task<dynamic> UpdateVendorStatusAsync(string pkRecId, int statusId, string? approvedByName = null, string? approvedBySignature = null, string? approverRemarks = null);

        Task<(int totalCount, VendorDashboardCounts counts, IEnumerable<VendorModel> vendors)> GetAllVendorsAsync(int pageIndex, int pageSize, string companyId, string searchTerm = "", string locationId = "", string agentCode = "", string status = "", string fhridMappingStatus = "", string? userId = "");
        Task<IEnumerable<NameValue>> GetVendorAgentDropdownAsync(string companyId);
        Task<dynamic> GetVendorFHRIDMappingStatsAsync(string companyId);
        Task<IEnumerable<VendorListModel>> GetVendorMappedUnmappedListAsync(string companyId, bool isMapped);
        Task<IEnumerable<dynamic>> UploadRateCardAsync(VendorRateCardUploadRequest request, string userId, string companyId, string locationId, string filePath = null);
        Task<(int totalCount, IEnumerable<VendorRateCardModel> list)> GetVendorListAsync(int pageIndex, int pageSize, string companyId, string searchTerm);
        Task<VendorResponseModel> UpdateVendorAsync(VendorModel model, string userId, string companyId);
        Task<VendorResponseModel> DeleteVendorAsync(string pk_recId);
        Task<VendorModel?> GetVendorByIdAsync(string pk_recId);

        Task<IEnumerable<dynamic>> GetVendorAuditLogsAsync(string pk_recId);
        Task<dynamic> GetVendorDashboardSummaryAsync(string companyId, string monthId, string yearId);
        Task<VendorResponseModel> SaveVendorExcelUploadAsync(VendorExcelUploadSaveRequest request, string originalFileName, string savedFileName, string savedFilePath, long fileSize, string? companyId, string? userId);


        Task<IEnumerable<VendorRateCardAuditItemModel>> GetVendorRateCardAuditHistoryAsync(string pk_recId);
        Task<IEnumerable<VendorRateCardAuditItemModel>> GetVendorRateCardsAsync(string pk_recId);
        Task<IEnumerable<AuditLogDocumentNameItem>> GetAuditLogDocumentNamesAsync(string companyId);
        Task<IEnumerable<AuditLogItemModel>> GetAuditLogsAsync(AuditLogFilterRequest filter, string companyId);
        Task<VendorResponseModel> InsertVendorAsync(VendorModel model, string userId, string companyId, string locationId);
        Task<(int totalCount, IEnumerable<VendorFHRIDHistoryModel> list)> GetVendorFHRIDHistoryAsync(string pk_recId, int pageIndex, int pageSize);
        Task<IEnumerable<dynamic>> GetFHRIDsAsync(string clientId, string modelId, string companyId);

        Task<IEnumerable<dynamic>> UploadTransactionsAsync(string clientId, string modelId, DateTime fromDate, DateTime toDate, string xmlData, string fileName, string userId, string companyId);
        Task<IEnumerable<dynamic>> GetTransactionUploadedFilesAsync(string companyId);
        Task<dynamic> GetTransactionFileByIdAsync(int id);

        //code added 31 Aug 2026 starts
        Task<List<VendorFHRIDMappingRow>> UploadVendorFHRIDMappingExcelAsync(IFormFile file, string? companyId = null, string? userId = null);
        Task<IEnumerable<VendorFHRIDFileModel>> GetVendorFHRIDFilesAsync(string? companyId);
        Task<VendorFHRIDFileModel?> GetVendorFHRIDFileByIdAsync(int id);
        Task<IEnumerable<VendorRateCardFileModel>> GetRateCardUploadedFilesAsync(string? companyId);
        Task<VendorRateCardFileModel?> GetRateCardFileByIdAsync(int id);
        //code added 31 Aug 2026 ends

        Task<(int totalCount, IEnumerable<VendorExcelUploadFileModel> list)> GetVendorExcelUploadListAsync(string? companyId, string? searchTerm, int pageIndex = 1, int pageSize = 10);
        Task<VendorExcelUploadFileModel?> GetVendorExcelUploadByIdAsync(long id);
        Task<List<VendorUploadRowModel>> UploadVendorExcelAsync(IFormFile file, string? companyId = null, string? userId = null);
        Task<IEnumerable<dynamic>> GetVendorTransactionRangesAsync(int clientId, int modelId);
        Task<IEnumerable<dynamic>> GetTransactionTemplateDataAsync(int clientId, int modelId);
        Task<IEnumerable<dynamic>> SearchVendorsAsync(string searchTerm);
        Task<(int totalCount, IEnumerable<dynamic> transactions)> GetVendorPaymentTransactionsListAsync(int clientId, int modelId, string? locationId, string? transactionRange, string? vendorCode, string? searchTerm, int pageIndex, int pageSize);

        Task<IEnumerable<dynamic>> GetVendorTemplateConfigAsync(int clientId, int modelId);
        Task<string> GetClientNameAsync(int clientId);
        Task<string> GetModelNameAsync(int modelId);


        Task<(int totalCount, IEnumerable<VendorVerificationListModel> vendors)> GetVendorDownloadVerificationListAsync(int pageIndex, int pageSize, string companyId, string userId, string searchTerm);

        Task<(int totalCount, IEnumerable<VendorVerificationListModel> vendors)> DownloadVendorVerificationListAsync(int pageIndex, int pageSize, string companyId, string userId, string searchTerm, string locationId);

        // Transaction Approval workflow - added for approval feature
        Task<(int totalVendors, int approvedCount, int pendingCount, int totalRows, IEnumerable<dynamic> rows)> GetVendorTransactionForApprovalAsync(int clientId, int modelId, string transactionRange, string searchTerm, int pageIndex, int pageSize);
        Task<dynamic> ApproveVendorTransactionAsync(string transactionIds, bool approveAll, int clientId, int modelId, string transactionRange, string approvedBy, string approvedByName, string approverRemarks);

        // Dynamic Deduction Entry, Fact Box, Sync & Recovery MIS
        Task<IEnumerable<dynamic>> GetLinkedLocationsAsync(long clientId, int modelId, string companyId);
        Task<IEnumerable<VendorLinkedVendorDto>> GetLinkedVendorsAsync(long clientId, int modelId, string? locationId, string companyId);
        Task<(bool isSuccess, string message)> SaveDeductionEntriesAsync(SaveDeductionEntryRequest request, string userId, string companyId);
        Task<(bool isSuccess, string message, int insertedCount)> SaveMultiVendorDeductionBatchAsync(SaveMultiVendorDeductionBatchRequest request, string userId, string companyId);
        Task<IEnumerable<ShipmentRecoverySummaryDto>> GetShipmentRecoverySummaryAsync(string shipmentId, long? clientId, int? modelId);
        Task<FactBoxDeductionSummaryDto> GetFactBoxDeductionSummaryAsync(long clientId, int modelId, string? locationId, string fhrid, DateTime fromDate, DateTime toDate, string companyId, string? vehicleType = null, string? route = null);
        Task<(bool isSuccess, string message)> SyncVendorDeductionsAsync(SyncDeductionsRequest request, string userId, string companyId);
        Task<IEnumerable<dynamic>> GetDeductionBreakdownAsync(long transactionId, string? standardDbColumn = null);
        Task<IEnumerable<DeductionRecoveryMISDto>> GetDeductionRecoveryMISReportAsync(long? clientId, int? modelId, string? locationId, DateTime fromDate, DateTime toDate, string recoveryStatus, string companyId);
        Task<(bool isSuccess, string message)> DeleteDeductionEntryAsync(long entryId, string userId);

        // Vendor Transaction Sync Workflow
        Task<(int totalVendors, int syncedCount, int pendingCount, decimal totalNetPayable, int totalRows, IEnumerable<dynamic> rows)> GetVendorTransactionForSyncAsync(int clientId, int modelId, string? locationId, string transactionRange, string? vendorCode, string? searchTerm, int pageIndex, int pageSize);
        Task<(bool isSuccess, string message, int updatedCount)> SyncVendorTransactionsAsync(SyncTransactionsRequest request, string userId, string userName, string companyId);
        Task<(bool isSuccess, string message)> UpdateTransactionRecoveryPercentAsync(long transactionId, decimal recoveryPercent, string userId);

        // Configurable Deduction Recovery Strategy & Audit
        Task<VendorRecoveryPolicyDto?> GetDeductionRecoveryPolicyAsync(long? clientId, int? modelId, string companyId);
        Task<(bool isSuccess, string message)> SaveDeductionRecoveryPolicyAsync(SaveRecoveryPolicyRequest request, string userId, string companyId);
        Task<IEnumerable<RecoveryPolicyAuditLogDto>> GetDeductionRecoveryPolicyAuditLogAsync(long? clientId, int? modelId);

        Task<(bool isSuccess, string message)> SaveOpeningDeficitAsync(SaveOpeningDeficitRequest request, string userId, string companyId);
        Task<(bool isSuccess, string message, int insertedCount)> BulkSaveOpeningDeficitsAsync(IEnumerable<BulkOpeningDeficitItemDto> items, string userId, string companyId);
        Task<IEnumerable<OpeningDeficitListItemDto>> GetOpeningDeficitsListAsync(long? clientId, int? modelId, string? locationId, string? searchTerm, string companyId);
        Task<(bool isSuccess, string message)> DeleteOpeningDeficitAsync(long carryForwardId, string userId);

        // Payment Settlement Workflow
        Task<(int totalRecords, int kpiTotalCount, int kpiPendingCount, int kpiPaidCount, decimal kpiTotalPendingAmount, decimal kpiTotalPaidAmount, int kpiSyncedCount, int kpiUnsyncedCount, IEnumerable<dynamic> rows)> GetPaymentSettlementListAsync(int clientId, int modelId, string? locationId, string transactionRange, string? vendorCode, string? paymentStatus, int? isDeductionsSynced, string? searchTerm, int pageIndex, int pageSize);
        Task<(bool isSuccess, string message, int updatedCount, string batchNo)> RecordPaymentAsync(RecordPaymentRequest request, string userId, string userName);
        Task<(bool isSuccess, string message)> RevertPaymentAsync(long transactionId, string? remarks, string userId, string userName);
    }
}





