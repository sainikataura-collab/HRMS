using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{
    public class EmpKraImportModel
    {


        [XmlRoot("NewDataSet")]
        public class ExcelUploadKRARequestNew
        {
            [XmlElement("Excel")]
            public List<ExcelUploadModelKRANew> Employees { get; set; } = new();
        }

        public class ExcelUploadModelKRANew
        {
            public string? empcode { get; set; }
            public long? SrNo { get; set; }
            public string? KRA { get; set; }
            public string? KPA { get; set; }
            public string? KPI { get; set; }
            public string? TargetValue { get; set; }
            public decimal? Weightage { get; set; }
            public string? AttachmentPath { get; set; }
        }



    }
}
