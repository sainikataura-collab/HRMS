using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class CandidateSalaryRepository: ICandidateSalaryRepository
    {
        public async Task<(int totalCount, IEnumerable<CandidateSalary>)> GetAll(int pageIndex, int pageSize)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@pageindex", (object)pageIndex, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pageSize, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, CandidateSalary>("REC_Candidate_Salary_SelForGrid", dynamicParameters, "Conadidate Salary -getALL");
            if (tuple == null || tuple.Item2 == null) return (0, []);
            //Convert Total Count
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

            return (totalCount, tuple?.Item2?.ToList());
        }

        public async Task<bool> Delete(string pk_recId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_recId", (object)pk_recId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int n = DataBaseFactory.QuerySP("REC_Candidate_Salary_Del", dynamicParameters, "Delete");
            return n > 0; 
        }




        public async Task<bool> Insert(CandidateSalaryDataSet dataset, string Fk_UserID, string Fk_LocID)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

           
            string xmlData = XmlUtility.XmlSerializeToString(dataset);
         
            dynamicParameters.Add("@pk_recId", (object)dataset.SalaryHeads[0].fk_recId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@xmlDoc", (object)xmlData, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_UserID", (object)Fk_UserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_LocID", (object)Fk_LocID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());


            int result = DataBaseFactory.QuerySP("REC_Candidate_Salary_Ins", dynamicParameters, "Candidate_Salary_Ins");

            return result > 0;
        }

        public async Task<bool> Update(CandidateSalaryDataSet dataset, string Fk_UserID, string Fk_LocID)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();


            string xmlData = XmlUtility.XmlSerializeToString(dataset);

            dynamicParameters.Add("@pk_recId", (object)dataset.SalaryHeads[0].fk_recId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@xmlDoc", (object)xmlData, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_UserID", (object)Fk_UserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_LocID", (object)Fk_LocID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());


            int result = DataBaseFactory.QuerySP("REC_Candidate_Salary_Upd", dynamicParameters, "Candidate_Salary_Upd");

            return result > 0;
        }




        public async Task<Result<List<NameValue>>> GetCandidateNameSerch(string candidatename,  string fk_companyId)
        {
            var result = new Result<List<NameValue>>();
            try
            {
                DynamicParameters dynamicParameters = new DynamicParameters();
                dynamicParameters.Add("@candidatename", (object)candidatename, DbType.String);
                dynamicParameters.Add("@fk_companyId", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

                // If your QuerySP is not async, remove async/await
                var data = DataBaseFactory.QuerySP<NameValue>("REC_Candidate_SelForddl_ForSalary", dynamicParameters, "Candidate_SelForddl_ForSalary");

                result.IsSuccessfull = data != null && data.Any();
                result.Message = result.IsSuccessfull ? "Data retrieved" : "No record found";
                result.Data = data.ToList();
            }
            catch (Exception ex)
            {
                result.IsSuccessfull = false;
                result.Message = $"Error: {ex.Message}";
                result.Data = new List<NameValue>();
            }

            return result;
        }


        // Get details by candidate id



        public async Task<(Candidate_Detail, List<Candidate_SalaryHead>, List<Candidate_SalaryHead>, int, int)> GetCandidateDetailsById(string pk_recId)
        {
            var dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_recId", (object)pk_recId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            var tuple = DataBaseFactory.QueryMultipleSP<Candidate_Detail, Candidate_SalaryHead, Candidate_SalaryHead, EarningAmount, DeductionAmount>(
                "REC_Candidate_Details_ForSalary", dynamicParameters, "REC_Screening_App_SelForGrid");

            Candidate_Detail candidate_Detail = null;
            List<Candidate_SalaryHead> salaryHead1 = new List<Candidate_SalaryHead>();
            List<Candidate_SalaryHead> salaryHead2 = new List<Candidate_SalaryHead>();
            //Candidate_SalaryHead salaryHead1 = null;
            //Candidate_SalaryHead salaryHead2 = null;
            int value1 = 0;
            int value2 = 0;

            if (tuple != null)
            {
                if (tuple.Item1 != null)
                {
                    candidate_Detail = tuple.Item1.FirstOrDefault();
                }
                if (tuple.Item2 != null)
                {
                    salaryHead1 = tuple.Item2.ToList();
                }
                if (tuple.Item3 != null)
                {
                    salaryHead2 = tuple.Item3.ToList();
                }
                if (tuple.Item4 != null)
                {
                    value1 = tuple.Item4.FirstOrDefault().earningAmount;
                   
                }
                if (tuple.Item5 != null)
                {
                    value2 = tuple.Item5.FirstOrDefault().deductionAmount;

                }
            }

            return (candidate_Detail, salaryHead1, salaryHead2, value1, value2);
        }

        //public async Task<(Candidate_Detail, Candidate_SalaryHead, Candidate_SalaryHead,int,int)> GetCandidateDetailsById(string pk_recId)
        //{
        //    var dynamicParameters = new DynamicParameters();
        //    dynamicParameters.Add("@pk_recId", (object)pk_recId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

        //    var tuple = DataBaseFactory.QueryMultipleSP<Candidate_Detail, Candidate_SalaryHead, Candidate_SalaryHead,dynamic,dynamic>("REC_Candidate_Details_ForSalary", dynamicParameters, "REC_Screening_App_SelForGrid");

        //    //List<ScreenedApplicationGetData> CandidateDetails = new List<ScreenedApplicationGetData>(); // Initialize properly

        //    Candidate_Detail candidate_Detail = null;
        //    Candidate_SalaryHead SalaryHead = null;
        //    if (tuple != null)
        //    {
        //        if (tuple.Item1 != null)
        //        {
        //            candidate_Detail = tuple.Item1.FirstOrDefault();
        //            //int candidateCount = CandidateDetails.Count;
        //        }
        //        if (tuple.Item2 != null)
        //        {
        //            SalaryHead = tuple.Item2.FirstOrDefault();  // Fetch all leave details
        //        }
        //    }


        //    return (candidate_Detail, SalaryHead, );
        //}


    }
}
