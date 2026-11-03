---
last_mapped_commit: b88e1fd8fbe340cd5ac4c6b5a413ec967fa15c2c
last_mapped_at: 2026-11-03
---
# External Integrations

**Analysis Date:** 2026-11-03

## APIs & External Services

**Identity & KYC Verification:**
- **SurePass API** - Real-time automated verification for onboarding candidates (Aadhaar, PAN card, Voter ID, and Bank Account Penny Drop verification)
  - SDK/Client: `System.Net.Http.HttpClient` in `WebAPI/Controllers/Onboarding` and KYC modules
  - Auth: Bearer Token configured in `WebAPI/appsettings.json` under `SurePassAPISettings:Token`
  - Base URL: `https://sandbox.surepass.io/api/v1`

**Job Board Aggregators (Recruitment / ATS):**
- **Naukri API** - Job posting synchronization, candidate sourcing, and application webhook ingestion
  - Implementation: `WebAPI/Helper/JobBoardIntegrationService.cs`
  - Auth: Client ID, Client Secret, and Webhook verification token in `WebAPI/appsettings.json` under `JobBoardIntegrations:Naukri`
- **Indeed API** - Job distribution and candidate webhook intake
  - Implementation: `WebAPI/Helper/JobBoardIntegrationService.cs`
  - Auth: Client ID, Client Secret, and Webhook verification token in `WebAPI/appsettings.json` under `JobBoardIntegrations:Indeed`

**Reporting Engines:**
- **Crystal Reports Gateway** - Remote report generation server for legacy HR, payroll, and statutory reports
  - Client: REST HTTP endpoints invoking report server
  - Configuration: `CrystalReportSettings:Domain` (`http://103.13.97.213/CrystalReport`) in `WebAPI/appsettings.json`

**Maps & Location Services:**
- **Ola Maps Web SDK** - Interactive map views, reverse geocoding, and location clustering in frontend dashboard
  - Client: `olamaps-web-sdk` in `Frontend/src/app/shared/services/location-tracker.service.ts`
- **Leaflet OpenStreetMap** - Fallback rendering and polygon geofence mapping for office/worksite radius verification

**Optical Character Recognition & AI:**
- **Google MediaPipe** - In-browser selfie validation with face mesh / landmark detection during mobile attendance check-in (`@mediapipe/tasks-vision`)
- **Tesseract.js** - Client-side OCR for auto-reading document data during onboarding uploads (`tesseract.js`)
- **Windows OCR PowerShell Utility** - Server-side text recognition fallback (`WebAPI/Scripts/win_ocr.ps1`, invoked by `WebAPI/Controllers/OcrController.cs`)

## Data Storage

**Databases:**
- **Microsoft SQL Server (T-SQL)**
  - Connection: `ConnectionStrings:WebApplication1DBConnection` in `WebAPI/appsettings.json` (`Data Source=localhost;Initial Catalog=HRBook;...`)
  - Client / Access: `System.Data.SqlClient.SqlConnection` managed via `WebAPI/Helper/DataBaseFactory.cs` executing dynamic Stored Procedures via `Dapper.SqlMapper`

**File Storage:**
- **Local Disk / Network Attached Storage:**
  - Configured in `WebAPI/appsettings.json` under `AppSettings`
  - Folders include:
    - Candidate documents: `AppSettings:CandidateFolderPath` (`D:/Candidate`)
    - Uploaded images: `AppSettings:UploadsFolderPath` (`D:/IMAGE`)
    - Company logos: `AppSettings:CompanyLogoFolderPath` (`D:/CompanyLogo`)
    - Vendor rate cards: `AppSettings:VendorRateCardUploads` (`D:/VendorRateCardUploads`)
    - Attendance imports: `AppSettings:AttendanceImportUploads` (`D:/ImportHistory/AttendanceImport`)
  - Static file hosting exposed at `/Uploads` virtual directory in `WebAPI/Program.cs`
  - Upload file handler service: `WebAPI/Helper/FileService.cs`

**Caching:**
- **In-Memory & Static Data Structures:** No distributed Redis cache detected; relies on SQL Server query caching, browser local storage, and client-side Angular service caches (`Frontend/src/app/shared/services/dropdown.service.ts`).

## Authentication & Identity

**Auth Provider:**
- **Custom JWT (JSON Web Tokens) & Multi-Tenant Company Code**
  - Implementation: `WebAPI/Helper/TokenService.cs` and `WebAPI/Middleware/TokenValidationMiddleware.cs`
  - Token Specification: HMAC-SHA256 symmetric key signed token containing `empid`, `roleid`, `companyid`, `locationid`, and user claims
  - Secret Configuration: `Jwt:Key` in `WebAPI/appsettings.json`
  - OTP Verification: SMS/Email OTP service (`WebAPI/Controllers/OtpController.cs`, `WebAPI/Helper/OTPHelper.cs`)
  - Candidate Walk-In Token: QR-secured short-lived tokens validated via `WebAPI/Middleware/CandidateKeyValidationMiddleware.cs`

## Monitoring & Observability

**Error Tracking:**
- Custom centralized middleware: `WebAPI/Middleware/JsonExceptionHandlingMiddleware.cs` intercepts unhandled exceptions and formats standard JSON error payloads.
- Client error interceptor: `Frontend/src/app/shared/services/interceptors/error.interceptor.ts`.

**Logs & Audit:**
- **Database Request Audit Logging:** `WebAPI/Middleware/RequestTrackingMiddleware.cs` logs incoming IP addresses, endpoints, user agents, and response times into SQL Server table via `WebAPI/Repository/RequestLogRepository.cs`.
- Console & ASP.NET Core default logging configured in `WebAPI/appsettings.json` under `Logging:LogLevel`.

## CI/CD & Deployment

**Hosting:**
- **Backend:** Windows Server IIS / Kestrel service listening on port 7142 (configured in `launchSettings.json` and `appsettings.json`).
- **Frontend:** Angular SSR server (`Frontend/server.ts`) or static web host on port 4200.
- **Mobile:** Android APK compiled via Gradle in `Frontend/android/`.

**CI Pipeline:**
- Local manual build & publishing workflow; standard `dotnet publish` and `ng build` scripts configured in `Frontend/package.json`.

## Environment Configuration

**Required env vars & configurations:**
- `ConnectionStrings:WebApplication1DBConnection`: Microsoft SQL Server connection string
- `Jwt:Key`: Minimum 256-bit base64 secret string
- `EmailSettings:SmtpServer`, `EmailSettings:SmtpUser`, `EmailSettings:SmtpPass`: SMTP mail server credentials
- `SurePassAPISettings:Token`: SurePass KYC verification bearer token
- `FrontendSettings:Domain`: Angular web application origin URL (for CORS and email redirect links)

**Secrets location:**
- Stored directly in `WebAPI/appsettings.json` and `Frontend/src/environments/environment.ts`. (Recommended to externalize into environment variables or Azure Key Vault in production).

## Webhooks & Callbacks

**Incoming:**
- `WebAPI/Controllers/RecruitmentManagementController.cs` - Receives candidate application webhooks from external job boards (Naukri, Indeed).
- Biometric Punch Machine Webhook / Sync API endpoints for remote device attendance pushes.

**Outgoing:**
- Real-time SignalR broadcasts: `WebAPI/Hubs/ChatHub.cs` broadcasts user presence, HR notifications, and chat messages to connected WebSocket clients.

---

*Integration audit: 2026-11-03*
