using System;

namespace HRMSWebAPI.Models
{
    public class SubDepartmentMst
    {
		public string? pk_subdeptid {  get; set; }
		public string fk_deptid {  get; set; }
		public string description {  get; set; }
		public string? fk_subDepHodid {  get; set; }
		public bool? active {  get; set; }
		public string? Fk_UserID {  get; set; }
		public string? Fk_LocID {  get; set; }
		public string? fk_companyId {  get; set; }
        public byte[]? Timestamp {  get; set; }
    }

    public class SubDepartmentforGetData
    {
        public string? pk_subdeptid { get; set; }
        public string description { get; set; }
        public string activeAlias { get; set; }
        public string department { get; set; }
        
    }




}
