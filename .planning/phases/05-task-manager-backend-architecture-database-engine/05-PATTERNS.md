# Phase 05: Task Manager Backend Architecture & Database Engine - Pattern Map

## File Classification

| File Path | Role | Data Flow | Closest Codebase Analog |
|-----------|------|-----------|-------------------------|
| `WebAPI/Scripts/HR_TaskManager_Setup.sql` | migration / SQL | CRUD / batch | `WebAPI/Scripts/ATS_FullLifecycle_Setup.sql` |
| `WebAPI/Models/TaskManagerModels.cs` | model / DTO | request-response | `WebAPI/Models/AtsLifecycleModels.cs` |
| `WebAPI/Repository/ITaskManagerRepository.cs` | repository interface | CRUD | `WebAPI/Repository/IAtsLifecycleRepository.cs` |
| `WebAPI/Repository/TaskManagerRepository.cs` | repository | CRUD / stored-procedure | `WebAPI/Repository/AtsLifecycleRepository.cs` |
| `WebAPI/Services/RecurringTaskHostedService.cs` | background service | event-driven / batch | `WebAPI/Program.cs` (`BackgroundService` / `IServiceScopeFactory`) |
| `WebAPI/Controllers/TaskManagerController.cs` | controller | request-response / file-I/O | `WebAPI/Controllers/RecruitmentManagementController/AtsLifecycleController.cs` |
| `WebAPI/Program.cs` | config / DI | config | `WebAPI/Program.cs` |

## Pattern Assignments & Code Excerpts

### 1. Dapper Repository Pattern (`WebAPI/Repository/TaskManagerRepository.cs`)
- Uses `using var conn = DataBaseFactory.ConnString();` from `HRMSWebAPI.Helper`.
- Executes stored procedures via `conn.QueryAsync<T>("dbo.usp_HR_Task_...", param, commandType: CommandType.StoredProcedure)` or `conn.QueryMultipleAsync(...)` for multi-result sets (e.g. board tasks + KPI counts, or task details + history timeline).
- Excerpt from `WebAPI/Repository/AtsLifecycleRepository.cs`:
```csharp
using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class TaskManagerRepository : ITaskManagerRepository
    {
        public async Task<dynamic> ExampleAsync()
        {
            using var conn = DataBaseFactory.ConnString();
            return await conn.QueryAsync<dynamic>(
                "dbo.usp_HR_Task_GetLookups",
                new { ViewerId = "GU-1" },
                commandType: CommandType.StoredProcedure);
        }
    }
}
```

### 2. Controller & Auth Context Pattern (`WebAPI/Controllers/TaskManagerController.cs`)
- Route: `[Route("api/v1/[controller]")]` and `[ApiController]`.
- `TokenValidationMiddleware` validates the Bearer JWT and populates `HttpContext.Items["DecryptedUserId"]`, `HttpContext.Items["DecryptedCompanyId"]`, `HttpContext.Items["DecryptedLocationId"]`.
- Note: For `usertype == "User"`, `DecryptedUserId` is `UM_Users_Mst.pk_userId` (which maps to `UM_Users_Mst.fk_empId` and `fk_roleId`); for `usertype == "Employee"`, `DecryptedUserId` is `SAL_Employee_Mst.pk_empid` (e.g., `'GU-1'`).
- File uploads save into `Path.Combine(Directory.GetCurrentDirectory(), "Uploads", "Tasks")` (served at `/Uploads/Tasks/...` because `Program.cs` lines 412-418 registers `PhysicalFileProvider` for `/Uploads`).

### 3. DI Registration (`WebAPI/Program.cs`)
- Register `builder.Services.AddScoped<ITaskManagerRepository, TaskManagerRepository>();`
- Register `builder.Services.AddHostedService<RecurringTaskHostedService>();`
