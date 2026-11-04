using System;
using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{
    [XmlRoot("NewDataSet")]
    public class CustomerShiftRateBonusDataSet
    {
        [XmlElement("CustomerShiftRateBonus")]
        public CustomerShiftRateBonusModel? CustomerShiftRateBonus { get; set; }
    }

    public class CustomerShiftRateBonusDropdownItem
    {
        public string? Value { get; set; }
        public string? Name { get; set; }
        public string? Text { get; set; }
    }

    [XmlRoot("NewDataSet")]
    public class CustomerShiftRateBonusBulkDataSet
    {
        [XmlElement("CustomerShiftRateBonus")]
        public System.Collections.Generic.List<CustomerShiftRateBonusModel>? CustomerShiftRateBonusList { get; set; }
    }

    public class CustomerShiftRateBonusBulkResult
    {
        public int IsSuccess { get; set; }
        public string? Message { get; set; }
        public int TotalProcessed { get; set; }
        public int InsertedCount { get; set; }
        public int UpdatedCount { get; set; }
    }

    public class CustomerShiftRateBonusModel
    {
        public long pk_id { get; set; }
        public string? fk_clientId { get; set; }
        public string? customerName { get; set; }
        public string? customerCode { get; set; }
        public string? fk_locId { get; set; }
        public string? locationName { get; set; }
        public decimal shiftTypeA { get; set; }
        public decimal shiftTypeB { get; set; }
        public decimal shiftTypeC { get; set; }
        public decimal attendanceBonus { get; set; }
        public bool isBonusApplicable { get; set; } = false;
        public string? bonusPayoutType { get; set; } // "Monthly" or "Yearly"
        public decimal attendanceApplicableDays { get; set; } = 0;
        public decimal quarterlyIncentive { get; set; } = 0;
        public bool isPeakIncentiveApplicable { get; set; } = false;
        public int peakIncentivesCount { get; set; } = 0;

        [XmlArray("peakIncentives")]
        [XmlArrayItem("PeakIncentiveItem")]
        public System.Collections.Generic.List<CustomerShiftRateBonusPeakIncentiveItem>? peakIncentives { get; set; }

        public bool isActive { get; set; } = true;
        public bool isDeleted { get; set; } = false;
        public string? fk_companyId { get; set; }
        public string? createdBy { get; set; }
        public DateTime? createdDate { get; set; }
        public string? modifiedBy { get; set; }
        public DateTime? modifiedDate { get; set; }
    }

    public class CustomerShiftRateBonusPeakIncentiveItem
    {
        public long pk_peakIncentiveId { get; set; }
        public long fk_shiftRateBonusId { get; set; }
        public string? fromDate { get; set; }
        public string? toDate { get; set; }
        public decimal incentiveAmount { get; set; }
        public bool isActive { get; set; } = true;
    }

    public class CustomerShiftRateBonusFilterDto
    {
        public int PageIndex { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? SearchTerm { get; set; } = "";
        public string? ClientID { get; set; }
        public string? LocationID { get; set; }
    }

    public class CustomerShiftRateBonusSpResult
    {
        public int IsSuccess { get; set; }
        public string? Message { get; set; }
        public long pk_recId { get; set; }
    }
}
