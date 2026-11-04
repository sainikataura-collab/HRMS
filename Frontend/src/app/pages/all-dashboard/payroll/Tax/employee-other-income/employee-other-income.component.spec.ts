import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeOtherIncomeComponent } from './employee-other-income.component';

describe('EmployeeOtherIncomeComponent', () => {
  let component: EmployeeOtherIncomeComponent;
  let fixture: ComponentFixture<EmployeeOtherIncomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeOtherIncomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeOtherIncomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
