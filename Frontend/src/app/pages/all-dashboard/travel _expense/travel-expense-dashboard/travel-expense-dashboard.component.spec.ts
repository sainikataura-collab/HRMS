import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TravelExpenseDashboardComponent } from './travel-expense-dashboard.component';

describe('TravelExpenseDashboardComponent', () => {
  let component: TravelExpenseDashboardComponent;
  let fixture: ComponentFixture<TravelExpenseDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TravelExpenseDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TravelExpenseDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
