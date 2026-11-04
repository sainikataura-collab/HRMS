using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{

  //Model for Insert Operation (Uses CRM_Suspect_Mst)

    [XmlRoot("NewDataSet")]
    public class ShiftMstInsertDataSet
    {
        [XmlElement("CRM_Suspect_Mst")]
        public ShiftMst Shifts { get; set; }
    }

   
     //Model for Update Operation (Uses SAL_Shift_Mst)
  
    [XmlRoot("NewDataSet")]
    public class ShiftMstUpdateDataSet
    {
        [XmlElement("SAL_Shift_Mst")]
        public ShiftMst Shifts { get; set; }
    }


    public class ShiftMst
    {

        // Needed for Update but ignored in Insert
        public long? pk_shiftId { get; set; }

        [StringLength(50, ErrorMessage = "shiftName must be minimum 2 and  maximum 50 character  long.", MinimumLength = 2)]
        public string shiftName { get; set; }

        [StringLength(5, ErrorMessage = "startHrs must be minimum 2 and  maximum 5 character  long.", MinimumLength = 2)]
        public string? startHrs { get; set; }

        [StringLength(5, ErrorMessage = "startMinute must be minimum 2 and  maximum 5 character  long.", MinimumLength = 2)]
        public string? startMinute { get; set; }

        [StringLength(5, ErrorMessage = "endHrs must be minimum 2 and  maximum 5 character  long.", MinimumLength = 2)]
        public string endHrs { get; set; }

        [StringLength(5, ErrorMessage = "endMinute must be minimum 2 and  maximum 5 character  long.", MinimumLength = 2)]
        public string? endMinute { get; set; }
        public decimal shiftHour { get; set; }
        public string ? graceTime { get; set; }
        public bool isActive { get; set; }

        public string? startTime { get; set; }

        public string? endTime { get; set; }

        public string ? fk_catid { get; set; }
        //added
        public string? fk_shifttype { get; set; }



        // Computed properties for StartTime and EndTime
        [XmlIgnore]
        //public string StartTime => $"{startHrs}:{startMinute}";

        //[XmlIgnore]
        //public string EndTime => $"{endHrs}:{endMinute}";

        public string? fk_InsuserId { get; set; }  // Inserted by User ID
        public string? fk_locId { get; set; }  // Location ID
        public string? fk_companyId { get; set; }  // Company ID

        public string? duration { get; set; }
        public string? compenstationTime { get; set; }
    }


  

}
