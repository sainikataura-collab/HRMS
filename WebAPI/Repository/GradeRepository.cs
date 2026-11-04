using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;

namespace HRMSWebAPI.Repository

{
    public class GradeRepository : IGradeRepository
    {
        public async Task<bool> InsertGradeAsync(grade grade)
        {
          DynamicParameters dynamicParameters = new DynamicParameters();
          dynamicParameters.Add("@Classname", (object)grade.classname, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());
          dynamicParameters.Add("@Fk_UserID", (object)grade.Fk_UserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());
          dynamicParameters.Add("@Fk_LocID", (object)grade.Fk_LocID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());
         dynamicParameters.Add("@NoticePeriod", (object)grade.NoticePeriod, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());
          dynamicParameters.Add("@fk_companyId", (object)grade.fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());


           // Execute stored procedure (no output parameters)
            int n = DataBaseFactory.QuerySP("SAL_Class_Ins", dynamicParameters,"Grade_Insert");

            return n > 0; // Return true if rows were affected

        }


        //----


        //get All
        public async Task<(int totalCount, IEnumerable<grade>)> GetAll(int pageIndex, int pageSize, string fk_companyId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pageindex", (object)pageIndex, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pageSize, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("fk_companyId", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, grade>("SAL_Class_SelForGrid", dynamicParameters, "Grade_GetAll");
             if (tuple == null || tuple.Item2 == null) return (0, []);
            //Convert Total Count
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

            return (totalCount, tuple?.Item2?.ToList());
        }

        //get by id

        public async Task<grade> GetGradeByIdAsync(string gradeId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@Pk_Classid", (object)gradeId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
             return DataBaseFactory.QuerySP<grade>("SAL_Class_Edit", (object)dynamicParameters, "grade Master - GetById").FirstOrDefault<grade>();
        }
        //for delete

        public async Task<bool> DeleteGradeAsync(string id)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@Pk_Classid", (object)id, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int n = DataBaseFactory.QuerySP("SAL_Class_Del", dynamicParameters, "Grade_Delete");

            return n > 0; // Return true if rows were affected
        }
        //update grade 

        public async Task<bool> UpdateGradeAsync(grade grade)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@pk_classid", (object)grade.pk_classid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Classname", (object)grade.classname, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_UserID", (object)grade.Fk_UserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_LocID ", (object)grade.Fk_LocID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@NoticePeriod", (object)grade.NoticePeriod, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Timestamp", (object)grade.Timestamp, new DbType?(DbType.Binary), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            
            // Execute stored procedure for update
            int n = DataBaseFactory.QuerySP("SAL_Class_Upd", dynamicParameters, "grade_Mst_Update");

            return n > 0; // Return true if rows were affected
        }
    }



}
