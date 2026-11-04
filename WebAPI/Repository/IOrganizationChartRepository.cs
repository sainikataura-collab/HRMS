using HRMSWebAPI.Models;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Repository
{
    public interface IOrganizationChartRepository
    {

        Task<Organizationdata> GetOrganizationChartByIdAsync(string pk_empid);


    }
}

