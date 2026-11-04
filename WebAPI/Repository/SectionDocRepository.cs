using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class SectionDocRepository:ISectionDocRepository
    {

        //for get all
        public async Task<(int totalCount, IEnumerable<SectionDocMst>)> GetAll(int pageindex, int pagesize, string fk_empid,string fk_finid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@pageindex", (object)pageindex, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pagesize, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_empid", (object)fk_empid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_finid", (object)fk_finid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());


            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, SectionDocMst>("SAL_Employee_SectionDocStatus_SelForGrid", dynamicParameters, "GetAll");
            if (tuple == null || tuple.Item2 == null) return (0, []);
            //Convert Total Count
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

            return (totalCount, tuple?.Item2?.ToList());
        }

        //get by id
        public async Task<SectionDocMst> GetBYId(string pk_docid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_docid", (object)pk_docid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<SectionDocMst>("SAL_Employee_SectionDocStatus_Edit_New", (object)dynamicParameters, "GetById").FirstOrDefault<SectionDocMst>();

        }

        //delete
        public async Task<bool> Delete(string pk_docid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_docid", (object)pk_docid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int n = DataBaseFactory.QuerySP("SAL_Employee_SectionDocStatus_Del", dynamicParameters, "Delete");

            return n > 0; // Return true if rows were affected
        }

        ////for insert
        //public async Task<bool> Insert(SectionDocMst section)
        //{
        //    DynamicParameters dynamicParameters = new DynamicParameters();
        //    SectionDocMstDataSet dataset = new SectionDocMstDataSet { section = section };

        //    // Serialize to XML
        //    string xmlData = XmlUtility.XmlSerializeToString(dataset);

        //    dynamicParameters.Add("@xmlDoc", Convert.ToString(XmlUtility.XmlSerializeToString(section)), DbType.String);

        //    DataBaseFactory.QuerySP("SAL_Employee_SectionDocStatus_Ins", (object)dynamicParameters, "SAL_Employee_SectionDocStatus_Ins");

        //    return true;
        //}


        public async Task<bool> Insert(SectionDocMst section)
        {
            try
            {
                DynamicParameters dynamicParameters = new DynamicParameters();
                SectionDocMstDataSet dataset = new SectionDocMstDataSet { section = section };

                // Serialize to XML
                string xmlData = XmlUtility.XmlSerializeToString(dataset);

                dynamicParameters.Add("@xmlDoc", xmlData, DbType.String);

                var result = DataBaseFactory.QuerySP("SAL_Employee_SectionDocStatus_Ins", dynamicParameters);

                // Assuming ExecuteAsync returns number of affected rows
                return result > 0;
            }
            catch (Exception ex)
            {
                // Log exception
                Console.WriteLine("Insert Error: " + ex.Message);
                return false;
            }
        }


        //for update

        //public async Task<bool> Update(string pk_docid, SectionDocMst section)
        //{
        //    DynamicParameters dynamicParameters = new DynamicParameters();

        //    // Wrap the model in the required dataset structure
        //    //SectionDocMstDataSet dataset = new SectionDocMstDataSet { section = new List<SectionDocMstsection };


        //    // Serialize to XML
        //    string xmlData = XmlUtility.XmlSerializeToString(section);

        //    // Add parameters
        //    dynamicParameters.Add("@pk_docid", (object)pk_docid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    dynamicParameters.Add("@xmlDoc", (object)xmlData, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    dynamicParameters.Add("@filename", (object)section.filename, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    dynamicParameters.Add("@contenttype", (object)section.contenttype, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    //dynamicParameters.Add("@attachment", (object)section.attachment, new DbType?(DbType.Binary), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    dynamicParameters.Add("@attachment", (object)section.attachment, new DbType?(DbType.Binary), new ParameterDirection?(), new int?(), new byte?(), new byte?());

        //    dynamicParameters.Add("@Timestamp", (object)section.Timestamp, new DbType?(DbType.Binary), new ParameterDirection?(), null, new byte?(), new byte?());

        //    // Log XML for debugging
        //    Console.WriteLine("Generated XML:\n" + xmlData);

        //    // Execute stored procedure
        //    int result = DataBaseFactory.QuerySP("SAL_Employee_SectionDocStatus_Upd", dynamicParameters, "update");

        //    return result > 0;
        //}

        public async Task<bool> Update(string pk_docid, SectionDocMst section)
        {
            try
            {
                DynamicParameters dynamicParameters = new DynamicParameters();

                // Wrap section in dataset (same as Insert)
                SectionDocMstDataSet dataset = new SectionDocMstDataSet { section = section };

                // Serialize to XML
                string xmlData = XmlUtility.XmlSerializeToString(dataset);

                // Add parameters
                dynamicParameters.Add("@pk_docid", pk_docid, DbType.String);
                dynamicParameters.Add("@xmlDoc", xmlData, DbType.String);
                dynamicParameters.Add("@filename", section.filename, DbType.String);
                dynamicParameters.Add("@contenttype", section.contenttype, DbType.String);
                dynamicParameters.Add("@attachment", section.attachment, DbType.Binary);
                dynamicParameters.Add("@Timestamp", section.Timestamp, DbType.Binary);

                // Optional: log XML for debugging
                Console.WriteLine("Generated XML:\n" + xmlData);

                // Call stored procedure
                var result = DataBaseFactory.QuerySP("SAL_Employee_SectionDocStatus_Upd", dynamicParameters, "update");

                return result > 0;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Update Error: " + ex.Message);
                return false;
            }
        }

        public async Task<Result<List<NameValue>>> GetSubsectionDropdownListAsync(string pk_secid, string companyId, string userId)
        {
            // Dynamic Parameters
            DynamicParameters dynamicParameters = new DynamicParameters();

           // dynamicParameters.Add("@UserId", (object)userId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pk_secid", (object)pk_secid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
           // dynamicParameters.Add("@CompanyId", (object)companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            // Output Parameters
          //  dynamicParameters.Add("@IsSuccessfull", null, new DbType?(DbType.Boolean), new ParameterDirection?(ParameterDirection.Output), new int?(), new byte?(), new byte?());
           // dynamicParameters.Add("@Message", null, new DbType?(DbType.String), new ParameterDirection?(ParameterDirection.Output), new int?(255), new byte?(), new byte?());

            var result = await DataBaseFactory.QuerySPAsync<NameValue>("SAL_SubSections_SelForddl", dynamicParameters, "GetSubsectionDropdownList");

            // Final Output
            var finalResult = new Result<List<NameValue>>
            {
                IsSuccessfull = result.ToList().Count>0,
                Message = result.ToList().Count > 0 ? "Data retrieved":"No record",
                Data = result.ToList()
            };

            return finalResult;
        }

    }
}
