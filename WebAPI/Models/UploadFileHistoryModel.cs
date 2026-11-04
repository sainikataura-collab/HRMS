namespace HRMSWebAPI.Models
{
    public class UploadFileHistoryModel
    {
        public long id { get; set; }
        public string file_type { get; set; } = string.Empty;
        public DateTime entry_date { get; set; }
        public string entry_by { get; set; } = string.Empty;
        public string file_name { get; set; } = string.Empty;
        public string company_id { get; set; } = string.Empty;
        public string? uploadedByName { get; set; }
        public int? total_records { get; set; }
        public int? totalRecords { get; set; }
        public int? success_count { get; set; }
        public int? successCount { get; set; }
        public int? failed_count { get; set; }
        public int? failedCount { get; set; }
    }

    public class UploadFileHistoryRequest
    {
        public string FileType { get; set; } = string.Empty;
        public string? UserId { get; set; }
        public int PageIndex { get; set; } = 1;
        public int PageSize { get; set; } = 5;
    }

    public class UploadFileHistoryListResponse
    {
        public int TotalCount { get; set; }
        public List<UploadFileHistoryModel> List { get; set; } = new List<UploadFileHistoryModel>();
    }
}
