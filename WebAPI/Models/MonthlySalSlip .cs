using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{


    [XmlRoot("NewDataSet")]
    public class ManthlySalSlipDataset
    {
        [XmlElement("SAL_SalarySlip_Message")]
       public List<MonthlySalSlipforIns> MonthlySalSlip { get; set; }
    }

    public class MonthlySalSlipforIns
    {
        public string fk_finid { get; set; }
        public int? fk_monthId { get; set; }
        public int? fk_yearId { get; set; }

        //public string dated { get; set; }
        public string? message { get; set; }


    }
    //GetbyId
    public class GetbyidModelTempMassage
    {
        public long CID { get; set; }
        public string fk_monthid { get; set; }
        public string fk_yearid { get; set; }
        public string monthname { get; set; }
        public string yearname { get; set; }
        public string message { get; set; }

    }

    public class GetbyidModelMassage
    {
        public long? pk_messageid { get; set; }
        public string fk_finid { get; set; }
        public string fk_monthId { get; set; }
        public string fk_yearid { get; set; }
        public string dated { get; set; }
        public string message { get; set; }


    }
}
