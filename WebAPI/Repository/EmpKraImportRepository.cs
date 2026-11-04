using Dapper;
using HRMSWebAPI.Helper;
using System.Data;
using static HRMSWebAPI.Models.EmpKraImportModel;



namespace HRMSWebAPI.Repository
{
    public class EmpKraImportRepository:IEmpKraImportRepository
    {


        CommonFunction commonFunction = new CommonFunction();

        //public async Task<bool> ImportEmpWiseKRA(ExcelUploadKRARequestNew request, string fk_userId)
        //{

        //    var p = new DynamicParameters();
        //    string xmlData = XmlUtility.XmlSerializeToString(request);
        //    if (xmlData.StartsWith("<?xml"))
        //    {
        //        int index = xmlData.IndexOf("?>");
        //        if (index != -1)
        //        {
        //            xmlData = xmlData.Substring(index + 2).Trim();
        //        }
        //    }



        //    p.Add("@KRAData", (object)xmlData, new DbType?(DbType.Xml), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    p.Add("@userid", (object)fk_userId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

        //    int result = DataBaseFactory.QuerySP("SAL_KRA_EmpWiseKRA_Import_Ins_XML", p, "SAL_KRA_EmpWiseKRA_Import_Ins_XML");
        //    return result > 0;
        //}



       
            public async Task<List<dynamic>> ImportEmpWiseKRA(ExcelUploadKRARequestNew request, string fk_userId)
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
                    var result = await connection.QueryAsync("SAL_KRA_EmpWiseKRA_Import_Ins_XML", p, commandType: CommandType.StoredProcedure);
                    return result.ToList();
                }
            }
      




    }
}
