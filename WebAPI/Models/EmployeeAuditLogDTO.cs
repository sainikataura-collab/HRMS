using System;

namespace HRMSWebAPI.Models
{
    public class EmployeeAuditLogDTO
    {
        public long LogId { get; set; }
        public string DocumentId { get; set; } = string.Empty;
        public string DocumentCode { get; set; } = string.Empty;
        public string DocumentName { get; set; } = string.Empty;
        public string FieldName { get; set; } = string.Empty;
        public string PreviousValue { get; set; } = string.Empty;
        public string CurrentValue { get; set; } = string.Empty;
        public string EntryBy { get; set; } = string.Empty;
        public DateTime? EntryDate { get; set; }
        public long RowNum { get; set; }
        public int TotalCount { get; set; }
    }
}
