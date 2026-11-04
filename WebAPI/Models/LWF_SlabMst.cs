using System.ComponentModel.DataAnnotations;

namespace HRMSWebAPI.Models
{
    public class LWF_SlabMst
    {


             public short fk_cityid { get; set; }
             public short? fk_stateid { get; set; }
             public long? pk_slabid { get; set; }
            public short sno { get; set; }
            public string effecttype { get; set; }
            public string? MMYYYY { get; set; }
            public string? EffectT { get; set; }
            public DateTime effectivefrom { get; set; }
            public decimal Amt { get; set; }
            public decimal emrmultiple { get; set; }
            public string? fk_insUserID { get; set; }
            public string? fk_locId { get; set; }
        public decimal? SlabPercent { get; set; }
        public byte[]? Timestamp { get; set; }

        public string? description { get; set; }

    }
}
