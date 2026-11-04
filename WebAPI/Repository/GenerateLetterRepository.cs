using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;
using static Dapper.SqlMapper;

namespace HRMSWebAPI.Repository
{
    public class GenerateLetterRepository : IGenerateLetterRepository
    {
        public async Task<dynamic> UpdateLetterStatusAsync(int pk_trnid, bool status, string remark)
        {
            var param = new DynamicParameters();
            param.Add("@pk_trnid", pk_trnid);
            param.Add("@Status", status);
            param.Add("@remark", remark);


            var result = DataBaseFactory.QuerySP(
                "HR_Candidate_Letter_AcceptReject",
                param,
                "Accept or reject"
            );

            return result;
        }
        public async Task<(bool IsSuccess, string ErrorMessage)> InsertCandidateLetterAsync(CandidateLetterDataset dataset, string fk_companyId)
        {
            try
            {
                DynamicParameters parameters = new DynamicParameters();

                // Convert dataset to XML
                string xmlData = XmlUtility.XmlSerializeToString(dataset);
                if (!string.IsNullOrEmpty(xmlData))
                {
                    xmlData = xmlData.Replace('\u00A0', ' ');
                }

                parameters.Add("@xmlDoc", xmlData, DbType.String);
                parameters.Add("@fk_companyId", fk_companyId, DbType.String);
                //var result = DataBaseFactory.QuerySP("HR_Candidate_Letter_Ins", parameters);

                //return (result > 0, "");
                DataBaseFactory.QuerySP("HR_Candidate_Letter_Ins", parameters);
                return (true, "");
            }
            catch (Exception ex)

            {
                // Return error message to API
                return (false, ex.Message);
            }
        }




        public async Task<IEnumerable<dynamic>> GetHeads(string? companyId = null)
        {
            try
            {
                DynamicParameters parameters = new DynamicParameters();
                parameters.Add("@fk_companyId", companyId);

                var result = DataBaseFactory.QuerySP<dynamic>(
                    "[dbo].[HR_Candidate_Letter_Head_SelForGrid]",
                    parameters,
                    "HR_Candidate_Letter_Head_SelForGrid"
                );

                return result ?? Enumerable.Empty<dynamic>();
            }
            catch (Exception ex)
            {
                Console.WriteLine("HR_Candidate_Letter_Head_SelForGrid Error: " + ex.Message);
                return Enumerable.Empty<dynamic>();
            }
        }

        //    public async Task<(int totalCount, IEnumerable<dynamic> data)>
        //GetCandidateLetterGrid(int pageIndex, int pageSize, long fk_formatid)
        //    {
        //        try
        //        {
        //            DynamicParameters parameters = new DynamicParameters();
        //            parameters.Add("@pageindex", pageIndex);
        //            parameters.Add("@pagesize", pageSize);
        //            parameters.Add("@fk_formatid", fk_formatid);

        //            // Call SP using your common pattern
        //            var multi = DataBaseFactory.QueryMultipleSP(
        //                "[dbo].[HR_Candidate_Letter_SelForGrid]",
        //                parameters,
        //                "HR_Candidate_Letter_SelForGrid"
        //            );

        //            int totalCount = multi.ReadFirst<int>();
        //            var data = multi.Read<dynamic>().ToList();

        //            return (totalCount, data);
        //        }
        //        catch (Exception ex)
        //        {
        //            Console.WriteLine("HR_Candidate_Letter_SelForGrid Error: " + ex.Message);
        //            return (0, Enumerable.Empty<dynamic>());
        //        }
        //    }


        public async Task<(int totalCount, IEnumerable<dynamic> data)>
    GetCandidateLetterGrid(int pageIndex, int pageSize, long? fk_formatid)
        {
            try
            {
                DynamicParameters parameters = new DynamicParameters();
                parameters.Add("@pageindex", pageIndex);
                parameters.Add("@pagesize", pageSize);
                parameters.Add("@fk_formatid", fk_formatid);

                // EXACT SAME PATTERN YOU SHOWED
                var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic>(
                    "HR_Candidate_Letter_SelForGrid",
                    parameters,
                    "HR_Candidate_Letter_SelForGrid"
                );

                if (tuple == null || tuple.Item2 == null)
                    return (0, Enumerable.Empty<dynamic>());

                // Convert first table (count)
                int totalCount =
                    tuple.Item1 is IEnumerable<dynamic> countList && countList.Any()
                    ? Convert.ToInt32(((IDictionary<string, object>)countList.First()).Values.First())
                    : 0;

                // second table = grid
                return (totalCount, tuple.Item2.ToList());
            }
            catch (Exception ex)
            {
                Console.WriteLine("HR_Candidate_Letter_SelForGrid Error: " + ex.Message);
                return (0, Enumerable.Empty<dynamic>());
            }
        }
        public async Task<bool> DeleteAsync(long pk_trnid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_trnid", (object)pk_trnid, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int n = DataBaseFactory.QuerySP("HR_Candidate_Letter_Del", dynamicParameters, "Generate letter_Delete");

            return n > 0; // Return true if rows were affected
        }

        public async Task<dynamic> DownloadFormatAsync(long pk_trnid)
        {
            var param = new DynamicParameters();
            param.Add("@pk_trnid", pk_trnid);

            using (var connection = DataBaseFactory.ConnString())
            {
                using (var multi = await connection.QueryMultipleAsync(
                    "HR_Format_Download",
                    param,
                    commandType: CommandType.StoredProcedure))
                {
                    // SAFE READ HELPER
                    async Task<List<dynamic>> SafeReadAsync(SqlMapper.GridReader reader)
                    {
                        try
                        {
                            return (await reader.ReadAsync<dynamic>()).ToList();
                        }
                        catch
                        {
                            return new List<dynamic>();
                        }
                    }

                    // SP returns 4 result sets:
                    // 1 → Company
                    // 2 → Trn
                    // 3 → Mst
                    // 4 → Head

                    var company = (await SafeReadAsync(multi)).FirstOrDefault();
                    var trn = (await SafeReadAsync(multi)).FirstOrDefault();
                    var mst = (await SafeReadAsync(multi));
                    var head = (await SafeReadAsync(multi));

                    return new
                    {
                        Company = company,
                        Trn = trn,
                        Mst = mst,
                        Head = head
                    };
                }
            }
        }


        //Anjali
        public async Task<dynamic> GetEmployeeByIdAsync(string fk_empId)
        {
            try
            {
                DynamicParameters parameters = new DynamicParameters();
                parameters.Add("@fk_empid", fk_empId, DbType.String);

                // ✅ Use your existing procedure
                var result = DataBaseFactory.QuerySP<dynamic>(
                    "[HR_Employee_GetById]",  // ✅ Your existing procedure
                    parameters,
                    "SAL_Employee_Details"
                );

                return result?.FirstOrDefault();
            }
            catch (Exception ex)
            {
                Console.WriteLine("SAL_Employee_Details Error: " + ex.Message);
                return null;
            }
        }
        //ANJ 6 Feb
        public async Task<bool> PublishLetterAsync(long pk_trnid)
        {
            try
            {
                var parameters = new DynamicParameters();
                parameters.Add("@pk_trnid", pk_trnid);

                DataBaseFactory.QuerySP(
                    "[sp_PublishLetter]",
                    parameters,
                    "sp_PublishLetter"
                );

                return true; // If no exception, it worked!
            }
            catch (Exception ex)
            {
                return false; // If exception, it failed
            }
        }


    }
}
    
