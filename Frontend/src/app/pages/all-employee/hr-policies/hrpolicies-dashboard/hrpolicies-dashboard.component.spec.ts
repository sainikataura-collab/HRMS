import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HrpoliciesDashboardComponent } from './hrpolicies-dashboard.component';

describe('HrpoliciesDashboardComponent', () => {
  let component: HrpoliciesDashboardComponent;
  let fixture: ComponentFixture<HrpoliciesDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HrpoliciesDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HrpoliciesDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
