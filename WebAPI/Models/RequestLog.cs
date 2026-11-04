using System;
using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{
    [XmlRoot("RequestLog")]
    public class RequestLog
    {
        public long LogId { get; set; }
        public string? UserId { get; set; }
        public string? IpAddress { get; set; }
        public string? DeviceType { get; set; }
        public string? DeviceBrand { get; set; }
        public string? DeviceModel { get; set; }
        public string? OS { get; set; }
        public string? OSVersion { get; set; }
        public string? Browser { get; set; }
        public string? BrowserVersion { get; set; }
        public string? Platform { get; set; }
        public bool? IsBot { get; set; }
        public string? UserAgent { get; set; }
        public string RequestMethod { get; set; } = string.Empty;
        public string RequestPath { get; set; } = string.Empty;
        public string? QueryString { get; set; }
        public string? RequestBody { get; set; }
        public string? ResponseBody { get; set; }
        public int? ResponseStatusCode { get; set; }
        public long? ResponseTime { get; set; }
        public string? CompanyId { get; set; }
        public string? LocationId { get; set; }
        public string? RoleId { get; set; }
        public DateTime RequestTimestamp { get; set; }
        public string? ExceptionMessage { get; set; }
        public bool? IsSuccessful { get; set; }
        public string? CorrelationId { get; set; }
        public DateTime? EntryDate { get; set; }
    }

    public class DeviceInformation
    {
        public string DeviceType { get; set; } = "Unknown";
        public string DeviceBrand { get; set; } = "Unknown";
        public string DeviceModel { get; set; } = "Unknown";
        public string OS { get; set; } = "Unknown";
        public string OSVersion { get; set; } = "Unknown";
        public string Browser { get; set; } = "Unknown";
        public string BrowserVersion { get; set; } = "Unknown";
        public string Platform { get; set; } = "Unknown";
        public bool IsBot { get; set; } = false;
    }
}
