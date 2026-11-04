import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TravelExpenceEmpDashboardComponent } from './travel-expence-emp-dashboard.component';

describe('TravelExpenceEmpDashboardComponent', () => {
  let component: TravelExpenceEmpDashboardComponent;
  let fixture: ComponentFixture<TravelExpenceEmpDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TravelExpenceEmpDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TravelExpenceEmpDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
