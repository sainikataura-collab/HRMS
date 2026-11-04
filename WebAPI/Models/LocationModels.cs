namespace HRMSWebAPI.Models
{
    public record LocationUpdateDto(
        string UserId,
        double Latitude,
        double Longitude,
        double Accuracy,
        DateTime? Timestamp,
        bool IsBackground,
        int? BatteryLevel,
        string? DeviceInfo
    );

    public class LocationRecord
    {
        public string Id { get; set; } = Guid.NewGuid().ToString("N");
        public string UserId { get; set; } = string.Empty;
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public double Accuracy { get; set; }
        public DateTime ClientTimestamp { get; set; }
        public DateTime ServerReceivedAt { get; set; } = DateTime.UtcNow;
        public bool IsBackground { get; set; }
        public int? BatteryLevel { get; set; }
        public string? DeviceInfo { get; set; }
    }

    public class LocationStats
    {
        public int TotalRecords { get; set; }
        public int ActiveUsersCount { get; set; }
        public DateTime? LatestUpdate { get; set; }
        public double TotalDistanceKm { get; set; }
    }
}
