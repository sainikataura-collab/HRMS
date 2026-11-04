using System;
using System.Collections.Generic;
using System.Xml.Serialization;
using Microsoft.AspNetCore.Http;

namespace HRMSWebAPI.Models
{
    [XmlRoot("NewDataSet")]
    public class ClientMasterDataset
    {
        [XmlElement("ClientMaster")]
        public ClientMasterModel ClientMaster { get; set; }

        [XmlElement("ServiceTypes")]
        public List<ServiceTypeXmlModel> ServiceTypes { get; set; }

        [XmlElement("ModelTypes")]
        public List<ModelTypeXmlModel>? ModelTypes { get; set; }

        [XmlElement("ExtraDayDetails")]
        public List<ExtraDayXmlModel>? ExtraDayDetails { get; set; }

        [XmlElement("HolidaySalaryHeads")]
        public List<HolidaySalaryHeadXmlModel>? HolidaySalaryHeads { get; set; }


        [XmlElement("ServiceMonthDaysDetails")]
        public List<ServiceMonthDaysXmlModel>? ServiceMonthDaysDetails { get; set; }

    }

    public class ServiceMonthDaysXmlModel
    {
        public long pk_id { get; set; }
        public string? ServiceTypeId { get; set; }
        public decimal? DaysDivideInMonth { get; set; }
    }

    public class HolidaySalaryHeadXmlModel
    {
        public string HeadId { get; set; }
    }

    public class ServiceTypeXmlModel
    {
        public string ServiceTypeId { get; set; }
    }

    public class ModelTypeXmlModel
    {
        public string ModelTypeId { get; set; }
    }

    public class ClientMasterModel
    {
        public long pk_cost_centre_id { get; set; }
        public string? ClientCode { get; set; }
        public string? ClientName { get; set; }
        public string? EmpCodePrefix { get; set; }
        public string? Grouping { get; set; }
        public string? ContactPerson { get; set; }
        public string? EmailID { get; set; }
        public string? CINNo { get; set; }
        public string? TAN { get; set; }
        public decimal? gst_rate { get; set; }


        public string? GST { get; set; }
        public string? gst_state { get; set; }

        public string? PAN { get; set; }
        public string? Address { get; set; }
        [XmlElement("fk_cityId")]
        public string? fk_cityId { get; set; }

        [XmlElement("fk_stateId")]
        public string? fk_stateId { get; set; }

        [XmlElement("fk_zoneId")]
        public string? fk_zoneId { get; set; }
        public string? Pincode { get; set; }
        public string? Phone { get; set; }

        //[XmlIgnore]
        public DateTime? StartDate { get; set; }

        //[XmlElement("StartDate")]
        //public string StartDateString
        //{
        //    get => StartDate?.ToString("yyyy-MM-ddTHH:mm:ss");
        //    set => StartDate = string.IsNullOrEmpty(value) ? null : DateTime.Parse(value);
        //}

        //[XmlIgnore]
        public DateTime? EndDate { get; set; }

        //[XmlElement("EndDate")]
        //public string EndDateString
        //{
        //    get => EndDate?.ToString("yyyy-MM-ddTHH:mm:ss");
        //    set => EndDate = string.IsNullOrEmpty(value) ? null : DateTime.Parse(value);
        //}

        public string? LeavePolicy { get; set; }
        public decimal? CommissionPercent { get; set; }
        public string? fk_companyId { get; set; }

        public bool? isHolidayHead { get; set; }
        public string? holidayWageTypeHead { get; set; }
        public decimal? HolidayMultiple { get; set; }
        public bool? addWeekOffInPaidDays { get; set; }
        public decimal? daysDivideInMonth { get; set; }

        [XmlElement("Location")]
        public string? Location { get; set; }

        public string? Pay_cycle { get; set; }

        public bool? ShowDetailsOnSlalrySlip { get; set; }
        [XmlIgnore]
        public string? Client_LogoPath { get; set; }

        public string? CreatedBy { get; set; }
        public DateTime? CreatedDate { get; set; }
        public string? ModifiedBy { get; set; }
        public DateTime? ModifiedDate { get; set; }

        [XmlIgnore]
        public List<string>? ServiceTypeIds { get; set; }

        [XmlIgnore]
        public List<string>? ModelTypeIds { get; set; }

        [XmlIgnore]
        public List<ExtraDayXmlModel>? ExtraDayDetails { get; set; }

        [XmlIgnore]
        public List<string>? HolidaySalaryHeadIds { get; set; }

        [XmlIgnore]
        public List<ServiceMonthDaysXmlModel>? ServiceMonthDaysDetails { get; set; }

        public decimal? PresentDaysforWeekOff { get; set; }
    }

    public class ClientMasterListModel
    {
        public long pk_cost_centre_id { get; set; }
        public string? ClientCode { get; set; }
        public string? ClientName { get; set; }
        public string? Grouping { get; set; }
        public string? ContactPerson { get; set; }
        public string? Phone { get; set; }
        public string? EmailID { get; set; }
        public string? ZoneName { get; set; }
        public string? CityName { get; set; }
        public string? StateName { get; set; }
        public string? Location { get; set; }
        public string? EmpCodePrefix { get; set; }
        public string? CINNo { get; set; }
        public string? TAN { get; set; }

        public string? GST { get; set; }
        public string? gst_state { get; set; }

        public string? PAN { get; set; }


        public string? Address { get; set; }
        public string? Pincode { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? LeavePolicy { get; set; }
        public decimal? CommissionPercent { get; set; }
        public decimal? HolidayMultiple { get; set; }
        public bool? ShowDetailsOnSlalrySlip { get; set; }
        public string? Client_LogoPath { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime? CreatedDate { get; set; }
        public string? ModifiedBy { get; set; }
        public DateTime? ModifiedDate { get; set; }
    }

    public class ExtraDayXmlModel
    {
        public string? ExtraDayStatus { get; set; }

        public string? DayConsider { get; set; }
    }

    public class ClientLogoUploadModel
    {
        public long ClientId { get; set; }
        public IFormFile? Logo { get; set; }
        public string? LogoName { get; set; }
    }
}
