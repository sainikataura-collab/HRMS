import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanAllotmentComponent } from './loan-allotment.component';

describe('LoanAllotmentComponent', () => {
  let component: LoanAllotmentComponent;
  let fixture: ComponentFixture<LoanAllotmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoanAllotmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoanAllotmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
