using DocumentFormat.OpenXml.Drawing.Charts;
using DocumentFormat.OpenXml.InkML;
using DocumentFormat.OpenXml.Math;
using DocumentFormat.OpenXml.Spreadsheet;
using iTextSharp.text.pdf.parser.clipper;
using System.Reflection;
using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{



    [XmlRoot("NewDataSet")]
    public class CandidateSalaryDataSet
    {

        [XmlElement("Candidate")]

        public Candidate Candidate { get; set; }

        [XmlElement("REC_Candidate_SalaryHead")]

        public List<SalaryHead> SalaryHeads { get; set; }
    }






    public class Candidate
    {
        public string? fk_locid { get; set; }
        public string fk_classid { get; set; }

        public string basedon { get; set; } //BasedOn: e.g., 'G' for Gross, 'B' for Basic etc.

        public decimal ctc { get; set; }
        public decimal basic { get; set; }

        public bool pf_app { get; set; }
        public bool esi_app { get; set; }

    }

    public class SalaryHead
    {
        public string fk_recId { get; set; }      // Foreign Key to Candidate or similar
        public long fk_headid { get; set; }     // Foreign Key to salary head type
        public decimal amount { get; set; }
    }




    public class CandidateSalary
    {
        public string pk_recId { get; set; }
        public string candidate_name { get; set; }
        public string father_name { get; set; }
        public string gender { get; set; }
        public string dob { get; set; }
        public string phone { get; set; }
        public string mobile { get; set; }
        public string email { get; set; }
        public string filename { get; set; }
        public string picturename { get; set; }
    }



    //Candidate details for salary by candidate Id from here


    public class Candidate_Detail
    {
        public string pk_recId { get; set; }
        public string fk_jobId { get; set; }
        public string candidate_name { get; set; }
        public string father_name { get; set; }
        public string gender { get; set; }
        public string dateofbirth { get; set; }
        public string totexperience { get; set; }
        public string currentctc { get; set; }
        public string expectedctc { get; set; }
        public string fk_locid { get; set; }
        public string fk_classid { get; set; }
        public string basedon { get; set; }

        public decimal ctc { get; set; }
        public decimal basic { get; set; }

        public bool pf_app { get; set; }
        public bool esi_app { get; set; }
        public string Notification_no { get; set; }
        public string Job_title { get; set; }
        public string remarks { get; set; }
    }


    public class Candidate_SalaryHead
    {
        public string fk_recId { get; set; }
        public long fk_headid { get; set; }
        public decimal amount { get; set; }
        public long pk_headid { get; set; }
        public string description { get; set; }
        public string shortdesc { get; set; }
        public string headtype { get; set; }
        public string mapping { get; set; }
        public int orderlevel { get; set; }
        public string rounding { get; set; }
        
     }

    public class EarningAmount
    {
        public int earningAmount { get; set; }
    }

    public class DeductionAmount
    {
        public int deductionAmount { get; set; }
    }














}


