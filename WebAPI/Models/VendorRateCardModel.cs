using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{
    // -----------------------------------------------------------------------

    // -----------------------------------------------------------------------
    public class VendorRateCardModel
    {
        // --- Keys & Lookups ---
        public long? pk_RateCardID { get; set; }
        public long? ClientID { get; set; }
        public string? Client_Name { get; set; }
        public int? ModelID { get; set; }
        public string? Model { get; set; }
        public string? FHRID { get; set; }
        public string? Vendor_HFRID { get; set; }
        public string? LocationID { get; set; }
        public string? EffectiveFrom { get; set; }
        public int? Large_VehicleTypeID { get; set; }
        public string? Large_VehicleTypeName { get; set; }
        public string? VehicleType { get; set; }

        // --- Model-Specific Rates & Slabs ---
        public decimal? Normal_Rate { get; set; }
        public string? Normal_RateType { get; set; }
        public string? Normal_SlabExpr { get; set; }

        public decimal? Pickup_Rate { get; set; }
        public string? Pickup_RateType { get; set; }
        public string? Pickup_SlabExpr { get; set; }

        public decimal? MFN_Rate { get; set; }
        public string? MFN_RateType { get; set; }
        public string? MFN_SlabExpr { get; set; }

        public decimal? Van_Rate { get; set; }
        public string? Van_RateType { get; set; }
        public string? Van_SlabExpr { get; set; }

        public decimal? U2S_Rate { get; set; }
        public string? U2S_RateType { get; set; }
        public string? U2S_SlabExpr { get; set; }

        public decimal? Shopsy_Deduction_Rate { get; set; }
        public string? Shopsy_RateType { get; set; }
        public string? Shopsy_SlabExpr { get; set; }

        public decimal? Prexo_Rate { get; set; }
        public string? Prexo_RateType { get; set; }
        public string? Prexo_SlabExpr { get; set; }

        public decimal? Grocery_Rate { get; set; }
        public string? Grocery_RateType { get; set; }
        public string? Grocery_SlabExpr { get; set; }

        public decimal? Rto_Rate { get; set; }
        public string?  Rto_RateType { get; set; }
        public string?  Rto_SlabExpr { get; set; }

        public decimal? Dto_Rate { get; set; }
        public string?  Dto_RateType { get; set; }
        public string?  Dto_SlabExpr { get; set; }

        public decimal? Fm_Rate { get; set; }
        public string?  Fm_RateType { get; set; }
        public string?  Fm_SlabExpr { get; set; }

        public decimal? Incentive_Rate { get; set; }
        public string? Incentive_RateType { get; set; }
        public string? Incentive_SlabExpr { get; set; }

        public int? AmazonEdsp_VehicleTypeID { get; set; }
        public string? AmazonEdsp_VehicleTypeName { get; set; }

        // Audit Columns
        public string? AssignBy { get; set; }
        public DateTime? AssignDate { get; set; }
        public string? UpdateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        public string? Status { get; set; }

        // --- File Tracking & Audit ---
        public string? Source { get; set; }
        public string? FilePath { get; set; }

        // --- Legacy Vendor Fields (Backward Compatibility) ---
        public string? Vendor_Code { get; set; }
        public string? Vendor_Name { get; set; }
        public string? Vendor_RateType { get; set; }
        public string? Vendor_Type { get; set; }
        public string? Vendor_CategoryID { get; set; }
        public decimal? Vendor_Rate { get; set; }
        public decimal? Vendor_RateDeduction { get; set; }
        public decimal? Vendor_DeliveryRate { get; set; }
        public decimal? Vendor_PickupRate { get; set; }
        public decimal? Vendor_TDS { get; set; }
        public decimal? Vendor_MFNRate { get; set; }

        // --- Result Status & Remarks ---
        
        public string? Remarks { get; set; }
    }


    public class UploadVendorExcelRequest
    {
        public IFormFile file { get; set; }
        public string? fk_companyId { get; set; }
        public string? userId { get; set; }
        public string? fk_insUserID { get; set; }
    }

    
    [XmlRoot("VendorRateCards")]
    public class VendorRateCardUploadRequest
    {
        [XmlElement("VendorRateCardModel")]
        public List<VendorRateCardModel> RateCards { get; set; } = new List<VendorRateCardModel>();
    }
}