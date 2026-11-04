using System.Xml.Serialization;
using static HRMSWebAPI.Models.TravelModeMasterModel;

namespace HRMSWebAPI.Models
{
    [XmlRoot("NewDataSet")]
    public class TrvlModemasterModelrequest
    {
        [XmlElement("LTRN_TravelMode_Mst")]
        public List<TravelModeMasterModel> travel { get; set; } = new();
    }

    [XmlRoot("NewDataSet")]
    public class TrvlModelUpd
    {
        [XmlElement("LTRN_Class_Mst")]
        public List<TravelModeMasterModel> travel { get; set; } = new();
    }






    public class TravelModeMasterModel
    {
        public long pk_travelmodeID { get; set; }
        public string? description { get; set; }
        public string? classname { get; set; }
        public string remarks { get; set; }

        public bool isActive { get; set; }

        public bool? isAir { get; set; }
        public string? fk_companyId { get; set; }


    }

    public class TrvlModemasterModelGetAll
    {
        public string? pk_travelmodeID { get; set; }
        public string description { get; set; }
        public string remarks { get; set; }
        public string isActive { get; set; }

        public bool? isAir { get; set; }
    }
}
