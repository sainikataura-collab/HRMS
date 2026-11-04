import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeOtherIncomeListComponent } from './employee-other-income-list.component';

describe('EmployeeOtherIncomeListComponent', () => {
  let component: EmployeeOtherIncomeListComponent;
  let fixture: ComponentFixture<EmployeeOtherIncomeListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeOtherIncomeListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeOtherIncomeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
