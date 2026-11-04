using DocumentFormat.OpenXml.Wordprocessing;

namespace HRMSWebAPI.Models
{
    public class TrainingSubProgramMst
    {

        public long? fk_programId { get; set; }
        public long? pk_subProgramId { get; set; }
        public string subProgramName { get; set; }
        
        public bool? isActive { get; set; }
        public string? Active { get; set; }
        public string? UserId { get; set; }
        public string? program { get; set; }

       

    }

   
}
