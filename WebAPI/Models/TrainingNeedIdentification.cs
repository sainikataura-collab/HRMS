namespace HRMSWebAPI.Models
{
    public class TrainingNeedIdentification
    {

        public TNIRequest Training { get; set; }
        public List<TNIRequestLine> TNIDetails { get; set; }
    }




    public class TNIRequest
    {
        public int? Pk_TNIId { get; set; }   // for update case
        public string? ReasonForTraining { get; set; }  // Performance Gap / Compliance / Skill Upgrade / Suggestion
        public string? Priority { get; set; }           // High / Medium / Low
        public string? ProposedTimeline { get; set; }   // Date / Quarter
        public string? TargetAudience { get; set; }     // Self / Team / Dept / Role
        public string? Remarks { get; set; }
        public string? AttachmentPath { get; set; }
        public long? TNILineId { get; set; }

        // File upload
        public IFormFile? FileBytes { get; set; }

        // From ContextAttachmentPath 
        public string? UserId { get; set; }
        public string? fk_empId { get; set; }    // Employee specific request
        public string? Fk_DeptId { get; set; }   // If department level
        public string? programName { get; set; }   // If department level
        public string? subprogramName { get; set; }   // If department level


        //use for get approve tni
        public List<TNIRequestLine> LineItems { get; set; } = new List<TNIRequestLine>();




    }
    public class TNIRequestLine
    {

        public int? TNILineId { get; set; }
        public int? fk_TNIId { get; set; }
        public long? fk_programId { get; set; }
        public string? ProgramName { get; set; }
        public long? fk_subprogramId { get; set; }
        public string? SubProgramName { get; set; }
        public string? Status
        {
            get; set;
        }
    }
    public class Training_Need_Program_Detail
    {
        public int? fk_TNIId { get; set; }
        public long? fk_programId { get; set; }
        public long? fk_subprogramId { get; set; }

    }



    //-- for admin portal

    public class TNIListFilter
    {
        public string? Status { get; set; } = null;     // null / Pending / Approved / Rejected / Hold
        public string? Priority { get; set; }   // null / High / Medium / Low
        public DateTime? FromDate { get; set; } = null;
        public DateTime? ToDate { get; set; } = null;
        public string? Search { get; set; } = null;
        public int PageSize { get; set; } = 10;
        public int PageNo { get; set; } = 1;

    }

    public class TNIListRow
    {
        public int Pk_TNIId { get; set; }
        public string fk_empId { get; set; }
        public string TrainingTitle { get; set; }
        public string Reason { get; set; }
        public string Priority { get; set; }
        public string ProposedTimeline { get; set; }
        public string TargetAudience { get; set; }
        public string EmpName { get; set; }
        public string Remarks { get; set; }
        public string AttachmentPath { get; set; }
        public string Status { get; set; }
        public string CreatedBy { get; set; }
        public DateTime? CreatedDate { get; set; }
        public string UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public string AdminComment { get; set; }
        public string ProgramName { get; set; }
        public string SubProgramName { get; set; }
        public string approvalStatus { get; set; }

        public int TotalCount { get; set; }
        public long? TNILineId { get; set; }

        public long? fk_programId { get; set; }
        public long? fk_subprogramId { get; set; }

        //
        //public string CalendarStatus { get; set; }
        //public string CalendarLocation { get; set; }
        //public string CalendarTrainer { get; set; }
        //public string CalendarMode { get; set; }
        //public string CalendarDateTime { get; set; }
       
        public string PlanningLocation { get; set; }
        public string PlanningTrainer { get; set; }
        public string PlanningMode { get; set; }
        public DateTime planningDateTime { get; set; }

    }

    public class TNIActionRequest
    {
        public int? Pk_TNIId { get; set; }
        public string Action { get; set; }          // Approve / Reject / Hold
        public string? AdminComments { get; set; }
        public string? UserId { get; set; }          // admin id


        public long? fk_programId { get; set; }
        public long? fk_subprogramId { get; set; }
        public long? TNILineId { get; set; }
    }


    public class TrainingCalendarEmployeeView
    {
        public string EmpName { get; set; }           // Employee Name
        public string ProgramName { get; set; }       // Program Name
        public string SubProgramName { get; set; }    // SubProgram Name
        public int Pk_TNIId { get; set; }             // TNI Id
        public int Fk_ProgramId { get; set; }         // Program Id
        public int Fk_SubProgramId { get; set; }      // SubProgram Id
        public string FinalStatus { get; set; }       // Final Status

        public string PlanningStatus { get; set; }    // Status from Planning
        public string CalendarStatus { get; set; }    // Status from Calendar
        public DateTime? TrainingDateTime { get; set; } // Training Date/Time (nullable)
        public string Trainer { get; set; }           // Trainer
        public string Mode { get; set; }              // Mode (Online/Offline)
        public string Location { get; set; }          // Location
        public string AdminComment { get; set; }      // Admin remarks/comments
    }







}
