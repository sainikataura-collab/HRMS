using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{
    public class RoleWiseKRAImportModel
    {



        //[XmlRoot("NewDataSet")]
        //public class ExcelUploadRolewiseKRAModelRequest
        //{
        //    [XmlElement("Excel")]
        //    public List<ExcelUploadRolewiseKRAModel> Employees { get; set; } = new();
        //}

        public class ExcelUploadRolewiseKRAModel
        {
            public string? RoleName { get; set; }
            public long? SrNo { get; set; }
            public string? KRA { get; set; }
            public string? KPA { get; set; }
            public string? KPI { get; set; }
            public string? TargetValue { get; set; }
            public decimal? Weightage { get; set; }
            public string? AttachmentPath { get; set; }
        }




        [XmlRoot("NewDataSet")]
        public class ExcelUploadRolewiseKRAModelRequest
        {
            [XmlElement("Excel")]
            public List<ExcelUploadRolewiseKRAModel> Employees { get; set; } = new();
        }





    }
}
