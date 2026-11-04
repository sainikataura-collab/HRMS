using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace HRMSWebAPI.Models
{
    public class General
    {
    }

    public class NameValue
    {
        public string Name { get; set; }
        public string Value { get; set; }

    }
    public class LocationNameValue
    {
        public string pk_locid { get; set; }
        public string locname { get; set; }

    }

    public class Result
    {
        public bool IsSuccessfull { get; set; }
        public string Message { get; set; }
        public bool IsAvailable { get; set; }
    }


    public class Result<T>
    {
        public bool IsSuccessfull { get; set; }
        public string Message { get; set; }
        public T Data { get; set; }
        public int count { get; set; }
    }



    public class MasterGeneral : BaseModel
    {
        [Required(ErrorMessage = "Please select Code Type")]
        [Display(Name = "Code Type")]
        public string CodeTypeId { get; set; }
        //public short CodeTypeId { get; set; }

        public string? CodeId { get; set; }
        //public short? CodeId { get; set; }

        [Display(Name = "Code Description")]
        public string? CodeDescription { get; set; }

        [Display(Name = "Code Type")]
        public string? CodeType { get; set; }

        [Display(Name = "Used In")]
        public string? UsedIn { get; set; }

        [Required(ErrorMessage = "Name is Required")]

        [StringLength(50, ErrorMessage = "Code Description must be minimum 1 and maximum 50 character long", MinimumLength = 1)]

        public string? Name { get; set; }
        public string? Code { get; set; }
        public bool IsCodeRequired { get; set; }

        //public string? OrganizationId { get; set; }
        public string? OrganizationName { get; set; }
    }
    public class CodeTypeByName
    {
        public string CodeTypeId { get; set; }
        //public short CodeTypeId { get; set; }

        public string CodeId { get; set; }
        //public byte CodeId { get; set; }
        public string CodeDescription { get; set; }
    }







    public class InsertResult
    {
        public bool IsSuccessfull { get; set; }
        public string Message { get; set; }

        public long? Id { get; set; }
    }


    public class ResultById<T>
    {
        public bool IsSuccessfull { get; set; }
        public string Message { get; set; }

        public T Data { get; set; }
    }

    public class ResultList<T>
    {
        public bool IsSuccessfull { get; set; }
        public string Message { get; set; }

        public List<T> List { get; set; }

        public Object Data { get; set; }

        public int TotalCount { get; set; }
    }


    public class BaseModel : Base
    {

        public string? EntryByName { get; set; }
        public string? UpdateByName { get; set; }
    }



    public class Base
    {
        public Base()
        {
            //this.EntryBy = 1;
            //this.UpdateBy = 1;
            //this.CompanyId = 1;
        }

        public long CompanyId { get; set; }
        public bool IsActive { get; set; }

        public string? Active { get; set; }

        [JsonIgnore]
        public string? EntryBy { get; set; }


        public DateTime? EntryDate { get; set; }


        [JsonIgnore]
        public string? UpdateBy { get; set; }

        public DateTime? UpdateDate { get; set; }

        public string? fk_companyId { get; set; }

    }





}
