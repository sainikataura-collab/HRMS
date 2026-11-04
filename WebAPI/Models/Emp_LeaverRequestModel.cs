using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{
  
    [XmlRoot("NewDataSet")]

    public class Emp_LeaverRequestModel
    {

        [XmlElement("SAL_Leave_Apply")]
        public SAL_Leave_Apply sAL_Leave_Apply { get; set; }


        [XmlElement("SAL_Leave_Apply_Details")]

        //public SAL_Leave_Apply_Details sAL_Leave_Apply_Details { get; set; }
        public List<SAL_Leave_Apply_Details> sAL_Leave_Apply_Details { get; set; }
        public string attSource { get; set; } = "W";

    }


    public class Emp_leaveTakenLeaveBalance
    {
        //public string fk_empid { get; set; }
        //public long fk_leaveid { get; set; }
        public decimal? currentyearleaves { get; set; }
        public decimal? totalleavesearned { get; set; }
        public decimal? Totalleavebal { get; set; }
        public decimal? leaveavailed { get; set; }
        public bool? OnProDataBasis { get; set; }

        public decimal? ProRatedLeaveAllowed { get; set; }
        public decimal? ProRatedLeaveRemaining { get; set; }


    }
    public class SAL_Leave_Apply
    {
        [XmlElement("pk_leaveappid")]
        public long? pk_leaveappid { get; set; }

        [XmlElement("fk_empid")]
        public string fk_empid { get; set; }

        [XmlElement("fk_finid")]
        public string fk_finid { get; set; }

        [XmlElement("fk_leaveid")]
        public string fk_leaveid { get; set; }

        [XmlElement("dated")]
        public string? dated { get; set; }

        [XmlElement("fromdate")]
        public string? fromdate { get; set; }

        [XmlElement("todate")]
        public string? todate { get; set; }

        [XmlElement("totdays")]
        public decimal totdays { get; set; } 

        [XmlElement("contactno")]
        public string? contactno { get; set; } = "";

        [XmlElement("contactduringleave")]
        public string? contactduringleave { get; set; } = "";

        [XmlElement("status")]
        public string? status { get; set; } = "";

        [XmlElement("remarks")]
        public string? remarks { get; set; } = "";

        [XmlElement("costhead")]
        public string? costhead { get; set; } = "";

        [XmlElement("eligibility")]
        public string? eligibility { get; set; } = "";

        [XmlElement("DepartTktClass")]
        public string? DepartTktClass { get; set; }

        [XmlElement("FromLoc")]
        public string? FromLoc { get; set; } = "";

        [XmlElement("ToLoc")]
        public string? ToLoc { get; set; } = "";

        [XmlElement("ReturnTktClass")]
        public string? ReturnTktClass { get; set; } = "";

        [XmlElement("FromLoc1")]
        public string? FromLoc1 { get; set; } = "";

        [XmlElement("ToLoc1")]
        public string? ToLoc1 { get; set; } = "";

        [XmlElement("eligible")]
        public bool eligible { get; set; } = true;

        [XmlElement("advance")]
        public decimal? advance { get; set; } = 0;

        [XmlElement("remarks1")]
        public string? remarks1 { get; set; } = "";

        [XmlElement("otherdetails")]
        public string? otherdetails { get; set; } = "";

        // Optional fields
        [XmlElement("fk_empstaffid")]
        public string? fk_empstaffid { get; set; } = "";

        [XmlElement("intime")]
        public string? intime { get; set; } = "";

        [XmlElement("outtime")]
        public string? outtime { get; set; } = "";

        [XmlElement("totalhours")]
        public string? totalhours { get; set; } = "";

        [XmlElement("VendorName")]
        public string? VendorName { get; set; } = "";

        [XmlElement("VendorMobileno")]
        public string? VendorMobileno { get; set; } = "";

        [XmlElement("VendorAddress")]
        public string? VendorAddress { get; set; } = "";

        [XmlElement("VendorLocation")]
        public string? VendorLocation { get; set; } = "";
    }

    public class SAL_Leave_Apply_Details
    {
        [XmlElement("fk_leaveappid")]
        public long? fk_leaveappid { get; set; } 

        [XmlElement("sno")]
        public int? sno { get; set; }

        [XmlElement("fk_leaveid")]
        public string? fk_leaveid { get; set; } = "";

        [XmlElement("dated")]
        public DateTime dated { get; set; }

        [XmlElement("clubcase")]
        public string? clubcase { get; set; } = "";

        [XmlElement("covercase")]
        public string? covercase { get; set; } = "";

        [XmlElement("ishalfday")]
        public bool ishalfday { get; set; }

        [XmlElement("halfdaystatus")]
        public string? halfdaystatus { get; set; } = "";

        [XmlElement("remarks")]
        public string? remarks { get; set; } = "";

        [XmlElement("halfdayclub")]
        public string? halfdayclub { get; set; } = "";
    }


    public class Empl_LeaveResponse
    {
        public string CID { get; set; }
        public string pk_leaveappid { get; set; }
        public string leavetype { get; set; }
        public string dated { get; set; }
        public string fromdate { get; set; }
        public string todate { get; set; }
        public string totdays { get; set; }
        public string statusname { get; set; }
        public char status { get; set; }
        public string statusimagename { get; set; }
        public string remarks { get; set; }

    }


}


