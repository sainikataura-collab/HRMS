using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{

    [XmlRoot("NewDataSet")]
    public class DealerOutletDataSet
    {
        [XmlElement("DealerOutlet_Mst")]
        public List<DealerOutletMst> DealerOutlet_Mst { get; set; }
    }
    public class DealerOutletMst
    {

        public int? pk_dealerOutletId { get; set; }
        public long? fk_cost_centre_id { get; set; }
            public string? OutletCode { get; set; }
            public string? OutletName { get; set; }
            public string? DealerCode { get; set; }
            public int? fk_retailtypeid { get; set; }
            public string? Address { get; set; }
            public string? fk_cityid { get; set; }
            public int? fk_stateid { get; set; }
            public long? fk_zoneId { get; set; }

        public string? fk_companyId { get; set; }
    }
    
}
