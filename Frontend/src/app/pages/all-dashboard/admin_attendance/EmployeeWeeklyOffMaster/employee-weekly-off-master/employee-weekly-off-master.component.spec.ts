import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeWeeklyOffMasterComponent } from './employee-weekly-off-master.component';

describe('EmployeeWeeklyOffMasterComponent', () => {
  let component: EmployeeWeeklyOffMasterComponent;
  let fixture: ComponentFixture<EmployeeWeeklyOffMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeWeeklyOffMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeWeeklyOffMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
