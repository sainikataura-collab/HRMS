using System;
using System.Collections.Generic;

namespace HRMSWebAPI.Models
{
    public class VendorLinkedVendorDto
    {
        public string FHRID { get; set; } = string.Empty;
        public string VendorCode { get; set; } = string.Empty;
        public string VendorName { get; set; } = string.Empty;
        public string? fk_rec_id { get; set; }
        public string LocationID { get; set; } = string.Empty;
        public string LocationName { get; set; } = string.Empty;
        public string? Vehicle_Type { get; set; }
        public string? Route { get; set; }
    }

    public class SaveDeductionEntryRequest
    {
        public long ClientId { get; set; }
        public int ModelId { get; set; }
        public string LocationId { get; set; } = string.Empty;
        public string FHRID { get; set; } = string.Empty;
        public DateTime FromDate { get; set; }
        public DateTime ToDate { get; set; }
        public string? VehicleType { get; set; }
        public string? Route { get; set; }
        public List<DeductionLineItemDto> Items { get; set; } = new();
    }

    public class DeductionLineItemDto
    {
        public long? pk_DeductionEntryId { get; set; }
        public long? DeductionEntryId { get; set; }
        public string DeductionType { get; set; } = string.Empty;
        public string StandardDbColumn { get; set; } = string.Empty;
        public string? ShipmentId { get; set; }
        public decimal Amount { get; set; }
        public string? Remarks { get; set; }
        public bool IsSplitShipment { get; set; }
        public decimal? OriginalShipmentAmount { get; set; }
        public int SplitShareCount { get; set; } = 1;
        public string? SplitGroupId { get; set; }
        public string? UploadBatchId { get; set; }
    }

    public class SaveMultiVendorDeductionBatchRequest
    {
        public long ClientId { get; set; }
        public int ModelId { get; set; }
        public string? LocationId { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public string? ClientName { get; set; }
        public string? ModelName { get; set; }
        public string? LocationName { get; set; }
        public List<MultiVendorDeductionItemDto> Items { get; set; } = new();
    }

    public class MultiVendorDeductionItemDto
    {
        public string FHRID { get; set; } = string.Empty;
        public string? VendorCode { get; set; }
        public string LocationId { get; set; } = string.Empty;
        public string? LocationName { get; set; }
        public string? ClientName { get; set; }
        public string? ModelName { get; set; }
        public DateTime Cycle_FromDate { get; set; }
        public DateTime Cycle_ToDate { get; set; }
        public string? Vehicle_Type { get; set; }
        public string? Route { get; set; }
        public string DeductionType { get; set; } = string.Empty;
        public string StandardDbColumn { get; set; } = string.Empty;
        public string? ShipmentId { get; set; }
        public decimal Amount { get; set; }
        public string? Remarks { get; set; }
        public bool IsSplitShipment { get; set; }
        public decimal? OriginalShipmentAmount { get; set; }
        public int SplitShareCount { get; set; } = 1;
        public string? SplitGroupId { get; set; }
        public string? UploadBatchId { get; set; }
    }

    public class FactBoxDeductionSummaryDto
    {
        public int TotalEntriesCount { get; set; }
        public decimal TotalDeductionAmount { get; set; }
        public decimal PriorCycleDeficit { get; set; }
        public bool IsSynced { get; set; }
        public bool IsLocked { get; set; }
        public DateTime? SyncedDate { get; set; }
        public List<FactBoxDeductionItemDto> RecentEntries { get; set; } = new();
    }

    public class FactBoxDeductionItemDto
    {
        public long pk_DeductionEntryId { get; set; }
        public DateTime EntryDate { get; set; }
        public string DeductionType { get; set; } = string.Empty;
        public string StandardDbColumn { get; set; } = string.Empty;
        public string? ShipmentID { get; set; }
        public decimal Amount { get; set; }
        public string? Remarks { get; set; }
        public string? Vehicle_Type { get; set; }
        public string? Route { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime CreatedDate { get; set; }
        public bool IsSynced { get; set; }
        public bool IsLocked { get; set; }
        public bool IsSplitShipment { get; set; }
        public decimal? OriginalShipmentAmount { get; set; }
        public int SplitShareCount { get; set; } = 1;
        public string? SplitGroupId { get; set; }
    }

