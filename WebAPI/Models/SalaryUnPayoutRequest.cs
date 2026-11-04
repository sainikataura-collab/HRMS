namespace HRMSWebAPI.Models
{
    public class SalaryUnPayoutRequest
    {
        public string fk_monthId { get; set; } = "";
        public string fk_yearId { get; set; } = "";
        public List<EmployeeRemark> Employees { get; set; } = new();
    }

    public class EmployeeRemark
    {
        public string pk_empid { get; set; } = "";
        public string remark { get; set; } = "";
    }
}
