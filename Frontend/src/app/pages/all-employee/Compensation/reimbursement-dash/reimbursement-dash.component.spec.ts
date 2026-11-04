import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReimbursementDashComponent } from './reimbursement-dash.component';

describe('ReimbursementDashComponent', () => {
  let component: ReimbursementDashComponent;
  let fixture: ComponentFixture<ReimbursementDashComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReimbursementDashComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReimbursementDashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