    public class ShipmentRecoverySummaryDto
    {
        public long pk_DeductionEntryId { get; set; }
        public string ShipmentID { get; set; } = string.Empty;
        public long ClientID { get; set; }
        public int ModelID { get; set; }
        public string HubName { get; set; } = string.Empty;
        public string FHRID { get; set; } = string.Empty;
        public string VendorCode { get; set; } = string.Empty;
        public string VendorName { get; set; } = string.Empty;
        public string DeductionType { get; set; } = string.Empty;
        public decimal SplitAmount { get; set; }
        public decimal? OriginalShipmentAmount { get; set; }
        public bool IsSplitShipment { get; set; }
        public int SplitShareCount { get; set; } = 1;
        public string? SplitGroupId { get; set; }
        public DateTime Cycle_FromDate { get; set; }
        public DateTime Cycle_ToDate { get; set; }
        public DateTime EntryDate { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public bool IsSynced { get; set; }
        public bool IsLocked { get; set; }
        public bool IsTransactionSynced { get; set; }
        public long? TransactionID { get; set; }
        public decimal RecoveredAmount { get; set; }
        public decimal PendingDeficit { get; set; }
        public string RecoveryStatus { get; set; } = string.Empty;
        public string? Remarks { get; set; }
    }

    public class SyncDeductionsRequest
    {
        public long ClientId { get; set; }
        public int ModelId { get; set; }
        public DateTime FromDate { get; set; }
        public DateTime ToDate { get; set; }
        public string? LocationId { get; set; }
    }

    public class DeductionRecoveryMISDto
    {
        public long POC_EntryNo { get; set; }
        public DateTime EntryDate { get; set; }
        public string ClientName { get; set; } = string.Empty;
        public string ModelName { get; set; } = string.Empty;
        public string HubName { get; set; } = string.Empty;
        public string? Vehicle_Type { get; set; }
        public string? Route { get; set; }
        public string FHRID { get; set; } = string.Empty;
        public string VendorCode { get; set; } = string.Empty;
        public string VendorName { get; set; } = string.Empty;
        public string DeductionType { get; set; } = string.Empty;
        public string? ShipmentID { get; set; }
        public decimal OriginalAmount { get; set; }
        public string Cycle1_Range { get; set; } = string.Empty;
        public decimal Cycle1_Recovered { get; set; }
        public decimal Cycle2_Recovered { get; set; }
        public decimal Total_Recovered { get; set; }
        public decimal Pending_Balance { get; set; }
        public string RecoveryStatus { get; set; } = string.Empty;
        public string? RecoveryRemarks { get; set; }
    }

    public class SyncTransactionsRequest
    {
        public long ClientId { get; set; }
        public int ModelId { get; set; }
        public string TransactionRange { get; set; } = string.Empty;

        [System.Text.Json.Serialization.JsonConverter(typeof(LenientNullableDateTimeConverter))]
        public DateTime? FromDate { get; set; }

        [System.Text.Json.Serialization.JsonConverter(typeof(LenientNullableDateTimeConverter))]
        public DateTime? ToDate { get; set; }

        public string? LocationId { get; set; }
        public string? TransactionIds { get; set; } // Comma-separated or empty
        public bool SyncAll { get; set; }
        public string? Remarks { get; set; }
        public List<SyncTransactionItemDto>? SyncItems { get; set; }
    }

    public class SyncTransactionItemDto
    {
        public long TransactionId { get; set; }
        public decimal RecoveryPercent { get; set; } = 100.00m;
    }

    public class UpdateTransactionRecoveryPercentRequest
    {
        public long TransactionId { get; set; }
        public decimal RecoveryPercent { get; set; } = 100.00m;
    }

    public class LenientNullableDateTimeConverter : System.Text.Json.Serialization.JsonConverter<DateTime?>
    {
        public override DateTime? Read(ref System.Text.Json.Utf8JsonReader reader, Type typeToConvert, System.Text.Json.JsonSerializerOptions options)
        {
            if (reader.TokenType == System.Text.Json.JsonTokenType.Null) return null;
            if (reader.TokenType == System.Text.Json.JsonTokenType.String)
            {
                var s = reader.GetString();
                if (string.IsNullOrWhiteSpace(s)) return null;
                if (DateTime.TryParse(s, out var dt)) return dt;
            }
            return null;
        }

