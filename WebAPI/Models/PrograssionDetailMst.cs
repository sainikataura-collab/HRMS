using System.Runtime.Serialization;
using System.Text.Json.Serialization;
using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{
    public class PrograssionDetailMst
    {
        public string? pk_incid { get; set; }
        public string? empcode { get; set; }
        public string? empname { get; set; }
        public string? type { get; set; }
        public string? dated { get; set; }
        public string? effectivefrom { get; set; }
        public string? ctcbasic { get; set; }
        public string? incper { get; set; }
        public string? incamt { get; set; }
        public string? ctcbasic_n { get; set; }

    }


    //compensation
    public class EmployeeRentModel
    {
        public string pk_rentId { get; set; }
        public string dated { get; set; }
        public string finDescription { get; set; }
        public string totalAmount { get; set; }
        public string docsub_status { get; set; }
        public string isView { get; set; }
        public string filename { get; set; }
    }




    [XmlRoot("ModelRentDetails")]
    public class ModelRentDetails
    {
        public string? pk_rentId { get; set; }
        public string? fk_rentId { get; set; }

        public string? fk_empid { get; set; }


        public string? fk_finid { get; set; }


        public string? rentdetailtype { get; set; }

        public string? docsub_status { get; set; }


        public string? remarks { get; set; }


        public string? PANNo { get; set; }

        public string? LandLordName { get; set; }


        public string? LandLordAddress { get; set; }



        [XmlIgnore]
        [IgnoreDataMember]
        [JsonIgnore]
        public IFormFile? file { get; set; }

        public string? filename { get; set; }

        // Monthly Rent List
        [XmlArray("RentDetailList")]
        [XmlArrayItem("ModelMonthlyRentDetails")]
        public List<ModelMonthlyRentDetails> RentDetailList { get; set; }
    }



    public class ModelMonthlyRentDetails
    {

        public string? fk_empid { get; set; }


        public string? fk_monthId { get; set; }

        public string? fk_yearId { get; set; }


        public decimal? rentamount { get; set; }

        public string? remarks { get; set; }
    }

}
