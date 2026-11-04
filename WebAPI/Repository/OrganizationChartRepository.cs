
using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;
using System.Linq;


namespace HRMSWebAPI.Repository
{
    public class OrganizationChartRepository : IOrganizationChartRepository
    {
      

    


        public async Task<Organizationdata> GetOrganizationChartByIdAsync(string pk_empid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_empid", (object)pk_empid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            var tuple = DataBaseFactory.QueryMultipleSP<OrganizationChartMst, OrganizationChartMst, OrganizationChartMst>("SAL_Employee_OrgChart_GetById", dynamicParameters, "Employee_OrgChart_GetById");


            Organizationdata organizationData = new Organizationdata
            {
                Head = tuple?.Item1?.ToList() ?? new List<OrganizationChartMst>(),
                Manager = tuple?.Item2?.ToList() ?? new List<OrganizationChartMst>(),
                Team = tuple?.Item3?.ToList() ?? new List<OrganizationChartMst>()
            };

            return organizationData;
        }



    }
}