        public override void Write(System.Text.Json.Utf8JsonWriter writer, DateTime? value, System.Text.Json.JsonSerializerOptions options)
        {
            if (value.HasValue) writer.WriteStringValue(value.Value.ToString("yyyy-MM-dd"));
            else writer.WriteNullValue();
        }
    }

    public class VendorRecoveryPolicyDto
    {
        public long PolicyId { get; set; }
        public long? RequestedClientID { get; set; }
        public string? RequestedClientName { get; set; }
        public int? RequestedModelID { get; set; }
        public string? RequestedModelName { get; set; }
        public string Strategy { get; set; } = "FIFO";
        public string? PriorityOrder { get; set; }
        public decimal MaxRecoveryPercent { get; set; } = 100.00m;
        public bool IsInherited { get; set; }
        public string InheritedFrom { get; set; } = "GlobalDefault";
        public DateTime? UpdatedDate { get; set; }
        public string? LastUpdatedByName { get; set; }
    }

    public class SaveRecoveryPolicyRequest
    {
        public long? ClientId { get; set; }
        public int? ModelId { get; set; }
        public string Strategy { get; set; } = "FIFO"; // 'FIFO', 'PRIORITY', 'PROPORTIONAL'
        public string? PriorityOrder { get; set; }
        public decimal MaxRecoveryPercent { get; set; } = 100.00m;
    }

    public class SaveOpeningDeficitRequest
    {
        public long ClientId { get; set; }
        public int ModelId { get; set; }
        public string LocationId { get; set; } = string.Empty;
        public string FHRID { get; set; } = string.Empty;
        public string? VendorCode { get; set; }
        public decimal DeficitAmount { get; set; }
        public DateTime? CutoffDate { get; set; }
        public string? Remarks { get; set; }
    }

    public class BulkOpeningDeficitItemDto
    {
        public string FHRID { get; set; } = string.Empty;
        public string? VendorCode { get; set; }
        public long ClientId { get; set; }
        public int ModelId { get; set; }
        public string LocationId { get; set; } = string.Empty;
        public decimal DeficitAmount { get; set; }
        public DateTime? CutoffDate { get; set; }
        public string? Remarks { get; set; }
    }

    public class RecoveryPolicyAuditLogDto
    {
        public long LogId { get; set; }
        public string DocumentId { get; set; } = string.Empty;
        public string DocumentCode { get; set; } = string.Empty;
        public string DocumentName { get; set; } = string.Empty;
        public string FieldName { get; set; } = string.Empty;
        public string PreviousValue { get; set; } = string.Empty;
        public string CurrentValue { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public DateTime EntryDate { get; set; }
    }

    public class OpeningDeficitListItemDto
    {
        public long CarryForwardId { get; set; }
        public long ClientID { get; set; }
        public string ClientName { get; set; } = string.Empty;
        public int ModelID { get; set; }
        public string ModelName { get; set; } = string.Empty;
        public string LocationId { get; set; } = string.Empty;
        public string FHRID { get; set; } = string.Empty;
        public string VendorCode { get; set; } = string.Empty;
        public string VendorName { get; set; } = string.Empty;
        public DateTime CutoffDate { get; set; }
        public decimal DeficitAmount { get; set; }
        public decimal RecoveredAmount { get; set; }
        public decimal PendingBalance { get; set; }
        public string RecoveryStatus { get; set; } = string.Empty;
        public string Remarks { get; set; } = string.Empty;
        public DateTime CreatedDate { get; set; }
    }

    public class RecordPaymentRequest
    {
        public List<long> TransactionIds { get; set; } = new();
        public bool IsSelectAllCycle { get; set; } = false;
        public long? ClientId { get; set; }
        public int? ModelId { get; set; }
        public string? TransactionRange { get; set; }
        public string? LocationId { get; set; }
        public int? DeductionsSyncedFilter { get; set; }
        public DateTime PaymentDate { get; set; }
        public string PaymentTransactionNo { get; set; } = string.Empty;
        public string? PaymentBankName { get; set; }
        public string? PaymentAccountNo { get; set; }
        public string PaymentMode { get; set; } = "NEFT";
        public string? PaymentRemarks { get; set; }
    }

    public class RevertPaymentRequest
    {
        public long TransactionId { get; set; }
        public string? Remarks { get; set; }
    }
}

