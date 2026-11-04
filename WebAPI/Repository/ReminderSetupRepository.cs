using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class ReminderSetupRepository:IReminderSetupRepository
    {
        public async Task<bool> Insert(ReminderSetupXmlModel dataMst)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();


            // Serialize the complete dataMst object 
            string xmlData = XmlUtility.XmlSerializeToString(dataMst);



            // Add parameters
            dynamicParameters.Add("@xmlDoc", (object)xmlData, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            // Log XML for debugging
            Console.WriteLine("Generated XML:\n" + xmlData);

            // Execute stored procedure
            int result = DataBaseFactory.QuerySP("APP_Reminder_Setup_Ins", dynamicParameters, "Ins");

            return result > 0;
        }


    }
}
