using System;
using System.Collections.Generic;

namespace HRMSWebAPI.Models
{
    public class CommonRateCardModel
    {
        public long pk_RateCardID { get; set; }
        public long? ClientID { get; set; }
        public string? ClientName { get; set; }
        public int? ModelID { get; set; }
        public string? ModelName { get; set; }
        public string? LocationID { get; set; }
        public string? LocationName { get; set; }
        public string? FHRID { get; set; }
        public DateTime? EffectiveFrom { get; set; }

        // Active Rate Columns
        public decimal? Normal_Rate { get; set; }
        public string? Normal_RateType { get; set; }
        public string? Normal_SlabExpr { get; set; }

        public decimal? Pickup_Rate { get; set; }
        public string? Pickup_RateType { get; set; }
        public string? Pickup_SlabExpr { get; set; }

        public decimal? Rto_Rate { get; set; }
        public string? Rto_RateType { get; set; }
        public string? Rto_SlabExpr { get; set; }

        public decimal? Dto_Rate { get; set; }
        public string? Dto_RateType { get; set; }
        public string? Dto_SlabExpr { get; set; }

        public decimal? Fm_Rate { get; set; }
        public string? Fm_RateType { get; set; }
        public string? Fm_SlabExpr { get; set; }

        public decimal? MFN_Rate { get; set; }
        public string? MFN_RateType { get; set; }
        public string? MFN_SlabExpr { get; set; }

        public decimal? Van_Rate { get; set; }
        public string? Van_RateType { get; set; }
        public string? Van_SlabExpr { get; set; }

        public decimal? Shopsy_Deduction_Rate { get; set; }
        public string? Shopsy_RateType { get; set; }
        public string? Shopsy_SlabExpr { get; set; }

        public decimal? U2S_Rate { get; set; }
        public string? U2S_RateType { get; set; }
        public string? U2S_SlabExpr { get; set; }

        public decimal? Prexo_Rate { get; set; }
        public string? Prexo_RateType { get; set; }
        public string? Prexo_SlabExpr { get; set; }

        public decimal? Grocery_Rate { get; set; }
        public string? Grocery_RateType { get; set; }
        public string? Grocery_SlabExpr { get; set; }

        public int? Large_VehicleTypeID { get; set; }
        public string? Large_VehicleTypeName { get; set; }

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


    }

    public class CommonRateCardFilterModel
    {
        public int PageIndex { get; set; } = 0;
        public int PageSize { get; set; } = 10;
        public long? ClientID { get; set; }
        public int? ModelID { get; set; }
        public string? LocationID { get; set; }
        public string? SearchTerm { get; set; } = "";
    }
}
