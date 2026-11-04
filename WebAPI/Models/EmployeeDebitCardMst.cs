using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{
   

        [XmlRoot("NewDataSet")]
        public class EmployeeDebitCardMstDataSet
        {
            [XmlElement("EmpList")]
            public List<EmployeeDebitCardMst> Employees { get; set; } = new List<EmployeeDebitCardMst>(); // List for multiple employees
        }

        public class EmployeeDebitCardMst
        {

            [XmlElement("fk_empid")]
            public string fk_empid { get; set; }  // Employee ID (Primary Key)

            [XmlElement("Debit_Card")]
            public string? Debit_Card { get; set; }

            [XmlElement("Advance_Limit")]
            public decimal? Advance_Limit { get; set; }

        }
        public class EmployeeDebitCard
        {
            public string CID { get; set; }
            public string pk_empid { get; set; }
            public string empcode { get; set; }
            public string manualempcode { get; set; }
            public string empname { get; set; }
            public string Desig { get; set; }
            public string Depart { get; set; }
            public string Debit_Card { get; set; }
        public decimal Advance_Limit { get; set; }

    }
    }
