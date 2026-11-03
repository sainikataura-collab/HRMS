# Coding Conventions

**Analysis Date:** 2026-11-03

## Naming Patterns

**C# / Backend:**
- **Classes & Records:** PascalCase (e.g., `DailyAttendanceController`, `DataBaseFactory`, `ModelResponse`)
- **Interfaces:** PascalCase prefixed with `I` (e.g., `IUserRepository`, `IDailyAttendanceRepository`)
- **Methods:** PascalCase (e.g., `ChangePasswordAsync`, `ValidateCompanyCodeAsync`, `InsertAccountMaster`)
- **Fields (private):** camelCase, often prefixed with underscore or camelCase without underscore (e.g., `_accountMasterRepository`, `accountMasterRepository`)
- **Stored Procedures:** PascalCase prefixed with module identifier (e.g., `Comm_ChangePassword_WebUserNew`, `General_ValidateCompanyCode`, `Sp_Attendance_InsertPunch`)
- **SQL Parameters:** `@camelCase` or `@PascalCase` prefixed with `@` (e.g., `@fk_empid`, `@password`, `@CompanyCode`)

**TypeScript / Frontend:**
- **Components:** PascalCase ending with `Component` (e.g., `LoginComponent`, `CandidateReviewComponent`)
- **Services:** PascalCase ending with `Service` (e.g., `TokenManagerService`, `LocationTrackerService`)
- **Variables & Functions:** camelCase (e.g., `getUserLocations`, `isLoggedIn`, `loadDashboardData`)
- **Constants / Environment:** camelCase or UPPER_SNAKE_CASE (e.g., `environment`, `baseURL`, `chatHub`)
- **Files:** kebab-case with type suffix (e.g., `token-manager.service.ts`, `attendance-in-out.component.ts`)

## Code Style

**Backend (.NET 8):**
- Implicit usings enabled in `WebAPI/HRMSWebAPI.csproj`
- Nullable reference types enabled (`<Nullable>enable</Nullable>`)
- Dapper naming match configured globally: `Dapper.DefaultTypeMap.MatchNamesWithUnderscores = true`
- Controller routing standardized to `[Route("api/v1/[controller]")]`
- Custom dynamic JSON converters registered in `WebAPI/Program.cs` (`DynamicStringConverter`, `DynamicBoolConverter`, `DynamicIntConverter`, etc.) to handle loose client types gracefully.

**Frontend (Angular 18):**
- Configured with `.editorconfig` (indent size 2 spaces, UTF-8, LF line endings, trim trailing whitespace)
- TypeScript strict compiler options configured in `Frontend/tsconfig.json`
- Component template separation: Angular components use external templates (`templateUrl: './xyz.component.html'`) and styles (`styleUrls: ['./xyz.component.scss']`)
- Global styling powered by SCSS (`Frontend/src/styles.scss`) with custom theme color palettes.

## Import Organization

**C# Import Order:**
1. System namespaces (`System.Data`, `System.Net`, `System.Reflection`)
2. Microsoft & ASP.NET Core namespaces (`Microsoft.AspNetCore.Mvc`, `Microsoft.AspNetCore.SignalR`)
3. Third-party packages (`Dapper`, `Newtonsoft.Json`, `Syncfusion`)
4. Internal project namespaces (`HRMSWebAPI.Models`, `HRMSWebAPI.Helper`, `HRMSWebAPI.Repository`)

**TypeScript Import Order:**
1. Angular framework packages (`@angular/core`, `@angular/router`, `@angular/common`)
2. Third-party UI / utility libraries (`@angular/material/*`, `rxjs`, `luxon`, `bootstrap`)
3. Application shared services & utilities (`./shared/services/*`, `./shared/layouts/*`)
4. Local models, pipes, and component imports

**Path Aliases:**
- Configured in `Frontend/tsconfig.json` for root directory resolution.

## Error Handling

**Backend Error Pattern:**
- Controllers catch exceptions and wrap errors inside `ModelResponse`:
```csharp
try
{
    var data = await repository.GetDataAsync(id);
    return Ok(new ModelResponse { IsSuccess = true, Data = data, StatusCode = 200 });
}
catch (Exception ex)
{
    return Ok(new ModelResponse { IsSuccess = false, Message = ex.Message, StatusCode = 500 });
}
```
- Global uncaught exception handling handled by `JsonExceptionHandlingMiddleware.cs`.

**Frontend Error Pattern:**
- `error.interceptor.ts` intercepts HTTP errors globally, parses backend `ModelResponse.Message`, and displays a toast notification using `ngx-toastr`:
```typescript
this.toastr.error(errorMessage || 'An unexpected error occurred', 'Error');
```

## Logging

**Framework:**
- Backend: Standard `Microsoft.Extensions.Logging` injected into services, combined with database audit logging via `RequestTrackingMiddleware.cs` storing request latency, user IP, and query paths in SQL Server.
- Frontend: `console.error` and `console.warn` for developmental debugging.

## Comments

**Guidelines Observed:**
- Section division comments in controllers and repositories delineate operational modules (e.g. `// --- Attendance APIs ---`).
- Date stamps and contributor notes in legacy code (e.g. `// added code LR starts 5dec 2025`).
- XML doc comments used on core utility classes in `WebAPI/Helper/`.

## Function Design

**Size:**
- Repositories favor focused methods executing one Stored Procedure and mapping the result set.
- Controllers maintain minimal branching logic; business decisions are pushed to Stored Procedures or Helper services.

**Parameters:**
- Methods accept strongly typed request DTO models (from `WebAPI/Models/`) rather than raw primitive parameter lists.

**Return Values:**
- Controllers return `Task<IActionResult>` returning `Ok(ModelResponse)`.
- Repositories return `Task<T?>` or `Task<IEnumerable<T>>`.

## Module Design

**Frontend Architecture:**
- Transitioned towards Angular 18 Standalone Components (`standalone: true`), with modular grouping in `shared.module.ts` for backward-compatible shared directives and pipes.
- Route-level lazy loading (`loadComponent: () => import(...).then(...)`) used for large sub-pages to optimize bundle sizes.

---

*Convention analysis: 2026-11-03*
