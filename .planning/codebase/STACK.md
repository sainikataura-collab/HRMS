---
last_mapped_commit: b88e1fd8fbe340cd5ac4c6b5a413ec967fa15c2c
last_mapped_at: 2026-11-03
---
# Technology Stack

**Analysis Date:** 2026-11-03

## Languages

**Primary:**
- **C# 12.0 / .NET 8.0** - Backend REST API service (`WebAPI/HRMSWebAPI.csproj`, `WebAPI/Program.cs`, `WebAPI/Controllers/`, `WebAPI/Repository/`)
- **TypeScript 5.5.2** - Frontend single-page application and mobile logic (`Frontend/src/app/`, `Frontend/tsconfig.json`)

**Secondary:**
- **SQL (Transact-SQL / T-SQL)** - Stored procedures, table schemas, triggers, and migrations for Microsoft SQL Server (`WebAPI/Repository/`, `WebAPI/Helper/DataBaseFactory.cs`)
- **PowerShell** - Automation & OCR background script execution (`WebAPI/Scripts/win_ocr.ps1`)
- **HTML5 & SCSS / CSS3** - Responsive UI presentation and styling (`Frontend/src/styles.scss`, `Frontend/src/app/**/*.html`, `Frontend/src/app/**/*.scss`)
- **Java / Gradle** - Native Android platform wrapper via Capacitor (`Frontend/android/`)

## Runtime

**Environment:**
- **.NET 8.0 Runtime** (Microsoft.NET.Sdk.Web, 64-bit Windows / Kestrel / IIS hosting)
- **Node.js 18+ / 20+** (LTS runtime for Angular CLI and SSR server)
- **Android SDK (API 34/35)** for Capacitor mobile build target

**Package Manager:**
- **NuGet** - .NET package management (`WebAPI/HRMSWebAPI.csproj`)
- **npm** - Frontend package management (`Frontend/package.json`, `Frontend/package-lock.json` present)

## Frameworks

**Core:**
- **ASP.NET Core 8.0 Web API** - Backend REST API framework with dependency injection and middleware pipeline (`WebAPI/Program.cs`)
- **Angular 18.1.0 (Standalone & Module-based)** - Frontend client-side SPA with reactive routing and SSR support (`@angular/core`, `@angular/router`, `@angular/ssr`)
- **Capacitor 7.3.0** - Hybrid cross-platform mobile runtime container for Android (`@capacitor/core`, `@capacitor/android`, `Frontend/capacitor.config.ts`)

**Data Access & ORM:**
- **Dapper 2.1.35** - Micro-ORM executing parameterized stored procedures and object mapping (`WebAPI/Helper/DataBaseFactory.cs`, `WebAPI/Repository/*.cs`)
- **System.Data.SqlClient 4.8.6** - Microsoft SQL Server ADO.NET data provider

**Testing:**
- **Jasmine 5.1.0 & Karma 6.4.0** - Frontend unit testing runner and assertion framework (`Frontend/tsconfig.spec.json`, `Frontend/src/app/**/*.spec.ts`)
- **Backend Testing:** Not configured (No .NET test project currently present in `WebAPI/HRMSWebAPI.sln`)

**Build & Dev Tools:**
- **Angular DevKit Build Angular 18.1.1** - ESBuild/Vite-based modern Angular build pipeline (`Frontend/angular.json`)
- **Swashbuckle.AspNetCore 6.6.2** - OpenAPI 3.0 / Swagger documentation generator (`WebAPI/Program.cs`)
- **patch-package 8.0.1** - Node modules hotfixing post-install (`Frontend/patches/`)

## Key Dependencies

**Critical Backend Packages:**
- `Dapper` (2.1.35) - Core database query execution and dynamic parameter mapping
- `System.IdentityModel.Tokens.Jwt` (8.1.2) & `Microsoft.IdentityModel.Tokens` (8.1.2) - JWT authentication token issuance, validation, and claims parsing
- `Syncfusion.DocIO.Net.Core` & `Syncfusion.DocIORenderer.Net.Core` (31.2.12) - Enterprise Word document processing and HR letter generation
- `Syncfusion.Pdf.Net.Core` (31.2.12) - High-fidelity PDF rendering and report compilation
- `ClosedXML` (0.104.2) - Complex Excel workbook generation and spreadsheet parsing
- `iTextSharp` (5.5.13.3) / `Portable.itextsharp` - Legacy PDF manipulation and salary slip compilation
- `UAParser` (3.1.47) - User-agent device detection for security and session audits

**Critical Frontend Packages:**
- `@angular/material` & `@angular/cdk` (18.2.8) - Material design UI controls, dialogs, form controls, and tables
- `bootstrap` (5.3.6) & `bootstrap-icons` (1.13.1) - Responsive grid, utility classes, and iconography
- `@microsoft/signalr` (9.0.6) - WebSocket-based real-time communication for HR Chat and notifications
- `@capacitor-community/background-geolocation` (1.2.26) & `@capacitor/geolocation` (7.1.2) - GPS location tracking for field employee attendance
- `@mediapipe/tasks-vision` (0.10.22) - Client-side AI face detection for selfie attendance validation
- `tesseract.js` (7.0.0) - Client-side optical character recognition for document onboarding
- `olamaps-web-sdk` (1.1.2) & `leaflet` (1.9.4) - Interactive mapping, geofencing, and route rendering
- `@fullcalendar/angular` (6.1.19) - Calendar visualizer for shifts, attendance, and leave rosters

## Configuration

**Environment Configuration:**
- Backend: Configured via `WebAPI/appsettings.json` and `WebAPI/appsettings.Development.json`. Contains DB connection strings, JWT configuration, folder paths for document uploads, email SMTP, and external API credentials.
- Frontend: Configured via `Frontend/src/environments/environment.ts` and `Frontend/src/environments/environment.prod.ts`. Stores API gateway URLs, endpoint routes, SignalR Hub URL, and client encryption keys.

**Build Configuration:**
- Backend: `WebAPI/HRMSWebAPI.csproj` targeting `net8.0`, nullable enabled, implicit usings enabled.
- Frontend: `Frontend/angular.json` with production and development optimization profiles, SSR prerendering options, and asset bundling. `Frontend/capacitor.config.ts` for mobile app identifiers (`appId: 'com.coolieapp.app'`).

## Platform Requirements

**Development:**
- Visual Studio 2022 / VS Code with C# Dev Kit
- .NET 8.0 SDK
- Node.js 18.x or 20.x + npm
- Microsoft SQL Server 2016+ (LocalDB, Express, or Developer Edition)
- Android Studio Ladybug/Koala (for mobile debugging via ADB)

**Production:**
- **Backend:** Windows Server IIS or Linux Kestrel container running .NET 8 ASP.NET Core runtime
- **Database:** Microsoft SQL Server Enterprise / Azure SQL Database
- **Frontend Web:** Static hosting (Nginx, IIS, Cloudflare Pages, S3/CloudFront) or Node.js Express SSR container
- **Mobile:** Android APK / AAB distributed via Google Play Store or enterprise MDM

---

*Stack analysis: 2026-11-03*
