////namespace HRMSWebAPI.Models
////{
////    public class LocalTravelMst
////    {
////    }
////}




using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{
    [XmlRoot("NewDataSet")]
    public class LocalTravelMst
    {
        [XmlElement("TVL_LocalTravelRequisition_Mst")]
        public List<LocalTravelRequisitionMst> LocalTravelRequisitionMst { get; set; }

        [XmlElement("TVL_LocalTravelRequisition_Mst_DateTransaction_Trn")]
        public List<LocalTravelRequisitionDateTransactionTrn> LocalTravelRequisitionDateTransactionTrn { get; set; }
    }

    public class ResponseIdMst
    {
        public List<LocalTravelRequisitionMst> LocalTravelRequisitionMst { get; set; }
        public List<LocalTravelRequisitionDateTransactionTrn> LocalTravelRequisitionDateTransactionTrn { get; set; }
        public EmployeeDetailsDTO EmployeeDetails { get; set; }

    }

    /// <summary>
    /// Main Master Table - TVL_LocalTravelRequisition_Mst
    /// Now includes date, city, and time fields directly
    /// </summary>
    public class LocalTravelRequisitionMst
    {
        public long? pk_localtravelId { get; set; }
        public string? fk_empid { get; set; }
        public decimal? amount { get; set; }
        public int? status { get; set; }
        public bool? isSubmitted { get; set; }
        public bool? isApproved { get; set; }
        public bool? isActive { get; set; }

        // Fields that were previously in DateTransaction table
        public string? traveldate { get; set; }
        public string? fk_cityId { get; set; }
        public string? InTime { get; set; }
        public string? OutTime { get; set; }
        public string? TotalHour { get; set; }
        public decimal? subTotal { get; set; }
        public decimal? fixedfda { get; set; }
        public decimal? GTotal { get; set; }
      
    }

    /// <summary>
    /// Transaction Detail Table - TVL_LocalTravelRequisition_Mst_DateTransaction_Trn
    /// </summary>
    public class LocalTravelRequisitionDateTransactionTrn
    {
        public long? pk_id { get; set; }
        public long? fk_localtravelId { get; set; }
        public long? fk_travelmodeId { get; set; }
        public string? description { get; set; }
        public string? purpose { get; set; }
        public string? isexitingclienttype { get; set; }
        public string? clientvisited { get; set; }
        public string? newClient { get; set; }
        public string? placefrom { get; set; }
        public string? placeto { get; set; }
        public decimal? kilometere { get; set; }
        public decimal? rate { get; set; }
        public decimal? amount { get; set; }
        public decimal? othercharges { get; set; }
        public decimal? totalamount { get; set; }
        [XmlIgnore]
        public IFormFile? SavedFile { get; set; }
        public string? filepath { get; set; }
        public bool? isActive { get; set; }
        public string? otherchargesremarks { get; set; }
        public string? effectivedate { get; set; }

    }

    /// <summary>
    /// DTO for Grid/List View
    /// </summary>
    public class LocalTravelGet
    {
        public string? dated { get; set; }
        public string? description { get; set; }
        public string? traveldate { get; set; }
        public string? cityname { get; set; }
        public decimal? amount { get; set; }
        public string? status { get; set; }
        public bool? isEdit { get; set; }
        public long? pk_localtravelId { get; set; }
        public long? pk_localtraveIDateId { get; set; }
        public string? requestDays { get; set; }
        public string? statusDes { get; set; }
    }

    public class EmployeeDetailsDTO
    {
        public string? fk_empid { get; set; }
        public string? EmployeeId { get; set; }
        public string? EmployeeName { get; set; }
        public string? Department { get; set; }
        public string? Designation { get; set; }
    }
}