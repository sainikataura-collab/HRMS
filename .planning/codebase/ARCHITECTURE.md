---
last_mapped_commit: b88e1fd8fbe340cd5ac4c6b5a413ec967fa15c2c
last_mapped_at: 2026-11-03
---
<!-- refreshed: 2026-11-03 -->

# Architecture

**Analysis Date:** 2026-11-03

## System Overview

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                CLIENT / PRESENTATION TIER                              │
├────────────────────────────────────────┬───────────────────────────────────────────────┤
│    Angular 18 SPA (Web Browser)        │     Capacitor 7 Hybrid Android App            │
│    `Frontend/src/app/`                 │     `Frontend/android/`                       │
│    - Admin & HR Dashboard              │     - Mobile Geo-Punch Attendance             │
│    - Employee Self-Service (ESS)       │     - MediaPipe Selfie Face Detection         │
│    - Public Walk-in Portal             │     - Real-Time Location Tracking             │
└───────────────────┬────────────────────┴───────────────────────┬───────────────────────┘
                    │ REST HTTP / JSON                           │ WebSocket (SignalR)
                    ▼                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              API GATEWAY & MIDDLEWARE PIPELINE                         │
│                              `WebAPI/Program.cs`                                       │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  - CORS Policy (`SignalRCorsPolicy`)                                                   │
│  - Static File Provider (`/Uploads`)                                                   │
│  - JsonExceptionHandlingMiddleware (`WebAPI/Middleware/JsonExceptionHandlingMiddleware`) │
│  - RequestTrackingMiddleware (`WebAPI/Middleware/RequestTrackingMiddleware.cs`)        │
│  - TokenValidationMiddleware (`WebAPI/Middleware/TokenValidationMiddleware.cs`)        │
│  - CandidateKeyValidationMiddleware (`WebAPI/Middleware/CandidateKeyValidation...`)   │
│  - SignalR Hub Endpoint (`/chatHub` -> `WebAPI/Hubs/ChatHub.cs`)                       │
└────────────────────────────────────────┬───────────────────────────────────────────────┘
                                         │
                                         ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 CONTROLLERS LAYER                                      │
│                                 `WebAPI/Controllers/`                                  │
├──────────────────┬─────────────────────┬───────────────────────┬───────────────────────┤
│ Auth & Account   │ Attendance & Leaves │ Payroll & Compensation│ Recruitment & Exit    │
│ `AccountCtrl`    │ `DailyAttendance`   │ `SalaryDashboard`     │ `RecruitmentMgmt`     │
│ `UserCtrl`       │ `Emp_LeaveRequest`  │ `CTCConfigCtrl`       │ `CandidateReport`     │
└──────────────────┴──────────┬──────────┴───────────┬───────────┴───────────────────────┘
                              │                      │
                              ▼                      ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                REPOSITORY & SERVICE LAYER                              │
│                                `WebAPI/Repository/`, `WebAPI/Helper/`                  │
├──────────────────┬─────────────────────┬───────────────────────┬───────────────────────┤
│ Repositories     │ Database Factory    │ External Services     │ Generation Helpers    │
│ `*Repository.cs` │ `DataBaseFactory.cs`│ `JobBoardService.cs`  │ `Syncfusion / Closed` │
│ `I*Repository.cs`│ Dapper SP Executor  │ `EmailGatewayService` │ `OfferLetterGenerator`│
└──────────────────┴──────────┬──────────┴───────────────────────┴───────────────────────┘
                              │ ADO.NET (System.Data.SqlClient)
                              ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               PERSISTENCE & EXTERNAL SYSTEMS                           │
├────────────────────────────────────────┬───────────────────────────────────────────────┤
│  Microsoft SQL Server (`HRBook` DB)    │  Local File System (`D:/IMAGE`, etc.)         │
│  Stored Procedures (T-SQL)             │  SurePass KYC API & External Report Server    │
└────────────────────────────────────────┴───────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| **Authentication & RBAC** | Handles login, token generation, claims validation, and module access rights | `WebAPI/Controllers/AccountController.cs`, `WebAPI/Controllers/UserController.cs` |
| **Request Tracking Middleware** | Logs client IP, execution time, and route details to the database | `WebAPI/Middleware/RequestTrackingMiddleware.cs` |
| **Exception Middleware** | Formats uncaught exceptions into uniform JSON error responses | `WebAPI/Middleware/JsonExceptionHandlingMiddleware.cs` |
| **DataBaseFactory** | Manages `SqlConnection` lifecycles and executes Dapper Stored Procedures | `WebAPI/Helper/DataBaseFactory.cs` |
| **Attendance Hub & Controller** | Ingests biometric punches, mobile geo-punches, face selfie verification | `WebAPI/Controllers/DailyAttendanceController.cs`, `WebAPI/Repository/DailyAttendanceRepository.cs` |
| **HR Chat Hub** | Bidirectional real-time messaging, employee notifications, and status alerts | `WebAPI/Hubs/ChatHub.cs`, `Frontend/src/app/shared/services/signalr.service.ts` |
| **Onboarding & KYC** | Multi-step candidate data collection, SurePass document verification | `Frontend/src/app/on_boarding/`, `WebAPI/Controllers/Onboarding` |
| **Payroll & CTC Engine** | Computes salary components, tax deductions, pay slips, and export sheets | `WebAPI/Controllers/SalaryDashboardController.cs`, `WebAPI/Controllers/CTCConfigController.cs` |
| **Document Generator** | Compiles dynamic appointment/offer letters via Syncfusion DocIO/PDF | `WebAPI/Helper/OfferLetterGenerator.cs`, `WebAPI/Controllers/GenerateLetterController.cs` |
| **Frontend State & Navigation**| Centralized routing, permission guards, HTTP interceptors, dropdown caches | `Frontend/src/app/shared/services/`, `Frontend/src/app/app.routes.ts` |

