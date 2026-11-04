using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{

    [XmlRoot("NewDataSet")]
    public class AccidentDetailsMstXmlModel
    {
        [XmlElement("HR_EmployeeAccident_Details")]
        public AccidentDetailsMst AccidentDetails { get; set; }
    }
    public class AccidentDetailsMst
    {
        public string? pk_accidentId { get; set; }
        public string? fk_empid { get; set; }

        public string? empname { get; set; }

        public string? empcode { get; set; }
        public string? description { get; set; }
        public string? location { get; set; }
        public string? accidentdate { get; set; }
        public string? claimdate { get; set; }
        public string? receivedate { get; set; }
        public decimal? expenceamt { get; set; }
        public decimal? claimamt { get; set; }
        public decimal? receivedamt { get; set; }
        public string? remarks { get; set; }
       
        public string? Filename { get; set; }
        [XmlIgnore]
        public IFormFile? Ifilename { get; set; } // File sent via multipart/form-data

        public byte[]? Timestamp { get; set; }

       
    }
}
