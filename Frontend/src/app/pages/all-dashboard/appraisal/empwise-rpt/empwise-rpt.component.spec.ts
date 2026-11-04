import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpwiseRptComponent } from './empwise-rpt.component';

describe('EmpwiseRptComponent', () => {
  let component: EmpwiseRptComponent;
  let fixture: ComponentFixture<EmpwiseRptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpwiseRptComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmpwiseRptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
