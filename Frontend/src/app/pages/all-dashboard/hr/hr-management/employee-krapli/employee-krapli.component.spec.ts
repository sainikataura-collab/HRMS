import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeKRAPLIComponent } from './employee-krapli.component';

describe('EmployeeKRAPLIComponent', () => {
  let component: EmployeeKRAPLIComponent;
  let fixture: ComponentFixture<EmployeeKRAPLIComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeKRAPLIComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeKRAPLIComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
