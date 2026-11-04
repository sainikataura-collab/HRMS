import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanAllotmentListComponent } from './loan-allotment-list.component';

describe('LoanAllotmentListComponent', () => {
  let component: LoanAllotmentListComponent;
  let fixture: ComponentFixture<LoanAllotmentListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoanAllotmentListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoanAllotmentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
