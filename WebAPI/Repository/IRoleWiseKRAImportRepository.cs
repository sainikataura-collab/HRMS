using static HRMSWebAPI.Models.RoleWiseKRAImportModel;

namespace HRMSWebAPI.Repository
{
    public interface IRoleWiseKRAImportRepository
    {

        //Task<bool> ImportEmpWiseKRA(ExcelUploadRolewiseKRAModelRequest request, string fk_userId);


        //Task<List<string>> ImportEmpWiseKRA(ExcelUploadRolewiseKRAModelRequest request, string fk_userId);

        Task<List<dynamic>> ImportEmpWiseKRA(ExcelUploadRolewiseKRAModelRequest request, string fk_userId);


    }
}
