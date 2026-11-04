import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReimbursementDashboardComponent } from './reimbursement-dashboard.component';

describe('ReimbursementDashboardComponent', () => {
  let component: ReimbursementDashboardComponent;
  let fixture: ComponentFixture<ReimbursementDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReimbursementDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReimbursementDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
