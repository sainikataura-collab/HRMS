---
last_mapped_commit: b88e1fd8fbe340cd5ac4c6b5a413ec967fa15c2c
last_mapped_at: 2026-11-03
---
# Codebase Structure

**Analysis Date:** 2026-11-03

## Directory Layout

```text
d:\HRBook_3Nov_Code/
├── .planning/                  # GSD planning and codebase intelligence documents
│   └── codebase/               # System architecture and technical mapping
├── Frontend/                   # Angular 18 client application & Capacitor mobile wrapper
│   ├── .angular/               # Angular CLI local build cache
│   ├── android/                # Native Android studio project for Capacitor
│   │   └── app/                # Android application source, manifests, Gradle build
│   ├── node_modules/           # Frontend third-party NPM packages
│   ├── patches/                # Custom patches applied via patch-package
│   ├── public/                 # Static web assets served directly by Angular
│   ├── resources/              # Mobile app icons and splash screen assets
│   ├── src/                    # Angular source code
│   │   ├── @types/             # Ambient TypeScript type definitions
│   │   ├── app/                # Main Angular application root
│   │   │   ├── authentication/ # Login, signup, OTP, reset password, AuthGuard
│   │   │   ├── dashboard/      # Admin dashboard components
│   │   │   ├── emp-dashboard/  # Employee self-service dashboard
│   │   │   ├── Directive/      # Custom Angular directives (e.g., maxday)
│   │   │   ├── healpers/       # Client-side utility functions and math helpers
│   │   │   ├── on_boarding/    # Candidate onboarding multi-step wizard
│   │   │   ├── pages/          # Domain feature pages
│   │   │   │   ├── all-dashboard/  # Admin modules (attendance, leaves, payroll, hr)
│   │   │   │   ├── all-employee/   # Employee ESS modules (leaves, appraisal, tasks)
│   │   │   │   ├── emailverification/ # Email verification handler
│   │   │   │   ├── public-apply/   # Walk-in applicant QR portal
│   │   │   │   └── setting/        # User profile, KYC, and password reset
│   │   │   └── shared/         # Shared layouts, reusable components, services, routes
│   │   │       ├── components/ # Headers, footers, sidebars, modals, 404
│   │   │       ├── layouts/    # Auth, Dashboard, and Onboarding page layouts
│   │   │       ├── pipes/      # Custom Angular display pipes
│   │   │       ├── routes/     # Child route definitions (auth, dash, on_board)
│   │   │       └── services/   # HTTP API clients, SignalR, token management
│   │   ├── assets/             # Images, logos, SVG icons, fonts
│   │   ├── environments/       # Environment endpoints (environment.ts / prod)
│   │   ├── index.html          # Single-page application HTML shell
│   │   ├── main.ts             # Client entry bootstrap
│   │   ├── server.ts           # Angular Express SSR server entry point
│   │   └── styles.scss         # Global SCSS styles, Bootstrap imports, theme variables
│   ├── angular.json            # Angular CLI project configuration
│   ├── capacitor.config.ts     # Capacitor mobile container settings
│   └── package.json            # NPM dependencies and scripts
└── WebAPI/                     # ASP.NET Core 8.0 backend Web API
    ├── Controllers/            # API Controllers (100+ endpoints)
    │   ├── Compensation/       # Salary and allowance endpoints
    │   ├── Settings/           # System configuration and master data
    │   └── TransactionsControllers/ # Financial & operational transaction endpoints
    ├── Helper/                 # Utility services, DataBaseFactory, encryption, email
    ├── Hubs/                   # SignalR WebSocket hubs (ChatHub.cs)
    ├── LetterTemplates/        # Word & HTML templates for appointment/offer letters
    ├── Middleware/             # Custom HTTP pipeline middlewares (JWT, error, logging)
    ├── Models/                 # DTOs, request models, and entity definitions
    ├── Repository/             # Repository interfaces and Dapper database access classes
    ├── Scripts/                # Windows OCR PowerShell automation script
    ├── Templates/              # Email and notification templates
    ├── Uploads/                # Local runtime upload destination for attachments
    ├── appsettings.json        # Database connection strings, API keys, file paths
    ├── HRMSWebAPI.csproj       # .NET 8 project file
    ├── HRMSWebAPI.sln          # Visual Studio solution file
    └── Program.cs              # Application startup, DI configuration, and middleware
```

## Directory Purposes

**`WebAPI/Controllers/`:**
- Purpose: HTTP REST endpoints processing requests from the Angular client.
- Contains: ASP.NET Core controllers inheriting from `ControllerBase`.
- Key files: `AccountController.cs`, `DailyAttendanceController.cs`, `EmployeeController.cs`, `SalaryDashboardController.cs`.

**`WebAPI/Repository/`:**
- Purpose: Data access layer encapsulating database queries and stored procedure invocations.
- Contains: Interface definitions (`I*Repository.cs`) and concrete implementations (`*Repository.cs`).
- Key files: `UserRepository.cs`, `DailyAttendanceRepository.cs`, `EmployeeRepository.cs`.

