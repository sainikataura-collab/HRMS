namespace HRMSWebAPI.Controllers
{
    public class ChangePasswordRequest
    {
        public string fk_empid { get; set; }
        public string password { get; set; }
    }

}
