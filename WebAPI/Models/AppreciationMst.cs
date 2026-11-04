using System.Runtime.Serialization;
using System.Text.Json.Serialization;
using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{
    public class AppreciationMst
    {
        public long? pk_appreciationId { get; set; }
        public string? fk_empid { get; set; }
        public string? EmpName { get; set; }
        public string? Date { get; set; }
        public string? ApprId { get; set; }
        public string? incidentDate { get; set; }
        public string? incidentDetails { get; set; }
        public string? fk_empApreid { get; set; }
        public string? fk_InsuserId { get; set; }
        public string? type { get; set; }
        public string? filename { get; set; }
        public string? AppFilename { get; set; }
        public string? AppContentType { get; set; }
        public string? contenttype { get; set; }
        public string? FileContentType { get; set; }
        public string? attachment { get; set; }
        [XmlIgnore]
        [IgnoreDataMember]
        [JsonIgnore]
        public IFormFile? filepath { get; set; }

        public string? fk_userId { get; set; }
        public string? fk_locId { get; set; }
        public string? fk_UpduserId { get; set; }
        public string? fk_InsdateId { get; set; }
        public string? fk_UpddateId { get; set; }
    }
}
