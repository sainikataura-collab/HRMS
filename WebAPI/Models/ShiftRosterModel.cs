using System;
using System.Collections.Generic;
using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{
    public class ShiftRosterModel
    {
        public long pk_rosterId { get; set; }
        public string? effectiveFrom { get; set; }
        public string? fk_empId { get; set; }
        public string? empCode { get; set; }
        public string? empName { get; set; }
        public long fk_shiftId { get; set; }
        public string? shiftName { get; set; }
        public string? weekOffDay { get; set; }
        public string? fk_companyId { get; set; }
        public bool isActive { get; set; } = true;
        public string? createdDate { get; set; }
    }

    [XmlRoot("NewDataSet")]
    public class ShiftRosterBulkDataSet
    {
        [XmlElement("RosterItem")]
        public List<ShiftRosterBulkItem>? RosterItems { get; set; }
    }

    public class ShiftRosterBulkItem
    {
        public string? effectiveFrom { get; set; }
        public string? empCode { get; set; }
        public string? shiftName { get; set; }
        public string? weekOffDay { get; set; }
    }

    public class ShiftRosterBulkResultItem
    {
        public int rowIndex { get; set; }
        public string? effectiveFrom { get; set; }
        public string? empCode { get; set; }
        public string? shiftName { get; set; }
        public string? weekOffDay { get; set; }
        public bool isValid { get; set; }
        public string? remarks { get; set; }
    }

    public class ShiftRosterFilterDto
    {
        public int pageIndex { get; set; } = 0;
        public int pageSize { get; set; } = 10;
        public string? searchTerm { get; set; } = "";
    }
}
