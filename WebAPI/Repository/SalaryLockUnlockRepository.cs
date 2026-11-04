using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using iTextSharp.text;
using Microsoft.AspNetCore.Mvc;
using Org.BouncyCastle.Asn1.Ocsp;
using System.Data;
using System.Xml.Linq;

namespace HRMSWebAPI.Repository
{
    public class SalaryLockUnlockRepository : ISalaryLockUnlockRepository

    {
        CommonFunction commonFunction = new CommonFunction();
        //monthly salary lock
        public async Task<(int salarylockedcount, int salaryunlockcount, salarylockunlockModel result)>
    GetsalarylockAsync(
    int pageIndex1, int pageSize1,
    int pageIndex2, int pageSize2,
    string empCode,
    string empCodeManual,
    string empName,
    List<string> selectedDepartments,
    string selectedDesignation,
    List<string> selectedLocations,
    string selectedNature,
    string selectedCity,
    string sortBy,
    string FkMonthId,
    string FkYearId,
    string fk_costcentreid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            var combinedXml = commonFunction.GetRecords(selectedLocations, selectedDepartments);

            dynamicParameters.Add("@pageindex1", (object)pageIndex1, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize1", (object)pageSize1, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            dynamicParameters.Add("@pageindex2", (object)pageIndex2, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize2", (object)pageSize2, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@empcode", (object)empCode, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@empcodemanual", (object)empCodeManual, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@empname", (object)empName, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@xmlDoc", (object)combinedXml, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_designationid", (object)selectedDesignation, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_nature", (object)selectedNature, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_cityid", (object)selectedCity, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@shortby", (object)sortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_monthId", (object)FkMonthId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_yearId", (object)FkYearId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_costcentreid", (object)fk_costcentreid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, SalaryLockUnlockMst, dynamic, SalaryLockUnlockMst>(
            "SAL_Salary_Lock_SelForGrid", dynamicParameters, "GetAll");
            var result = new salarylockunlockModel();

            int unlockCount = tuple.Item1 is IEnumerable<dynamic> list1 && list1.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)list1.First()).Values.First())
                : 0;

            int lockCount = tuple.Item3 is IEnumerable<dynamic> list3 && list3.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)list3.First()).Values.First())
                : 0;

            result.salarylockedcount = lockCount;
            result.salaryunlockcount = unlockCount;
         

            result.salarylocked = tuple.Item4?.ToList();
            result.salaryunlock = tuple.Item2?.ToList();
            

            return (lockCount, unlockCount, result);
        }


        public async Task<bool> UpdateForSalaryUnLockAsync(string fk_insUserID, string Fk_LocID, SalaryLockUnlockRequest request)
        {
            try
            {

            
            DynamicParameters dynamicParameters = new DynamicParameters();
            var combinedXml = commonFunction.GetRecords(request.SelectedLocations, request.SelectedDepartments);

            dynamicParameters.Add("@fk_monthId", (object)request.fk_monthId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_yearId ", (object)request.fk_yearId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@empcode", (object)request.EmpCode, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@empcodemanual", (object)request.EmpCodeManual, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@empname", (object)request.EmpName, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@xmlDoc", (object)combinedXml, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_designationid", (object)request.SelectedDesignation, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_nature", (object)request.SelectedNature, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_cityid", (object)request.SelectedCity, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@fk_costcentreid", (object)request.fk_costcentreid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

                //   dynamicParameters.Add("@Overwrite", (object)Overwrite, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@fk_userID", (object)fk_insUserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_locid", (object)Fk_LocID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());


            //dynamicParameters.Add("@Timestamp", (object)HolidayMst.Timestamp, new DbType?(DbType.Binary), new ParameterDirection?(), null, new byte?(), new byte?());


            int result = DataBaseFactory.QuerySP("SAL_Salary_Lock_Return", dynamicParameters, "Salary_Lock_Return");

            return result > 0;
        }
            catch (Exception ex)
            {
                Console.WriteLine("Error updating Manual: " + ex.Message);
                return false;
            }
}



        public async Task<bool> UpdateForSalaryLockAsync(string fk_insUserID, string Fk_LocID,string fk_companyId, SalaryLockUnlockRequest request)
        {

            try
            {
                DynamicParameters dynamicParameters = new DynamicParameters();
            var combinedXml = commonFunction.GetRecords(request.SelectedLocations, request.SelectedDepartments);

            dynamicParameters.Add("@fk_monthId", (object)request.fk_monthId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_yearId ", (object)request.fk_yearId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@empcode", (object)request.EmpCode, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@empcodemanual", (object)request.EmpCodeManual, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@empname", (object)request.EmpName, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@xmlDoc", (object)combinedXml, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_designationid", (object)request.SelectedDesignation, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_nature", (object)request.SelectedNature, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_cityid", (object)request.SelectedCity, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@fk_costcentreid", (object)request.fk_costcentreid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

                dynamicParameters.Add("@fk_userID", (object)fk_insUserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_locid", (object)Fk_LocID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());


            //dynamicParameters.Add("@Timestamp", (object)HolidayMst.Timestamp, new DbType?(DbType.Binary), new ParameterDirection?(), null, new byte?(), new byte?());


            int result = DataBaseFactory.QuerySP("SAL_Salary_Lock", dynamicParameters, "Salary_Lock");

            return result > 0;
        }
            catch (Exception ex)
            {
                Console.WriteLine("Error updating Manual: " + ex.Message);
                return false;
            }

}
        //salary approved

        // note add in SalaryLockUnlockRepository       
        public async Task<(int disapprovedCount, int approvedCount,
                          List<dynamic> disapprovedList, List<dynamic> approvedList)>
       GetsalaryApprovedList(
           int pageIndex1, int pageSize1,
           int pageIndex2, int pageSize2,
           string empCode,
           string empCodeManual,
           string empName,
           List<string> selectedDepartments,
           string selectedDesignation,
           List<string> selectedLocations,
           string selectedNature,
           string selectedCity,
           string sortBy,
           string fkMonthId,
           string fkYearId,
           string fkCostCentreId
       )
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            var combinedXml = commonFunction.GetRecords(selectedLocations, selectedDepartments);

            dynamicParameters.Add("@pageindex1", pageIndex1);
            dynamicParameters.Add("@pagesize1", pageSize1);
            dynamicParameters.Add("@pageindex2", pageIndex2);
            dynamicParameters.Add("@pagesize2", pageSize2);

            dynamicParameters.Add("@empcode", empCode);
            dynamicParameters.Add("@empcodemanual", empCodeManual);
            dynamicParameters.Add("@empname", empName);
            dynamicParameters.Add("@xmlDoc", combinedXml);

            dynamicParameters.Add("@fk_designationid", selectedDesignation);
            dynamicParameters.Add("@fk_nature", selectedNature);
            dynamicParameters.Add("@fk_cityid", selectedCity);
            dynamicParameters.Add("@shortby", sortBy);

            dynamicParameters.Add("@fk_monthId", fkMonthId);
            dynamicParameters.Add("@fk_yearId", fkYearId);
            dynamicParameters.Add("@fk_costcentreid", fkCostCentreId);

            // 🔥 SAME pattern – ONLY dynamic used
            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic, dynamic, dynamic>(
                "SAL_Salary_Approve_SelForGrid",
                dynamicParameters,
                "GetAll"
            );

            // ❌ NO MODEL for count
            int disapprovedCount = tuple.Item1 is IEnumerable<dynamic> list1 && list1.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)list1.First()).Values.First())
                : 0;

            int approvedCount = tuple.Item3 is IEnumerable<dynamic> list3 && list3.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)list3.First()).Values.First())
                : 0;

            // ✅ Dynamic Lists
            var disapprovedList = tuple.Item2?.ToList() ?? new List<dynamic>();
            var approvedList = tuple.Item4?.ToList() ?? new List<dynamic>();

            return (disapprovedCount, approvedCount, disapprovedList, approvedList);
        }




        public async Task<bool> DisapproveSalaryEmplyeelist(string fk_insUserID, string Fk_LocID, SalaryApprovedRequest request)
        {
            try
            {


                DynamicParameters dynamicParameters = new DynamicParameters();
                var combinedXml = commonFunction.GetRecords(request.SelectedLocations, request.SelectedDepartments);

                dynamicParameters.Add("@fk_monthId", (object)request.fk_monthId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@fk_yearId ", (object)request.fk_yearId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@empcode", (object)request.EmpCode, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@empcodemanual", (object)request.EmpCodeManual, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@empname", (object)request.EmpName, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@xmlDoc", (object)combinedXml, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@fk_designationid", (object)request.SelectedDesignation, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@fk_nature", (object)request.SelectedNature, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@fk_cityid", (object)request.SelectedCity, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@fk_costcentreid", (object)request.fk_costcentreid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

                //   dynamicParameters.Add("@Overwrite", (object)Overwrite, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@fk_userID", (object)fk_insUserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@fk_locid", (object)Fk_LocID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());


                //dynamicParameters.Add("@Timestamp", (object)HolidayMst.Timestamp, new DbType?(DbType.Binary), new ParameterDirection?(), null, new byte?(), new byte?());


                int result = DataBaseFactory.QuerySP("SAL_Salary_Approve_Return", dynamicParameters, "SAL_Salary_Approve_Return");

                return result > 0;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error updating Manual: " + ex.Message);
                return false;
            }
        }



        public async Task<bool> approveSalaryEmplyeelist(string fk_insUserID, string Fk_LocID, string fk_companyId, SalaryApprovedRequest request)
        {

            try
            {
                DynamicParameters dynamicParameters = new DynamicParameters();
                var combinedXml = commonFunction.GetRecords(request.SelectedLocations, request.SelectedDepartments);

                dynamicParameters.Add("@fk_monthId", (object)request.fk_monthId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@fk_yearId ", (object)request.fk_yearId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@empcode", (object)request.EmpCode, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@empcodemanual", (object)request.EmpCodeManual, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@empname", (object)request.EmpName, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@xmlDoc", (object)combinedXml, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@fk_designationid", (object)request.SelectedDesignation, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@fk_nature", (object)request.SelectedNature, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@fk_cityid", (object)request.SelectedCity, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@fk_companyId", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@fk_costcentreid", (object)request.fk_costcentreid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

                dynamicParameters.Add("@fk_userID", (object)fk_insUserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@fk_locid", (object)Fk_LocID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());


                //dynamicParameters.Add("@Timestamp", (object)HolidayMst.Timestamp, new DbType?(DbType.Binary), new ParameterDirection?(), null, new byte?(), new byte?());


                int result = DataBaseFactory.QuerySP("SAL_Salary_Approve", dynamicParameters, "SAL_Salary_Approve");

                return result > 0;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error updating Manual: " + ex.Message);
                return false;
            }

        }


        //end








        //public async Task<IEnumerable<SalaryLockUnlockMst>> UpdateForSalaryUnLockAsync(string fk_insUserID,string Fk_LocID, SalaryLockUnlockRequest request)

        //{
        //    DynamicParameters dynamicParameters = new DynamicParameters();
        //    var combinedXml = commonFunction.GetRecords(request.SelectedLocations, request.SelectedDepartments);

        //    dynamicParameters.Add("@fk_monthId", (object)request.fk_monthId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    dynamicParameters.Add("@fk_yearId ", (object)request.fk_yearId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    dynamicParameters.Add("@empcode", (object)request.EmpCode, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    dynamicParameters.Add("@empcodemanual", (object)request.EmpCodeManual, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    dynamicParameters.Add("@empname", (object)request.EmpName, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    dynamicParameters.Add("@xmlDoc", (object)combinedXml, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    dynamicParameters.Add("@fk_designationid", (object)request.SelectedDesignation, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    dynamicParameters.Add("@fk_nature", (object)request.SelectedNature, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    dynamicParameters.Add("@fk_cityid", (object)request.SelectedCity, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        // //   dynamicParameters.Add("@Overwrite", (object)Overwrite, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    dynamicParameters.Add("@fk_userID", (object)fk_insUserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    dynamicParameters.Add("@fk_locid", (object)Fk_LocID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());


        //    //dynamicParameters.Add("@Timestamp", (object)HolidayMst.Timestamp, new DbType?(DbType.Binary), new ParameterDirection?(), null, new byte?(), new byte?());


        //    var tuple = DataBaseFactory.QueryMultipleSP<dynamic, SalaryLockUnlockMst>("SAL_Salary_Lock_Return", dynamicParameters, "Salary_Lock_Return");
        //    if (tuple == null || tuple.Item2 == null)
        //        return (new List<SalaryLockUnlockMst>());

        //    // Extract totalCount safely
        //    int totalCount = 0;
        //    if (tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any())
        //    {
        //        var firstItem = totalList.First() as IDictionary<string, object>;
        //        if (firstItem != null && firstItem.Values.Any())
        //        {
        //            totalCount = Convert.ToInt32(firstItem.Values.First());
        //        }
        //    }

        //    return ( tuple.Item2?.ToList() ?? new List<SalaryLockUnlockMst>());

        //}



    }
}