**`WebAPI/Helper/`:**
- Purpose: Shared infrastructure helpers, data conversion utilities, and third-party integrations.
- Key files: `DataBaseFactory.cs` (Dapper/ADO.NET executor), `TokenService.cs` (JWT), `EncryptionHelper.cs`, `FileService.cs`, `JobBoardIntegrationService.cs`.

**`WebAPI/Middleware/`:**
- Purpose: HTTP request pipeline interceptors.
- Key files: `JsonExceptionHandlingMiddleware.cs`, `TokenValidationMiddleware.cs`, `RequestTrackingMiddleware.cs`.

**`Frontend/src/app/pages/all-dashboard/`:**
- Purpose: Administrative modules for HR managers, payroll officers, and administrators.
- Subdirectories: `admin_attendance`, `admin_leave`, `payroll`, `recruitment`, `appraisal`, `client_billing`, `vendor`, `visitors`.

**`Frontend/src/app/pages/all-employee/`:**
- Purpose: Employee Self-Service (ESS) views for standard employees.
- Subdirectories: `attendance`, `leaves`, `performance`, `travel_expence-emp`, `emp-exit`, `task-box`.

**`Frontend/src/app/shared/services/`:**
- Purpose: Angular singleton services managing API HTTP requests, reactive state, and tokens.
- Key files: `shared.service.ts`, `token-manager.service.ts`, `signalr.service.ts`, `location-tracker.service.ts`.

## Key File Locations

**Entry Points:**
- `WebAPI/Program.cs`: ASP.NET Core application bootstrap, DI service registration, middleware pipeline.
- `Frontend/src/main.ts`: Angular client bootstrap with standalone providers.
- `Frontend/server.ts`: Angular Universal / SSR Express server entry.

**Configuration:**
- `WebAPI/appsettings.json`: DB connection strings, JWT secret keys, upload directory paths.
- `Frontend/src/environments/environment.ts`: API endpoint catalogue and frontend encryption settings.
- `Frontend/capacitor.config.ts`: Mobile application bundle ID, Android package settings.

**Core Logic:**
- `WebAPI/Helper/DataBaseFactory.cs`: Central database connection and stored procedure execution engine.
- `Frontend/src/app/shared/services/interceptors/error.interceptor.ts`: Central HTTP error handling.

**Testing:**
- `Frontend/src/app/**/*.spec.ts`: Angular component and service unit tests.

## Naming Conventions

**Files:**
- C# Controllers: `[Name]Controller.cs` (e.g., `DailyAttendanceController.cs`)
- C# Repositories: `[Name]Repository.cs` and `I[Name]Repository.cs` (e.g., `EmployeeRepository.cs`)
- C# Models: PascalCase `.cs` (e.g., `ModelResponse.cs`, `AccountMst.cs`)
- Angular Components: kebab-case with `.component.ts`, `.component.html`, `.component.scss` (e.g., `login.component.ts`)
- Angular Services: kebab-case with `.service.ts` (e.g., `token-manager.service.ts`)

**Directories:**
- C# / WebAPI: PascalCase folders (e.g., `Controllers`, `Repository`, `Middleware`)
- Angular Frontend: kebab-case or snake_case feature folders (e.g., `all-dashboard`, `on_boarding`, `admin_attendance`)

## Where to Add New Code

**Adding a New Backend Endpoint / Feature:**
1. **Model:** Add request/response DTO in `WebAPI/Models/` (e.g., `WebAPI/Models/NewFeatureModel.cs`).
2. **Repository:** Define interface in `WebAPI/Repository/INewFeatureRepository.cs` and implement in `WebAPI/Repository/NewFeatureRepository.cs`. Call Stored Procedure via `DataBaseFactory.QuerySP<T>()`.
3. **Register DI:** Register interface and repository in `WebAPI/Program.cs` (`builder.Services.AddScoped<INewFeatureRepository, NewFeatureRepository>()`).
4. **Controller:** Create `WebAPI/Controllers/NewFeatureController.cs` inheriting `ControllerBase`, inject `INewFeatureRepository`, return `ModelResponse`.

**Adding a New Frontend Feature / View:**
1. **API Mapping:** Add new endpoint route in `Frontend/src/environments/environment.ts`.
2. **Service:** Create or update service in `Frontend/src/app/shared/services/` or within feature module.
3. **Component:** Generate standalone component in appropriate feature folder (`Frontend/src/app/pages/all-dashboard/` or `Frontend/src/app/pages/all-employee/`).
4. **Route:** Register route in `Frontend/src/app/shared/routes/dash.routes.ts` or `Frontend/src/app/app.routes.ts`.

## Special Directories

- **`WebAPI/Uploads/`**: Runtime storage for generated documents, attachments, and receipts. Not tracked in git.
- **`Frontend/android/`**: Generated Capacitor Android project containing native Gradle build files and Android Manifest.
- **`Frontend/patches/`**: Custom node package patches applied automatically via `patch-package` on `npm install`.

---

*Structure analysis: 2026-11-03*
