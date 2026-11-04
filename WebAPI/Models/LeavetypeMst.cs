using System;
using System.Collections.Generic;
using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{
    [XmlRoot("NewDataSet")]
    public class LeaveTypeMstDataSet
    {
        //[XmlElement("SAL_Leavetype_Mst")]
        //public List<LeavetypeMst> LeaveTypeMaster { get; set; } = new List<LeavetypeMst>();


        //public byte[]? Timestamp { get; set; }
        //public long? Pk_leaveid { get; set; }


        [XmlElement("SAL_Leavetype_Mst")]
        public LeavetypeMst LeaveTypeMaster { get; set; }

        [XmlElement("SAL_Leavetype_Details")]
        public List<LeaveTypeDetails> LeaveTypeDetails { get; set; } = new List<LeaveTypeDetails>(); // Ensure it's initialized

        public byte[]? Timestamp { get; set; }




    }

    public class LeavetypeMst
    {

        [XmlElement("pk_leaveid")]
        public long? pk_leaveid { get; set; }

        [XmlElement("leavetype")]
        public string leavetype { get; set; }

        [XmlElement("shortdesc")]
        public string shortdesc { get; set; }

        [XmlElement("leavenature")]
        public string leavenature { get; set; }

        [XmlElement("remarks")]
        public string? remarks { get; set; }
    }

    public class LeaveTypeDetails
    {

        [XmlElement("fk_leaveid")]
        public long? fk_leaveid { get; set; }

        [XmlElement("fk_natureid")]
        public string fk_natureid { get; set; }

        [XmlElement("maxperyear")]
        public short maxperyear { get; set; }

        [XmlElement("cf")]
        public bool? cf { get; set; }

        [XmlElement("totalleavelimit")]
        public short totalleavelimit { get; set; }

        [XmlElement("leavelimitperinstance")]
        public short? LeaveLimitPerInstance { get; set; }

        [XmlElement("fixedtimesissue")]
        public bool fixedtimesissue { get; set; }

        [XmlElement("totaltimesissue")]
        public byte totaltimesissue { get; set; }

        [XmlElement("cashable")]
        public bool? cashable { get; set; }

        [XmlElement("maxcashable")]
        public decimal maxcashable { get; set; }

        [XmlElement("minlvbaltoencash")]
        public decimal minlvbaltoencash { get; set; }

        [XmlElement("isconvertible")]
        public bool? isconvertible { get; set; }

        [XmlElement("lvprocessingtype")]
        public string? lvprocessingtype { get; set; }

        [XmlElement("amount")]
        public decimal amount { get; set; }

        [XmlElement("fk_formulaid")]
        public string? fk_formulaid { get; set; }

        [XmlElement("club_woff")]
        public bool? club_woff { get; set; }

        [XmlElement("cover_woff")]
        public bool? cover_woff { get; set; }

        [XmlElement("club_nh")]
        public bool? club_nh { get; set; }

        [XmlElement("cover_nh")]
        public bool? cover_nh { get; set; }

        [XmlElement("negbalallowed")]
        public bool? negbalallowed { get; set; }

        [XmlElement("pfded")]
        public bool? pfded { get; set; }

        [XmlElement("maxhold")]
        public decimal? maxhold { get; set; }

        [XmlElement("maxlimitinmonth")]
        public decimal? maxlimitinmonth { get; set; }

        [XmlElement("basedon")]
        public string? basedon { get; set; }

        [XmlElement("cf_max")]
        public short? cf_max { get; set; }

        [XmlElement("onearnedbasis")]
        public bool? onearnedbasis { get; set; }

        // ✅ ADD THIS NEW PROPERTY:

        [XmlElement("earnedBasedOn")]
        public int? earnedBasedOn { get; set; }//Added

        [XmlElement("creditleavemonthly")]
        public bool? creditleavemonthly { get; set; }//Added

        [XmlElement("sandwichapplicable")]
        public bool? sandwichapplicable { get; set; }//Added

        [XmlElement("leaveid")]
        public string? leaveid { get; set; }//Added



        [XmlElement("onprodatabasis")]
        public bool? onprodatabasis { get; set; }
        public string? fk_empid { get; set; }
        public decimal? LeaveBalance { get; set; }
        public string? shortleave { get; set; }

    }

    public class LeaveDetails
    {

        [XmlElement("fk_leaveid")]
        public long? fk_leaveid { get; set; }

        [XmlElement("fk_natureid")]
        public string? fk_natureid { get; set; }

        [XmlElement("maxperyear")]
        public short maxperyear { get; set; }

        [XmlElement("cf")]
        public bool cf { get; set; }

        [XmlElement("totalleavelimit")]
        public short totalleavelimit { get; set; }

        [XmlElement("leavelimitperinstance")]
        public short? LeaveLimitPerInstance { get; set; }

        [XmlElement("fixedtimesissue")]
        public bool fixedtimesissue { get; set; }

        [XmlElement("totaltimesissue")]
        public byte? totaltimesissue { get; set; }

        [XmlElement("cashable")]
        public bool? cashable { get; set; }

        [XmlElement("maxcashable")]
        public decimal maxcashable { get; set; }

        [XmlElement("minlvbaltoencash")]
        public decimal minlvbaltoencash { get; set; }

        [XmlElement("isconvertible")]
        public bool? isconvertible { get; set; }

        [XmlElement("lvprocessingtype")]
        public string? lvprocessingtype { get; set; }

        [XmlElement("amount")]
        public decimal amount { get; set; }

        [XmlElement("fk_formulaid")]
        public string? fk_formulaid { get; set; }

        [XmlElement("club_woff")]
        public bool? club_woff { get; set; }

        [XmlElement("cover_woff")]
        public bool? cover_woff { get; set; }

        [XmlElement("club_nh")]
        public bool? club_nh { get; set; }

        [XmlElement("cover_nh")]
        public bool? cover_nh { get; set; }

        [XmlElement("negbalallowed")]
        public bool? negbalallowed { get; set; }

        [XmlElement("pfded")]
        public bool? pfded { get; set; }

        [XmlElement("maxhold")]
        public decimal? maxhold { get; set; }

        [XmlElement("maxlimitinmonth")]
        public decimal? maxlimitinmonth { get; set; }

        [XmlElement("basedon")]
        public string? basedon { get; set; }

        [XmlElement("cf_max")]
        public short? cf_max { get; set; }

        [XmlElement("onearnedbasis")]
        public bool? onearnedbasis { get; set; }
        public string? fk_empid { get; set; }
        public decimal? LeaveBalance { get; set; }

    }
}
