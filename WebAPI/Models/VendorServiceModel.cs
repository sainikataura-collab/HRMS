using System;
using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{
    [XmlRoot("NewDataSet")]
    public class VendorServiceDataSet
    {
        [XmlElement("VendorService")]
        public VendorServiceModel? VendorService { get; set; }
    }

    public class VendorServiceModel
    {
        public long PK_VendorServiceID { get; set; }
        public string? VendorID { get; set; }
        public string? VendorName { get; set; }
        public string? VendorCode { get; set; }
        public string? LocationID { get; set; }
        public string? LocationName { get; set; }
        public string? ClientID { get; set; }
        public string? ClientName { get; set; }
        public string? ClientCode { get; set; }
        public string? ServiceType { get; set; } // "Flat" or "Percentage"
        public string? PercentageType { get; set; } // "CTC" or "Gross" (or null if Flat)
        public decimal? ServiceCharge { get; set; }
        public bool? IsGratuity { get; set; } = false;
        public string? fk_CompanyID { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime? CreatedDate { get; set; }
        public string? ModifiedBy { get; set; }
        public DateTime? ModifiedDate { get; set; }
        public bool IsActive { get; set; } = true;
        public bool IsDeleted { get; set; } = false;
    }

    public class VendorServiceFilterDto
    {
        public int PageIndex { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? SearchTerm { get; set; } = "";
        public string? VendorID { get; set; }
        public string? LocationID { get; set; }
        public string? ClientID { get; set; }
        public string? ServiceType { get; set; }
    }

    public class VendorServiceSpResult
    {
        public int IsSuccess { get; set; }
        public string? Message { get; set; }
        public long pk_recId { get; set; }
    }

    public class VendorServiceDropdownItem
    {
        public string Value { get; set; } = string.Empty;
        private string? _text;
        public string Text
        {
            get => !string.IsNullOrWhiteSpace(_text) ? _text : (Name ?? string.Empty);
            set => _text = value;
        }
        public string Name { get; set; } = string.Empty;
        public string? Code { get; set; }
    }
    public class VendorServiceUploadRowResult
    {
        public int RowNumber { get; set; }
        public string Vendor { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string Client { get; set; } = string.Empty;
        public string ServiceType { get; set; } = string.Empty;
        public string PercentageType { get; set; } = string.Empty;
        public decimal ServiceCharge { get; set; }
        public bool IsSuccess { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
    }

    public class VendorServiceUploadSummaryResult
    {
        public int TotalCount { get; set; }
        public int UploadedCount { get; set; }
        public int FailedCount { get; set; }
        public List<VendorServiceUploadRowResult> Rows { get; set; } = new();
    }

}
