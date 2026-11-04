using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{
    [XmlRoot("NewDataSet")]
    public class EmployeeEmailMstDataSet
    {
        [XmlElement("EmpList")]
        public List<EmployeeEmailMst> Employees { get; set; } = new List<EmployeeEmailMst>(); // List for multiple employees
    }

    public class EmployeeEmailMst
    {

        [XmlElement("fk_empid")]
        public string fk_empid { get; set; }  // Employee ID (Primary Key)

        [XmlElement("PersonalEmail")]
        public string? PersonalEmail { get; set; }

        [XmlElement("OfficialEmail")]
        public string? OfficialEmail { get; set; }

    }
    public class EmployeeEmail
    {
        public string CID { get; set; }
        public string pk_empid { get; set; }
        public string empcode { get; set; }
        public string manualempcode { get; set; }
        public string empname { get; set; }
        public string Desig { get; set; }
        public string Depart { get; set; }
        public string PersonalEmail { get; set; }
        public string OfficialEmail { get; set; }
        
        public string MobileDeviceID { get; set; }
    }
}