## Pattern Overview

**Overall:** Controller-Repository-Stored Procedure Architecture with Thin Controllers and Heavy Database Logic.

**Key Characteristics:**
- **Thin Controllers:** Controllers unwrap the HTTP payload, invoke an injected repository interface, and wrap output in a standardized `ModelResponse` object.
- **Repository Pattern via Stored Procedures:** Data operations avoid inline dynamic SQL strings and EF Core ORM; instead, repositories pass parameters to SQL Server Stored Procedures via Dapper (`DataBaseFactory.QuerySP<T>`).
- **Standardized Response Envelope:** API returns `ModelResponse` containing `{ IsSuccess: bool, Message: string, StatusCode: int, Data: object }`.
- **Micro-Frontend / Layout Separation:** Angular frontend organizes views into three distinct layouts: `AuthenticationLayout`, `DashboardLayout`, and `OnBoardingLayout`.

## Layers

**Presentation Layer (Frontend Angular 18):**
- Purpose: Provides responsive web portal for HR Admins and Employees, plus Android native views via Capacitor
- Location: `Frontend/src/app/`
- Contains: Standalone components, modules, guards, directives, and SCSS stylesheets
- Depends on: Angular Router, RxJS, Angular Material, Bootstrap, SignalR Client
- Used by: Web browsers and mobile devices

**API Gateway & Controller Layer:**
- Purpose: Exposes RESTful endpoints, handles HTTP routing, content negotiation, model binding, and authorization checks
- Location: `WebAPI/Controllers/`
- Contains: ASP.NET Core API controllers decorated with `[ApiController]`, `[Route("api/v1/[controller]")]`, and `[Authorize]`
- Depends on: Repository interfaces (`I*Repository`)
- Used by: Angular frontend client, external webhooks

**Repository & Service Layer:**
- Purpose: Business transaction coordination, validation, and database abstraction
- Location: `WebAPI/Repository/` and `WebAPI/Helper/`
- Contains: Concrete repository classes implementing corresponding interfaces
- Depends on: `DataBaseFactory`, `Dapper`, `System.Data.SqlClient`
- Used by: Controllers

**Data Access & Persistence Layer:**
- Purpose: Executes relational queries, triggers, constraints, and stored procedures in SQL Server
- Location: SQL Server database (`HRBook`), configured in `WebAPI/appsettings.json`
- Contains: Stored procedures, tables, views, and indexes
- Depends on: SQL Server Database Engine
- Used by: `DataBaseFactory.cs`

## Data Flow

### Primary Request Path (e.g. Employee Clock-In / Attendance Punch)

1. **User Action:** Employee triggers Punch In on mobile app or web portal (`Frontend/src/app/pages/all-employee/attendance/`).
2. **Client Preparation:** Geolocation coordinates and selfie image base64 are verified via MediaPipe, then packaged by `attendance.service.ts`.
3. **HTTP Dispatch:** Angular `HttpClient` sends `POST /api/v1/DailyAttendance/PunchIn` with Bearer token in the `Authorization` header.
4. **Middleware Filtering:** `TokenValidationMiddleware.cs` decodes JWT, verifies issuer/key, and populates `HttpContext.User`.
5. **Controller Ingestion:** `DailyAttendanceController.cs` receives the model, verifies `ModelState`, and forwards to `IDailyAttendanceRepository`.
6. **Database Execution:** `DailyAttendanceRepository.cs` executes Stored Procedure `Sp_Attendance_InsertPunch` through `DataBaseFactory.QuerySP<AttendanceResponse>()`.
7. **Response Wrapping:** Controller packages output into `ModelResponse` with `StatusCode = 200` and returns JSON.
8. **Real-time Broadcast:** If notification is required, controller/repository notifies `ChatHub.cs` which broadcasts event to HR admin dashboard over WebSocket.

### Secondary Flow: Candidate Public Walk-In Onboarding

