using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{

    public class listResult
    {
        public int totalCount1 { get; set; }
        public List<leaveAccrualMst> leaveAccrualMst { get; set; }
        public int totalCount2 { get; set; }
        public List<leaveAccrualMst1> leaveAccrualMst1 { get; set; }



    }

    public class leaveAccrualMst
    {
        public long CID { get; set; }
        public string pk_empid { get; set; }
        public string empcode { get; set; }
        public string empname { get; set; }
        public string LeaveType { get; set; }
        public decimal attdays { get; set; } = 0;
        public decimal currentyearleaves { get; set; } = 0;
        public decimal accrualleaves { get; set; } = 0;
        public decimal totalbalance { get; set; } = 0;
    }

    public class leaveAccrualMst1
    {

        public string CID { get; set; }

        public string designation { get; set; }
        public string pk_empid { get; set; }
        public string empcode { get; set; }
        public string empname { get; set; }
        public string locname { get; set; }
        public string department { get; set; }
    }


    public class leaveAccrualRequest
    {

        public string? empcode { get; set; } = "";
        public string? empcodemanual { get; set; } = "";
        public string? empname { get; set; } = "";
        public List<string> SelectedDepartments { get; set; } = new List<string>();
        public List<string> SelectedLocations { get; set; } = new List<string>();

        public string? selectedDesignation { get; set; } = "";
        public string? selectedNature { get; set; } = "";
        public string? selectedCity { get; set; } = "";
        public string sortBy { get; set; } = "";
        public string fk_monthId { get; set; } = "";

        public string fk_yearId { get; set; } = "";
        public string? fk_costcentreid { get; set; } = "";

        public int PageIndex1 { get; set; }
        public int PageSize1 { get; set; }
        public int PageIndex2 { get; set; }
        public int PageSize2 { get; set; }




    }

    //for delete
    public class Emplist
    {

        public string pk_empid { get; set; }
        public decimal currentyearleaves { get; set; }
        public decimal accrualleaves { get; set; }
        public decimal totalbalance { get; set; }


    }
    [XmlRoot("NewDataSet")] // 👈 Correct root tag
    public class NewDataSet
    {

        [XmlElement("EmpList")]
        public List<Emplist> Emplist { get; set; }

        [XmlIgnore]
        public string fk_monthId { get; set; }
        [XmlIgnore]
        public string fk_yearId { get; set; }
        [XmlIgnore]
        public string? fk_locid { get; set; }

        [XmlIgnore]
        public string? fk_userID { get; set; }

        [XmlIgnore]
        public string? fk_finid { get; set; }

        [XmlIgnore]
        public string? empcode { get; set; } = "";
        [XmlIgnore]
        public string? empcodemanual { get; set; } = "";
        [XmlIgnore]
        public string? empname { get; set; } = "";


        public List<string> SelectedDepartments { get; set; } = new List<string>();
        public List<string> SelectedLocations { get; set; } = new List<string>();
        [XmlIgnore]
        public string? selectedDesignation { get; set; } = "";
        [XmlIgnore]
        public string? selectedNature { get; set; } = "";
        [XmlIgnore]
        public string? selectedCity { get; set; } = "";
        [XmlIgnore]
        public string sortBy { get; set; } = "";
        //public string fk_monthId { get; set; } = "";

        //public string fk_yearId { get; set; } = "";
        [XmlIgnore]
        public string? fk_costcentreid { get; set; } = "";

    }

}
