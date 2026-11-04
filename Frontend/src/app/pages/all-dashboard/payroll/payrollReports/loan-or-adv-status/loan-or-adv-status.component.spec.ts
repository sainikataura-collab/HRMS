import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanOrAdvStatusComponent } from './loan-or-adv-status.component';

describe('LoanOrAdvStatusComponent', () => {
  let component: LoanOrAdvStatusComponent;
  let fixture: ComponentFixture<LoanOrAdvStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoanOrAdvStatusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoanOrAdvStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
