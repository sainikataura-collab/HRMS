using DocumentFormat.OpenXml.Math;
using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{

    [XmlRoot("NewDataSet")]
    public class ScreeningAppGenNode
    {
        [XmlElement("ScreenedApplication")]
        public List<ScreenedApplication> screenedApplication { get; set; } = new List<ScreenedApplication>(); // Ensure it's initialized

        //public string? Fk_UserID { get; set; }
        //public string? Fk_LocID { get; set; }


    }

    public class ScreenedApplication
    {
        public string pk_recId { get; set; }           
        public bool shortlist_status { get; set; }     // true = Accepted, false = Rejected
        public string remarks { get; set; }            // Any remarks/comments

    }


    public class ScreenedApplicationGetData
    {
        public string fk_jobid { get; set; }
        public string pk_recId { get; set; }
        public string candidate_name { get; set; }    
        public string gender { get; set; }    
        public string father_name { get; set; }    
        public string dateofbirth { get; set; }
        public string education { get; set; }

        public string mobile { get; set; }
        public string email { get; set; }
        public string corresAddress { get; set; }    
        public string filename { get; set; }    
        public string totexperience { get; set; }    
        public string currentctc { get; set; }    
        public string expectedctc { get; set; }    
        public string status { get; set;}    
        public bool shortList_status { get; set;}    
        public string remarks { get; set; }


    }





    public  class jobdata
    {

        public string pk_jobId { get; set; }
        public string Job_opening_date { get; set; }
        public string Job_closing_date { get; set; }
    }



}
