import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalaryOtherHeadComponent } from './salary-other-head.component';

describe('SalaryOtherHeadComponent', () => {
  let component: SalaryOtherHeadComponent;
  let fixture: ComponentFixture<SalaryOtherHeadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalaryOtherHeadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalaryOtherHeadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
