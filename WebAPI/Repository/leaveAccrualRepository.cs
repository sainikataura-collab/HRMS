using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class leaveAccrualRepository : IleaveAccrualRepository
    {


        CommonFunction commonFunction = new CommonFunction();
        public async Task<listResult> GetAll(leaveAccrualRequest filter)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Combine both into one XML structure
            var combinedXml = commonFunction.GetRecords(filter.SelectedLocations, filter.SelectedDepartments);

            dynamicParameters.Add("@PageIndex1", (object)filter.PageIndex1, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@PageSize1", (object)filter.PageSize1, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            dynamicParameters.Add("@PageIndex2", (object)filter.PageIndex2, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@PageSize2", (object)filter.PageSize2, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@empcode", (object)filter.empcode ?? "");
            dynamicParameters.Add("@empcodemanual", (object)filter.empcodemanual ?? "");
            dynamicParameters.Add("@empname", (object)filter.empname ?? "");
            dynamicParameters.Add("@xmlDoc", (object)combinedXml);
            dynamicParameters.Add("@fk_designationid", (object)filter.selectedDesignation ?? "");
            dynamicParameters.Add("@fk_nature", (object)filter.selectedNature ?? "");
            dynamicParameters.Add("@fk_cityid", (object)filter.selectedCity ?? "");
            dynamicParameters.Add("@shortby", (object)filter.sortBy ?? "");
            dynamicParameters.Add("@fk_monthId", (object)filter.fk_monthId ?? "");
            dynamicParameters.Add("@fk_yearId", (object)filter.fk_yearId ?? "");
            dynamicParameters.Add("@fk_costcentreid", (object)filter.fk_costcentreid ?? "", new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            // Assuming DataBaseFactory.QueryMultipleSP executes the stored procedure and returns the tuple with two results
            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, leaveAccrualMst, dynamic, leaveAccrualMst1>("SAL_LeaveAccrual_SelForGrid", dynamicParameters, "GetAll");
            var result = new listResult();
            if (tuple != null && tuple?.Item1 != null)
            {
                result.totalCount1 = tuple.Item1.FirstOrDefault()?.TotalCount1 ?? 0;
            }
            if (tuple != null && tuple?.Item2 != null)
            {
                result.leaveAccrualMst = tuple.Item2.ToList();

            }
            if (tuple != null && tuple?.Item3 != null)
            {
                result.totalCount2 = tuple.Item3.FirstOrDefault()?.TotalCount2 ?? 0;
            }


            if (tuple != null && tuple?.Item4 != null)
            {
                result.leaveAccrualMst1 = tuple.Item4.ToList();
            }



            return (result);

            // return result;

        }


        public async Task<bool> delete(NewDataSet emplistreqData)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Wrap in XML structure
            //string xmlData = XmlUtility.XmlSerializeToString(emplistreqData.Emplist);
            string xmlData = XmlUtility.XmlSerializeToString(emplistreqData);



            // Serialize to XML string

            // Add parameters to Dapper
            dynamicParameters.Add("@xmlDoc", (object)xmlData, DbType.String);
            dynamicParameters.Add("@fk_monthId", emplistreqData.fk_monthId, DbType.String);
            dynamicParameters.Add("@fk_yearId", emplistreqData.fk_yearId, DbType.String);
            dynamicParameters.Add("@fk_finid", emplistreqData.fk_finid, DbType.String);
            dynamicParameters.Add("@fk_locid", emplistreqData.fk_locid, DbType.String);
            dynamicParameters.Add("@fk_userID", emplistreqData.fk_userID, DbType.String);



            // Log XML for debug (optional)
            Console.WriteLine("Generated XML:\n" + xmlData);

            // Execute stored procedure
            int result = DataBaseFactory.QuerySP("SAL_LeaveAccrual_Del", dynamicParameters, "Delete");

            return result > 0;
        }


        public async Task<bool> Insert(NewDataSet emplistreqData)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            var combinedXml = commonFunction.GetRecords(emplistreqData.SelectedLocations, emplistreqData.SelectedDepartments);

            // Serialize employee list to XML
            //string xmlData = XmlUtility.XmlSerializeToString(emplistreqData.Emplist);
            string xmlData = XmlUtility.XmlSerializeToString(emplistreqData);
            dynamicParameters.Add("@empcode", (object)emplistreqData.empcode ?? "");
            dynamicParameters.Add("@empcodemanual", (object)emplistreqData.empcodemanual ?? "");
            dynamicParameters.Add("@empname", (object)emplistreqData.empname ?? "");
            dynamicParameters.Add("@xmlDoc2", (object)combinedXml);
            dynamicParameters.Add("@fk_designationid", (object)emplistreqData.selectedDesignation ?? "");
            dynamicParameters.Add("@fk_nature", (object)emplistreqData.selectedNature ?? "");
            dynamicParameters.Add("@fk_cityid", (object)emplistreqData.selectedCity ?? "");
            dynamicParameters.Add("@shortby", (object)emplistreqData.sortBy ?? "");
            dynamicParameters.Add("@fk_monthId", (object)emplistreqData.fk_monthId ?? "");
            dynamicParameters.Add("@fk_yearId", (object)emplistreqData.fk_yearId ?? "");
            dynamicParameters.Add("@fk_costcentreid", (object)emplistreqData.fk_costcentreid ?? "", new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());



            dynamicParameters.Add("@xmlDoc", xmlData, DbType.String);
            dynamicParameters.Add("@fk_monthId", emplistreqData.fk_monthId, DbType.String);
            dynamicParameters.Add("@fk_yearId", emplistreqData.fk_yearId, DbType.String);
            dynamicParameters.Add("@fk_finid", emplistreqData.fk_finid, DbType.String);
            dynamicParameters.Add("@fk_locid", emplistreqData.fk_locid, DbType.String);
            dynamicParameters.Add("@fk_userID", emplistreqData.fk_userID, DbType.String);

            // Execute stored procedure
            int result = DataBaseFactory.QuerySP("SAL_LeaveAccrual_Ins", dynamicParameters, "Insert");

            return result > 0;
        }


    }
}
