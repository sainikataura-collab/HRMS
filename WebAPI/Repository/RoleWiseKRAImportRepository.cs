
using Dapper;
using HRMSWebAPI.Helper;
using iTextSharp.text.pdf.parser.clipper;
using System.Data;
using static HRMSWebAPI.Models.RoleWiseKRAImportModel;
namespace HRMSWebAPI.Repository
{
    //public class RoleWiseKRAImportRepository: IRoleWiseKRAImportRepository
    //{
    //    CommonFunction commonFunction = new CommonFunction();

    //    //public async Task<bool> ImportEmpWiseKRA(ExcelUploadRolewiseKRAModelRequest request, string fk_userId)
    //    //{

    //    //    var p = new DynamicParameters();
    //    //    string xmlData = XmlUtility.XmlSerializeToString(request);
    //    //    if (xmlData.StartsWith("<?xml"))
    //    //    {
    //    //        int index = xmlData.IndexOf("?>");
    //    //        if (index != -1)
    //    //        {
    //    //            xmlData = xmlData.Substring(index + 2).Trim();
    //    //        }
    //    //    }



    //    //    p.Add("@KRAData", (object)xmlData, new DbType?(DbType.Xml), new ParameterDirection?(), new int?(), new byte?(), new byte?());
    //    //    p.Add("@userid", (object)fk_userId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

    //    //    int result = DataBaseFactory.QuerySP("SAL_KRA_Rolewise_Import", p, "SAL_KRA_Rolewise_Import");
    //    //    return result > 0;
    //    //}


    //    public async Task<List<string>> ImportEmpWiseKRA(ExcelUploadRolewiseKRAModelRequest request, string fk_userId)
    //    {
    //        var p = new DynamicParameters();
    //        string xmlData = XmlUtility.XmlSerializeToString(request);

    //        if (xmlData.StartsWith("<?xml"))
    //        {
    //            int index = xmlData.IndexOf("?>");
    //            if (index != -1)
    //            {
    //                xmlData = xmlData.Substring(index + 2).Trim();
    //            }
    //        }

    //        p.Add("@KRAData", xmlData, DbType.Xml);
    //        p.Add("@userid", fk_userId, DbType.String);

    //        using (var connection = DataBaseFactory.ConnString())
    //        {
    //            var result = await connection.QueryAsync<string>("SAL_KRA_Rolewise_Import_New", p, commandType: CommandType.StoredProcedure);
    //            return result.ToList(); // This will return invalid roles (if any)
    //        }
    //    }




    //}

    public class RoleWiseKRAImportRepository : IRoleWiseKRAImportRepository
    {
        public async Task<List<dynamic>> ImportEmpWiseKRA(ExcelUploadRolewiseKRAModelRequest request, string fk_userId)
        {
            var p = new DynamicParameters();
            string xmlData = XmlUtility.XmlSerializeToString(request);

            if (xmlData.StartsWith("<?xml"))
            {
                int index = xmlData.IndexOf("?>");
                if (index != -1)
                {
                    xmlData = xmlData.Substring(index + 2).Trim();
                }
            }

            p.Add("@KRAData", xmlData, DbType.Xml);
            p.Add("@userid", fk_userId, DbType.String);

            using (var connection = DataBaseFactory.ConnString())
            {
                var result = await connection.QueryAsync("SAL_KRA_RoleWiseKRA_Import_Ins_XML", p, commandType: CommandType.StoredProcedure);
                return result.ToList();
            }
        }
    }


}
