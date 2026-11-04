using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{
    [XmlRoot(ElementName = "NewDataSet")]
    public class ReminderSetupXmlModel
    {
        [XmlElement("APP_Reminder_Setup")]
        public List<ReminderSetupMst> ReminderSetupMst { get; set; }
    }

    public class ReminderSetupMst
    {
        public string Alert { get; set; }             // e.g., "KRA Intimation Alert"
        public string Message { get; set; }           // e.g., "Please submit your KRA"
        public bool IsActive { get; set; }            // true = ON, false = OFF
        public int AlertCount { get; set; }
    }
}
