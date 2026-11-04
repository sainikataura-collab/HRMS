using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{
    public class TrainingCalendar
    {
        public int pk_calendarId { get; set; }
        public int fk_programId { get; set; }
        public int fk_TNIId { get; set; }
        public int fk_subprogramId { get; set; }
        public long fk_planningId { get; set; }
        public string trainer { get; set; }
        public string mode { get; set; }
        public DateTime trainingDateTime { get; set; }
        public string location { get; set; }
        public string status { get; set; }
        public DateTime createdDate { get; set; }
    }






    public class getAdminCalendarList
    {
        public int pk_calendarId { get; set; }
        public int fk_programId { get; set; }
        public int fk_subprogramId { get; set; }
        public string trainer { get; set; }
        public string mode { get; set; }
        public string programName { get; set; }
        public string subprogramName { get; set; }
        public DateTime trainingStartDate { get; set; }
        public DateTime trainingEndDate { get; set; }
        public string location { get; set; }
        public string calendarStatus { get; set; }
        public string trainingStatus { get; set; }
        public string priority { get; set; }
        public string reason { get; set; }
        public string duration { get; set; }
        public string attendance { get; set; } // p or A
        public int pk_planningId { get; set; }
        public int pk_attId { get; set; }

    }

    public class TrainingAttendanceDto
    {
        public int? fk_calendarId { get; set; }
        public int? pk_planningId { get; set; }
        public string? fk_empId { get; set; }
        public string? adminId { get; set; }
        public string ?remarks { get; set; }
        public string ? attendanceStatus { get; set; }
        public DateTime ? attendanceDate { get; set; }
        public string? Otp { get; set; }

    }
    public class TrainingAttendanceEmployeeInfo
    {
        public int fk_calendarId { get; set; }
        public string fk_empId { get; set; }
        public string EmpName { get; set; }
        public string ProgramName { get; set; }
        public string SubProgramName { get; set; }
    }

    public class TrainingAttendanceDetail
    {
        public DateTime AttendanceDate { get; set; }
        public DateTime AttendanceTime { get; set; }
        public string AttendanceStatus { get; set; }
    }


    //public class TrainingMaterial
    //{
    //    public int? pk_materialId { get; set; }

    //    [Required(ErrorMessage = "Training ID is required")]
    //    public int? sessionId { get; set; }

    //    public int? fk_planningId { get; set; }

    //    //[Required(ErrorMessage = "Material type is required")]
    //    //[RegularExpression("^(video|link|document|youtube|file)$", ErrorMessage = "Invalid material type")]
    //    public string materialType { get; set; }

    //    //[Required(ErrorMessage = "Material title is required")]
    //    //[StringLength(255)]
    //    public string materialTitle { get; set; }

    //    public string? materialPath { get; set; }

    //    [Url(ErrorMessage = "Invalid URL format")]
    //    public string? materialUrl { get; set; }

    //    public string? description { get; set; }

    //    public string? fileSize { get; set; }

    //    public string duration { get; set; }

    //    public int? displayOrder { get; set; } = 0;

    //    public bool isActive { get; set; } = true;

    //    public bool isMandatory { get; set; } = false;


    //    public string? uploadedBy { get; set; }

    //    public DateTime? uploadedDate { get; set; }

    //    public string updatedBy { get; set; }

    //    public DateTime? updatedDate { get; set; }
    //}





    public class TrainingMaterial
    {
        public int? pk_materialId { get; set; }
        public int? sessionId { get; set; }
        public int? fk_planningId { get; set; }
        public string? materialType { get; set; }   // "video", "document", "youtube", "link", etc.
        public string? materialTitle { get; set; }
        public string? materialUrl { get; set; }
        public string? description { get; set; }
        public string? duration { get; set; }
        public int? displayOrder { get; set; } 
        public bool? isActive { get; set; }
        public bool? active { get; set; }
        public bool? isMandatory { get; set; }

        public string? materialPath { get; set; }    // store after upload
        public string? uploadedBy { get; set; }    // store after upload
        public string? fileSize { get; set; }        // computed in KB/MB

        [FromForm]
        public IFormFile? file { get; set; }         // optional form file
    }









    //public class TrainingMaterialTracking
    //{
    //    public int? pk_trackId { get; set; }


    //    public int fk_materialId { get; set; }


    //    public string fk_empId { get; set; }

    //    public int? fk_atId { get; set; }

    //    public string viewStatus { get; set; } 

    //    public decimal viewedPercentage { get; set; } = 0;

    //    public DateTime? startedOn { get; set; }

    //    public DateTime? completedOn { get; set; }

    //    public int totalViewTime { get; set; } = 0;

    //    public DateTime? lastViewedOn { get; set; }

    //    public string remarks { get; set; }
    //}



    //feedback part

 


        [XmlRoot("NewDataSet")]
        public class TrainingFeedbackDataSet
        {
            [XmlElement("TRN_TrainingFeedback")]
            public TrainingFeedback Feedback { get; set; }
        }

        public class TrainingFeedback
        {
          
            public int? pk_feedbackId { get; set; }

          
            [Required(ErrorMessage = "Planning Id is required.")]
            public int fk_planningId { get; set; }

         
            public string? fk_empId { get; set; }
            public string? recommend { get; set; }

            public int? rating { get; set; }

            [XmlElement("comments")]
            [StringLength(1000, ErrorMessage = "Comments can be maximum 1000 characters long.")]
            public string? comments { get; set; }

            
            public DateTime? Date { get; set; }

        
            public string? fk_userid { get; set; }

    
            public string? fk_locid { get; set; }

          
            public string? fk_companyId { get; set; }
        }
    }








