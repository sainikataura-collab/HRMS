---
last_mapped_commit: b88e1fd8fbe340cd5ac4c6b5a413ec967fa15c2c
last_mapped_at: 2026-11-03
---
# Codebase Concerns

**Analysis Date:** 2026-11-03

## Tech Debt

**Monolithic Database Helper (`DataBaseFactory.cs`):**
- Issue: `WebAPI/Helper/DataBaseFactory.cs` is a 3,660-line static class containing low-level reflection, ADO.NET connection instantiation, `DataTable` conversions, and Dapper wrappers.
- Files: `WebAPI/Helper/DataBaseFactory.cs`, `WebAPI/Program.cs`
- Impact: Static coupling makes mocking the data tier impossible, preventing automated unit testing of repositories and business logic.
- Fix approach: Refactor into an injectable `IDatabaseFactory` service using factory patterns, and introduce interface abstractions for database connections and commands.

**Hardcoded Drive Letters for Upload Paths:**
- Issue: File storage directories in `WebAPI/appsettings.json` reference hardcoded Windows drive letters (`D:/IMAGE`, `D:/Candidate`, `C:/VendorEmployeeDocUploads`).
- Files: `WebAPI/appsettings.json`, `WebAPI/Helper/FileService.cs`
- Impact: Deployment to Linux Docker containers, Azure App Services, or servers without a `D:\` drive will crash file uploads with `DirectoryNotFoundException`.
- Fix approach: Standardize relative path configuration or implement cloud storage abstraction (AWS S3, Azure Blob Storage) with local directory fallback.

**Mixed Synchronous & Asynchronous Data Execution:**
- Issue: Many repository methods expose `async Task` signatures but invoke synchronous `DataBaseFactory.QuerySP<T>` underneath, blocking thread pool worker threads.
- Files: `WebAPI/Repository/*.cs`, `WebAPI/Helper/DataBaseFactory.cs`
- Impact: Under high concurrent load (such as morning shift attendance punches), thread pool starvation can degrade API responsiveness.
- Fix approach: Implement truly asynchronous Dapper execution (`QueryAsync`, `ExecuteAsync`) end-to-end.

## Known Bugs & Anti-Patterns

**Pseudo-Encryption using Base64:**
- Symptoms: Passwords or sensitive values passed to `UserRepository.Encrypt()` are simply converted to Base64 strings (`Convert.ToBase64String`).
- Files: `WebAPI/Repository/UserRepository.cs`
- Trigger: Password update or authentication routines invoking `UserRepository.Encrypt()`.
- Workaround: Ensure sensitive passwords use modern one-way cryptographic hashing (PBKDF2 / BCrypt / Argon2) and AES-GCM encryption for reversible data via `EncryptionHelper.cs`.

**HTTP 200 Returned for 500 Server Errors:**
- Symptoms: When exceptions occur inside controller action methods, the `catch (Exception ex)` block returns `Ok(modelResponse)` with `modelResponse.StatusCode = 500`.
- Files: `WebAPI/Controllers/*.cs` (e.g., `AccountController.cs`)
- Impact: HTTP client monitoring, load balancers, and APM tools record these responses as HTTP 200 OK, masking outages and server errors.
- Fix approach: Return semantic HTTP status codes via `StatusCode(StatusCodes.Status500InternalServerError, modelResponse)`.

## Security Considerations

**Plaintext Secrets in Configuration Files:**
- Risk: Production database credentials, SMTP email credentials with app password, JWT signing keys, and real SurePass API tokens are committed in plaintext inside `WebAPI/appsettings.json` and `Frontend/src/environments/environment.ts`.
- Files: `WebAPI/appsettings.json`, `Frontend/src/environments/environment.ts`
- Current mitigation: None.
- Recommendations: Extract all credentials into environment variables or secrets managers (e.g., Azure Key Vault / AWS Secrets Manager) and add production configs to `.gitignore`.

**Overly Permissive CORS Policy with Credentials:**
- Risk: `SignalRCorsPolicy` in `WebAPI/Program.cs` is configured with `.SetIsOriginAllowed(origin => true).AllowCredentials()`.
- Files: `WebAPI/Program.cs`
- Current mitigation: None.
- Recommendations: Restrict allowed origins strictly to known production domain origins (`FrontendSettings:Domain`).

## Performance Bottlenecks

**Heavy Frontend Client Bundle:**
- Problem: The Angular bundle imports several large third-party visualization and document libraries simultaneously (`@amcharts/amcharts5`, `chart.js`, `tesseract.js`, `@mediapipe/tasks-vision`, `summernote`, `exceljs`, `jspdf`).
- Files: `Frontend/package.json`, `Frontend/angular.json`
- Cause: Multiple overlapping charting and export packages loaded upfront rather than code-split dynamically.
- Improvement path: Enforce route-level lazy loading and dynamic ESM `import()` syntax for heavy packages like MediaPipe, Tesseract OCR, and ExcelJS.

**Synchronous Stored Procedure Execution on Large Reports:**
- Problem: Complex reporting endpoints (e.g., `SalaryDashboardController.cs`, `ExportReportController.cs`) query large tables through stored procedures with long execution timeouts (`ConnectionTimeout = 600`).
- Files: `WebAPI/Helper/DataBaseFactory.cs`, `WebAPI/Controllers/ExportReportController.cs`
- Cause: Queries pulling tens of thousands of rows without server-side pagination into in-memory `DataTable` objects.
- Improvement path: Implement keyset or offset-based SQL pagination and stream report generation directly to HTTP response streams.

## Fragile Areas

**Centralized Environment Endpoint Configuration:**
- Files: `Frontend/src/environments/environment.ts` (1,594 lines)
- Why fragile: Hundreds of individual endpoint string routes are manually declared inside a giant object. A typo in an endpoint path will break API communication without compile-time warnings.
- Safe modification: Introduce strongly typed API client services or OpenAPI/Swagger code generation for Angular HTTP clients.

**Syncfusion & Office Letter Template Processing:**
- Files: `WebAPI/Helper/OfferLetterGenerator.cs`, `WebAPI/LetterTemplates/`
- Why fragile: Relies on exact bookmark/placeholder names within template files on disk. Missing template files or renamed bookmarks cause letter generation to fail silently.

## Scaling Limits

**Single SQL Server Instance Bottleneck:**
- Current capacity: Serves several thousand employee records, but all transactions, background tracking logs, and request tracking hit the same database.
- Limit: High frequency GPS tracking pings from field staff can saturate database I/O.
- Scaling path: Offload real-time request tracking and raw GPS coordinates to a time-series cache (Redis / TimeScaleDB) before flushing aggregates to SQL Server.

## Dependencies at Risk

**Legacy PDF & Excel Libraries:**
- `iTextSharp` (5.5.13.3) and `Portable.itextsharp`: Deprecated versions with known security advisories (AGPL licensing issues and unmaintained codebase).
- `xlsx` (0.18.5): Older SheetJS version containing known CVEs.
- Migration plan: Standardize all PDF generation on `Syncfusion.Pdf` (already licensed in project) and Excel export on `ClosedXML` / `exceljs`.

## Test Coverage Gaps

**Zero Backend Test Automation:**
- What's not tested: All controllers, repository methods, stored procedure parameter builders, and payroll calculation logic.
- Files: Entire `WebAPI/` project.
- Risk: Any change to salary components, tax deduction slabs, or attendance rules could introduce regressions with zero automated detection.
- Recommendations: Create a `WebAPI.Tests` project using xUnit and Moq to test business logic and DTO conversions.

---

*Codebase concerns audit: 2026-11-03*
