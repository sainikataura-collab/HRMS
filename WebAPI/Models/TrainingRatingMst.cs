namespace HRMSWebAPI.Models
{
    public class TrainingRatingMst
    {
        public long? pk_ratingId { get; set; }
        public string? description { get; set; }
        public bool? active { get; set; }
        public string? remarks { get; set; }
        public byte[]? Timestamp { get; set; }
    }
    public class TrainingRatingMstView
    {
        public long? pk_ratingId { get; set; }
        public string? description { get; set; }
        public string? active { get; set; }
        public string? remarks { get; set; }
        public byte[]? Timestamp { get; set; }
    }
}
