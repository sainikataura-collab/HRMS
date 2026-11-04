using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Data;
using System.Linq;

namespace HRMSWebAPI.Repository
{
    public class FinancialYearRepository :IFinancialYearRepository
    {


        public async Task<bool> InsertFinancialYearAsync(FinancialYear financialyr)

        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@date1", (object)financialyr.date1, new DbType?(DbType.DateTime), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@date2", (object)financialyr.date2, new DbType?(DbType.DateTime), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_UserID", (object)financialyr.Fk_UserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_LocID", (object)financialyr.Fk_LocID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
          
            int result = DataBaseFactory.QuerySP("SAL_FinancialYear_Ins", dynamicParameters, "Financial_Insert");

            return result > 0;
        }


        public async Task<bool>UpdateFinancialYearAsync(FinancialYear financialyr)

        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@pk_finid", (object)financialyr.pk_finid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@date1", (object)financialyr.date1, new DbType?(DbType.DateTime), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@date2", (object)financialyr.date2, new DbType?(DbType.DateTime), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_UserID", (object)financialyr.Fk_UserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_LocID", (object)financialyr.Fk_LocID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Timestamp", (object)financialyr.Timestamp, new DbType?(DbType.Binary), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int result = DataBaseFactory.QuerySP("SAL_FinancialYear_Upd", dynamicParameters, "Financial_Update");

            return result > 0;
        }



        public async Task<(int totalCount, IEnumerable<FinancialyearGetAll>)> GetAll(int pageIndex, int pageSize, string Fk_UserID)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@pageindex", (object)pageIndex, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pageSize, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_UserID", (object)Fk_UserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, FinancialyearGetAll>("SAL_FinancialYear_SelForGrid", dynamicParameters, "FinancialYear_GetAll");
            if (tuple == null || tuple.Item2 == null) return (0, []);
            //Convert Total Count
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

            return (totalCount, tuple?.Item2?.ToList());
        }


        public async Task<bool> Delete(string pk_finid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_finid", (object)pk_finid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int n = DataBaseFactory.QuerySP("SAL_FinancialYear_Del", dynamicParameters, "SAL_FinancialYear_Del");
            return n > 0; // Return true if rows were affected
        }

        public async Task<FinancialyearGetAll> GetFinancialYearById(string pk_finid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_finid", (object)pk_finid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<FinancialyearGetAll>("SAL_FinancialYear_Edit", (object)dynamicParameters, "FinancialYear Master - GetById").FirstOrDefault<FinancialyearGetAll>();

        }

        public async Task<bool> FinancialYearOnChnage(string pk_finid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_finid", (object)pk_finid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            int n =  DataBaseFactory.QuerySP("SAL_FinancialYear_Change", (object)dynamicParameters, "FinancialYear Master - GetById");
            return n > 0;
        }
        public async Task<IEnumerable<FinancialyearGetAll>> GetFinancialYearschangeAsync(string fk_companyId)
        {
            var dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@fk_companyId", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            var result = await DataBaseFactory.QuerySPAsync<FinancialyearGetAll>("SAL_FinancialYear_SelForChange", dynamicParameters, "FinancialYear Master - Get All For Change");

            return result;
        }







    }
}
