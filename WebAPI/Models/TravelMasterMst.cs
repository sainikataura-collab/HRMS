using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{

    [XmlRoot("NewDataSet")]
    public class TravelMasterMstmodel
    {
        [XmlElement("LTRN_Class_Mst")]
        public TravelMasterMst TravelMasterMst { get; set; }
    }

    public class TravelMasterMst
    { 
       public long? pk_classTvlId { get; set;}
       public string classname { get; set;}
       public string remarks { get; set;}
       public bool isActive { get; set;}
    }

    public class TravelMasterMstView
    {

        public long pk_classTvlId { get; set; }
        public string classname { get; set; }
        public string remarks { get; set; }
        public string isActive { get; set; }
    }

}
