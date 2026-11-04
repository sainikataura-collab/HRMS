using System.Text.Json.Serialization;
using System.Runtime.Serialization;
using System.Xml.Serialization;



namespace HRMSWebAPI.Models
{
  

    public class RebateModal
    {

        public int CID { get; set; }
        public string pk_docid { get; set; }
        public string secname { get; set; }
        public string subsecname { get; set; }
        public string docsub_status { get; set; }
        public string status { get; set; }

        public decimal docsub_Amt { get; set; }
        public string billno { get; set; }
        public string billdate { get; set; }
        public string submitdate { get; set; }
        public string filename { get; set; }
        public bool isApproved { get; set; }


    }

    [XmlRoot("ModelSectionDocStatus")]

    public class RebateDocStatus
    {
        public long pk_docid { get; set; } = 0; // Although not used in insert, it's in the XML

        public string? fk_empid { get; set; }

        public string? fk_secid { get; set; }

        public string? fk_subsecid { get; set; }

        public string? fk_finid { get; set; }

        public string docsub_status { get; set; }

        public decimal docsub_Amt { get; set; }

        public string? billno { get; set; }

        public string? billdate { get; set; } // Use string for date input to match 'dd/MM/yyyy' format

        public string? remarks { get; set; }

        public string? contenttype { get; set; }

        public bool isApproved { get; set; }

        public bool isActive { get; set; }
        public string? filename { get; set; }
        [XmlIgnore]
        [IgnoreDataMember]
        [JsonIgnore]
        public IFormFile? filepath { get; set; }
        public string? attachment { get; set; }
        public string? status { get; set; }
    }


    public class rebateresponse
    {
        public int StatusCode { get; set; }
        public string? DocumentId { get; set; }
        public string? DocumentNo { get; set; }
        public bool? IsSuccessfull { get; set; }
        public string Message { get; set; }

    }


    //---------------Tax computation

    public class TaxcomputationRequest
    {

        public string? fk_empid { get; set; }
        public string? fk_finid { get; set; }
        public string? fk_companyId { get; set; } = "";


    }
    public class Taxcomputationresponse
    {

        public string? pk_headId { get; set; }
        public string? HeadName { get; set; }
        public string? TotalAmount { get; set; } = "";


    }


}
