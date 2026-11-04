import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeOtherDetailsComponent } from './employee-other-details.component';

describe('EmployeeOtherDetailsComponent', () => {
  let component: EmployeeOtherDetailsComponent;
  let fixture: ComponentFixture<EmployeeOtherDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeOtherDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeOtherDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
