import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeManagementDashboardComponent } from './employee-management-dashboard.component';

describe('EmployeeManagementDashboardComponent', () => {
  let component: EmployeeManagementDashboardComponent;
  let fixture: ComponentFixture<EmployeeManagementDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeManagementDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeManagementDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
