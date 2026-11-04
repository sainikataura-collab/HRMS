using System.ComponentModel.DataAnnotations;
using System.Xml.Serialization;



namespace HRMSWebAPI.Models
{


    [XmlRoot("NewDataSet")]
    public class DesignationMstDataSet
    {
        [XmlElement("SAL_Designation_Mst")]
        public DesignationMst Designation { get; set; }
    }

    public class DesignationMst
    {
        [XmlElement("designation")]

        [StringLength(255, ErrorMessage = "designation must be minimum 3 and  maximum 255 character  long.", MinimumLength = 1)]

        public string designation { get; set; }

        [XmlElement("fk_levelid")]
        public string? fk_levelid { get; set; }

        [XmlElement("level")]
        public string? level { get; set; }

        [XmlElement("senioritylevel")]

        public int? SeniorityLevel { get; set; }

        //[StringLength(255, ErrorMessage = "qualification must be minimum 1 and  maximum 255 character  long.", MinimumLength = 1)]

        [XmlElement("qualification")]
        public string? Qualification { get; set; }

        [XmlElement("remarks")]
        //[StringLength(255, ErrorMessage = "remarks must be minimum 2 and  maximum 255 character  long.", MinimumLength = 2)]

        public string? remarks { get; set; }

        [XmlElement("fk_userid")]
        public string? fk_userid { get; set; }

        [XmlElement("fk_locid")]
        public string? fk_locid { get; set; }

        [XmlElement("fk_companyId")]
        public string? fk_companyId { get; set; }


        [XmlElement("isActive")]
        public bool? isActive { get; set; }
        public string? pk_desgid { get; set; }
        public byte[]? Timestamp { get; set; }



    }


}
