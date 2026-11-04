using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IProjectRepository
    {
        public Task<bool> InsertProjectMstAsync(ProjectMst projectMst, string fk_companyId);

        public Task<(int totalCount, IEnumerable<ProjectMst>)> GetAllProjectsAsync(int pageIndex, int pageSize, string fk_companyId);

        public Task<ProjectMst> GetProjectByIdAsync(long pk_ProjectId);

        public Task<bool> UpdateProjectMstAsync(ProjectMst projectMst);

        public Task<bool> DeleteProjectMstAsync(long projectId);




    }
}
