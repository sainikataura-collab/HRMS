---
last_mapped_commit: b88e1fd8fbe340cd5ac4c6b5a413ec967fa15c2c
last_mapped_at: 2026-11-03
---
# Testing Patterns

**Analysis Date:** 2026-11-03

## Test Framework

**Frontend Runner & Framework:**
- **Runner:** Karma 6.4.0 (`Frontend/karma.conf.js` / Angular CLI default)
- **Framework:** Jasmine 5.1.0 (`jasmine-core`, `karma-jasmine`)
- **Config:** `Frontend/tsconfig.spec.json`

**Backend Runner & Framework:**
- **Runner / Framework:** **None currently configured.** `WebAPI/HRMSWebAPI.sln` contains only the main `HRMSWebAPI.csproj` project. There is no xUnit, NUnit, or MSTest project for unit or integration testing.

**Frontend Run Commands:**

```bash
npm run test           # Run Angular unit tests via Karma
ng test --watch=false  # Single-run headless test execution
ng test --code-coverage # Generate coverage report in Frontend/coverage/
```

## Test File Organization

**Location:**
- Co-located with source components and services in `Frontend/src/app/**/*.spec.ts`.
- Every Angular component generated via Angular CLI includes a sibling `.spec.ts` file.

**Naming:**
- Matches component or service name with `.spec.ts` suffix (e.g., `login.component.spec.ts`, `auth.guard.spec.ts`).

**Structure:**

```text
Frontend/src/app/
├── authentication/
│   ├── login/
│   │   ├── login.component.ts
│   │   ├── login.component.html
│   │   ├── login.component.scss
│   │   └── login.component.spec.ts
```

## Test Structure

**Suite Organization (Frontend Jasmine):**

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent, HttpClientTestingModule],
      providers: []
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component instance', () => {
    expect(component).toBeTruthy();
  });
});
```

**Patterns:**
- `beforeEach` initializes `TestBed` with mocked HTTP clients and required standalone component imports.
- Default scaffolded tests verify component instantiation (`expect(component).toBeTruthy()`).

## Mocking

**Framework:**
- Jasmine Spies (`jasmine.createSpyObj`, `spyOn`).

**Patterns:**

```typescript
const authServiceMock = jasmine.createSpyObj('AuthService', ['login', 'isLoggedIn']);
authServiceMock.login.and.returnValue(of({ IsSuccess: true, StatusCode: 200 }));
```

**What to Mock:**
- External HTTP requests via `HttpClientTestingModule` or `provideHttpClientTesting()`
- Realtime SignalR hubs (`SignalRService`)
- Browser device APIs (Capacitor Geolocation, MediaPipe camera stream)

**What NOT to Mock:**
- Pure helper functions and calculation math in `Frontend/src/app/healpers/`
- Custom Angular display pipes

## Fixtures and Factories

**Test Data:**
- Mock responses emulate backend `ModelResponse` structures:

```typescript
const mockModelResponse = {
  isSuccess: true,
  message: 'Success',
  statusCode: 200,
  data: {
    empId: 'EMP001',
    empName: 'Test Employee',
    companyCode: 'COMP01'
  }
};
```

## Coverage

**Requirements:**
- Currently not enforced in CI/CD pipeline.
- Scaffolded tests exist for UI components, but comprehensive assertion logic across complex workflows (such as payroll calculation and multi-step onboarding) is primarily verified through manual and UAT testing.

**Backend Coverage Gap:**
- Backend WebAPI currently has **0% automated test coverage** due to the absence of a test project and tight coupling between database stored procedures and `DataBaseFactory.cs`.

## Test Types

**Unit Tests:**
- Frontend: Basic instantiation and smoke tests for Angular components and guards.
- Backend: Manual testing via Swagger UI (`/swagger`).

**Integration Tests:**
- Conducted end-to-end between local Angular client (`localhost:4200`) and ASP.NET Core Web API (`localhost:7142`) connected to a development SQL Server instance.

**E2E Tests:**
- Cypress / Playwright not configured in repository.

---

*Testing analysis: 2026-11-03*
