using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using Microsoft.AspNetCore.Components.Forms;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class EmployeeOtherIncomeRepository:IEmployeeOtherIncomeRepository
    {

        //for get all
        public async Task<(int totalCount, IEnumerable<EmployeeOtherIncome>)> GetAll(int pageindex, int pagesize, string fk_finid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@pageindex", (object)pageindex, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pagesize, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_finid", (object)fk_finid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, EmployeeOtherIncome>("SAL_Employee_IncomeLoss_SelForGrid", dynamicParameters, "GetAll");
            if (tuple == null || tuple.Item2 == null) return (0, []);
            //Convert Total Count
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

            return (totalCount, tuple?.Item2?.ToList());
        }

          //get by id
        public async Task<EmployeeOtherIncome>GetBYId(string pk_incomeid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_incomeid", (object)pk_incomeid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<EmployeeOtherIncome>("SAL_Employee_IncomeLoss_Edit", (object)dynamicParameters, "GetById").FirstOrDefault<EmployeeOtherIncome>();

        }
        
        //delete
        public async Task<bool> Delete(string pk_incomeid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_incomeid", (object)pk_incomeid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int n = DataBaseFactory.QuerySP("SAL_Employee_IncomeLoss_Del", dynamicParameters, "Delete");

            return n > 0; // Return true if rows were affected
        }
        

        //for insert
      
        public async Task<Result> Insert(EmployeeOtherIncome Employee, string Fk_UserID, string Fk_LocID, string fk_empid, string fk_finid)

        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@dated", (object)Employee.dated, new DbType?(DbType.DateTime), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@houseproperty", (object)Employee.houseproperty, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@interest", (object)Employee.interest, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@anyotherincome", (object)Employee.anyotherincome, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@anyloss", (object)Employee.anyloss, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            dynamicParameters.Add("@Fk_LocID", (object)Fk_LocID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_UserID", (object)Fk_UserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_empid", (object)fk_empid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_finid", (object)fk_finid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            dynamicParameters.Add("@IsSucessfull", (object)null, new DbType?(DbType.Boolean), new ParameterDirection?(ParameterDirection.Output), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Message", (object)null, new DbType?(DbType.String), new ParameterDirection?(ParameterDirection.Output), new int?(-1), new byte?(), new byte?());
            
            DataBaseFactory.QuerySP("SAL_Employee_IncomeLoss_Ins", dynamicParameters, "perquisteAssignment_Insert");

            //check dynamicParamenter
            bool isSuccess = dynamicParameters.Get<Boolean>("@IsSucessfull");
            string message = dynamicParameters.Get<String>("@Message");

            Result result = new Result
            {
                IsSuccessfull = isSuccess,
                Message = message,
            };


            return result;
        }
        //for update
        public async Task<bool> Update(EmployeeOtherIncome Employee, string Fk_UserID, string Fk_LocID, string fk_empid, string fk_finid)

        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_incomeid", (object)Employee.pk_incomeid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@dated", (object)Employee.dated, new DbType?(DbType.DateTime), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@houseproperty", (object)Employee.houseproperty, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@interest", (object)Employee.interest, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@anyotherincome", (object)Employee.anyotherincome, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@anyloss", (object)Employee.anyloss, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            dynamicParameters.Add("@Fk_LocID", (object)Fk_LocID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_UserID", (object)Fk_UserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_empid", (object)fk_empid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_finid", (object)fk_finid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Timestamp", (object)Employee.Timestamp, new DbType?(DbType.Binary), new ParameterDirection?(), null, new byte?(), new byte?());


            int result = DataBaseFactory.QuerySP("SAL_Employee_IncomeLoss_Upd", dynamicParameters, "perquisteAssignment_Insert");

            return result > 0;
        }

    }




}
