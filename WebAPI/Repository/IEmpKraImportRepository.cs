
using static HRMSWebAPI.Models.EmpKraImportModel;

namespace HRMSWebAPI.Repository
{
    public interface IEmpKraImportRepository
    {

     //Task<bool> ImportEmpWiseKRA(ExcelUploadKRARequestNew request, string fk_userId);



    Task<List<dynamic>> ImportEmpWiseKRA(ExcelUploadKRARequestNew request, string fk_userId);


    }
}
