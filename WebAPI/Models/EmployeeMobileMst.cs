using System.ComponentModel.DataAnnotations;
using System.Runtime.Intrinsics.Arm;
using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{
    [XmlRoot("NewDataSet")]
    public class EmployeeMobileMstDataSet
    {
        [XmlElement("EmpList")]
        public List<EmployeeMobileMst> Employees { get; set; } = new List<EmployeeMobileMst>(); // List for multiple employees
    }

    public class EmployeeMobileMst
    {

        //[XmlElement("pk_empid")]
        //public string pk_empid {  get; set; }

        //[XmlElement("empcode")]

        //public string empcode { get; set; }
        //[XmlElement("manualempcode")]
        //public string? manualempcode { get; set; }  // Employee ID (Primary Key)

        //[XmlElement("empname")]
        //public string? empname { get; set; }

        //[XmlElement("dept")]
        //public string? dept { get; set; }
        [XmlElement("fk_empid")]
        public string fk_empid { get; set; }  // Employee ID (Primary Key)

        [XmlElement("PersonalContactno")]
        public string? PersonalContactno { get; set; }

        [XmlElement("OfficialContactno")]
        public string? OfficialContactno { get; set; }

        //[XmlElement("fk_deptid")]
        //public string? fk_deptid { get; set; }

        //[XmlElement("fk_locid")]
        //public string? fk_locid { get; set; }

    }
    public class EmployeeMobile
    {
        public string CID { get; set; }
        public string pk_empid { get; set; }
        public string empcode { get; set; }
        public string manualempcode { get; set; }
        public string empname { get; set; }
        public string Desig { get; set; }
        public string Depart { get; set; }
        public string PersonalContactno { get; set; }
        public string OfficialContactno { get; set; }
    }
}
