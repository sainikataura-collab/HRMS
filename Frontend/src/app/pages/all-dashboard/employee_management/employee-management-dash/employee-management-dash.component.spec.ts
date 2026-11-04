import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeManagementDashComponent } from './employee-management-dash.component';

describe('EmployeeManagementDashComponent', () => {
  let component: EmployeeManagementDashComponent;
  let fixture: ComponentFixture<EmployeeManagementDashComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeManagementDashComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeManagementDashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