1. Candidate scans on-site QR code linking to `/public-apply/:qrToken`.
2. Angular router loads `PublicWalkinApplyComponent` without authentication layout.
3. Candidate submits KYC credentials (Aadhaar / PAN).
4. WebAPI calls SurePass API sandbox to verify identity.
5. On approval, candidate details are inserted into `CandidateMaster` table and notification email is queued via `OnboardingEmailService.cs`.

**State Management:**
- Client state is managed reactively using RxJS Subjects and BehaviorSubjects (`Frontend/src/app/shared/services/ui-state.service.ts`).
- User session identity and authorization claims are stored in browser `localStorage` and synchronized via `token-manager.service.ts`.

## Key Abstractions

**DataBaseFactory (`WebAPI/Helper/DataBaseFactory.cs`):**
- Purpose: Centralized database execution factory encapsulating connection creation, retry logic, DataTable conversions, and Dapper SP calls.
- Pattern: Static Gateway / Data Mapper Helper.

**ModelResponse (`WebAPI/Models/ModelResponse.cs`):**
- Purpose: Unified API response envelope ensuring consistent status codes, user-friendly messages, and payload structure across all 100+ endpoints.

**TokenService & Middleware (`WebAPI/Helper/TokenService.cs`, `WebAPI/Middleware/TokenValidationMiddleware.cs`):**
- Purpose: Centralizes token generation, refresh tokens, claim extraction, and HTTP context attachment.

## Entry Points

**Backend WebAPI:**
- Location: `WebAPI/Program.cs`
- Triggers: ASP.NET Core Kestrel HTTP host initialization
- Responsibilities: Registers DI services, configures middleware pipeline, maps controllers and SignalR `/chatHub`.

**Frontend Application:**
- Location: `Frontend/src/main.ts`
- Triggers: Browser document load
- Responsibilities: Bootstraps Angular standalone application with `appConfig` (`Frontend/src/app/app.config.ts`).

**Server-Side Rendering (SSR):**
- Location: `Frontend/server.ts`
- Triggers: Node.js express execution (`npm run serve:ssr:coolie-app`)
- Responsibilities: Renders initial Angular HTML templates on the server for enhanced load performance.

## Architectural Constraints

- **Database Engine Coupling:** Deep coupling to Microsoft SQL Server T-SQL stored procedures; not easily portable to PostgreSQL or MySQL without rewriting database scripts.
- **Synchronous Stored Procedure Execution:** Several legacy repository methods wrap ADO.NET calls synchronously rather than using native `async/await` end-to-end.
- **Local Filesystem Coupling:** File upload paths reference local Windows disk drive letters (`D:/IMAGE`, `D:/Candidate`, etc.) rather than S3 or cloud blob storage.
- **Global Static State:** `DataBaseFactory` relies on static methods and static delegates initialized during application bootstrap.

## Anti-Patterns

### Storing Sensitive Secrets in Repository Methods / Base64 "Encryption"

**What happens:** `UserRepository.cs` contains an `Encrypt(string sData)` method that merely converts plain text to a Base64 string (`Convert.ToBase64String(encData_byte)`).
**Why it's wrong:** Base64 is an encoding format, not encryption. Anyone can decode credentials instantly.
**Do this instead:** Use standard cryptographically secure hashing (e.g. BCrypt / Argon2 / PBKDF2) or the AES-GCM implementation in `EncryptionHelper.cs`.

### Catching Exceptions and Returning HTTP 200 with Internal Error Code

**What happens:** Controllers catch `Exception ex` and return `Ok(modelResponse)` where `modelResponse.StatusCode = 500`.
**Why it's wrong:** Violates HTTP REST semantics; HTTP monitoring tools, API gateways, and client interceptors see a 200 OK status instead of a failure.
**Do this instead:** Return `StatusCode(StatusCodes.Status500InternalServerError, modelResponse)` or let `JsonExceptionHandlingMiddleware.cs` handle unhandled exceptions cleanly.

## Error Handling

**Strategy:** Two-tiered error interception:
1. Controller-level `try-catch` blocks returning `ModelResponse` with `IsSuccess = false`.
2. Global fallback via `JsonExceptionHandlingMiddleware.cs` which catches unhandled exceptions and outputs JSON `{ "StatusCode": 500, "Message": "Internal Server Error" }`.
3. Client-side Angular `error.interceptor.ts` intercepts non-200 HTTP responses and triggers toast alerts via `ngx-toastr`.

## Cross-Cutting Concerns

**Logging:** Captured at the HTTP boundary via `RequestTrackingMiddleware.cs` logging into SQL database table `RequestLog`, supplemented by standard ASP.NET Core console logging.
**Validation:** Custom `ValidateModelAttribute.cs` action filter enforces model validation on incoming controller actions.
**Authentication & Authorization:** Enforced via `TokenValidationMiddleware.cs` and `[Authorize]` attributes; granular page-level permissions resolved through `PageRightsController.cs`.

---

*Architecture analysis: 2026-11-03*
