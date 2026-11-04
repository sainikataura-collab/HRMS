import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutoSalaryProcessReimComponent } from './auto-salary-process-reim.component';

describe('AutoSalaryProcessReimComponent', () => {
  let component: AutoSalaryProcessReimComponent;
  let fixture: ComponentFixture<AutoSalaryProcessReimComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutoSalaryProcessReimComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AutoSalaryProcessReimComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
