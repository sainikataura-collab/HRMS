using System.Net.Mail;
using System.Xml.Serialization;
using DocumentFormat.OpenXml.InkML;
using Microsoft.AspNetCore.Http;

namespace HRMSWebAPI.Models
{
    [XmlRoot("NewDataSet")]
    public class DocumentUpldRoot
    {


        [XmlElement("HR_Upload_Documents")]
        public Upload_Documents Upload_Documents { get; set; }

        [XmlElement("HR_Upload_Documents_Trn")]
        public List<Upload_trn> Upload_trn { get; set; } = new List<Upload_trn>();

        public long? pk_uploadId { get; set; }
        public string? UpdAppChange { get; set; }
        public byte?[] Timestamp { get; set; }
        

    }

    public class Upload_Documents
    {
    
        public string? circularno { get; set; }
        public string? circularname { get; set; }
        public string? description { get; set; }
        public string? filetype { get; set; }
        public string? dated { get; set; }
        public bool? active { get; set; }

        [XmlIgnore] // Important: Do not serialize the uploaded file
        public IFormFile? filename { get; set; }


        [XmlIgnore]
        public string? documentname { get; set; } // only use for edit time
        

        [XmlIgnore] // Do not serialize content type directly
        public string? contenttype { get; set; }

        public bool? isAllCompany { get; set; }

        [XmlIgnore] // Used internally to pass the saved name
        public string? SavedFileName { get; set; }
        public string? remarks { get; set; }

        
    }

    public class Upload_trn
    {
        public string fk_deptid { get; set; }
        public long fk_uploadId { get; set; }
    }


    public class Upload_getAll
    {
        public long pk_uploadId { get; set; }
        public string circularno { get; set; }
        public string fk_deptid { get; set; }
        public string circularname { get; set; }
        public string description { get; set; }
        public string filetype { get; set; }
        public string dated { get; set; }
        public string active { get; set; }
        public string filename { get; set; }
        public string contenttype { get; set; }
        public string attachment { get; set; }
        public string department { get; set; }

    }

 //   CID bigint Identity(1,1) Primary Key,
 //   pk_uploadId bigint,
 //   circularno varchar(50),
 //   circularname varchar(100),
	//description varchar(100),
	//filetype varchar(20),
	//dated varchar(25),
	//active char (5),
	//filename varchar(255),
	//contenttype varchar(50),
	//attachment image,
 //   department  varchar(50)




}
