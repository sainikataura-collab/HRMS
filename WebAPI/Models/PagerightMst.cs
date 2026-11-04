using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{
    [XmlRoot("NewDataSet")]
    public class PagerightMst
    {
        [XmlIgnore]
        public string userid { get; set; }

        [XmlIgnore]
        public int moduleid { get; set; }

        [XmlElement("LocationList")]
        public List<LocationList1> LocationList { get; set; }

        [XmlElement("UM_UserPageRights")]
        public List<UM_UserPageRights_INs> UM_UserPageRights { get; set; }



    }
    public class UM_UserPageRights_INs
    {
        public int? fk_webpageId { get; set; }
        public bool? AllowAdd { get; set; }      // if you pass actions
        public bool? AllowUpdate { get; set; }
        public bool? AllowDelete { get; set; }
        public bool? AllowView { get; set; }
        // CJ DARCL Level & Functional Access Rights
        public bool? L1_Access { get; set; }
        public bool? L2_Access { get; set; }
        public bool? L3_Access { get; set; }
        public bool? CanRaiseRequisition { get; set; }
        public bool? CanEditManpower { get; set; }
    }



    public class LocationList1
    {

        public string fk_locid { get; set; }
    }


    public class UserFullMenuModel
    {
        public int pk_moduleId { get; set; }
        public string ModuleName { get; set; }
        public bool ModuleActiveStatus { get; set; }
        public int pk_webpageId { get; set; }
        public string menucaption { get; set; }
        public string webpagename { get; set; }
        public string pagepath { get; set; }
        public string tooltip { get; set; }
        public string icon { get; set; }
        public int? parentId { get; set; }
        public int displayorder { get; set; }
        public bool WebPageActiveStatus { get; set; }
        public int IsAssigned { get; set; }
    }


    public class EmployeeModuleActive
    {
        public int pk_moduleId { get; set; }
        public string modulename { get; set; } = "";
        public bool active { get; set; }
    }
}


